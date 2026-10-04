import React from "react";
import { AbsoluteFill, Img, random, staticFile, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import { gold, goldGradient, green } from "./parts";

// Third Gulf Cup design: key-art posters. The stadium is the backdrop, players are cut out
// (public/gulf/*-cut.png) and stand in front of giant type for depth.
const STADIUM = { src: staticFile("gulf/stadium.jpg"), w: 1638, h: 2048, lights: [[0.29, 0.07], [0.82, 0.07]] };
const TEAM_CUT = { src: staticFile("gulf/team-cut.png"), w: 1469, h: 725 };
const OWAIS_CUT = { src: staticFile("gulf/owais-cut.png"), w: 1023, h: 1097 };

const Logo: React.FC = () => (
  <Img src={staticFile("neocapta-logo.png")} style={{ position: "absolute", top: 20, left: 32, width: 180, height: 180 * LOGO_RATIO, filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.9))" }} />
);

const Stadium: React.FC<{ H: number; dim?: number; zoom?: number; shiftY?: number }> = ({ H, dim = 0.5, zoom = 1, shiftY = 0 }) => {
  const sc = Math.max(1080 / STADIUM.w, H / STADIUM.h) * zoom;
  const w = STADIUM.w * sc;
  const h = STADIUM.h * sc;
  const left = (1080 - w) / 2;
  const top = (H - h) / 2 + shiftY;
  const lights = STADIUM.lights.map(([x, y]) => [left + x * w, top + y * h]);
  return (
    <AbsoluteFill>
      <Img src={STADIUM.src} style={{ position: "absolute", left, top, width: w, height: h, filter: "saturate(1.15) contrast(1.05)" }} />
      <AbsoluteFill style={{ background: `rgba(1,14,8,${dim})` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)" }} />
      {/* floodlight bloom + beams */}
      <svg width={1080} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        <defs>
          <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eafff2" stopOpacity={0.55} />
            <stop offset="1" stopColor="#eafff2" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="bloom">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="0.25" stopColor="#d9ffe9" stopOpacity={0.45} />
            <stop offset="1" stopColor="#1fae5b" stopOpacity={0} />
          </radialGradient>
        </defs>
        {lights.map(([x, y], i) => (
          <g key={i}>
            {[-34, -20, -8, 6, 18, 30].map((a, j) => (
              <path key={j} d={`M ${x} ${y} L ${x - 40} ${y + H} L ${x + 40} ${y + H} Z`} fill="url(#beam)" opacity={0.18 + (j % 2) * 0.06} transform={`rotate(${a + (i ? -6 : 6)} ${x} ${y})`} />
            ))}
            <circle cx={x} cy={y} r={230} fill="url(#bloom)" />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Sparkles: React.FC<{ H: number; n?: number; seed: string; y0?: number; y1?: number }> = ({ H, n = 70, seed, y0 = 0, y1 = 1 }) => (
  <>
    {new Array(n).fill(0).map((_, i) => {
      const s = 3 + random(`${seed}s${i}`) * 9;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`${seed}x${i}`) * 1080,
            top: (y0 + random(`${seed}y${i}`) * (y1 - y0)) * H,
            width: s,
            height: s,
            borderRadius: "50%",
            background: i % 4 ? gold.light : "#fff",
            boxShadow: `0 0 ${s * 2}px ${gold.mid}`,
            opacity: 0.35 + random(`${seed}o${i}`) * 0.6,
          }}
        />
      );
    })}
  </>
);

const goldFill: React.CSSProperties = { backgroundImage: goldGradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

const Kicker: React.FC<{ top: number }> = ({ top }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 22 }}>
    <span style={{ width: 120, height: 2, background: `linear-gradient(90deg, rgba(233,194,90,0), ${gold.mid})` }} />
    <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 9, color: gold.light }}>GULF CUP CHAMPIONS</span>
    <span style={{ width: 120, height: 2, background: `linear-gradient(90deg, ${gold.mid}, rgba(233,194,90,0))` }} />
  </div>
);

// Gold ribbon with the stamp line, tilted slightly.
const Ribbon: React.FC<{ top: number; size: number }> = ({ top, size }) => (
  <div style={{ position: "absolute", left: -60, right: -60, top, transform: "rotate(-3deg)", background: goldGradient, borderTop: `4px solid ${gold.light}`, borderBottom: `6px solid ${gold.deep}`, boxShadow: "0 20px 50px rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 34, padding: "4px 0" }}>
    <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: size * 0.3, letterSpacing: 6, color: green.deep, opacity: 0.75 }}>THIS IS THE GREEN</span>
    <span style={{ width: size * 0.16, height: size * 0.16, background: green.deep, transform: "rotate(45deg)" }} />
    <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: size, lineHeight: 1.3, color: green.deep }}>لا لعب</span>
    <span style={{ width: size * 0.16, height: size * 0.16, background: green.deep, transform: "rotate(45deg)" }} />
    <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: size * 0.3, letterSpacing: 6, color: green.deep, opacity: 0.75 }}>NO JOKE</span>
  </div>
);

