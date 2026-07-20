import { notFound } from "next/navigation";
import { learningTracks, getTrack } from "../../../../lib/learning";
import { getModuleDetail } from "../../../../lib/moduleDetails";
import { buildLessonArticle } from "../../../../lib/lessonArticle";

export async function generateStaticParams() {
  return learningTracks.flatMap((track) => track.chapters.map((chapter) => ({ slug: track.id, module: chapter.no })));
}

export default async function DetailedLessonPage({ params }: { params: Promise<{ slug: string; module: string }> }) {
  const { slug, module } = await params;
  const track = getTrack(slug);
  const chapter = track?.chapters.find((item) => item.no === module);
  const detail = track && chapter ? getModuleDetail(track.id, chapter.no) : undefined;
  if (!track || !chapter || !detail) notFound();
  const article = buildLessonArticle(track, chapter, detail);
  const index = track.chapters.findIndex((item) => item.no === chapter.no);
  const previous = track.chapters[index - 1];
  const next = track.chapters[index + 1];
  return <main className={`learning-page lesson-page ${track.color}`}>
    <nav className="nav shell"><a href="/" className="brand"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span></a><div className="nav-links"><a href="#theory">理论</a><a href="#case">案例</a><a href="#application">应用</a><a href="#practice-detail">实操</a></div><a className="nav-cta" href={`/learn/${track.id}`}>← 返回路线</a></nav>
    <header className="lesson-cover shell"><p className="eyebrow"><span /> {track.title} · MODULE {chapter.no}</p><div className="lesson-title-row"><span>{chapter.no}</span><div><h1>{chapter.title}</h1><p>{chapter.desc}</p></div></div><div className="lesson-tags"><span>小白友好</span><span>约 15–25 分钟</span><span>理论 + 公式 + 图解 + 案例</span></div></header>
    <div className="lesson-layout shell"><aside className="lesson-toc"><b>本课目录</b><a href="#start">01 · 先建立直觉</a><a href="#theory">02 · 核心理论</a><a href="#formula">03 · 公式拆解</a><a href="#diagram">04 · 流程图解</a><a href="#case">05 · 案例分析</a><a href="#application">06 · 具体应用</a><a href="#practice-detail">07 · 动手实验</a><a href="#pitfalls">08 · 常见错误</a><a href="#review">09 · 复习验收</a></aside>
      <article className="lesson-article">
        <section id="start"><small>01 · BEGINNER FIRST</small><h2>先建立直觉</h2><p>{article.intro}</p></section>
        <section id="theory"><small>02 · CORE THEORY</small><h2>核心理论：从输入到动作</h2><p>{article.basics}</p><p>{article.deeper}</p><div className="term-cards">{chapter.lessons.map((lesson, i)=><div key={lesson}><span>0{i+1}</span><h3>{lesson}</h3><p>{i===0?"先理解它在整个系统中的位置与输入输出。":i===1?"再观察它与前后模块如何交换数据、怎样产生误差。":"最后用可测量指标判断是否真正有效。"}</p></div>)}</div></section>
        <section id="formula"><small>03 · FORMULA</small><h2>公式拆解：不用怕数学</h2><div className="formula-panel"><span>{article.formula.name}</span><strong>{article.formula.expression}</strong><div>{article.formula.symbols.map((symbol)=><p key={symbol}>{symbol}</p>)}</div></div><p>{article.formulaGuide}</p></section>
        <section id="diagram"><small>04 · VISUAL EXPLANATION</small><h2>把知识放进机器人流程</h2><div className="lesson-diagram"><div><b>输入</b><span>图像 · 状态 · 指令</span></div><i>→</i>{chapter.lessons.map((lesson)=><><div key={lesson}><b>{lesson}</b><span>处理并留下中间结果</span></div><i key={`${lesson}-arrow`}>→</i></>)}<div><b>输出与评测</b><span>动作 · 成功率 · 失败日志</span></div></div><p>沿箭头阅读这张图：每个方框都必须有明确的数据格式和时间戳。调试时从左到右检查，若某一步已经错误，不要继续责怪下游模块。图中的中间结果应当能够保存和回放，这就是可观测系统与“只能看演示”的系统之间的区别。</p></section>
        <section id="case"><small>05 · CASE STUDY</small><h2>案例：{detail.caseStudy.title}</h2><blockquote>{detail.caseStudy.story}</blockquote><p>{article.caseNarrative}</p><ol className="case-steps"><li>复现现象：固定环境与输入，确认问题能够重复出现。</li><li>建立时间线：对齐传感、模型、控制和真实状态。</li><li>提出假设：一次只验证一个可能原因。</li><li>修改与对照：保留原始基线，比较同一组测试。</li><li>写入检查：把本次经验变成下次可自动执行的测试。</li></ol></section>
        <section id="application"><small>06 · APPLICATIONS</small><h2>具体应用：它能解决什么</h2><p>{article.applicationGuide}</p><div className="application-grid">{detail.applications.map((item,index)=><div key={item}><span>场景 0{index+1}</span><h3>{item}</h3><p>从一个边界清晰的小任务开始，先建立传统或简单模型基线，再逐步增加环境变化和泛化要求。</p></div>)}</div></section>
        <section id="practice-detail"><small>07 · HANDS-ON LAB</small><h2>动手实验：把理解变成证据</h2><div className="lab-callout"><b>本课任务</b><p>{detail.practice}</p></div><p>{article.practiceGuide}</p><table><thead><tr><th>阶段</th><th>你要做什么</th><th>必须留下的证据</th></tr></thead><tbody><tr><td>准备</td><td>固定环境、数据与配置</td><td>版本与参数表</td></tr><tr><td>运行</td><td>先跑通最小闭环</td><td>日志与演示结果</td></tr><tr><td>扰动</td><td>改变一个条件</td><td>对照实验</td></tr><tr><td>复盘</td><td>分类成功与失败</td><td>统计表和改进计划</td></tr></tbody></table></section>
        <section id="pitfalls"><small>08 · COMMON PITFALLS</small><h2>小白最容易踩的坑</h2><p>{article.pitfalls}</p><div className="warning-list"><p><b>不要：</b>只保存最好的一次结果。</p><p><b>不要：</b>训练与测试使用相同轨迹。</p><p><b>不要：</b>忽略单位、坐标系、频率和延迟。</p><p><b>应该：</b>为每次实验保存配置、统计和失败案例。</p></div></section>
        <section id="review"><small>09 · REVIEW</small><h2>复习与验收</h2><p>{article.review}</p><div className="review-box"><b>本课最终验收</b><p>{chapter.checkpoint}</p><span>完成后再进入下一模块，不以“看过”代替“做到”。</span></div></section>
      </article></div>
    <section className="lesson-nav shell"><div>{previous&&<a href={`/learn/${track.id}/${previous.no}`}>← 上一课<small>{previous.title}</small></a>}</div><a href={`/learn/${track.id}`}>返回课程目录</a><div>{next&&<a href={`/learn/${track.id}/${next.no}`}>下一课 →<small>{next.title}</small></a>}</div></section>
    <footer className="shell"><a href="/" className="brand"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span></a><p>原创课程内容，未经书面授权禁止复制、转载或商用。<a className="copyright-link" href="/copyright">版权声明</a></p><span>© 2026 KIAN · ALL RIGHTS RESERVED.</span></footer>
  </main>;
}
