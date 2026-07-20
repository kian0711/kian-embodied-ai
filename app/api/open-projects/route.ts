import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../db";

async function ensureTable(db:D1Database){await db.prepare(`CREATE TABLE IF NOT EXISTS open_source_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, project_url TEXT NOT NULL,
  description TEXT NOT NULL, highlights TEXT NOT NULL DEFAULT '', contributor_name TEXT NOT NULL DEFAULT '',
  contributor_school TEXT NOT NULL DEFAULT '', contributor_wechat TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL
)`).run();}
function isAdmin(request:NextRequest){const configured=String(env.ADMIN_UPLOAD_KEY||"");const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";return configured.length>=12&&supplied===configured;}
function clean(value:unknown,max:number){return String(value||"").trim().slice(0,max);}

export async function GET(request:NextRequest){
  try{const db=getD1();await ensureTable(db);const where=isAdmin(request)?"":"WHERE status = 'approved'";const rows=await db.prepare(`SELECT id,title,project_url AS projectUrl,description,highlights,contributor_name AS contributorName,contributor_school AS contributorSchool,contributor_wechat AS contributorWechat,status,created_at AS createdAt FROM open_source_projects ${where} ORDER BY created_at DESC,id DESC`).all();return NextResponse.json({projects:rows.results},{headers:{"Cache-Control":"no-store"}});}catch(error){return NextResponse.json({projects:[],error:error instanceof Error?error.message:"暂时无法读取项目"},{status:500});}
}

export async function POST(request:NextRequest){
  try{const body=await request.json() as Record<string,unknown>;const title=clean(body.title,200),projectUrl=clean(body.projectUrl,1000),description=clean(body.description,3000),highlights=clean(body.highlights,2000),contributorName=clean(body.contributorName,80),contributorSchool=clean(body.contributorSchool,160),contributorWechat=clean(body.contributorWechat,120);if(!title||!description)return NextResponse.json({error:"请填写项目名称和项目介绍"},{status:400});try{const url=new URL(projectUrl);if(!/^https?:$/.test(url.protocol))throw new Error();}catch{return NextResponse.json({error:"请输入有效的项目链接"},{status:400});}const db=getD1();await ensureTable(db);const row=await db.prepare(`INSERT INTO open_source_projects (title,project_url,description,highlights,contributor_name,contributor_school,contributor_wechat,status,created_at) VALUES (?,?,?,?,?,?,?,?,?) RETURNING id`).bind(title,projectUrl,description,highlights,contributorName,contributorSchool,contributorWechat,"pending",new Date().toISOString()).first<{id:number}>();return NextResponse.json({ok:true,id:row?.id,status:"pending"},{status:201});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"提交失败"},{status:500});}
}
