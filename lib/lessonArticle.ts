import type { Track } from "./learning";
import type { ModuleDetail } from "./moduleDetails";

type Chapter = Track["chapters"][number];

const formulas: Record<string, { expression: string; name: string; symbols: string[] }> = {
  "foundation-01": { expression: "oₜ → sₜ → aₜ → eₜ₊₁ → oₜ₊₁", name: "具身智能闭环", symbols: ["o：传感器观测", "s：智能体对状态的判断", "a：准备执行的动作", "e：动作影响后的环境"] },
  "foundation-02": { expression: "项目能力 = 已有优势 × 场景需求 + 定向补课", name: "项目驱动学习模型", symbols: ["已有优势：你的专业积累", "场景需求：项目真实接口", "定向补课：为解决暴露问题而学习"] },
  "foundation-03": { expression: "T = [ R  p ; 0  1 ]，xᵇ = Tᵇₐ xᵃ", name: "齐次坐标变换", symbols: ["R：3×3 旋转矩阵", "p：3×1 平移向量", "Tᵇₐ：从坐标系 a 到 b 的变换", "x：空间中的点或位姿"] },
  "foundation-04": { expression: "z [u v 1]ᵀ = K [R | t] Xʷ", name: "三维点到图像的投影", symbols: ["Xʷ：世界坐标中的三维点", "R,t：相机外参", "K：相机内参", "u,v：图像像素坐标"] },
  "foundation-05": { expression: "u(t)=Kₚe(t)+Kᵢ∫e(t)dt+K_d de(t)/dt", name: "PID 控制律", symbols: ["e：目标与实际的误差", "Kₚ：立即纠正误差", "Kᵢ：消除长期偏差", "K_d：抑制变化过快与振荡"] },
  "foundation-06": { expression: "π* = arg maxπ  E[ Σ γᵗ rₜ ]", name: "强化学习目标", symbols: ["π：机器人策略", "r：每一步奖励", "γ：未来奖励折扣", "E：不同轨迹下的平均结果"] },
  "vla-01": { expression: "L_BC = E(o,a)~D [ ||πθ(o) − a||² ]", name: "行为克隆损失", symbols: ["D：专家示范数据", "o：机器人观测", "a：专家动作", "πθ(o)：模型预测动作"] },
  "vla-02": { expression: "a_real = σ_data · a_norm + μ_data", name: "动作反归一化", symbols: ["a_norm：模型的标准化输出", "μ_data：训练动作均值", "σ_data：训练动作标准差", "a_real：交给机器人的真实动作"] },
  "vla-03": { expression: "a⁰:H ~ pθ(a⁰:H | o, language)", name: "条件动作序列生成", symbols: ["a⁰:H：未来 H 步动作块", "o：图像与机器人状态", "language：任务指令", "pθ：模型学习到的动作分布"] },
  "vla-04": { expression: "[视觉特征, 文本 Token] → Transformer → 动作 Token", name: "VLA 信息流", symbols: ["视觉特征：场景与物体", "文本 Token：用户意图", "Transformer：跨模态推理", "动作 Token：可解码的控制命令"] },
  "vla-05": { expression: "a_common = f_adapter(robot_id, a_native)", name: "跨本体动作对齐", symbols: ["robot_id：机器人身份与结构", "a_native：原生关节动作", "f_adapter：本体适配器", "a_common：统一动作表示"] },
  "vla-06": { expression: "T_total = T_capture + T_encode + T_infer + T_control", name: "闭环总延迟", symbols: ["T_capture：传感器采集", "T_encode：输入编码", "T_infer：模型推理", "T_control：命令传输与执行"] },
  "world-01": { expression: "p(sₜ₊₁ | sₜ, aₜ)", name: "状态转移模型", symbols: ["sₜ：当前状态", "aₜ：当前动作", "sₜ₊₁：下一状态", "p：可能结果的概率分布"] },
  "world-02": { expression: "zₜ=f(oₜ)，ẑₜ₊₁=g(zₜ,aₜ)", name: "潜在动力学", symbols: ["f：高维观测编码器", "z：紧凑潜在状态", "g：动力学模型", "ẑ：模型预测的下一状态"] },
  "world-03": { expression: "Îₜ₊₁:ₜ₊H = G(I≤t, aₜ:ₜ₊H)", name: "动作条件视频预测", symbols: ["I≤t：已经看到的视频", "a：候选动作序列", "G：视频世界模型", "Î：预测的未来画面"] },
  "world-04": { expression: "L = L_recon + βL_KL + λL_reward", name: "世界模型联合目标", symbols: ["L_recon：重建或预测误差", "L_KL：潜变量正则", "L_reward：奖励预测误差", "β,λ：各目标的权重"] },
  "world-05": { expression: "a*₀:H = arg minₐ Σ c(ŝₜ, aₜ)", name: "模型预测控制", symbols: ["a₀:H：候选动作序列", "ŝ：世界模型预测状态", "c：任务代价", "只执行 a*₀ 后重新规划"] },
  "world-06": { expression: "p(video, action | history, instruction)", name: "世界—动作联合建模", symbols: ["history：历史观测与动作", "instruction：语言目标", "video：未来世界变化", "action：与未来一致的动作"] },
  "practice-01": { expression: "T_base^object = T_base^camera · T_camera^object", name: "机器人坐标链", symbols: ["T_base^camera：手眼标定外参", "T_camera^object：视觉测得的目标位姿", "T_base^object：规划器需要的目标位姿"] },
  "practice-02": { expression: "SuccessRate = 成功回合数 / 总评测回合数", name: "任务成功率", symbols: ["成功必须由明确判据判断", "评测回合与训练回合分离", "固定随机种子用于公平比较"] },
  "practice-03": { expression: "Dₙ₊₁ = Clean(Dₙ ∪ FailureReplayₙ)", name: "机器人数据飞轮", symbols: ["Dₙ：当前训练数据", "FailureReplay：部署失败回放", "Clean：对齐、去重、标注与质检"] },
  "practice-04": { expression: "θ_sim ~ P(θ_real ± Δθ)", name: "域随机化", symbols: ["θ_sim：仿真物理或视觉参数", "θ_real：真实系统估计值", "Δθ：合理变化范围", "P：训练时的采样分布"] },
  "practice-05": { expression: "a_safe = Shield(a_model, limits, collision)", name: "部署安全屏障", symbols: ["a_model：模型原始动作", "limits：速度、关节与工作空间限制", "collision：碰撞检测", "a_safe：实际允许执行的动作"] },
  "practice-06": { expression: "error(t) = reference(t) − measured(t)", name: "故障定位的共同时间轴", symbols: ["reference：模型或控制器目标", "measured：传感器实测状态", "t：统一时间戳", "误差曲线帮助判断异常从何时开始"] },
};

