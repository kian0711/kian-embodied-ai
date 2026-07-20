import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../db";
import { classicPapers } from "../../../lib/classicPapers";

const feeds = [
  { category:"vla", label:"VLA 模型", query:"vision language action robot" },
  { category:"world", label:"世界模型", query:"robotics world model planning" },
  { category:"practice", label:"机器人实践", query:"robot manipulation imitation learning" },
  { category:"foundation", label:"基础研究", query:"embodied intelligence robot learning" },
];

function preferredPaperUrl(paper:{externalIds?:{ArXiv?:string;DOI?:string};openAccessPdf?:{url?:string}|null;url?:string;paperId:string}) {
  if(paper.externalIds?.ArXiv) return `https://arxiv.org/abs/${paper.externalIds.ArXiv}`;
  if(paper.externalIds?.DOI) return `https://doi.org/${paper.externalIds.DOI}`;
  if(paper.openAccessPdf?.url) return paper.openAccessPdf.url;
  return paper.url??`https://www.semanticscholar.org/paper/${paper.paperId}`;
}

async function ensureTables(db:D1Database) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS papers (id INTEGER PRIMARY KEY AUTOINCREMENT, paper_id TEXT NOT NULL UNIQUE, title TEXT NOT NULL, abstract TEXT NOT NULL DEFAULT '', authors TEXT NOT NULL DEFAULT '', year INTEGER NOT NULL, published_at TEXT, url TEXT NOT NULL, category TEXT NOT NULL, category_label TEXT NOT NULL, citations INTEGER NOT NULL DEFAULT 0, added_at TEXT NOT NULL)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS papers_category_year_idx ON papers(category, year DESC)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS paper_sync (id TEXT PRIMARY KEY, last_sync_date TEXT NOT NULL, last_sync_at TEXT NOT NULL, added_count INTEGER NOT NULL DEFAULT 0)`),
  ]);
}

async function dailySync(db:D1Database) {
  const today=new Date().toISOString().slice(0,10);
  const seedResults=await db.batch(classicPapers.map(paper=>db.prepare(`INSERT OR IGNORE INTO papers (paper_id,title,abstract,authors,year,published_at,url,category,category_label,citations,added_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(paper.paperId,paper.title,paper.abstract,paper.authors,paper.year,null,paper.url,paper.category,paper.categoryLabel,0,today)));
  const seeded=seedResults.reduce((sum,result)=>sum+Number(result.meta.changes??0),0);
  const existing=await db.prepare("SELECT last_sync_date FROM paper_sync WHERE id = ?").bind("global").first<{last_sync_date:string}>();
  const countRow=await db.prepare("SELECT COUNT(*) AS total FROM papers").first<{total:number}>(); let currentTotal=Number(countRow?.total??0); const bootstrap=currentTotal<100;
  if(existing?.last_sync_date===today&&!bootstrap){if(seeded)await db.prepare("UPDATE paper_sync SET added_count = added_count + ? WHERE id = ?").bind(seeded,"global").run();return {live:true,added:seeded};}
  let added=seeded;
  for(const feed of feeds){
    try{
      const fields="title,abstract,year,authors,url,citationCount,publicationDate,externalIds,openAccessPdf";
      const url=`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(feed.query)}&year=2023-2026&limit=${bootstrap?100:16}&fields=${fields}`;
      const response=await fetch(url,{headers:{"User-Agent":"KIAN-Embodied-AI-Learning/1.0"}}); if(!response.ok) continue;
      const result=await response.json() as {data?:Array<{paperId:string;title:string;abstract?:string;year?:number;authors?:Array<{name:string}>;url?:string;citationCount?:number;publicationDate?:string;externalIds?:{ArXiv?:string;DOI?:string};openAccessPdf?:{url?:string}|null}>};
      const selected=(result.data??[]).filter(p=>p.paperId&&p.title&&p.year&&p.year>=2023&&p.year<=2026).sort((a,b)=>(b.year??0)-(a.year??0)||String(b.publicationDate??"").localeCompare(String(a.publicationDate??""))||(b.citationCount??0)-(a.citationCount??0)).slice(0,bootstrap?40:4);
      for(const paper of selected){const wasExisting=await db.prepare("SELECT 1 AS found FROM papers WHERE paper_id = ?").bind(paper.paperId).first<{found:number}>(); if(!wasExisting&&bootstrap&&currentTotal>=100) continue; await db.prepare(`INSERT INTO papers (paper_id,title,abstract,authors,year,published_at,url,category,category_label,citations,added_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(paper_id) DO UPDATE SET url=excluded.url, published_at=COALESCE(excluded.published_at,papers.published_at), citations=MAX(papers.citations,excluded.citations)`).bind(paper.paperId,paper.title,(paper.abstract??"").slice(0,500),(paper.authors??[]).slice(0,5).map(a=>a.name).join(" · "),paper.year,paper.publicationDate??null,preferredPaperUrl(paper),feed.category,feed.label,paper.citationCount??0,today).run(); if(!wasExisting){added+=1;currentTotal+=1}}
    }catch{continue}
  }
  const now=new Date().toISOString(); await db.prepare(`INSERT INTO paper_sync (id,last_sync_date,last_sync_at,added_count) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET last_sync_date=excluded.last_sync_date,last_sync_at=excluded.last_sync_at,added_count=excluded.added_count`).bind("global",today,now,added).run();
  return {live:true,added};
}

export async function GET(request:NextRequest){
  try{
    const db=getD1(); await ensureTables(db); const sync=await dailySync(db);
    const page=Math.max(1,Number(request.nextUrl.searchParams.get("page")||1)); const limit=8; const offset=(page-1)*limit; const category=request.nextUrl.searchParams.get("category")||"all"; const year=request.nextUrl.searchParams.get("year")||"all"; const q=(request.nextUrl.searchParams.get("q")||"").trim();
    const clauses:string[]=[]; const values:(string|number)[]=[]; if(category!=="all"){clauses.push("category = ?");values.push(category)} if(year!=="all"){clauses.push("year = ?");values.push(Number(year))} if(q){clauses.push("(title LIKE ? OR abstract LIKE ? OR authors LIKE ?)");const like=`%${q}%`;values.push(like,like,like)} const where=clauses.length?`WHERE ${clauses.join(" AND ")}`:"";
    const count=await db.prepare(`SELECT COUNT(*) AS total FROM papers ${where}`).bind(...values).first<{total:number}>(); const total=Number(count?.total??0);
    const rows=await db.prepare(`SELECT id,title,abstract,authors,year,url,category,category_label AS categoryLabel,citations,added_at AS addedAt FROM papers ${where} ORDER BY year DESC, COALESCE(published_at,'') DESC, citations DESC, id DESC LIMIT ? OFFSET ?`).bind(...values,limit,offset).all();
    const status=await db.prepare("SELECT last_sync_at AS lastSyncAt, added_count AS addedToday FROM paper_sync WHERE id = ?").bind("global").first<{lastSyncAt:string;addedToday:number}>();
    return NextResponse.json({papers:rows.results,total,page,pages:Math.max(1,Math.ceil(total/limit)),lastSyncAt:status?.lastSyncAt??null,addedToday:status?.addedToday??sync.added,live:sync.live},{headers:{"Cache-Control":"no-store"}});
  }catch(error){return NextResponse.json({papers:[],total:0,page:1,pages:1,lastSyncAt:null,addedToday:0,live:false,error:error instanceof Error?error.message:"unavailable"});}
}
