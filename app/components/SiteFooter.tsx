"use client";

import { useEffect, useState } from "react";

export function SiteInfoBar() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/views", { method: "POST", signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { views?: number }) => {
        if (typeof data.views === "number") setViews(data.views);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return (
    <aside className="site-info-bar" aria-label="网站信息">
      <div className="shell">
        <span className="view-count"><i />独立访问人数 <b>{views === null ? "—" : views.toLocaleString("zh-CN")}</b></span>
        <span>抖音号 <b>kian0711</b></span>
        <span>微信号 <b>kian060701</b></span>
      </div>
    </aside>
  );
}

export function SiteFooter({ home = false }: { home?: boolean }) {
  return <footer className="shell"><a href={home ? "#top" : "/"} className="brand"><span className="brand-mark">K<i /></span><span>KIAN<small>EMBODIED INTELLIGENCE</small></span></a><p>原创课程内容，未经书面授权禁止复制、转载或商用。<a className="copyright-link" href="/copyright">版权声明</a></p><span>© 2026 KIAN · ALL RIGHTS RESERVED.</span></footer>;
}
