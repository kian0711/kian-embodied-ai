"use client";

import { useCallback, useEffect, useState } from "react";

type Paper = { id:number; title:string; abstract:string; authors:string; year:number; url:string; category:string; categoryLabel:string; citations:number; addedAt:string };
type LibraryResponse = { papers:Paper[]; total:number; page:number; pages:number; lastSyncAt:string|null; addedToday:number; live:boolean };

const categories = [{id:"all",label:"全部"},{id:"vla",label:"VLA 模型"},{id:"world",label:"世界模型"},{id:"practice",label:"机器人实践"},{id:"foundation",label:"基础研究"}];
const years = ["all",...Array.from({length:Math.max(1,new Date().getFullYear()-2022)},(_,index)=>String(new Date().getFullYear()-index))];

export function AccumulatingPaperLibrary() {
  const [data,setData] = useState<LibraryResponse>({papers:[],total:0,page:1,pages:1,lastSyncAt:null,addedToday:0,live:false});
  const [page,setPage] = useState(1); const [category,setCategory] = useState("all"); const [year,setYear] = useState("all"); const [query,setQuery] = useState(""); const [input,setInput] = useState(""); const [loading,setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); const params=new URLSearchParams({page:String(page),category,year,q:query}); fetch(`/api/library?${params}`).then(r=>r.json()).then(setData).finally(()=>setLoading(false)); },[page,category,year,query]);
  useEffect(()=>{load()},[load]);
  const submit=(e:React.FormEvent)=>{e.preventDefault();setPage(1);setQuery(input)};
  const translate=(paper:Paper)=>`https://www.bing.com/translator?from=en&to=zh-Hans&text=${encodeURIComponent((paper.abstract||paper.title).slice(0,900))}`;
  const fallback=(paper:Paper)=>`https://www.bing.com/search?q=${encodeURIComponent(`论文 ${paper.title}`)}`;
  const readableUrl=(paper:Paper)=>paper.url.includes("semanticscholar.org/paper/")?`https://arxiv.org/search/?query=${encodeURIComponent(paper.title)}&searchtype=title&abstracts=show&order=-announced_date_first&size=50`:paper.url;
  return <>
    <div className="section-head paper-head"><div><p className="eyebrow"><span /> GROWING PAPER ARCHIVE</p><h2>从经典到前沿</h2><p className="archive-note">{new Date().getFullYear()} → 2023 按年份倒序 · 每小时自动检索，单次最多新增 50 篇 · 已收录 <b>{data.total}</b> 篇</p></div><form className="search" onSubmit={submit}><span>⌕</span><input value={input} onChange={e=>setInput(e.target.value)} placeholder="搜索论文、作者或主题" /></form></div>
    <div className="year-filter" aria-label="按年份筛选论文">{years.map(item=><button key={item} className={year===item?"active":""} onClick={()=>{setYear(item);setPage(1)}}>{item==="all"?"全部年份":item}</button>)}</div>
    <div className="library-toolbar"><div>{categories.map(item=><button key={item.id} className={category===item.id?"active":""} onClick={()=>{setCategory(item.id);setPage(1)}}>{item.label}</button>)}</div><p><i />{data.live?`最近一轮新增 ${data.addedToday} 篇`:`论文档案暂时离线`}<small>{data.lastSyncAt?`最近更新 ${new Date(data.lastSyncAt).toLocaleString("zh-CN")}`:"正在等待首次自动更新"}</small></p></div>
    <div className={`archive-list ${loading?"loading":""}`}>{data.papers.map((paper,index)=><article className="archive-paper" key={paper.id}>
      <div className="archive-index">{String((data.page-1)*8+index+1).padStart(2,"0")}</div><div className="archive-year">{paper.year}<small>{paper.categoryLabel}</small></div><div className="archive-main"><h3>{paper.title}</h3><p>{paper.abstract||"暂无摘要，点击原文查看完整内容。"}</p><span>{paper.authors}</span></div><div className="archive-metrics"><span>引用 {paper.citations}</span><small>收录 {paper.addedAt}</small></div><div className="archive-actions"><a href={readableUrl(paper)} target="_blank" rel="noreferrer">阅读原文 ↗</a><a className="translate" href={translate(paper)} target="_blank" rel="noreferrer">翻译摘要 文</a><a className="fallback" href={fallback(paper)} target="_blank" rel="noreferrer">备用搜索 ⌕</a></div>
    </article>)}</div>
    {!loading&&!data.papers.length&&<div className="empty-library">没有找到匹配论文，请尝试其他关键词。</div>}
    <div className="pagination"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← 上一页</button><span>{data.page} / {data.pages}</span><button disabled={page>=data.pages} onClick={()=>setPage(p=>p+1)}>下一页 →</button></div>
    <p className="paper-source">论文元数据来自 Semantic Scholar Academic Graph。原文优先使用 arXiv，其次使用 DOI 或开放 PDF；无法访问时可使用备用搜索。摘要翻译由 Bing Translator 提供。</p>
  </>;
}
