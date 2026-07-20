import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIAN · 具身智能学习地图",
  description: "KIAN 具身智能学习站：从基础理论、VLA 模型、世界模型到机器人实践，系统掌握 Embodied AI。",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
