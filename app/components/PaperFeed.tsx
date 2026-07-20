"use client";

import { useEffect, useState } from "react";

type Paper = { id: string; title: string; abstract: string; year: number; authors: string; url: string; citations: number; date?: string };

export function PaperFeed({ track }: { track: string }) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("每日论文雷达");

  useEffect(() => {
    fetch(`/api/papers?track=${track}`)
      .then((res) => res.json())
      .then((data) => { setPapers(data.papers ?? []); setSource(data.live ? "今日已从 Semantic Scholar 更新" : "精选论文 · 网络恢复后自动更新"); })
      .catch(() => setPapers([]))
      .finally(() => setLoading(false));
  }, [track]);

  return <section className="live-papers">
    <div className="learn-section-head"><div><p className="eyebrow"><span /> DAILY PAPER RADAR</p><h2>今日优质论文</h2></div><p className="radar-status"><i />{source}<small>每 24 小时刷新一次</small></p></div>
    {loading ? <div className="paper-loading"><i /><i /><i /></div> : <div className="live-paper-grid">
      {papers.map((paper, index) => <a className="live-paper" href={paper.url} target="_blank" rel="noreferrer" key={paper.id}>
        <div className="live-paper-top"><span>0{index + 1}</span><em>{paper.year}</em><b>↗</b></div>
        <h3>{paper.title}</h3><p>{paper.abstract || "查看论文摘要与完整研究内容。"}</p>
        <div className="paper-authors">{paper.authors}</div><div className="paper-score"><span>引用 {paper.citations}</span><span>主题匹配</span></div>
      </a>)}
    </div>}
    <p className="paper-source">数据来自 Semantic Scholar Academic Graph API；“优质”综合主题相关性、引用量与发表时间排序，最终判断请以论文原文为准。</p>
  </section>;
}
