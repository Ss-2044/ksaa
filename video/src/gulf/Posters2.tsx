import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import { gold, goldGradient, green } from "./parts";

// Second Gulf Cup design: editorial sports posters with crossing "tapes".
const TEAM = staticFile("gulf/team.jpg");
const OWAIS = staticFile("gulf/owais.jpg");

const Logo: React.FC<{ tall: boolean }> = ({ tall }) => {
  const w = tall ? 200 : 170;
  return (
    <Img
      src={staticFile("neocapta-logo.png")}
      style={{ position: "absolute", top: 22, left: 34, width: w, height: w * LOGO_RATIO, filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.85))" }}
    />
  );
};

const Dot: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <span style={{ display: "inline-block", width: size, height: size, background: color, transform: "rotate(45deg)", margin: `0 ${size * 1.2}px`, verticalAlign: "middle" }} />
);

// A long strip of repeated text across the frame.
const Tape: React.FC<{ top: number; angle: number; bg: string; color: string; items: string[]; size: number; family?: string; edge?: string }> = ({ top, angle, bg, color, items, size, family = fonts.ar, edge = "rgba(0,0,0,0.35)" }) => {
  const seq = new Array(6).fill(items).flat();
  return (
    <div
      style={{
        position: "absolute",
        left: -400,
        width: 1880,
        top,
        transform: `rotate(${angle}deg)`,
        background: bg,
        borderTop: `5px solid ${edge}`,
        borderBottom: `5px solid ${edge}`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
        padding: `${size * 0.08}px 0`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <span dir="rtl" style={{ fontFamily: family, fontWeight: 900, fontSize: size, lineHeight: 1.3, color }}>
        {seq.map((t, i) => (
          <React.Fragment key={i}>
            {t}
            <Dot color={color} size={size * 0.18} />
          </React.Fragment>
        ))}
      </span>
    </div>
  );
};

const Halftone: React.FC<{ opacity?: number }> = ({ opacity = 0.18 }) => (
  <AbsoluteFill style={{ opacity, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 0 1.6px, transparent 2.2px)", backgroundSize: "12px 12px", mixBlendMode: "overlay" }} />
);

// 1) The squad
export const GulfTeamPoster: React.FC = () => {
  useFonts();
  const { height: H } = useVideoConfig();
  const tall = H > 1500;
  const pw = tall ? 1700 : 1400;
  const ph = (pw / 2048) * 1592;
  const top = tall ? 560 : 300;
  const knees = top + ph * 0.585; // the sponsor board starts about here
  return (
    <AbsoluteFill style={{ backgroundColor: "#010a05", overflow: "hidden" }}>
      <Img src={TEAM} style={{ position: "absolute", left: (1080 - pw) / 2, top, width: pw, height: ph, filter: "contrast(1.12) saturate(1.15) brightness(0.95)" }} />
      {/* blend top of the photo into the headline area, and the bottom into black-green */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #010a05 0px, #010a05 ${top}px, rgba(1,10,5,0.2) ${top + ph * 0.22}px, rgba(1,10,5,0) ${top + ph * 0.3}px, rgba(1,10,5,0) ${knees - 80}px, rgba(1,10,5,0.9) ${knees + 120}px, #010a05 100%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, rgba(31,174,91,0.22) 0%, rgba(0,0,0,0) 60%)" }} />
      <Halftone opacity={0.12} />
      {/* headline */}
      <div style={{ position: "absolute", top: tall ? 170 : 40, right: 40, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: tall ? 26 : 22, letterSpacing: 6, color: gold.mid }}>GULF CUP CHAMPIONS</span>
        <span style={{ width: 54, height: 4, background: gold.mid }} />
      </div>
      <div dir="rtl" style={{ position: "absolute", top: tall ? 250 : 120, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: tall ? 200 : 168, lineHeight: 1.15, color: "#fff", textShadow: `0 0 50px rgba(31,174,91,0.55), 0 10px 30px rgba(0,0,0,0.8)` }}>
          هذا <span style={{ backgroundImage: `linear-gradient(180deg, #4fe08a, ${green.mid})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>الأخضر</span>
        </div>
      </div>
      {/* crossing tapes cover the sponsor board */}
      <Tape top={knees + (tall ? 30 : 10)} angle={-6} bg={goldGradient} color={green.deep} items={["لا لعب"]} size={tall ? 92 : 84} edge={gold.deep} />
      <Tape top={knees + (tall ? 200 : 170)} angle={4} bg={`linear-gradient(180deg, ${green.light}, ${green.mid})`} color="#fff" items={["جهّزوا كاس الذهب", "GOLD CUP, HERE WE COME"]} size={tall ? 56 : 50} edge="#03331c" />
      {tall ? (
        <div style={{ position: "absolute", bottom: 120, left: 0, right: 0, textAlign: "center" }}>
          <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 96, backgroundImage: goldGradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", lineHeight: 1.4 }}>أبطال الخليج</div>
        </div>
      ) : null}
      <Logo tall={tall} />
    </AbsoluteFill>
  );
};

// 2) Al-Owais & the falcon
export const GulfOwaisPoster: React.FC = () => {
  useFonts();
  const { height: H } = useVideoConfig();
  const tall = H > 1500;
  const ph = tall ? 1500 : H * 1.02;
  const pw = (ph / 1144) * 1170;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0503", overflow: "hidden" }}>
      <Img src={OWAIS} style={{ position: "absolute", top: tall ? 120 : -10, left: -(pw - 1080) * 0.62, width: pw, height: ph, filter: "contrast(1.08) saturate(1.1)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,5,3,${tall ? 1 : 0.5}) 0px, rgba(10,5,3,0) ${tall ? 340 : 200}px, rgba(10,5,3,0) ${H * 0.42}px, rgba(10,5,3,0.88) ${H * 0.66}px, #0a0503 ${H * 0.8}px)` }} />
      <Halftone opacity={0.1} />
      {/* corner tape */}
      <div style={{ position: "absolute", top: (tall ? 290 : 210) - 32, left: 800 - 380, width: 760, transform: "rotate(30deg)", background: goldGradient, borderTop: `4px solid ${gold.deep}`, borderBottom: `4px solid ${gold.deep}`, padding: "8px 0", textAlign: "center", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
        <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 40, color: green.deep }}>
          أبطال الخليج <Dot color={green.deep} size={9} /> <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, letterSpacing: 3 }}>CHAMPIONS</span>
        </span>
      </div>
      {/* text block */}
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, bottom: tall ? 200 : 60, textAlign: "center" }}>
        <div style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: tall ? 120 : 104, lineHeight: 1.1, color: "#fff", textShadow: "0 8px 30px rgba(0,0,0,0.9)" }}>هذا الأخضر</div>
        <div style={{ fontFamily: fonts.handAr, fontSize: tall ? 250 : 220, lineHeight: 1.25, backgroundImage: goldGradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.8))" }}>لا لعب</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginTop: tall ? 6 : 0 }}>
          <span style={{ width: 150, height: 3, background: `linear-gradient(90deg, rgba(233,194,90,0), ${gold.mid})` }} />
          <span style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: tall ? 62 : 54, color: gold.light }}>جهّزوا كاس الذهب</span>
          <span style={{ width: 150, height: 3, background: `linear-gradient(90deg, ${gold.mid}, rgba(233,194,90,0))` }} />
        </div>
      </div>
      <Logo tall={tall} />
    </AbsoluteFill>
  );
};
