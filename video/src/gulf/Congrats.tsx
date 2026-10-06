import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";

// NEO CAPTA congratulates the national team — Gulf Cup 27 champions.
// Deep green + flat gold, the squad cut-out in front of a giant outlined "27".
const G = { deep: "#05261A", green: "#0B4D33", gold: "#D4AF37", paleGold: "#F1DFA0", white: "#FFFFFF" };
const TEAM = { src: staticFile("gulf/team-cut.png"), w: 1469, h: 725 };

export const GulfCongrats: React.FC = () => {
  useFonts();
  const { height: H } = useVideoConfig();
  const tall = H > 1500;
  const panelTop = tall ? 1520 : 1085;
  const cw = tall ? 1180 : 1120;
  const ch = (cw / TEAM.w) * TEAM.h;
  const headTop = tall ? 340 : 140;
  return (
    <AbsoluteFill style={{ backgroundColor: G.deep, overflow: "hidden" }}>
      {/* stadium, very soft */}
      <Img src={staticFile("gulf/stadium.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.22, filter: "blur(10px) saturate(0.6)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${G.deep} 0%, rgba(5,38,26,0.55) 40%, rgba(5,38,26,0.2) 70%, ${G.deep} 100%)` }} />
      {/* top bar */}
      <Img src={staticFile("neocapta-logo-white.png")} style={{ position: "absolute", top: 26, left: 36, width: 165, height: 165 * LOGO_RATIO }} />
      <div style={{ position: "absolute", top: 62, right: 44, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 20, letterSpacing: 6, color: G.gold }}>CONGRATULATIONS</span>
        <span style={{ width: 40, height: 3, background: G.gold }} />
        <span dir="rtl" style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 28, color: G.gold }}>تهنئة</span>
      </div>
      {/* headline */}
      <div dir="rtl" style={{ position: "absolute", top: headTop, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: tall ? 140 : 124, lineHeight: 1.1, color: G.white }}>مبروك للأخضر</div>
        <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 60, height: 3, background: G.gold }} />
          <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: tall ? 58 : 52, color: G.gold }}>أبطال كأس الخليج 27</span>
          <span style={{ width: 60, height: 3, background: G.gold }} />
        </div>
      </div>
      {/* giant 27 behind the squad */}
      <div style={{ position: "absolute", left: 0, right: 0, top: panelTop - ch - (tall ? 360 : 235), textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: tall ? 820 : 720, lineHeight: 1, letterSpacing: -30, color: "transparent", WebkitTextStroke: `5px ${G.gold}`, opacity: 0.9 }}>27</div>
      {/* the squad */}
      <Img src={TEAM.src} style={{ position: "absolute", left: (1080 - cw) / 2, top: panelTop - ch + 2, width: cw, height: ch, filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))" }} />
      {/* gold panel */}
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: panelTop, bottom: 0, background: G.gold, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: tall ? 18 : 10 }}>
        <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: tall ? 76 : 64, color: G.deep, lineHeight: 1.2 }}>عرف وجهته… وجاب الكأس.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: tall ? 32 : 28, color: G.deep }}>نيو كابتا تبارك للمنتخب السعودي</span>
          <span style={{ width: 10, height: 10, background: G.deep, transform: "rotate(45deg)" }} />
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: tall ? 22 : 19, letterSpacing: 4, color: G.deep }}>NEO CAPTA</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
