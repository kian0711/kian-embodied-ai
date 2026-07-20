"use client";

import { FormEvent, useState } from "react";

export default function PaperAdminPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function json(response: Response) {
    const text = await response.text();
    try { return JSON.parse(text) as Record<string, unknown>; }
    catch { throw new Error(response.status === 413 ? "文件超过单次上传限制" : `服务器返回错误（${response.status}）`); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("正在准备上传…");
    const form = event.currentTarget;
    try {
      const formData=new FormData(form); const pdf=formData.get("pdf");
      if(!(pdf instanceof File)) throw new Error("请选择 PDF 文件");
      if(pdf.size>50*1024*1024) throw new Error("PDF 不能超过 50MB");
      const auth={Authorization:`Bearer ${key}`};
      const initResponse=await fetch("/api/reading-papers/upload",{method:"POST",headers:{...auth,"Content-Type":"application/json"},body:JSON.stringify({action:"init",name:pdf.name,size:pdf.size})});
      const init=await json(initResponse); if(!initResponse.ok) throw new Error(String(init.error||"无法开始上传"));
      const chunkSize=4*1024*1024; const total=Math.ceil(pdf.size/chunkSize); const parts:{partNumber:number;etag:string}[]=[];
      for(let index=0;index<total;index++){
        setStatus(`正在上传 PDF：${index+1} / ${total}`);
        const url=`/api/reading-papers/upload?key=${encodeURIComponent(String(init.key))}&uploadId=${encodeURIComponent(String(init.uploadId))}&partNumber=${index+1}`;
        const partResponse=await fetch(url,{method:"PUT",headers:auth,body:pdf.slice(index*chunkSize,Math.min(pdf.size,(index+1)*chunkSize))});
        const part=await json(partResponse); if(!partResponse.ok) throw new Error(String(part.error||"PDF 分片上传失败"));
        parts.push({partNumber:Number(part.partNumber),etag:String(part.etag)});
      }
      setStatus("PDF 已上传，正在保存精读内容…");
      const completeBody=Object.fromEntries(["title","innovation","method","result","implementation"].map((name)=>[name,String(formData.get(name)||"")]));
      const completeResponse=await fetch("/api/reading-papers/upload",{method:"POST",headers:{...auth,"Content-Type":"application/json"},body:JSON.stringify({action:"complete",key:init.key,uploadId:init.uploadId,name:pdf.name,size:pdf.size,parts,...completeBody})});
      const complete=await json(completeResponse); if(!completeResponse.ok) throw new Error(String(complete.error||"保存失败"));
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
      <label className="wide file-field">完整论文 PDF<input name="pdf" type="file" accept="application/pdf,.pdf" required /><small>仅支持 PDF，最大 50MB；大文件会自动分片上传</small></label>
      <button className="wide" disabled={busy}>{busy ? "正在发布…" : "发布论文精读 →"}</button>
      {status && <p className="wide form-status" role="status">{status}</p>}
    </form>
  </div></main>;
}