const GoldCupLine: React.FC<{ top: number; size: number }> = ({ top, size }) => (
  <div dir="rtl" style={{ position: "absolute", top, left: 0, right: 0, textAlign: "center" }}>
    <span style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: size, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,0.9)" }}>جهّزوا </span>
    <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: size * 1.1, ...goldFill, filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.9))" }}>كاس الذهب</span>
  </div>
);

export const GulfTeamKeyArt: React.FC = () => {
  useFonts();
  const { height: H } = useVideoConfig();
  const tall = H > 1500;
  const cw = tall ? 1160 : 1100;
  const ch = (cw / TEAM_CUT.w) * TEAM_CUT.h;
  const cutBottom = tall ? 1420 : 1075; // where the cut-out ends (covered by the ribbon)
  const wordTop = tall ? 590 : 320;
  return (
    <AbsoluteFill style={{ backgroundColor: "#010a05", overflow: "hidden" }}>
      <Stadium H={H} dim={0.42} />
      <Sparkles H={H} seed="tk" y0={0.15} y1={0.6} />
      <Kicker top={tall ? 340 : 170} />
      {/* "هذا" + giant "الأخضر" behind the squad */}
      <div dir="rtl" style={{ position: "absolute", top: wordTop - (tall ? 70 : 60), left: 0, right: 0, textAlign: "center", fontFamily: fonts.ar, fontWeight: 900, fontSize: tall ? 100 : 88, lineHeight: 1.2, ...goldFill, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.8))" }}>هذا</div>
      <div dir="rtl" style={{ position: "absolute", top: wordTop, left: -40, right: -40, textAlign: "center", fontFamily: fonts.ar, fontWeight: 900, fontSize: tall ? 320 : 290, lineHeight: 1.25, color: "#fff", textShadow: "0 0 80px rgba(31,174,91,0.75), 0 0 20px rgba(31,174,91,0.6)" }}>
        الأخضر
      </div>
      {/* the squad, rim-lit */}
      <Img src={TEAM_CUT.src} style={{ position: "absolute", left: (1080 - cw) / 2, top: cutBottom - ch, width: cw, height: ch, filter: "drop-shadow(0 0 24px rgba(31,174,91,0.55)) drop-shadow(0 -6px 30px rgba(0,0,0,0.6)) contrast(1.06)" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(1,10,5,0) ${cutBottom - 120}px, rgba(1,10,5,0.95) ${cutBottom + 60}px, #010a05 100%)` }} />
      <Ribbon top={cutBottom - 46} size={tall ? 104 : 96} />
      <GoldCupLine top={cutBottom + (tall ? 150 : 115)} size={tall ? 70 : 62} />
      {tall ? (
        <div dir="rtl" style={{ position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center", fontFamily: fonts.ar, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: "rgba(255,255,255,0.75)" }}>
          أبطال الخليج
        </div>
      ) : null}
      <Logo />
    </AbsoluteFill>
  );
};

export const GulfOwaisKeyArt: React.FC = () => {
  useFonts();
  const { height: H } = useVideoConfig();
  const tall = H > 1500;
  const cw = tall ? 1260 : 1080;
  const ch = (cw / OWAIS_CUT.w) * OWAIS_CUT.h;
  const cutTop = tall ? 560 : 410;
  return (
    <AbsoluteFill style={{ backgroundColor: "#050302", overflow: "hidden" }}>
      <Stadium H={H} dim={0.55} zoom={1.15} shiftY={tall ? 160 : 120} />
      {/* warm glow behind him to match his kit */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 45% ${((cutTop + ch * 0.35) / H) * 100}%, rgba(255,140,40,0.35) 0%, rgba(255,140,40,0) 40%)` }} />
      <Sparkles H={H} seed="ow" y0={0.1} y1={0.55} n={55} />
      <Kicker top={tall ? 250 : 170} />
      {/* headline above his head */}
      <div dir="rtl" style={{ position: "absolute", top: tall ? 330 : 215, left: 0, right: 0, textAlign: "center", fontFamily: fonts.ar, fontWeight: 900, fontSize: tall ? 165 : 140, lineHeight: 1.15, color: "#fff", textShadow: "0 0 60px rgba(31,174,91,0.7), 0 10px 30px rgba(0,0,0,0.9)" }}>
        هذا <span style={{ backgroundImage: "linear-gradient(180deg, #6ff0a4, #1fae5b)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>الأخضر</span>
      </div>
      <Img src={OWAIS_CUT.src} style={{ position: "absolute", left: (1080 - cw) / 2 - 20, top: cutTop, width: cw, height: ch, filter: "drop-shadow(0 0 30px rgba(255,150,60,0.35)) drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(5,3,2,0) ${H * (tall ? 0.74 : 0.7)}px, rgba(5,3,2,0.92) ${H * (tall ? 0.86 : 0.84)}px, #050302 100%)` }} />
      <Ribbon top={H - (tall ? 290 : 228)} size={tall ? 84 : 72} />
      <GoldCupLine top={H - (tall ? 160 : 112)} size={tall ? 60 : 52} />
      <Logo />
    </AbsoluteFill>
  );
};
