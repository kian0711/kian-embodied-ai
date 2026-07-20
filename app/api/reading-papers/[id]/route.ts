import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../../db";

function isAdmin(request:NextRequest){const configured=String(env.ADMIN_UPLOAD_KEY||"");const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||"";return configured.length>=12&&supplied===configured;}
async function paperId(context:{params:Promise<{id:string}>}){const {id}=await context.params;return /^\d+$/.test(id)?Number(id):null;}

export async function PATCH(request:NextRequest,context:{params:Promise<{id:string}>}){
  if(!isAdmin(request))return NextResponse.json({error:"仅管理员可以审核"},{status:401});
  const id=await paperId(context);if(!id)return NextResponse.json({error:"无效论文"},{status:400});
  const body=await request.json() as {status?:string};if(!["approved","pending"].includes(body.status||""))return NextResponse.json({error:"无效审核状态"},{status:400});
  const result=await getD1().prepare("UPDATE reading_papers SET status = ? WHERE id = ?").bind(body.status,id).run();
  if(!result.meta.changes)return NextResponse.json({error:"论文不存在"},{status:404});
  return NextResponse.json({ok:true,status:body.status});
}

export async function DELETE(request:NextRequest,context:{params:Promise<{id:string}>}){
  if(!isAdmin(request))return NextResponse.json({error:"仅管理员可以删除"},{status:401});
  const id=await paperId(context);if(!id)return NextResponse.json({error:"无效论文"},{status:400});
  const db=getD1();const row=await db.prepare("SELECT image_key AS imageKey FROM reading_papers WHERE id = ?").bind(id).first<{imageKey:string}>();
  if(!row)return NextResponse.json({error:"论文不存在"},{status:404});
  await db.prepare("DELETE FROM reading_papers WHERE id = ?").bind(id).run();
  if(row.imageKey&&env.FILES)await env.FILES.delete(row.imageKey);
  return NextResponse.json({ok:true});
}
