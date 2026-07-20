import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../db";

async function ensureTable(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS collaborators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    research_direction TEXT NOT NULL,
    bio TEXT NOT NULL,
    photo_key TEXT NOT NULL,
    photo_name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  try { await db.prepare(`ALTER TABLE collaborators ADD COLUMN photo_position TEXT NOT NULL DEFAULT '50% 20%'`).run(); } catch {}
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
    const rows = await db.prepare(`SELECT id, name, school, research_direction AS researchDirection,
      bio, photo_position AS photoPosition, created_at AS createdAt FROM collaborators ORDER BY created_at ASC, id ASC`).all();
    return NextResponse.json({ collaborators: rows.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ collaborators: [], error: error instanceof Error ? error.message : "暂时无法读取共创成员" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "管理员密钥不正确" }, { status: 401 });
  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const school = String(form.get("school") || "").trim();
    const researchDirection = String(form.get("researchDirection") || "").trim();
    const bio = String(form.get("bio") || "").trim();
    const photoPosition = String(form.get("photoPosition") || "50% 20%").trim();
    if (!name || !school || !researchDirection || !bio) return NextResponse.json({ error: "请填写全部成员资料" }, { status: 400 });
    if (name.length > 80 || school.length > 160 || researchDirection.length > 300 || bio.length > 2000) return NextResponse.json({ error: "成员资料超出字数限制" }, { status: 400 });

    const photo = form.get("photo");
    if (!(photo instanceof File) || photo.size === 0) return NextResponse.json({ error: "请上传个人照片" }, { status: 400 });
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(photo.type)) return NextResponse.json({ error: "照片仅支持 JPG、PNG 或 WebP" }, { status: 400 });
    if (photo.size > 4 * 1024 * 1024) return NextResponse.json({ error: "照片不能超过 4MB" }, { status: 400 });
    if (!env.FILES) return NextResponse.json({ error: "照片存储尚未启用" }, { status: 503 });

    const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const photoKey = `collaborator-photos/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    await env.FILES.put(photoKey, photo.stream(), { httpMetadata: { contentType: photo.type } });
    const db = getD1();
    await ensureTable(db);
    try {
      const row = await db.prepare(`INSERT INTO collaborators
        (name, school, research_direction, bio, photo_key, photo_name, photo_position, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`).bind(name, school, researchDirection, bio, photoKey, photo.name, photoPosition, new Date().toISOString()).first<{ id: number }>();
      return NextResponse.json({ ok: true, id: row?.id }, { status: 201 });
    } catch (error) {
      await env.FILES.delete(photoKey);
      throw error;
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "添加成员失败" }, { status: 500 });
  }
}
