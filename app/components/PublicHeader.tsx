"use client";
import { useEffect, useState } from "react";

const links=[{href:"/roadmap",label:"学习路线"},{href:"/papers",label:"论文图谱"},{href:"/#my-papers",label:"论文解读"},{href:"/projects",label:"开源项目"},{href:"/collaboration",label:"合作共创"}];

export function PublicHeader(){
  const [views,setViews]=useState<number|null>(null);
  useEffect(()=>{const controller=new AbortController();fetch("/api/views",{method:"POST",signal:controller.signal}).then(response=>response.ok?response.json():Promise.reject()).then((data:{views?:number})=>{if(typeof data.views==="number")setViews(data.views)}).catch(()=>undefined);return()=>controller.abort()},[]);
  return <><aside className="founder-strip"><div className="public-shell"><span>发起者 <b>上海大学 · 张鹏宇</b></span><div><span>访问次数 <b>{views===null?"—":views.toLocaleString("zh-CN")}</b></span><span>抖音号 <b>kian0711</b></span><span>微信号 <b>kian060701</b></span></div></div></aside><header className="public-nav"><div className="public-shell"><a href="/" className="brand public-kian-brand" aria-label="点击回到主页"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span><span className="home-return"><b>首页</b><small>点击回到主页</small></span></a><nav aria-label="主导航">{links.map(link=><a key={link.href} href={link.href}>{link.label}</a>)}</nav><details className="mobile-menu"><summary>浏览模块</summary><nav aria-label="移动端模块导航">{links.map(link=><a key={link.href} href={link.href}>{link.label}</a>)}</nav></details></div></header></>;
}
