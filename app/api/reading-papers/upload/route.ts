import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../../db";

const MAX_PDF_SIZE = 50 * 1024 * 1024;

function isAdmin(request: NextRequest) {
  const configured = String(env.ADMIN_UPLOAD_KEY || "");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  return configured.length >= 12 && supplied === configured;
}

function validKey(key: string) { return /^reading-papers\/[0-9]+-[a-f0-9-]+-[a-zA-Z0-9._-]+$/.test(key); }

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS reading_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, innovation TEXT NOT NULL,
    method TEXT NOT NULL, result TEXT NOT NULL, implementation TEXT NOT NULL,
    pdf_key TEXT NOT NULL, pdf_name TEXT NOT NULL, pdf_size INTEGER NOT NULL, created_at TEXT NOT NULL
  )`).run();
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "管理密钥不正确" }, { status: 401 });
  if (!env.FILES) return NextResponse.json({ error: "文件存储尚未启用" }, { status: 503 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.action === "init") {
      const name = String(body.name || "paper.pdf");
      const size = Number(body.size || 0);
      if (!name.toLowerCase().endsWith(".pdf") || size <= 0 || size > MAX_PDF_SIZE) return NextResponse.json({ error: "仅支持 50MB 以内的 PDF" }, { status: 400 });
      const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "paper.pdf";
      const key = `reading-papers/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const upload = await env.FILES.createMultipartUpload(key, { httpMetadata:{ contentType:"application/pdf" }, customMetadata:{ originalName:encodeURIComponent(name) } });
      return NextResponse.json({ key, uploadId:upload.uploadId });
    }
    if (body.action === "complete") {
      const key = String(body.key || ""); const uploadId = String(body.uploadId || "");
      if (!validKey(key) || !uploadId) return NextResponse.json({ error:"无效上传任务" }, { status:400 });
      const fields = ["title","innovation","method","result","implementation"] as const;
      const values = Object.fromEntries(fields.map((field)=>[field,String(body[field]||"").trim()])) as Record<typeof fields[number],string>;
      if (fields.some((field)=>!values[field] || values[field].length > 6000)) return NextResponse.json({ error:"请完整填写精读内容，每项不超过 6000 字" }, { status:400 });
      const parts = Array.isArray(body.parts) ? body.parts.map((part) => ({ partNumber:Number((part as {partNumber?:number}).partNumber), etag:String((part as {etag?:string}).etag||"") })) : [];
      if (!parts.length || parts.some((part)=>!part.partNumber || !part.etag)) return NextResponse.json({ error:"PDF 分片不完整" }, { status:400 });
      const upload = env.FILES.resumeMultipartUpload(key, uploadId);
      await upload.complete(parts);
      const db=getD1(); await ensureTable(db); const createdAt=new Date().toISOString();
      try {
        const inserted=await db.prepare(`INSERT INTO reading_papers (title,innovation,method,result,implementation,pdf_key,pdf_name,pdf_size,created_at) VALUES (?,?,?,?,?,?,?,?,?) RETURNING id`).bind(values.title,values.innovation,values.method,values.result,values.implementation,key,String(body.name||"paper.pdf"),Number(body.size||0),createdAt).first<{id:number}>();
        return NextResponse.json({ok:true,id:inserted?.id},{status:201});
      } catch(error) { await env.FILES.delete(key); throw error; }
    }
    return NextResponse.json({error:"未知上传操作"},{status:400});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"上传失败"},{status:500}); }
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error:"管理密钥不正确" },{status:401});
  if (!env.FILES) return NextResponse.json({error:"文件存储尚未启用"},{status:503});
  try {
    const key=request.nextUrl.searchParams.get("key")||""; const uploadId=request.nextUrl.searchParams.get("uploadId")||""; const partNumber=Number(request.nextUrl.searchParams.get("partNumber")||0);
    if (!validKey(key)||!uploadId||partNumber<1||partNumber>20) return NextResponse.json({error:"无效分片"},{status:400});
    const bytes=await request.arrayBuffer(); if(!bytes.byteLength||bytes.byteLength>5*1024*1024) return NextResponse.json({error:"分片大小无效"},{status:400});
    const part=await env.FILES.resumeMultipartUpload(key,uploadId).uploadPart(partNumber,bytes);
    return NextResponse.json({partNumber:part.partNumber,etag:part.etag});
  } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"分片上传失败"},{status:500}); }
}
