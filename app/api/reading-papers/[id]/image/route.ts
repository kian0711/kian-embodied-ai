import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../../../db";

export async function GET(_request:NextRequest,context:{params:Promise<{id:string}>}) {
  const {id}=await context.params;
  if(!/^\d+$/.test(id)) return NextResponse.json({error:"无效论文"},{status:400});
  const row=await getD1().prepare("SELECT image_key AS imageKey FROM reading_papers WHERE id = ?").bind(Number(id)).first<{imageKey:string}>();
  if(!row?.imageKey||!env.FILES) return NextResponse.json({error:"图片不存在"},{status:404});
  const object=await env.FILES.get(row.imageKey); if(!object) return NextResponse.json({error:"图片不存在"},{status:404});
  return new Response(object.body,{headers:{"Content-Type":object.httpMetadata?.contentType||"image/jpeg","Cache-Control":"public, max-age=86400","ETag":object.httpEtag}});
}
