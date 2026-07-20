"use client";

import { useState } from "react";
import { AccumulatingPaperLibrary } from "./components/AccumulatingPaperLibrary";

const tracks = [
  { id: "foundation", step: "01", title: "基础导航", en: "FOUNDATIONS", desc: "从具身智能的核心问题出发，建立机器人学、视觉与强化学习的共同语言。", lessons: 12, time: "6 小时", color: "violet" },
  { id: "vla", step: "02", title: "VLA 模型", en: "VISION · LANGUAGE · ACTION", desc: "沿 RT-1、RT-2、OpenVLA 到 π0，理解视觉—语言—动作模型的演进。", lessons: 18, time: "10 小时", color: "lime" },
  { id: "world", step: "03", title: "世界模型", en: "WORLD · ACTION MODELS", desc: "学习预测未来状态与动作的模型，理解机器人的想象、规划与决策。", lessons: 14, time: "8 小时", color: "blue" },
  { id: "practice", step: "04", title: "机器人实践", en: "BUILD · SIMULATE · DEPLOY", desc: "在仿真环境中完成从数据采集、策略训练到真机部署的完整闭环。", lessons: 16, time: "12 小时", color: "orange" },
];

export default function Home() {
  const [activeTrack, setActiveTrack] = useState("vla");
  const [done, setDone] = useState(["foundation"]);
  const current = tracks.find((track) => track.id === activeTrack) ?? tracks[1];

  const toggleDone = (id: string) => setDone((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <main>
      <nav className="nav shell" aria-label="主导航">
        <a href="#top" className="brand" aria-label="KIAN 具身智能学习站首页"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span></a>
        <div className="nav-links"><a href="#roadmap">学习路径</a><a href="#papers">论文精读</a><a href="#practice">实践地图</a></div>
        <a className="nav-cta" href="#roadmap">开始探索 <span>↗</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> SYSTEMATIC LEARNING PATH · 2026</p>
          <h1>从感知到行动，<br />系统掌握<span>具身智能</span></h1>
          <p className="hero-lead">一张为学习者打造的研究星图。循序掌握基础理论、VLA 模型、世界模型与机器人实践，把零散论文连接成完整知识体系。</p>
          <div className="hero-actions"><a className="primary-btn" href="#roadmap">进入学习路径 <b>→</b></a><a className="text-btn" href="#papers"><i>▶</i> 浏览论文图谱</a></div>
          <div className="hero-stats"><div><strong>4</strong><span>阶段路径</span></div><div><strong>60</strong><span>节精选课程</span></div><div><strong>36h</strong><span>完整学习时长</span></div></div>
        </div>
        <div className="atlas" aria-label="具身智能知识图谱示意">
          <div className="atlas-label"><span>LEARNING ATLAS</span><b>四阶知识坐标</b></div>
          <div className="orbit orbit-1" /><div className="orbit orbit-2" /><div className="orbit orbit-3" />
          <button className="node node-center" onClick={() => setActiveTrack("vla")}><small>CORE</small>具身智能</button>
          <button className="node node-a" onClick={() => setActiveTrack("foundation")}><span>01</span>基础</button>
          <button className="node node-b" onClick={() => setActiveTrack("vla")}><span>02</span>VLA</button>
          <button className="node node-c" onClick={() => setActiveTrack("world")}><span>03</span>世界模型</button>
          <button className="node node-d" onClick={() => setActiveTrack("practice")}><span>04</span>实践</button>
          <div className="signal-dot dot-1" /><div className="signal-dot dot-2" />
          <p className="atlas-caption">感知 → 语言 → 规划 → 动作</p>
        </div>
      </section>

      <section className="roadmap shell" id="roadmap">
        <div className="section-head"><div><p className="eyebrow"><span /> YOUR LEARNING ORBIT</p><h2>四阶段学习路径</h2></div><p>无需一次读懂所有论文。沿着清晰的知识依赖，<br />从概念建立到动手部署，逐层进阶。</p></div>
        <div className="track-grid">
          {tracks.map((track) => <article key={track.id} tabIndex={0} className={`track-card ${activeTrack === track.id ? "active" : ""} ${track.color}`} onClick={() => setActiveTrack(track.id)} onKeyDown={(event) => { if(event.key === "Enter") setActiveTrack(track.id); }}>
            <div className="track-top"><span>{track.step}</span><small>{done.includes(track.id) ? "✓ 已完成" : "探索轨道 ↗"}</small></div>
            <p>{track.en}</p><h3>{track.title}</h3><div className="track-line" /><p className="track-desc">{track.desc}</p><div className="track-meta"><span>◫ {track.lessons} 课</span><span>◷ {track.time}</span><a href={`/learn/${track.id}`}>进入课程 →</a></div>
          </article>)}
        </div>
        <div className="course-panel">
          <div><span className="course-no">{current.step}</span><p>当前选中轨道</p><h3>{current.title}</h3></div>
          <p>{current.desc}</p>
          <button onClick={() => toggleDone(current.id)}>{done.includes(current.id) ? "撤销完成" : "标记为已完成"}</button>
          <div className="progress-block"><span>你的路线进度 <b>{Math.round(done.length / tracks.length * 100)}%</b></span><div className="progress"><i style={{ width: `${done.length / tracks.length * 100}%` }} /></div></div>
        </div>
      </section>

      <section className="papers-section" id="papers"><div className="shell"><AccumulatingPaperLibrary /></div></section>

      <section className="practice shell" id="practice">
        <div><p className="eyebrow"><span /> LEARN BY BUILDING</p><h2>让知识在机器人身上<br /><span>真正发生。</span></h2><p>从仿真到真实世界，完成你的第一个视觉语言动作闭环。</p><a href="#roadmap" className="primary-btn">开始第一个实验 <b>→</b></a></div>
        <div className="pipeline"><div><b>01</b><span>看见</span><small>Vision</small></div><i>→</i><div><b>02</b><span>理解</span><small>Language</small></div><i>→</i><div><b>03</b><span>规划</span><small>Policy</small></div><i>→</i><div><b>04</b><span>行动</span><small>Action</small></div></div>
      </section>

      <section className="community shell" id="community">
        <div className="community-copy">
          <p className="eyebrow"><span /> KIAN LEARNING COMMUNITY</p>
          <h2>欢迎大家进群交流，<br /><span>一起维护学习网址。</span></h2>
          <p>这里不仅是一份课程，也是一群具身智能学习者共同生长的知识库。欢迎分享论文、学习笔记、机器人实践经验和课程建议，让内容持续变得更准确、更好懂。</p>
          <div className="community-points"><span>论文共读</span><span>问题交流</span><span>实践互助</span><span>共同维护</span></div>
          <small>微信扫码加入「具身智能机器人交流群 3」</small>
        </div>
        <figure className="community-qr">
          <div className="qr-glow" />
          <img src="/kian-wechat-group-20260720.jpg" alt="具身智能机器人交流群 3 微信群二维码" />
          <figcaption><b>扫码加入交流群</b><span>二维码有效期至 2026 年 7 月 27 日，失效后将及时更新</span></figcaption>
        </figure>
      </section>

      <footer className="shell"><a href="#top" className="brand"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span></a><p>原创课程内容，未经书面授权禁止复制、转载或商用。<a className="copyright-link" href="/copyright">版权声明</a></p><span>© 2026 KIAN · ALL RIGHTS RESERVED.</span></footer>
    </main>
  );
}
