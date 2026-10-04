import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";

// Fourth Gulf Cup design: clean editorial club-post style. Flat colours, one strong headline,
// blurred stadium (depth of field) and a solid type panel. No glows, sparkles or gradients on type.
const STADIUM = { src: staticFile("gulf/stadium.jpg"), w: 1638, h: 2048 };
const TEAM_CUT = { src: staticFile("gulf/team-cut.png"), w: 1469, h: 725 };
const OWAIS_CUT = { src: staticFile("gulf/owais-cut.png"), w: 1023, h: 1097 };

const C = { green: "#0A6B3A", ink: "#0d1410", paper: "#F3F2ED", muted: "#6d736f" };

const Backdrop: React.FC<{ H: number; focusY?: number }> = ({ H, focusY = 0.45 }) => {
  const sc = Math.max(1080 / STADIUM.w, H / STADIUM.h) * 1.08;
  const w = STADIUM.w * sc;
  const h = STADIUM.h * sc;
  return (
    <AbsoluteFill>
      <Img src={STADIUM.src} style={{ position: "absolute", left: (1080 - w) / 2, top: (H - h) * focusY, width: w, height: h, filter: "blur(9px) brightness(0.6) saturate(0.85)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,12,8,0.55) 0%, rgba(4,12,8,0.15) 45%, rgba(4,12,8,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => <Img src={staticFile("neocapta-logo.png")} style={{ position: "absolute", top: 22, left: 34, width: 170, height: 170 * LOGO_RATIO }} />;

const Headline: React.FC<{ top: number; size: number }> = ({ top, size }) => (
  <div dir="rtl" style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center", fontFamily: fonts.display, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: -2, color: "#fff", whiteSpace: "nowrap" }}>
    هذا الأخضر
  </div>
);

const Label: React.FC<{ top: number }> = ({ top }) => (
  <div dir="rtl" style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
    <span style={{ width: 14, height: 14, background: "#2bd47a" }} />
    <span style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 30, color: "rgba(255,255,255,0.85)" }}>أبطال كأس الخليج</span>
  </div>
);

// Solid bottom panel carrying the rest of the line.
const Panel: React.FC<{ top: number; H: number; tall: boolean }> = ({ top, H, tall }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, height: H - top, background: C.paper, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, borderLeft: `6px solid ${C.green}`, paddingLeft: 18 }}>
      <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: tall ? 26 : 22, letterSpacing: 5, color: C.ink }}>GULF CUP</span>
      <span style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: tall ? 22 : 19, letterSpacing: 5, color: C.muted }}>CHAMPIONS</span>
    </div>
    <div dir="rtl" style={{ textAlign: "right" }}>
      <div style={{ fontFamily: fonts.punch, fontSize: tall ? 190 : 160, lineHeight: 1.05, color: C.green }}>لا لعب.</div>
      <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: tall ? 58 : 50, lineHeight: 1.3, color: C.ink }}>جهّزوا كاس الذهب</div>
    </div>
  </div>
);

export const GulfTeamClean: React.FC = () => {
  useFonts();
  const { height: H } = useVideoConfig();
  const tall = H > 1500;
  const panelTop = tall ? 1380 : 1010;
  const cw = tall ? 1240 : 1180;
  const ch = (cw / TEAM_CUT.w) * TEAM_CUT.h;
  return (
    <AbsoluteFill style={{ backgroundColor: "#06100b", overflow: "hidden" }}>
      <Backdrop H={H} />
      <Label top={tall ? 470 : 150} />
      <Headline top={tall ? 550 : 235} size={tall ? 160 : 150} />
      <Img src={TEAM_CUT.src} style={{ position: "absolute", left: (1080 - cw) / 2, top: panelTop - ch + 2, width: cw, height: ch, filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.45))" }} />
      <Panel top={panelTop} H={H} tall={tall} />
      <Logo />
    </AbsoluteFill>
  );
};

export const GulfOwaisClean: React.FC = () => {
  useFonts();
  const { height: H } = useVideoConfig();
  const tall = H > 1500;
  const panelTop = tall ? 1500 : 1090;
  const cw = tall ? 1000 : 960;
  const ch = (cw / OWAIS_CUT.w) * OWAIS_CUT.h;
  const top = tall ? 690 : 365;
  return (
    <AbsoluteFill style={{ backgroundColor: "#06100b", overflow: "hidden" }}>
      <Backdrop H={H} focusY={0.3} />
      <Label top={tall ? 400 : 120} />
      <Headline top={tall ? 470 : 190} size={tall ? 160 : 150} />
      <Img src={OWAIS_CUT.src} style={{ position: "absolute", left: (1080 - cw) / 2 - 40, top, width: cw, height: ch, filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.5))" }} />
      <Panel top={panelTop} H={H} tall={tall} />
      <Logo />
    </AbsoluteFill>
  );
};
