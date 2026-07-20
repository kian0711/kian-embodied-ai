import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kian-embodied-ai.pengyu9711791686.chatgpt.site"),
  title: "机器人公益学习平台 · 免费、开放、共创",
  description: "面向机器人、ROS、机械臂、移动机器人与具身智能学习者的公益平台。免费学习、开放分享，让优秀作品被更多人看见。",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "机器人学习，不应该有门槛", description: "公益、免费、开放的机器人学习社区。", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "机器人学习，不应该有门槛", description: "公益、免费、开放的机器人学习社区。", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
