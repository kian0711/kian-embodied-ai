import { notFound } from "next/navigation";
import { learningTracks, getTrack } from "../../../lib/learning";
import { getModuleDetail } from "../../../lib/moduleDetails";
import { PaperFeed } from "../../components/PaperFeed";

export async function generateStaticParams() { return learningTracks.map((track) => ({ slug: track.id })); }

export default async function LearningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();
  return <main className={`learning-page ${track.color}`}>
    <nav className="nav shell"><a href="/" className="brand"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span></a><div className="nav-links"><a href="#chapters">课程章节</a><a href="#concepts">关键概念</a><a href="#papers">每日论文</a></div><a className="nav-cta" href="/">← 返回星图</a></nav>
    <header className="learn-hero shell"><div className="learn-step">{track.step}</div><div><p className="eyebrow"><span /> {track.en}</p><h1>{track.title}</h1><p className="learn-intro">{track.intro}</p><div className="learn-meta"><span>学习时长 <b>{track.duration}</b></span><span>建议阶段 <b>{track.level}</b></span><span>章节数量 <b>{track.chapters.length} 章</b></span></div></div><aside><small>完成后你将能够</small><p>{track.outcome}</p><a href="#chapters">开始学习 <b>↓</b></a></aside></header>
    <section className="source-strip shell"><p>本课程融合自</p>{track.sources.map((source) => <span key={source}>{source}</span>)}</section>
    <section className="learn-block shell" id="chapters"><div className="learn-section-head"><div><p className="eyebrow"><span /> COURSE MODULES</p><h2>学习路线</h2></div><p>点击每个模块，展开理论、案例、应用与练习。</p></div><div className="chapter-list">{track.chapters.map((chapter) => { const detail = getModuleDetail(track.id, chapter.no); return <details key={chapter.no} className="course-module"><summary><span>{chapter.no}</span><div><small>MODULE {chapter.no}</small><h3>{chapter.title}</h3><p>{chapter.desc}</p></div><ol>{chapter.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ol><b className="module-toggle">＋</b></summary>{detail && <div className="module-body"><section><small>01 · 核心理论</small><h4>先理解为什么</h4><p>{detail.theory}</p></section><section className="case-card"><small>02 · 案例拆解</small><h4>{detail.caseStudy.title}</h4><p>{detail.caseStudy.story}</p></section><section><small>03 · 具体应用</small><h4>它能用在哪里</h4><ul>{detail.applications.map((item)=><li key={item}>{item}</li>)}</ul></section><section className="practice-card"><small>04 · 动手练习</small><h4>{detail.practice}</h4><p className="checkpoint">验收标准：{chapter.checkpoint}</p></section></div>}</details> })}</div></section>
    <section className="concept-section" id="concepts"><div className="shell concept-layout"><div><p className="eyebrow"><span /> KNOWLEDGE CHECKPOINT</p><h2>必须掌握的<br />关键概念</h2></div><div className="concept-grid">{track.concepts.map((concept,index)=><div key={concept}><span>0{index+1}</span><b>{concept}</b></div>)}</div><aside id={`project-${track.id}`}><small>路线项目</small><h3>{track.project.title}</h3><p>{track.project.desc}</p><em>{track.project.stack}</em><ul className="deliverables">{track.project.deliverables.map((item)=><li key={item}>{item}</li>)}</ul></aside></div></section>
    <div className="shell" id="papers"><PaperFeed track={track.id} /></div>
    <section className="next-track shell"><p>下一步</p><h2>继续沿 KIAN 学习星图前进</h2><div>{learningTracks.filter(t=>t.id!==track.id).map(t=><a key={t.id} href={`/learn/${t.id}`}><span>{t.step}</span>{t.title}<b>→</b></a>)}</div></section>
    <footer className="shell"><a href="/" className="brand"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span></a><p>让知识拥有身体，让智能走进真实世界。</p><span>© 2026 KIAN</span></footer>
  </main>;
}
