import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../db";
import { classicPapers } from "../../../lib/classicPapers";

const feeds = [
  { category:"vla", label:"VLA 模型", query:"vision language action robot" },
  { category:"world", label:"世界模型", query:"robot world model planning" },
  { category:"practice", label:"机器人实践", query:"robot manipulation imitation learning" },
  { category:"foundation", label:"基础研究", query:"embodied intelligence robotics" },
];

type CrossrefWork={DOI?:string;title?:string[];abstract?:string;author?:Array<{given?:string;family?:string}>;published?:{"date-parts"?:number[][]};"published-online"?:{"date-parts"?:number[][]};URL?:string;"is-referenced-by-count"?:number};

function crossrefDate(work:CrossrefWork){const parts=(work["published-online"]?.["date-parts"]??work.published?.["date-parts"]??[])[0]??[];if(!parts[0])return null;return `${parts[0]}-${String(parts[1]??1).padStart(2,"0")}-${String(parts[2]??1).padStart(2,"0")}`}
function plainAbstract(value?:string){return (value??"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim().slice(0,500)}
function isRobotPaper(title:string,abstract:string){return /(robot|robotic|embodied|manipulation|vision.language.action|world model|sim.?to.?real|imitation learning|grasp|locomotion)/i.test(`${title} ${abstract}`)}

async function ensureTables(db:D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS papers (id INTEGER PRIMARY KEY AUTOINCREMENT, paper_id TEXT NOT NULL UNIQUE, title TEXT NOT NULL, abstract TEXT NOT NULL DEFAULT '', authors TEXT NOT NULL DEFAULT '', year INTEGER NOT NULL, published_at TEXT, url TEXT NOT NULL, category TEXT NOT NULL, category_label TEXT NOT NULL, citations INTEGER NOT NULL DEFAULT 0, added_at TEXT NOT NULL)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS papers_category_year_idx ON papers(category, year DESC)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS paper_sync (id TEXT PRIMARY KEY, last_sync_date TEXT NOT NULL, last_sync_at TEXT NOT NULL, added_count INTEGER NOT NULL DEFAULT 0)`),
  ]);
}

async function hourlySync(db:D1Database) {
  const now=new Date(); const today=now.toISOString().slice(0,10); const currentYear=now.getUTCFullYear();
  const seedResults=await db.batch(classicPapers.map(paper=>db.prepare(`INSERT OR IGNORE INTO papers (paper_id,title,abstract,authors,year,published_at,url,category,category_label,citations,added_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(paper.paperId,paper.title,paper.abstract,paper.authors,paper.year,null,paper.url,paper.category,paper.categoryLabel,0,today)));
  const seeded=seedResults.reduce((sum,result)=>sum+Number(result.meta.changes??0),0);
  const existing=await db.prepare("SELECT last_sync_at FROM paper_sync WHERE id = ?").bind("global").first<{last_sync_at:string}>();
  const lastSyncMs=existing?.last_sync_at?Date.parse(existing.last_sync_at):0;
  if(lastSyncMs&&now.getTime()-lastSyncMs<55*60*1000){return {live:true,added:0,skipped:true};}
  let added=seeded;
  const hourWindow=Math.floor(now.getTime()/3600000)%10; const rotatedFeeds=[...feeds.slice(hourWindow%feeds.length),...feeds.slice(0,hourWindow%feeds.length)];
  let successfulFeeds=0;
  for(const feed of rotatedFeeds){
    if(added>=50) break;
    try{
      const url=`https://api.crossref.org/works?query.title=${encodeURIComponent(feed.query)}&filter=from-pub-date:2023-01-01,until-pub-date:${today}&sort=relevance&order=desc&rows=100&offset=${hourWindow*100}&mailto=kian0711%40users.noreply.github.com`;
      const response=await fetch(url,{headers:{"User-Agent":"KIAN-Embodied-AI-Learning/1.0 (mailto:kian0711@users.noreply.github.com)"}}); if(!response.ok) continue;
      const result=await response.json() as {message?:{items?:CrossrefWork[]}}; successfulFeeds+=1;
      for(const paper of result.message?.items??[]){if(added>=50)break;const doi=String(paper.DOI??"").trim();const title=String(paper.title?.[0]??"").trim();const publishedAt=crossrefDate(paper);const year=Number(publishedAt?.slice(0,4)??0);const abstract=plainAbstract(paper.abstract);if(!doi||!title||year<2023||year>currentYear||!isRobotPaper(title,abstract))continue;const paperId=`doi:${doi.toLowerCase()}`;const paperUrl=`https://doi.org/${doi}`;const authors=(paper.author??[]).slice(0,5).map(author=>[author.given,author.family].filter(Boolean).join(" ")).filter(Boolean).join(" · ");const citations=Number(paper["is-referenced-by-count"]??0);const insert=await db.prepare(`INSERT OR IGNORE INTO papers (paper_id,title,abstract,authors,year,published_at,url,category,category_label,citations,added_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(paperId,title,abstract,authors,year,publishedAt,paperUrl,feed.category,feed.label,citations,today).run();if(Number(insert.meta.changes??0)>0)added+=1;else await db.prepare("UPDATE papers SET url = ?, published_at = COALESCE(?, published_at), citations = MAX(citations, ?) WHERE paper_id = ?").bind(paperUrl,publishedAt,citations,paperId).run()}
    }catch{continue}
  }
  if(successfulFeeds===0)return {live:false,added,skipped:false};
  const syncedAt=now.toISOString(); await db.prepare(`INSERT INTO paper_sync (id,last_sync_date,last_sync_at,added_count) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET last_sync_date=excluded.last_sync_date,last_sync_at=excluded.last_sync_at,added_count=excluded.added_count`).bind("global",today,syncedAt,added).run();
  return {live:true,added,skipped:false};
}

export async function GET(request:NextRequest){
  try{
    const db=getD1(); await ensureTables(db); const sync=await hourlySync(db);
    const page=Math.max(1,Number(request.nextUrl.searchParams.get("page")||1)); const limit=8; const offset=(page-1)*limit; const category=request.nextUrl.searchParams.get("category")||"all"; const year=request.nextUrl.searchParams.get("year")||"all"; const q=(request.nextUrl.searchParams.get("q")||"").trim();
    const clauses:string[]=[]; const values:(string|number)[]=[]; if(category!=="all"){clauses.push("category = ?");values.push(category)} if(year!=="all"){clauses.push("year = ?");values.push(Number(year))} if(q){clauses.push("(title LIKE ? OR abstract LIKE ? OR authors LIKE ?)");const like=`%${q}%`;values.push(like,like,like)} const where=clauses.length?`WHERE ${clauses.join(" AND ")}`:"";
    const count=await db.prepare(`SELECT COUNT(*) AS total FROM papers ${where}`).bind(...values).first<{total:number}>(); const total=Number(count?.total??0);
    const rows=await db.prepare(`SELECT id,title,abstract,authors,year,url,category,category_label AS categoryLabel,citations,added_at AS addedAt FROM papers ${where} ORDER BY year DESC, COALESCE(published_at,'') DESC, citations DESC, id DESC LIMIT ? OFFSET ?`).bind(...values,limit,offset).all();
    const status=await db.prepare("SELECT last_sync_at AS lastSyncAt, added_count AS addedToday FROM paper_sync WHERE id = ?").bind("global").first<{lastSyncAt:string;addedToday:number}>();
    return NextResponse.json({papers:rows.results,total,page,pages:Math.max(1,Math.ceil(total/limit)),lastSyncAt:status?.lastSyncAt??null,addedToday:status?.addedToday??sync.added,live:sync.live},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return NextResponse.json({papers:[],total:0,page:1,pages:1,lastSyncAt:null,addedToday:0,live:false,error:error instanceof Error?error.message:"unavailable"});}
}
