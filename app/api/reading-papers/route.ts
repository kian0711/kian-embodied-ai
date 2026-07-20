import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../db";

const MAX_PDF_SIZE = 20 * 1024 * 1024;

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS reading_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    innovation TEXT NOT NULL,
    method TEXT NOT NULL,
    result TEXT NOT NULL,
    implementation TEXT NOT NULL,
    pdf_key TEXT NOT NULL,
    pdf_name TEXT NOT NULL,
    pdf_size INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
}

function isAdmin(request: NextRequest) {
  const configured = String(env.ADMIN_UPLOAD_KEY || "");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  return configured.length >= 12 && supplied === configured;
}

export async function GET() {
  try {
    const db = getD1();
    await ensureTable(db);
    const rows = await db.prepare(`SELECT id,title,innovation,method,result,implementation,
      pdf_name AS pdfName,pdf_size AS pdfSize,created_at AS createdAt
      FROM reading_papers ORDER BY created_at DESC, id DESC`).all();
    return NextResponse.json({ papers: rows.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ papers: [], error: error instanceof Error ? error.message : "unavailable" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "管理密钥不正确" }, { status: 401 });
  try {
    const form = await request.formData();
    const fields = ["title", "innovation", "method", "result", "implementation"] as const;
    const values = Object.fromEntries(fields.map((field) => [field, String(form.get(field) || "").trim()])) as Record<typeof fields[number], string>;
    if (fields.some((field) => !values[field])) return NextResponse.json({ error: "请填写全部精读内容" }, { status: 400 });
    if (fields.some((field) => values[field].length > 6000)) return NextResponse.json({ error: "单项内容不能超过 6000 字" }, { status: 400 });
    const pdf = form.get("pdf");
    if (!(pdf instanceof File) || pdf.type !== "application/pdf") return NextResponse.json({ error: "请上传 PDF 文件" }, { status: 400 });
    if (pdf.size <= 0 || pdf.size > MAX_PDF_SIZE) return NextResponse.json({ error: "PDF 大小必须在 20MB 以内" }, { status: 400 });
    if (!env.FILES) return NextResponse.json({ error: "文件存储尚未启用" }, { status: 503 });

    const safeName = pdf.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "paper.pdf";
    const key = `reading-papers/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    await env.FILES.put(key, pdf.stream(), { httpMetadata: { contentType: "application/pdf" }, customMetadata: { originalName: encodeURIComponent(pdf.name) } });

    const db = getD1();
    await ensureTable(db);
    try {
      const createdAt = new Date().toISOString();
      const inserted = await db.prepare(`INSERT INTO reading_papers
        (title,innovation,method,result,implementation,pdf_key,pdf_name,pdf_size,created_at)
        VALUES (?,?,?,?,?,?,?,?,?) RETURNING id`).bind(values.title, values.innovation, values.method, values.result, values.implementation, key, pdf.name, pdf.size, createdAt).first<{ id: number }>();
      return NextResponse.json({ ok: true, id: inserted?.id }, { status: 201 });
    } catch (error) {
      await env.FILES.delete(key);
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "上传失败" }, { status: 500 });
  }
}
