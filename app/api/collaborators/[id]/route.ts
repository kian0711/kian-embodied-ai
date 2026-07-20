import { env } from "cloudflare:workers";
import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "../../../../db";

function isAdmin(request: NextRequest) { const configured=String(env.ADMIN_UPLOAD_KEY||""); const supplied=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"")||""; return configured.length>=12&&supplied===configured; }
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: "仅管理员可以编辑成员" }, { status: 401 });
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: "无效成员" }, { status: 400 });
  try {
    const form=await request.formData(); const name=String(form.get("name")||"").trim(); const school=String(form.get("school")||"").trim(); const researchDirection=String(form.get("researchDirection")||"").trim(); const bio=String(form.get("bio")||"").trim(); const photoPosition=String(form.get("photoPosition")||"50% 20%").trim();
    if(!name||!school||!researchDirection||!bio) return NextResponse.json({error:"请填写全部成员资料"},{status:400});
    if(name.length>80||school.length>160||researchDirection.length>300||bio.length>2000) return NextResponse.json({error:"成员资料超出字数限制"},{status:400});
    const db=getD1(); try{await db.prepare("ALTER TABLE collaborators ADD COLUMN photo_updated_at TEXT").run();}catch{} const previous=await db.prepare("SELECT photo_key AS photoKey, photo_name AS photoName FROM collaborators WHERE id = ?").bind(Number(id)).first<{photoKey:string;photoName:string}>();
    if(!previous) return NextResponse.json({error:"成员不存在"},{status:404});
    const photo=form.get("photo"); let photoKey=previous.photoKey; let photoName=previous.photoName; let replacementKey="";
    if(photo instanceof File&&photo.size>0){
      const allowed=new Set(["image/jpeg","image/png","image/webp"]); if(!allowed.has(photo.type))return NextResponse.json({error:"照片仅支持 JPG、PNG 或 WebP"},{status:400}); if(photo.size>4*1024*1024)return NextResponse.json({error:"照片不能超过 4MB"},{status:400}); if(!env.FILES)return NextResponse.json({error:"照片存储尚未启用"},{status:503});
      const extension=photo.type==="image/png"?"png":photo.type==="image/webp"?"webp":"jpg"; replacementKey=`collaborator-photos/${Date.now()}-${crypto.randomUUID()}.${extension}`; await env.FILES.put(replacementKey,photo.stream(),{httpMetadata:{contentType:photo.type}}); photoKey=replacementKey; photoName=photo.name;
    }
    try{await db.prepare("UPDATE collaborators SET name = ?, school = ?, research_direction = ?, bio = ?, photo_key = ?, photo_name = ?, photo_position = ?, photo_updated_at = ? WHERE id = ?").bind(name,school,researchDirection,bio,photoKey,photoName,photoPosition,new Date().toISOString(),Number(id)).run();}
    catch(error){if(replacementKey&&env.FILES)await env.FILES.delete(replacementKey);throw error;}
    if(replacementKey&&previous.photoKey&&env.FILES)await env.FILES.delete(previous.photoKey);
    return NextResponse.json({ok:true});
  } catch(error){return NextResponse.json({error:error instanceof Error?error.message:"编辑成员失败"},{status:500});}
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: "仅管理员可以删除成员" }, { status: 401 });
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: "无效成员" }, { status: 400 });
  const db=getD1(); const row=await db.prepare("SELECT photo_key AS photoKey FROM collaborators WHERE id = ?").bind(Number(id)).first<{photoKey:string}>();
  if (!row) return NextResponse.json({ error: "成员不存在" }, { status: 404 });
  await db.prepare("DELETE FROM collaborators WHERE id = ?").bind(Number(id)).run(); if(row.photoKey&&env.FILES) await env.FILES.delete(row.photoKey);
  return NextResponse.json({ ok: true });
}
