"use client";

import { FormEvent, useState } from "react";

type AdminPaper={id:number;title:string;status:"pending"|"approved";createdAt:string;paperUrl:string;hasImage:number};

async function readResponse(response: Response): Promise<{error?: string}> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json() as Promise<{error?: string}>;
  const message = (await response.text()).trim();
  if (response.status === 413) return { error: "上传内容过大，请选择不超过 4MB 的图片后重试。" };
  return { error: message || `请求失败（HTTP ${response.status}）` };
}

export default function PaperAdminPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [papers,setPapers]=useState<AdminPaper[]>([]);
  const [manageStatus,setManageStatus]=useState("");
  async function loadPapers(){
    if(!key){setManageStatus("请先输入管理员密钥");return;}
    setManageStatus("正在读取审核列表…");
    const response=await fetch("/api/reading-papers",{headers:{Authorization:`Bearer ${key}`}});const data=await response.json() as {papers?:AdminPaper[];error?:string};
    if(!response.ok){setManageStatus(data.error||"密钥验证失败");return;}setPapers(data.papers||[]);setManageStatus("");
  }
  async function updatePaper(id:number,action:"approve"|"delete"){
    const label=action==="delete"?"删除":"通过审核";
    if(action==="delete"&&!window.confirm("确认永久删除这篇论文精读吗？"))return;
    setManageStatus(`正在${label}…`);
    const response=await fetch(`/api/reading-papers/${id}`,{method:action==="delete"?"DELETE":"PATCH",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:action==="delete"?undefined:JSON.stringify({status:"approved"})});
    const data=await response.json() as {error?:string};if(!response.ok){setManageStatus(data.error||`${label}失败`);return;}await loadPapers();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("正在发布精读…");
    const form = event.currentTarget;
    try {
      const formData=new FormData(form);
      const image=formData.get("image");
      if(image instanceof File && image.size > 4 * 1024 * 1024) throw new Error("图片不能超过 4MB，请压缩后重试。");
      const response=await fetch("/api/reading-papers",{method:"POST",headers:{Authorization:`Bearer ${key}`},body:formData});
      const data=await readResponse(response); if(!response.ok) throw new Error(data.error||"发布失败");
      form.reset(); setStatus("提交成功，论文已进入待审核列表。"); await loadPapers();
    } catch(error) { setStatus(error instanceof Error?error.message:"上传失败，请重试。"); }
    finally { setBusy(false); }
  }
  return <main className="admin-page"><div className="admin-shell">
    <a className="admin-back" href="/">← 返回 KIAN 学习地图</a>
    <p className="eyebrow"><span /> PRIVATE PUBLISHING DESK</p><h1>论文精读发布台</h1><p className="admin-lead">此页面只负责提交内容。所有写入操作都需要你的管理员密钥，访客即使发现页面也无法上传。</p>
    <form onSubmit={submit} className="paper-form">
      <label>管理员密钥<input type="password" value={key} onChange={(event)=>setKey(event.target.value)} required autoComplete="current-password" /></label>
      <label className="wide">论文标题<input name="title" required maxLength={300} placeholder="输入论文的完整标题" /></label>
      <label>创新点<textarea name="innovation" required maxLength={6000} placeholder="这篇论文解决了什么新问题？核心贡献是什么？" /></label>
      <label>方法<textarea name="method" required maxLength={6000} placeholder="模型、数据、训练方式和关键技术路线" /></label>
      <label>结果<textarea name="result" required maxLength={6000} placeholder="实验结果、指标提升和重要结论" /></label>
      <label>可以实现的途径<textarea name="implementation" required maxLength={6000} placeholder="如何复现、需要哪些工具和具体步骤" /></label>
      <label className="wide">论文链接<input name="paperUrl" type="url" required placeholder="https://arxiv.org/abs/... 或论文官网链接" /></label>
      <label className="wide file-field">一张图了解这篇论文<input name="image" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" /><small>可选，支持 JPG、PNG、WebP，最大 4MB；建议使用横版知识图或方法流程图</small></label>
      <button className="wide" disabled={busy}>{busy ? "正在发布…" : "发布论文精读 →"}</button>
      {status && <p className="wide form-status" role="status">{status}</p>}
    </form>
    <section className="review-desk">
      <div className="review-head"><div><small>ADMIN ONLY</small><h2>精读审核与管理</h2></div><button onClick={loadPapers} disabled={!key}>验证密钥并刷新</button></div>
      {manageStatus&&<p className="manage-status" role="status">{manageStatus}</p>}
      {!papers.length&&!manageStatus?<div className="review-empty">输入管理员密钥，点击刷新后查看待审核及已发布论文。</div>:
      <div className="review-list">{papers.map((paper)=><article key={paper.id}><div><span className={`review-state ${paper.status}`}>{paper.status==="approved"?"已发布":"待审核"}</span><small>{new Date(paper.createdAt).toLocaleDateString("zh-CN")}{paper.hasImage?" · 含知识图":""}</small><h3>{paper.title}</h3><a href={paper.paperUrl} target="_blank" rel="noreferrer">检查论文链接 ↗</a></div><div className="review-actions">{paper.status!=="approved"&&<button onClick={()=>updatePaper(paper.id,"approve")}>通过审核</button>}<button className="danger" onClick={()=>updatePaper(paper.id,"delete")}>删除</button></div></article>)}</div>}
    </section>
  </div></main>;
}
