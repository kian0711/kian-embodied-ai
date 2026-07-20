"use client";

import { FormEvent, useState } from "react";

export default function PaperAdminPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("正在发布精读…");
    const form = event.currentTarget;
    try {
      const formData=new FormData(form);
      const response=await fetch("/api/reading-papers",{method:"POST",headers:{Authorization:`Bearer ${key}`},body:formData});
      const data=await response.json() as {error?:string}; if(!response.ok) throw new Error(data.error||"发布失败");
      form.reset(); setStatus("上传成功，论文已出现在公开页面。");
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
  </div></main>;
}
