import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../../../db";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "无效论文" }, { status: 400 });
  const row = await getD1().prepare("SELECT pdf_key AS pdfKey,pdf_name AS pdfName FROM reading_papers WHERE id = ?").bind(Number(id)).first<{ pdfKey: string; pdfName: string }>();
  if (!row || !env.FILES) return NextResponse.json({ error: "PDF 不存在" }, { status: 404 });
  const object = await env.FILES.get(row.pdfKey);
  if (!object) return NextResponse.json({ error: "PDF 不存在" }, { status: 404 });
  const encoded = encodeURIComponent(row.pdfName).replace(/'/g, "%27");
  return new Response(object.body, { headers: {
    "Content-Type": "application/pdf",
    "Content-Length": String(object.size),
    "Content-Disposition": `inline; filename="paper.pdf"; filename*=UTF-8''${encoded}`,
    "Cache-Control": "public, max-age=3600",
  }});
}
