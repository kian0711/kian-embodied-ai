import { NextResponse } from "next/server";
import { getD1 } from "../../../db";

export async function POST() {
  try {
    const db = getD1();
    await db.prepare(`CREATE TABLE IF NOT EXISTS site_views (id TEXT PRIMARY KEY, view_count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)`).run();
    const now = new Date().toISOString();
    const row = await db.prepare(`INSERT INTO site_views (id, view_count, updated_at) VALUES (?, 1, ?) ON CONFLICT(id) DO UPDATE SET view_count = view_count + 1, updated_at = excluded.updated_at RETURNING view_count`).bind("global", now).first<{ view_count: number }>();

    return NextResponse.json({ views: Number(row?.view_count ?? 1) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "unavailable" }, { status: 503 });
  }
}
