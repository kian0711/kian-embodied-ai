import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../../db";

function isAdmin(request: NextRequest) { const configured=String(env.ADMIN_UPLOAD_KEY||""); const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||""; return configured.length>=12&&supplied===configured; }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: "仅管理员可以删除成员" }, { status: 401 });
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: "无效成员" }, { status: 400 });
  const db=getD1(); const row=await db.prepare("SELECT photo_key AS photoKey FROM collaborators WHERE id = ?").bind(Number(id)).first<{photoKey:string}>();
  if (!row) return NextResponse.json({ error: "成员不存在" }, { status: 404 });
  await db.prepare("DELETE FROM collaborators WHERE id = ?").bind(Number(id)).run(); if(row.photoKey&&env.FILES) await env.FILES.delete(row.photoKey);
  return NextResponse.json({ ok: true });
}
