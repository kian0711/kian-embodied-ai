"use client";

import { useEffect, useState } from "react";

export function SiteFooter({ home = false }: { home?: boolean }) {
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
    <footer className="shell site-footer">
      <a href={home ? "#top" : "/"} className="brand">
        <span className="brand-mark">K<i /></span>
        <span>KIAN<small>EMBODIED INTELLIGENCE</small></span>
      </a>
      <div className="footer-details">
        <p className="footer-contact"><span>抖音号 <b>kian0711</b></span><span>微信号 <b>kian060701</b></span></p>
        <p>原创课程内容，未经书面授权禁止复制、转载或商用。<a className="copyright-link" href="/copyright">版权声明</a></p>
      </div>
      <div className="footer-meta">
        <span className="view-count"><i />访问浏览次数 <b>{views === null ? "—" : views.toLocaleString("zh-CN")}</b></span>
        <span>© 2026 KIAN · ALL RIGHTS RESERVED.</span>
      </div>
    </footer>
  );
}
