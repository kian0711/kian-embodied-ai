import { MyPaperLibrary } from "./components/MyPaperLibrary";
import { SiteFooter } from "./components/SiteFooter";
import { PublicHeader } from "./components/PublicHeader";

const features = [
  { icon: "01", title: "免费学习", text: "所有公开课程、项目和论文解读均免费开放，不设会员与付费门槛。" },
  { icon: "02", title: "开放分享", text: "每位同学都可以上传项目、论文解读、学习笔记和技术经验。" },
  { icon: "03", title: "共同建设", text: "累计完成 10 次有效贡献，可以申请成为平台共创者。" },
];

const directions = ["ROS 2", "移动机器人", "机械臂", "四足机器人", "无人机", "具身智能", "SLAM", "强化学习"];

export default function Home() {
  return <main className="home-modern" id="top">
    <PublicHeader />

    <section className="public-hero public-shell">
      <div className="public-hero-copy"><p className="public-kicker"><i /> 公益 · 免费 · 开放</p><h1>机器人学习，<br /><span>不应该有门槛</span></h1><p>这是一个由机器人学习者共同建设的公益平台。所有公开内容免费开放，让知识被分享，让优秀作品被看见。</p><div className="public-actions"><a className="blue-btn" href="/roadmap">开始学习 <b>→</b></a><a className="outline-btn" href="/projects">浏览项目</a><a className="text-link" href="#upload">上传作品 ↗</a></div><div className="public-promise"><span>✓ 永久免费</span><span>✓ 可匿名发布</span><span>✓ 审核后公开展示</span></div></div>
      <div className="robot-board" aria-label="机器人学习社区方向示意"><div className="board-grid" /><div className="board-head"><span>OPEN LEARNING NETWORK</span><i>LIVE</i></div><div className="robot-core"><span>ROBOT</span><b>学习共同体</b><small>LEARN · BUILD · SHARE</small></div>{directions.map((item,index)=><span className={`topic topic-${index+1}`} key={item}>{item}</span>)}<div className="board-foot"><span>01 学习</span><i>→</i><span>02 实践</span><i>→</i><span>03 分享</span></div></div>
    </section>

    <section className="public-features public-shell" id="about">{features.map(feature=><article key={feature.title}><span>{feature.icon}</span><div><h2>{feature.title}</h2><p>{feature.text}</p></div></article>)}</section>

    <section className="learning-preview" id="roadmap"><div className="public-shell"><div className="public-section-head"><div><p>STRUCTURED LEARNING</p><h2>从入门到实践的学习路线</h2></div><a href="/roadmap">查看完整路线 →</a></div><div className="learning-steps"><article><span>01</span><b>机器人基础</b><p>运动学、控制与机器人系统的共同语言</p></article><article><span>02</span><b>VLA 模型</b><p>理解视觉、语言与动作如何进入同一个模型</p></article><article><span>03</span><b>世界模型</b><p>学习预测未来、想象规划与模型控制</p></article><article><span>04</span><b>机器人实践</b><p>从仿真复现到真实机器人部署</p></article></div></div></section>

    <MyPaperLibrary />

    <section className="contribution-rule"><div className="public-shell"><span>10</span><div><p>CO-CREATOR RULE</p><h2>完成 10 次有效贡献，申请成为共创者</h2><p>共创者代表持续参与平台建设，不代表技术水平排名。你可以自愿展示头像、昵称、学校、研究方向、贡献次数和代表项目。</p></div><a href="/collaboration">了解共创计划 →</a></div></section>

    <section className="upload-callout public-shell" id="upload"><div><p>SHARE YOUR WORK</p><h2>让你的作品被更多人看到</h2><span>分享项目、论文解读、学习笔记、项目复现和技术教程。是否公开姓名和学校，完全由你决定。</span></div><div><a className="blue-btn" href="/projects#open-projects">上传项目 <b>→</b></a><a className="outline-btn" href="/admin/papers">发布论文解读</a></div></section>

    <SiteFooter home />
  </main>;
}
