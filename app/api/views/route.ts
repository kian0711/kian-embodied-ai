import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { getD1 } from "../../../db";

async function anonymousIpKey(ip: string) {
  const secret = String((env as unknown as { VISITOR_HASH_SECRET?: string }).VISITOR_HASH_SECRET ?? "");
  if (!secret) throw new Error("Visitor hash secret is unavailable");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const db = getD1();
    await db.prepare(`CREATE TABLE IF NOT EXISTS site_visitors (ip_hash TEXT PRIMARY KEY, first_seen_at TEXT NOT NULL, last_seen_at TEXT NOT NULL)`).run();
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
    if (!ip) throw new Error("Visitor IP is unavailable");
    const ipHash = await anonymousIpKey(ip);
    const now = new Date().toISOString();
    await db.prepare(`INSERT INTO site_visitors (ip_hash, first_seen_at, last_seen_at) VALUES (?, ?, ?) ON CONFLICT(ip_hash) DO UPDATE SET last_seen_at = excluded.last_seen_at`).bind(ipHash, now, now).run();
    const row = await db.prepare(`SELECT COUNT(*) AS total FROM site_visitors`).first<{ total: number }>();

    return NextResponse.json({ views: Number(row?.total ?? 1) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "unavailable" }, { status: 503 });
  }
}
