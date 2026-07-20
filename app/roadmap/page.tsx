import { PublicHeader } from "../components/PublicHeader";
import { SiteFooter } from "../components/SiteFooter";
import { learningTracks } from "../../lib/learning";
import "./roadmap.css";

export default function RoadmapPage(){
  return <main className="home-modern public-page roadmap-page">
    <PublicHeader />
    <header className="public-portal-hero public-shell"><p>STRUCTURED LEARNING · STEP BY STEP</p><h1>学习路线</h1><span>沿着“基础认知 → 模型理解 → 世界预测 → 真机实践”，边学边做出第一个可运行项目。</span></header>
    <section className="route-intro public-shell"><div><small>HOW TO START</small><h2>小白应该怎样使用这条路线？</h2></div><p>按 01—04 顺序学习最稳妥；已有机器人基础的同学也可以直接进入对应阶段。每门课程都包含直觉解释、必要理论、案例、具体应用、章节检查点和结课项目。遇到陌生概念先完成案例，不必等到“全部学会”才开始动手。</p><div className="route-rule"><b>建议节奏</b><span>每周 3–5 小时</span><b>学习方法</b><span>理论 30% · 实践 70%</span><b>完成标志</b><span>可运行、可评测、可复盘</span></div></section>
    <section className="route-map"><div className="public-shell"><div className="route-map-head"><p>4 STAGES · 24 CHAPTERS</p><h2>从第一条概念到第一个机器人闭环</h2></div><div className="route-stages">{learningTracks.map((track,index)=><article className={`route-stage route-${track.color}`} key={track.id}><div className="route-stage-top"><span>{track.step}</span><small>{track.en}</small></div><div className="route-stage-copy"><p>阶段 {index+1} / 4</p><h3>{track.title}</h3><strong>{track.level} · {track.duration}</strong><div className="route-progress"><i style={{width:`${(index+1)*25}%`}} /></div><p>{track.intro}</p></div><div className="route-goals"><b>学完你将能够</b><p>{track.outcome}</p></div><div className="route-concepts">{track.concepts.slice(0,4).map(item=><span key={item}>{item}</span>)}</div><div className="route-stage-foot"><span>{track.chapters.length} 个章节</span><a href={`/learn/${track.id}`}>进入课程 <b>→</b></a></div></article>)}</div></div></section>
    <section className="route-finish public-shell"><div><p>LEARN · BUILD · SHARE</p><h2>学习不是收藏内容，而是完成一个作品</h2><span>从基础阶段开始，每章完成一个检查点；最后把项目、实验结果和失败复盘分享给社区。</span></div><a className="blue-btn" href="/learn/foundation">从第一阶段开始 <b>→</b></a></section>
    <SiteFooter />
  </main>;
}
