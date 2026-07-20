import { NextRequest, NextResponse } from "next/server";
import { getTrack } from "../../../lib/learning";

const fallbacks: Record<string, { id: string; title: string; abstract: string; year: number; authors: string; url: string; citations: number }[]> = {
  foundation: [
    { id:"f1", title:"A Survey of Embodied AI: From Simulators to Research Tasks", abstract:"从仿真器、任务和方法三个维度建立具身智能全景。", year:2021, authors:"Duan et al.", url:"https://arxiv.org/abs/2103.04918", citations:700 },
    { id:"f2", title:"Learning Hand-Eye Coordination for Robotic Grasping", abstract:"以大规模真实机器人数据学习视觉抓取策略。", year:2016, authors:"Levine et al.", url:"https://arxiv.org/abs/1603.02199", citations:1800 },
  ],
  vla: [
    { id:"v1", title:"RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control", abstract:"将视觉语言模型的互联网知识迁移到机器人控制。", year:2023, authors:"Brohan et al.", url:"https://arxiv.org/abs/2307.15818", citations:1200 },
    { id:"v2", title:"OpenVLA: An Open-Source Vision-Language-Action Model", abstract:"开放权重 VLA 模型与高效微调方法。", year:2024, authors:"Kim et al.", url:"https://arxiv.org/abs/2406.09246", citations:600 },
  ],
  world: [
    { id:"w1", title:"DreamerV3: Mastering Diverse Domains through World Models", abstract:"通过可扩展世界模型在多类任务中学习策略。", year:2023, authors:"Hafner et al.", url:"https://arxiv.org/abs/2301.04104", citations:1600 },
    { id:"w2", title:"UniSim: Learning Interactive Real-World Simulators", abstract:"从真实数据学习可交互的长时视觉模拟器。", year:2023, authors:"Yang et al.", url:"https://arxiv.org/abs/2310.06114", citations:350 },
  ],
  practice: [
    { id:"p1", title:"Diffusion Policy: Visuomotor Policy Learning via Action Diffusion", abstract:"使用扩散模型生成高维连续机器人动作。", year:2023, authors:"Chi et al.", url:"https://arxiv.org/abs/2303.04137", citations:2200 },
    { id:"p2", title:"LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning", abstract:"面向终身机器人学习的知识迁移基准。", year:2023, authors:"Liu et al.", url:"https://arxiv.org/abs/2306.03310", citations:500 },
  ],
};

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("track") ?? "vla";
  const track = getTrack(id);
  if (!track) return NextResponse.json({ error: "Unknown track" }, { status: 404 });
  try {
    const fields = "title,abstract,year,authors,url,citationCount,publicationDate";
    const endpoint = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(track.query)}&limit=12&fields=${fields}`;
    const response = await fetch(endpoint, { headers: { "User-Agent": "KIAN-Embodied-AI-Learning/1.0" } });
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    const result = await response.json() as { data?: Array<{ paperId:string; title:string; abstract?:string; year?:number; authors?:Array<{name:string}>; url?:string; citationCount?:number; publicationDate?:string }> };
    const papers = (result.data ?? []).filter((p) => p.title && p.year).sort((a,b) => {
      const recencyA = (a.year ?? 0) >= new Date().getFullYear() - 2 ? 250 : 0;
      const recencyB = (b.year ?? 0) >= new Date().getFullYear() - 2 ? 250 : 0;
      return ((b.citationCount ?? 0) + recencyB) - ((a.citationCount ?? 0) + recencyA);
    }).slice(0, 6).map((p) => ({ id:p.paperId, title:p.title, abstract:(p.abstract ?? "").slice(0,180), year:p.year, authors:(p.authors ?? []).slice(0,3).map(a=>a.name).join(" · "), url:p.url ?? `https://www.semanticscholar.org/paper/${p.paperId}`, citations:p.citationCount ?? 0, date:p.publicationDate }));
    if (!papers.length) throw new Error("empty");
    return NextResponse.json({ papers, live:true, updatedAt:new Date().toISOString() }, { headers:{ "Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch {
    return NextResponse.json({ papers:fallbacks[id] ?? [], live:false, updatedAt:new Date().toISOString() }, { headers:{ "Cache-Control":"public, s-maxage=3600" } });
  }
}
