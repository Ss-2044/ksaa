import React from "react";
import { AbsoluteFill } from "remotion";
import { Logo } from "../components/Logo";
import { useFonts } from "../components/useFonts";
import { colors, fonts } from "../theme";
import { Halftone } from "./Halftone";

const CoverLine: React.FC<{ ar: string; en: string; align: "left" | "right" }> = ({ ar, en, align }) => (
  <div style={{ textAlign: align, maxWidth: 420 }}>
    <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 44, color: colors.white, lineHeight: 1.3 }}>
      {ar}
    </div>
    <div style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: 22, letterSpacing: 3, color: colors.accent, textTransform: "uppercase" }}>{en}</div>
  </div>
);

// Magazine cover (3:4) used as the prop reference for the AI shots.
export const MagazineCover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, #000 0%, ${colors.night} 50%, ${colors.navy} 100%)`, overflow: "hidden" }}>
      <Halftone at={62} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(52,68,153,0.45), rgba(0,0,0,0) 55%)" }} />

      {/* masthead */}
      <div style={{ position: "absolute", top: 50, left: 60, right: 60, display: "flex", justifyContent: "space-between", fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: colors.steel }}>
        <span>ISSUE 01</span>
        <span>MARKETING · IDEAS · GROWTH</span>
        <span dir="rtl" style={{ fontFamily: fonts.ar, letterSpacing: 0, fontSize: 28 }}>
          العدد الأول
        </span>
      </div>
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Logo width={820} />
      </div>

      {/* hero line */}
      <div style={{ position: "absolute", top: 780, left: 0, right: 0, textAlign: "center" }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 118, color: colors.white, lineHeight: 1.2, textShadow: "0 0 40px rgba(94,120,255,0.5)" }}>
          لكل فكرة وجهة
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 52, letterSpacing: 10, color: colors.accent }}>EVERY IDEA, A DIRECTION</div>
        <svg width={700} height={60} style={{ marginTop: 26 }}>
          <path d="M 20 30 L 660 30 M 620 8 L 664 30 L 620 52" stroke={colors.silver} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* cover lines */}
      <div style={{ position: "absolute", top: 1110, left: 60, right: 60, display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <CoverLine ar="من فكرة على ورق إلى حملة" en="From paper to campaign" align="left" />
          <CoverLine ar="أرقام تصنع القرار" en="Data that decides" align="left" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          <CoverLine ar="كيف تصل فكرتك؟" en="Where does your idea go?" align="right" />
          <CoverLine ar="شراكات تصنع المستقبل" en="Partnerships for tomorrow" align="right" />
        </div>
      </div>

      {/* footer */}
      <div style={{ position: "absolute", bottom: 50, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 28, color: colors.silver, letterSpacing: 4 }}>2026</div>
        <div style={{ display: "flex", gap: 3, height: 70, background: colors.white, padding: "8px 12px" }}>
          {[3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2].map((w, i) => (
            <div key={i} style={{ width: w * 3, background: "#000" }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
