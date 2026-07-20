"use client";

import { useEffect, useState } from "react";

type ReadingPaper = { id:number; title:string; innovation:string; method:string; result:string; implementation:string; paperUrl:string; hasImage:number; createdAt:string };

export function MyPaperLibrary() {
  const [papers, setPapers] = useState<ReadingPaper[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/reading-papers").then((response) => response.json()).then((data) => setPapers(data.papers || [])).finally(() => setLoading(false)); }, []);
  return <section className="my-papers shell" id="my-papers">
    <div className="section-head"><div><p className="eyebrow"><span /> KIAN READING NOTES</p><h2>我的论文精读</h2></div><p>把每一次阅读沉淀为可以复用的研究判断。<br />访客可阅读，内容仅由 KIAN 维护。</p></div>
    {loading ? <div className="reading-empty">正在读取精读档案…</div> : papers.length === 0 ? <div className="reading-empty"><b>第一篇精读正在准备中</b><span>标题、创新点、方法、结果、实现途径与完整 PDF 将展示在这里。</span></div> :
      <div className="reading-list">{papers.map((paper, index) => <details className="reading-card" key={paper.id}>
        <summary className="reading-card-head"><span>{String(index + 1).padStart(2,"0")}</span><div><small>{new Date(paper.createdAt).toLocaleDateString("zh-CN")} · KIAN 精读</small><h3>{paper.title}</h3></div><i aria-hidden="true">＋</i></summary>
        <div className="reading-detail">
          {Boolean(paper.hasImage) && <figure className="paper-visual"><img src={`/api/reading-papers/${paper.id}/image`} alt={`一张图了解《${paper.title}》`} /><figcaption>一张图了解这篇论文</figcaption></figure>}
          <div className="reading-insights"><div><small>01 · INNOVATION</small><b>创新点</b><p>{paper.innovation}</p></div><div><small>02 · METHOD</small><b>方法</b><p>{paper.method}</p></div><div><small>03 · RESULT</small><b>结果</b><p>{paper.result}</p></div><div><small>04 · IMPLEMENTATION</small><b>实现途径</b><p>{paper.implementation}</p></div></div>
          <a className="reading-source" href={paper.paperUrl} target="_blank" rel="noreferrer">打开论文原文 ↗</a>
        </div>
      </details>)}</div>}
  </section>;
}
