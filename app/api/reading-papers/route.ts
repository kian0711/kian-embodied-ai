import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../db";

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS reading_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    innovation TEXT NOT NULL,
    method TEXT NOT NULL,
    result TEXT NOT NULL,
    implementation TEXT NOT NULL,
    paper_url TEXT NOT NULL DEFAULT '',
    image_key TEXT NOT NULL DEFAULT '',
    image_name TEXT NOT NULL DEFAULT '',
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
    const rows = await db.prepare(`SELECT id,title,innovation,method,result,implementation,paper_url AS paperUrl,
      CASE WHEN image_key <> '' THEN 1 ELSE 0 END AS hasImage,
      created_at AS createdAt
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
    const paperUrl = String(form.get("paperUrl") || "").trim();
    try { const parsed = new URL(paperUrl); if (!/^https?:$/.test(parsed.protocol)) throw new Error(); }
    catch { return NextResponse.json({ error: "请输入有效的 http 或 https 论文链接" }, { status: 400 }); }

    let imageKey = ""; let imageName = "";
    const image = form.get("image");
    if (image instanceof File && image.size > 0) {
      const allowed = new Set(["image/jpeg","image/png","image/webp"]);
      if (!allowed.has(image.type)) return NextResponse.json({ error:"图片仅支持 JPG、PNG 或 WebP" },{status:400});
      if (image.size > 4 * 1024 * 1024) return NextResponse.json({ error:"图片不能超过 4MB" },{status:400});
      if (!env.FILES) return NextResponse.json({ error:"图片存储尚未启用" },{status:503});
      const extension = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
      imageKey = `reading-images/${Date.now()}-${crypto.randomUUID()}.${extension}`; imageName = image.name;
      await env.FILES.put(imageKey, image.stream(), { httpMetadata:{contentType:image.type}, customMetadata:{originalName:encodeURIComponent(image.name)} });
    }
    const db = getD1();
    await ensureTable(db);
    const createdAt = new Date().toISOString();
    try {
      const inserted = await db.prepare(`INSERT INTO reading_papers
        (title,innovation,method,result,implementation,paper_url,image_key,image_name,pdf_key,pdf_name,pdf_size,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`).bind(values.title, values.innovation, values.method, values.result, values.implementation, paperUrl, imageKey, imageName, "", "", 0, createdAt).first<{ id: number }>();
      return NextResponse.json({ ok: true, id: inserted?.id }, { status: 201 });
    } catch(error) { if(imageKey && env.FILES) await env.FILES.delete(imageKey); throw error; }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "上传失败" }, { status: 500 });
  }
}
