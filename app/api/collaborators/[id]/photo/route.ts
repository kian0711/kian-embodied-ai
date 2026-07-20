import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../../../db";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const row = await getD1().prepare("SELECT photo_key AS photoKey FROM collaborators WHERE id = ?").bind(Number(id)).first<{ photoKey: string }>();
  if (!row?.photoKey || !env.FILES) return new NextResponse("Not found", { status: 404 });
  const object = await env.FILES.get(row.photoKey);
  if (!object) return new NextResponse("Not found", { status: 404 });
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("Cache-Control", "public, max-age=3600");
  return new NextResponse(object.body, { headers });
}
