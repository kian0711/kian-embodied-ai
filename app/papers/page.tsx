import { AccumulatingPaperLibrary } from "../components/AccumulatingPaperLibrary";
import { PublicHeader } from "../components/PublicHeader";
import { SiteFooter } from "../components/SiteFooter";
export default function PapersPage(){return <main className="home-modern public-page"><PublicHeader/><header className="public-portal-hero public-shell"><p>FROM CLASSIC TO FRONTIER</p><h1>论文图谱</h1><span>从经典工作到最新前沿，沿时间与研究方向探索具身智能论文。</span></header><section className="papers-section public-paper-page"><div className="public-shell"><AccumulatingPaperLibrary/></div></section><SiteFooter/></main>}
