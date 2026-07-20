"use client";

import { useEffect, useState } from "react";

type Collaborator = { id:number; name:string; school:string; researchDirection:string; bio:string; photoPosition?:string };

export function CollaboratorSection() {
  const [members, setMembers] = useState<Collaborator[]>([]);
  useEffect(() => { fetch("/api/collaborators").then((response) => response.json()).then((data: { collaborators?: Collaborator[] }) => setMembers(data.collaborators || [])).catch(() => setMembers([])); }, []);
  return <section className="collaboration-section" id="collaboration"><div className="shell">
    <div className="section-head collaboration-head"><div><p className="eyebrow"><span /> COLLABORATE · CREATE · EXPLORE</p><h2>合作共创</h2></div><p>连接不同学校与研究方向的探索者，<br />让想法在交流、实验与实践中共同生长。</p></div>
    {members.length ? <div className="collaborator-grid">{members.map((member, index) => <article className="collaborator-card" key={member.id}>
      <div className="collaborator-photo"><img src={`/api/collaborators/${member.id}/photo`} alt={`${member.name}的个人照片`} style={{objectPosition:member.photoPosition || "50% 20%"}} /><span>{String(index + 1).padStart(2,"0")}</span></div>
      <div className="collaborator-info"><div className="member-school"><span>学校 / 机构</span><small title={member.school}>{member.school || "暂未填写"}</small></div><h3 title={member.name}>{member.name}</h3><div className="member-research"><p className="research-label">研究方向</p><strong title={member.researchDirection}>{member.researchDirection || "具身智能"}</strong></div><p className="collaborator-bio" title={member.bio}>{member.bio || "一起学习、实践与分享具身智能。"}</p></div>
    </article>)}</div> : <div className="collaborator-empty"><span>CO-CREATION NETWORK</span><h3>共创席位正在开放</h3><p>成员资料将由管理员添加，并在这里展示。</p></div>}
  </div></section>;
}
