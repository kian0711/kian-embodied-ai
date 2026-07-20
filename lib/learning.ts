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
  chapters: { no: string; title: string; desc: string; lessons: string[] }[];
  project: { title: string; desc: string; stack: string };
};

export const learningTracks: Track[] = [
  {
    id: "foundation", step: "01", title: "基础导航", en: "FOUNDATIONS", color: "violet",
    intro: "建立具身智能所需的共同语言：机器人如何感知环境、表示状态、学习策略，并在物理世界中安全行动。",
    outcome: "看懂具身智能论文的任务定义、模型输入输出、训练目标与评测指标。", duration: "6 小时", level: "零基础 → 入门",
    query: "robot learning embodied intelligence reinforcement learning survey",
    concepts: ["机器人运动学", "计算机视觉", "强化学习", "模仿学习", "状态与动作空间", "Sim-to-Real"],
    chapters: [
      { no: "01", title: "什么是具身智能", desc: "从智能体—环境闭环理解具身性。", lessons: ["感知—决策—行动闭环", "具身智能与传统 AI", "任务、场景与本体"] },
      { no: "02", title: "机器人学最小基础", desc: "读懂位姿、关节与控制。", lessons: ["坐标系与位姿", "正逆运动学", "轨迹与控制器"] },
      { no: "03", title: "从数据中学习动作", desc: "理解 BC、RL 与离线学习。", lessons: ["行为克隆", "奖励与策略", "数据分布偏移"] },
    ],
    project: { title: "搭建第一个闭环智能体", desc: "在仿真中让机械臂观察目标、规划动作并完成一次抓取。", stack: "MuJoCo · Gymnasium · Python" },
  },
  {
    id: "vla", step: "02", title: "VLA 模型", en: "VISION · LANGUAGE · ACTION", color: "lime",
    intro: "沿着 RT-1、RT-2、OpenVLA 到生成式策略，理解视觉、语言与机器人动作如何进入同一个模型。",
    outcome: "能够拆解 VLA 的架构、动作表示、数据配方和泛化实验，并复现一个开源模型推理流程。", duration: "10 小时", level: "入门 → 核心",
    query: "vision language action model robot manipulation VLA",
    concepts: ["视觉语言模型", "动作 Token", "跨本体数据", "Flow Matching", "通用策略", "开放词汇泛化"],
    chapters: [
      { no: "01", title: "VLA 的诞生", desc: "从 Robotics Transformer 到视觉语言动作模型。", lessons: ["RT-1 的序列化动作", "RT-2 的知识迁移", "VLA 的三类训练范式"] },
      { no: "02", title: "动作如何生成", desc: "比较离散、自回归与连续生成。", lessons: ["动作离散化", "扩散策略", "Flow Matching"] },
      { no: "03", title: "开放模型实践", desc: "运行并评估 OpenVLA 类模型。", lessons: ["模型与数据准备", "推理服务", "成功率与泛化评测"] },
    ],
    project: { title: "复现一个 VLA 推理管线", desc: "输入相机图像和自然语言指令，生成机械臂末端动作序列。", stack: "OpenVLA · PyTorch · LIBERO" },
  },
  {
    id: "world", step: "03", title: "世界模型", en: "WORLD · ACTION MODELS", color: "blue",
    intro: "让机器人学习预测未来：理解视频预测、隐空间动力学，以及联合生成未来状态与动作的世界—行动模型。",
    outcome: "分辨显式与隐式世界模型，理解预测如何服务规划，并能搭建一个模型预测控制实验。", duration: "8 小时", level: "核心 → 进阶",
    query: "robotics world model action model video prediction planning",
    concepts: ["潜在动力学", "视频预测", "模型预测控制", "联合世界—动作模型", "想象 rollout", "长时规划"],
    chapters: [
      { no: "01", title: "学习世界的规律", desc: "理解状态转移和潜在动力学。", lessons: ["显式状态模型", "隐空间世界模型", "不确定性"] },
      { no: "02", title: "在想象中规划", desc: "用预测结果选择更好的动作。", lessons: ["Model Predictive Control", "搜索与采样", "价值引导"] },
      { no: "03", title: "世界—行动统一建模", desc: "研究联合生成的新范式。", lessons: ["级联式 WAM", "联合式 WAM", "长时一致性"] },
    ],
    project: { title: "训练一个视觉世界模型", desc: "从机器人视频预测未来帧，并用想象轨迹辅助动作选择。", stack: "Dreamer · PyTorch · RoboNet" },
  },
  {
    id: "practice", step: "04", title: "机器人实践", en: "BUILD · SIMULATE · DEPLOY", color: "orange",
    intro: "把论文中的模型接到真正的机器人系统：数据采集、仿真训练、ROS 2 集成、安全控制与部署优化。",
    outcome: "完成一个从相机输入、模型推理到机械臂执行的端到端项目，并建立可复现的实验记录。", duration: "12 小时", level: "进阶 → 实战",
    query: "robot manipulation sim to real deployment ROS imitation learning",
    concepts: ["ROS 2", "仿真环境", "数据采集", "机械臂控制", "推理加速", "实验复现"],
    chapters: [
      { no: "01", title: "搭好机器人软件栈", desc: "连接传感器、模型和执行器。", lessons: ["ROS 2 节点与话题", "相机标定", "MoveIt 规划"] },
      { no: "02", title: "构建高质量数据", desc: "采集、清洗并回放示范轨迹。", lessons: ["遥操作采集", "时间同步", "数据质量诊断"] },
      { no: "03", title: "从仿真走向真机", desc: "解决延迟、偏差与安全问题。", lessons: ["域随机化", "推理优化", "安全边界与恢复"] },
    ],
    project: { title: "部署视觉语言抓取系统", desc: "用自然语言指定物体，完成识别、规划、抓取和失败恢复。", stack: "ROS 2 · MoveIt 2 · RealSense" },
  },
];

export function getTrack(id: string) { return learningTracks.find((track) => track.id === id); }
