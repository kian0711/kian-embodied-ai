export type Track = {
  id: string;
  step: string;
  title: string;
  en: string;
  color: string;
  intro: string;
  outcome: string;
  duration: string;
  level: string;
  query: string;
  concepts: string[];
  sources: string[];
  chapters: { no: string; title: string; desc: string; lessons: string[]; checkpoint: string }[];
  project: { title: string; desc: string; stack: string; deliverables: string[] };
};

export const learningTracks: Track[] = [
  {
    id: "foundation", step: "01", title: "基础导航", en: "FOUNDATIONS", color: "violet",
    intro: "先建立‘身体—环境—任务’的完整认知，再补齐数学、机器人学、控制、视觉与学习基础。课程以《具身智能入门指南》的直觉讲解为入口，以《具身智能机器人学习指导》的工程验收标准收束。",
    outcome: "能画出感知—决策—执行—学习闭环，读懂机器人论文的任务定义与评测，并完成一个可观测、可复盘的仿真小闭环。",
    duration: "8 小时", level: "零基础 → 入门",
    query: "robot learning embodied intelligence reinforcement learning survey",
    sources: ["《具身智能入门指南》：认知框架、技术栈与零基础路线", "《具身智能机器人学习指导》：基础体系、专业切入与项目验收"],
    concepts: ["具身闭环", "坐标系与位姿", "运动学与动力学", "状态估计", "控制与规划", "数据与评测"],
    chapters: [
      { no: "01", title: "什么是具身智能", desc: "用司机与机器人抓杯子的例子理解：行动会改变世界，新的世界又会影响下一次决策。", lessons: ["感知—决策—执行—学习", "具身智能与传统 AI 的差异", "本体、环境、任务与闭环"], checkpoint: "用一张图说明机器人完成抓杯任务的信息流。" },
      { no: "02", title: "从你的专业切入", desc: "机械、控制、自动化、物联网、电子信息和计算机各有入口，不必先补齐所有知识。", lessons: ["盘点已有优势与短板", "以项目需要驱动补课", "复现级—改造级—落地级"], checkpoint: "选择一个第一项目，并列出三项已有能力和三项待补能力。" },
      { no: "03", title: "空间、运动与力", desc: "把线性代数真正连接到坐标变换、机械臂运动和接触任务。", lessons: ["旋转矩阵、四元数与齐次变换", "正逆运动学与雅可比", "惯量、摩擦、接触与执行器饱和"], checkpoint: "实现二维机械臂正运动学并可视化末端轨迹。" },
      { no: "04", title: "感知与状态估计", desc: "机器人不仅要看懂图像，还要把目标转换到统一、可执行的三维坐标中。", lessons: ["相机、深度与点云", "检测、分割、关键点与可供性", "传感器融合、时间同步与不确定度"], checkpoint: "把一个视觉目标投影到机器人基座坐标系并检查误差。" },
      { no: "05", title: "规划与控制", desc: "理解‘想去哪里’和‘怎样稳定到达’之间的分工。", lessons: ["A*、RRT 与轨迹优化", "PID、MPC 与学习控制", "位置控制、阻抗控制与安全边界"], checkpoint: "为一个任务选择控制器，并解释选择依据。" },
      { no: "06", title: "学习、数据与论文阅读", desc: "以行为克隆和强化学习为入口，建立数据、实验和失败分类意识。", lessons: ["BC、DAgger 与分布漂移", "MDP、奖励与策略", "数据对齐、回放评测与论文六问"], checkpoint: "用两页报告复盘一篇论文：问题、方法、数据、评测、局限、可借鉴点。" },
    ],
    project: { title: "搭建第一个闭环智能体", desc: "在仿真中让机械臂观察目标、规划动作并完成一次抓取，记录成功率与失败原因。", stack: "MuJoCo · Gymnasium · Python", deliverables: ["可运行代码与环境说明", "20 次实验成功率", "感知/动作/控制失败分类", "两页复盘报告"] },
  },
  {
    id: "vla", step: "02", title: "VLA 模型", en: "VISION · LANGUAGE · ACTION", color: "lime",
    intro: "从行为克隆、动作分块和扩散策略出发，理解视觉、语言与动作如何进入同一个模型；再沿 RT 系列、OpenVLA、Octo、RDT 与 π 系列进入机器人基础模型。",
    outcome: "能拆解 VLA 的数据格式、视觉编码器、语言条件、动作表示与推理流程，并完成一次开源模型回放和失败分析。",
    duration: "12 小时", level: "入门 → 核心",
    query: "vision language action model robot manipulation VLA",
    sources: ["《具身智能入门指南》：模仿学习、Diffusion Policy 与 VLA 直觉", "《具身智能机器人学习指导》：VLA 周程、数据格式与部署验收"],
    concepts: ["行为克隆", "动作 Chunk", "动作 Token", "Diffusion Policy", "跨本体数据", "闭环推理"],
    chapters: [
      { no: "01", title: "从模仿学习开始", desc: "把机器人控制转成监督学习，同时正视分布漂移和恢复状态不足。", lessons: ["示范轨迹与行为克隆", "DAgger 与专家纠正", "成功数据、失败数据与恢复数据"], checkpoint: "可视化 20 条轨迹并标注失败发生在哪个状态。" },
      { no: "02", title: "动作怎样表示", desc: "动作定义决定数据、模型和真机接口能否正确对齐。", lessons: ["关节/末端、绝对/增量动作", "离散 Token 与连续动作", "归一化、频率与单位陷阱"], checkpoint: "打印训练数据动作统计量，并验证部署端反归一化。" },
      { no: "03", title: "动作分块与扩散策略", desc: "比较逐步预测、Action Chunking 和生成式动作序列。", lessons: ["ACT 与长动作片段", "Diffusion Policy 去噪生成", "多峰动作与时间一致性"], checkpoint: "比较单步动作与动作分块在抖动和延迟上的差异。" },
      { no: "04", title: "VLA 架构演进", desc: "从 Robotics Transformer 到开放模型，理解语言知识如何迁移到机器人动作。", lessons: ["RT-1 与 RT-2", "OpenVLA、Octo 与 RDT", "π0/π0.5 与 Flow Matching"], checkpoint: "选一个模型，画出图像、文本、动作的完整张量流。" },
      { no: "05", title: "数据与跨本体泛化", desc: "大模型能力来自统一数据配方，而不仅是参数量。", lessons: ["Open X-Embodiment", "机器人、相机与动作空间对齐", "任务覆盖、数据质量与泄漏"], checkpoint: "为两个不同机器人设计统一数据字段和本体适配层。" },
      { no: "06", title: "推理、评测与部署", desc: "把离线回放变成可测量的闭环系统。", lessons: ["模型加载与推理服务", "成功率、泛化和恢复评测", "平均/最大延迟、动作滤波与安全后端"], checkpoint: "提交回放视频、延迟统计、失败样本和改进计划。" },
    ],
    project: { title: "复现一个 VLA 推理管线", desc: "输入相机图像与自然语言指令，生成机械臂动作序列，并完成离线回放与仿真验证。", stack: "OpenVLA · PyTorch · LIBERO", deliverables: ["数据字段说明", "推理与回放脚本", "至少三类指令测试", "成功/失败案例表"] },
  },
  {
    id: "world", step: "03", title: "世界模型", en: "WORLD · ACTION MODELS", color: "blue",
    intro: "让机器人在行动前预测未来：从状态转移、潜在动力学和视频预测，进入 Dreamer、基于模型的强化学习与世界—动作联合模型。",
    outcome: "能区分显式、潜在和视频世界模型，理解预测如何服务规划，并搭建一个模型预测控制实验。",
    duration: "10 小时", level: "核心 → 进阶",
    query: "robotics world model action model video prediction planning",
    sources: ["《具身智能入门指南》：世界模型、视频预测与 Sim2Real 直觉", "《具身智能机器人学习指导》：潜在动力学、规划路线与前沿判断"],
    concepts: ["状态转移", "潜在动力学", "视频预测", "不确定性", "想象 Rollout", "模型预测控制"],
    chapters: [
      { no: "01", title: "为什么需要世界模型", desc: "机器人不能只对当前画面反应，还要预判动作将造成什么后果。", lessons: ["环境模型与策略模型", "状态、观测与部分可观测", "预测、规划和控制的关系"], checkpoint: "为抓取任务列出模型必须预测的状态变量。" },
      { no: "02", title: "学习潜在动力学", desc: "将高维观测压缩到可预测、可规划的表示空间。", lessons: ["VAE 与表示学习", "递归状态空间模型", "多步误差与不确定性"], checkpoint: "训练低维状态预测器并绘制多步误差曲线。" },
      { no: "03", title: "视频世界模型", desc: "直接预测未来视觉结果，理解动作条件和多种可能未来。", lessons: ["动作条件视频预测", "确定性与生成式预测", "视觉保真度不等于控制可用性"], checkpoint: "用控制指标而不只是画质评价预测结果。" },
      { no: "04", title: "在想象中学习", desc: "用模型生成的轨迹减少真实交互成本。", lessons: ["Dreamer 范式", "模型偏差与短视优化", "真实数据和想象数据的配比"], checkpoint: "比较真实环境训练和模型内训练的样本效率。" },
      { no: "05", title: "在想象中规划", desc: "对多条候选动作进行 rollout，用价值或任务目标选择下一步。", lessons: ["MPC、采样与轨迹优化", "价值函数与目标条件", "滚动重规划与闭环纠错"], checkpoint: "实现随机射击或 CEM 规划并记录耗时。" },
      { no: "06", title: "世界—动作统一模型", desc: "观察世界生成与动作生成逐渐融合的新范式。", lessons: ["级联式与联合式 WAM", "长时一致性与因果交互", "数据、算力、评测和安全局限"], checkpoint: "用四问法评估一个前沿模型是否适合你的项目。" },
    ],
    project: { title: "训练一个视觉世界模型", desc: "从机器人视频预测未来状态，并用想象轨迹辅助动作选择。", stack: "Dreamer · PyTorch · RoboNet", deliverables: ["单步与多步预测结果", "误差和不确定性曲线", "MPC 动作选择演示", "模型偏差分析"] },
  },
  {
    id: "practice", step: "04", title: "机器人实践", en: "BUILD · SIMULATE · DEPLOY", color: "orange",
    intro: "把论文模型接到真实工程：从 Linux、ROS 2、URDF 与仿真开始，完成数据采集、Sim2Real、LeRobot 真机闭环、部署优化与安全复盘。",
    outcome: "完成一个从传感器输入、策略推理到机械臂执行的端到端项目，并用日志和自动检查定位失败。",
    duration: "16 小时", level: "进阶 → 实战",
    query: "robot manipulation sim to real deployment ROS imitation learning",
    sources: ["《具身智能入门指南》：工具平台、仿真器、ROS 2 与开源项目", "《具身智能机器人学习指导》：数据闭环、低成本实物、部署安全与排错案例"],
    concepts: ["ROS 2", "URDF/TF", "仿真与 Sim2Real", "LeRobot", "数据飞轮", "安全与日志"],
    chapters: [
      { no: "01", title: "搭建机器人软件栈", desc: "让传感器、状态、策略、规划器和执行器拥有清晰接口。", lessons: ["Linux、Python/C++ 与环境管理", "ROS 2 节点、话题、服务与 Action", "URDF、TF、RViz 与 MoveIt"], checkpoint: "启动六轴机械臂模型并验证全部坐标变换。" },
      { no: "02", title: "仿真任务最小闭环", desc: "选择 MuJoCo、Isaac Lab 或 Gazebo，建立可重置、可评测任务。", lessons: ["机器人与环境资产", "观测、动作、成功判据与重置", "随机种子、配置版本和评测脚本"], checkpoint: "一条命令复现实验，并输出固定种子的评测结果。" },
      { no: "03", title: "采集高质量数据", desc: "通过遥操作或脚本采集同步、可回放的多模态轨迹。", lessons: ["图像、关节、力觉和指令同步", "LeRobot 数据格式与回放", "失败状态分类与恢复示范"], checkpoint: "采集、清洗并回放 20 条示范轨迹。" },
      { no: "04", title: "Sim2Real", desc: "从视觉、动力学、延迟和控制接口四个方向缩小现实差距。", lessons: ["域随机化与域适应", "系统辨识、标定与时延", "渐进式部署与残差策略"], checkpoint: "建立仿真—真机差异表，并为每项差异设计验证实验。" },
      { no: "05", title: "低成本真机闭环", desc: "用 LeRobot、ALOHA 类平台完成安全、低速、可回退的第一次策略部署。", lessons: ["硬件接口和动作尺度", "空载—软物体—正式任务", "限位、急停、碰撞与失败恢复"], checkpoint: "完成部署前安全检查表和三阶段测试。" },
      { no: "06", title: "部署、日志与排错", desc: "用工程证据定位动作抖动、回放差异、尺度错误和边界状态失控。", lessons: ["延迟、显存与推理优化", "记录观测—策略—控制—关节状态", "正常、边界、异常案例自动检查"], checkpoint: "让一次失败能够从日志复现，并明确归属模块。" },
    ],
    project: { title: "部署视觉语言抓取系统", desc: "用自然语言指定物体，完成识别、规划、抓取和失败恢复。", stack: "ROS 2 · MoveIt 2 · LeRobot · RealSense", deliverables: ["系统架构与接口图", "可复现环境和启动方式", "30 次任务成功率", "失败分类与安全检查表"] },
  },
];

export function getTrack(id: string) { return learningTracks.find((track) => track.id === id); }