export function buildLessonArticle(track: Track, chapter: Chapter, detail: ModuleDetail) {
  const key = `${track.id}-${chapter.no}`;
  const formula = formulas[key];
  const intro = `这一课属于“${track.title}”路线的第 ${chapter.no} 个模块。我们要解决的问题是：${chapter.desc}。如果你是第一次接触机器人，不要急着记术语。先抓住一条主线——机器人接收什么信息、内部怎样表示、最后输出什么动作、我们又怎样判断它做得对不对。${detail.theory}学习时建议一边阅读，一边把每个名词映射到一个你能想象的机器人任务，例如抓杯子、移动到门口或把零件插入孔中。只要能说清输入、处理、输出和失败风险，你就已经建立了正确的第一层理解。`;
  const basics = `先从最小概念开始。“观测”是机器人此刻能读取的内容，包括相机图像、深度、关节角、速度、力传感器和语言指令；“状态”是对真实世界的内部描述，它可能直接由传感器给出，也可能需要模型推断；“动作”是机器人能够执行的命令；“任务指标”则负责判断结果。初学者常把模型输出当成最终答案，但真实系统中还存在坐标转换、动作缩放、控制频率、碰撞检查和硬件响应。因而每学习一个算法，都要追问五件事：输入从哪里来、单位是什么、模型输出什么、输出怎样接到底层、失败时留下什么证据。把这五问写在笔记首页，会比背很多模型名称更有用。`;
  const deeper = `进一步理解“${chapter.title}”，要把离线学习和在线执行分开。离线阶段可以暂停、回放和反复计算，在线机器人却必须在固定时间内给出安全动作。假设相机每秒 30 帧、策略每秒推理 10 次、底层控制器每秒更新 200 次，这三个频率不会天然同步。旧图像、拥堵的消息队列或一次异常缓慢的推理，都可能让机器人根据过去的世界行动。因此工程上需要缓存策略、时间戳、超时处理和降级动作。还要区分“相关”与“因果”：模型在数据里看到某个视觉特征经常与成功同时出现，不代表它真正理解了物理原因。可以通过改变背景、初始位置、物体颜色、负载和干扰来检验。若结果只在训练布置中成立，它学到的是捷径；若在合理变化下仍稳定，才说明表示更接近任务本质。最后，任何准确率都需要分母：成功了多少次、总共测试多少次、测试条件如何分布、失败是否被隐藏。对小白而言，养成这些问题意识，就是从“会运行代码”走向“会做机器人实验”的关键。`;
  const formulaGuide = `上面的公式不是为了考试，而是把关系压缩成一行。阅读公式可以按三步走：第一步只看等号或箭头左边，确认我们要计算的目标；第二步逐个看右边变量，分清哪些来自传感器、哪些是需要学习的参数、哪些由人设定；第三步想象一个数值变化，例如观测噪声变大、延迟增加或动作范围翻倍，判断公式结果和机器人行为会怎样变化。公式中的下标 t 通常表示当前时刻，t+1 表示下一时刻；上标 * 常表示最优解；概率 p 表示同一动作可能产生多个结果。能用自己的话解释符号，比机械推导更重要。`;
  const caseNarrative = `现在看案例“${detail.caseStudy.title}”。${detail.caseStudy.story}分析案例时不要直接说“模型不好”，而要沿数据流排查。第一步固定输入并保存原始传感器数据；第二步查看中间结果是否与真实几何和时间一致；第三步比较模型输出与训练数据范围；第四步检查控制器实际收到什么；第五步把真实关节、末端或底盘状态与目标叠加。只有当上游都正确时，才应修改模型结构。这个方法的价值在于把模糊的失败变成可复现实验，也避免团队成员凭感觉相互归因。`;
  const applicationGuide = `这项能力可以落到 ${detail.applications.join("、")} 等场景。具体应用时要先缩小任务边界：明确物体种类、工作空间、光照、速度和允许失败的方式，再设计基线。基线可以是人工规则、传统规划或简单网络，它不必最先进，但必须可运行、可测量。随后每次只替换一个模块，并同时记录成功率、耗时、最大误差、失败类别和资源占用。这样你才能判断新方法究竟解决了什么。产品环境还要额外考虑安全、维护、异常恢复和成本，因为实验室里的一次精彩演示并不等于系统可以长期工作。`;
  const practiceGuide = `本课练习是：${detail.practice}。建议按“准备—最小运行—增加扰动—记录结果—复盘”五步完成。准备阶段固定软件版本、配置和随机种子；最小运行阶段只求打通数据流；增加扰动阶段改变初始位置、光照、噪声、负载或延迟；记录阶段同时保存输入、输出、真实状态和时间戳；复盘阶段把失败归入感知、状态估计、策略、规划、控制、硬件或接口。最终验收标准是：${chapter.checkpoint}。不要只提交一张成功截图，至少保留运行方式、关键配置、统计表、失败样本和下一步改进。`;
  const pitfalls = `小白最常见的第一个误区是“先把所有数学学完再动手”。更有效的方法是先跑通最小例子，遇到概念再回到公式。第二个误区是只看公开视频或论文结果，不检查数据、评测和限制条件。第三个误区是把仿真效果直接等同于真机效果，忽略摩擦、时延、标定和安全边界。第四个误区是一次改变多个因素，最后不知道提升来自哪里。第五个误区是没有日志，失败后只能重新猜。正确做法是小步迭代：每个实验只回答一个问题，每次运行都有版本和记录，每个结论都能被另一个人复现。`;
  const review = `完成本课后，请尝试不看页面回答：这个模块解决什么问题？输入和输出分别是什么？核心公式中的每个符号是什么意思？案例为什么失败？如果把它用到自己的机器人，第一条可运行基线是什么？你准备记录哪些指标？如果其中任何一题答不出来，就回到相应部分，并用自己的任务重写一遍。真正的掌握不是“看懂了”，而是能够预测系统在条件变化时会发生什么，能够设计实验验证判断，也能够把失败解释给团队成员。`;
  return { key, formula, intro, basics, deeper, formulaGuide, caseNarrative, applicationGuide, practiceGuide, pitfalls, review };
}
