import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { gap, apart, towers, build, cross, outro } = timeline;
const DECK = 1240;
const L = 250; // left cliff edge
const R = 830; // right cliff edge
const SEG = (R - L) / 5;

const Person: React.FC<{ x: number; y: number; lit: boolean; s?: number }> = ({ x, y, lit, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-62} r={14} fill={lit ? colors.accent : "#2a3052"} />
    <path d="M -16 -44 L 16 -44 L 20 0 L -20 0 Z" fill={lit ? colors.accent : "#2a3052"} />
    {lit ? <path d="M -16 -40 L -30 -70 M 16 -40 L 30 -70" stroke={colors.accent} strokeWidth={6} strokeLinecap="round" /> : null}
  </g>
);

const Valley: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tw = interpolate(frame, [towers.from, towers.to], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const segIn = (k: number) => spring({ frame: frame - (build.from + k * build.each), fps, config: { damping: 12, stiffness: 120 } });
  const built = SERVICES.filter((_, k) => frame >= build.from + k * build.each + 20).length;
  // the idea (a glowing orb): hops at the edge while apart, then crosses
  let ox = L - 60;
  let oy = DECK - 40;
  if (frame >= apart.from && frame < towers.from) {
    const h = Math.abs(Math.sin((frame - apart.from) / 8));
    ox = L - 60 + h * 40;
    oy = DECK - 40 - h * 60;
  }
  const c = interpolate(frame, [cross.from, cross.arrive], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  if (c > 0) {
    ox = L - 60 + (R + 90 - (L - 60)) * c;
    oy = DECK - 40 - Math.abs(Math.sin(c * Math.PI * 6)) * 14;
  }
  const arrived = frame >= cross.arrive;
  const logo = spring({ frame: frame - (cross.arrive + 10), fps, config: { damping: 14 } });
  const cableY = (x: number) => DECK - 260 + Math.pow((x - (L + R) / 2) / ((R - L) / 2), 2) * 200;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #081036 0%, #1b2d7a 50%, #7E93FF 78%, #c9d2ff 88%, #2a2440 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* distant mountains */}
        <path d="M 0 1300 L 160 1150 L 320 1260 L 520 1080 L 700 1240 L 880 1120 L 1080 1260 L 1080 1920 L 0 1920 Z" fill="#2a3470" opacity={0.6} />
        {/* the chasm */}
        <path d={`M 0 ${DECK} L ${L} ${DECK} L ${L - 40} 1920 L 0 1920 Z`} fill="#0a0e22" />
        <path d={`M ${R} ${DECK} L 1080 ${DECK} L 1080 1920 L ${R + 40} 1920 Z`} fill="#0a0e22" />
        <path d={`M ${L - 40} 1920 L ${L + 60} 1700 L ${R - 60} 1760 L ${R + 40} 1920 Z`} fill="#05070f" />
        {/* towers + cables */}
        <g opacity={tw}>
          {[L + 40, R - 40].map((x) => (
            <g key={x}>
              <rect x={x - 12} y={DECK - 300 * tw} width={24} height={300 * tw + 200} fill="#E4E6EE" />
              <rect x={x - 22} y={DECK - 300 * tw} width={44} height={16} fill="#E4E6EE" />
            </g>
          ))}
          <path d={`M ${L + 40} ${DECK - 300} Q ${(L + R) / 2} ${DECK - 60} ${R - 40} ${DECK - 300}`} stroke="#E4E6EE" strokeWidth={5} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - tw} />
        </g>
        {/* deck segments dropping in */}
        {SERVICES.map((s, k) => {
          const p = segIn(k);
          if (frame < build.from + k * build.each) return null;
          const x0 = L + k * SEG;
          const lit = k < built;
          return (
            <g key={s.en} transform={`translate(0 ${(1 - p) * -700})`}>
              <rect x={x0 + 2} y={DECK - 14} width={SEG - 4} height={28} rx={4} fill={lit ? colors.royal : "#8A90A8"} stroke="#E4E6EE" strokeWidth={2} />
              <line x1={x0 + SEG / 2} x2={x0 + SEG / 2} y1={DECK - 14} y2={cableY(x0 + SEG / 2)} stroke="#E4E6EE" strokeWidth={2} opacity={tw} />
              <text x={x0 + SEG / 2} y={DECK + 70} textAnchor="middle" fill="#E4E6EE" fontFamily="Aref Ruqaa" fontSize={30} opacity={lit ? 1 : 0}>
                {s.ar}
              </text>
            </g>
          );
        })}
        {/* audience on the far side */}
        {new Array(7).fill(0).map((_, i) => {
          const lit = arrived && frame >= cross.arrive + i * 3;
          const jump = lit ? Math.abs(Math.sin((frame - cross.arrive) / 5 + i)) * 16 : 0;
          return <Person key={i} x={R + 50 + i * 30} y={DECK - jump} lit={lit} s={0.8 + random(`ps${i}`) * 0.3} />;
        })}
        {/* the idea */}
        <circle cx={ox} cy={oy} r={30} fill="#FFE7A3" style={{ filter: "drop-shadow(0 0 24px #FFE7A3)" }} />
        <text x={ox} y={oy + 10} textAnchor="middle" fontFamily="Cairo" fontWeight={900} fontSize={24} fill="#5a4217">
          فكرة
        </text>
        {/* speech bubble from the audience once they meet */}
        {arrived ? (
          <g opacity={logo}>
            <rect x={R - 20} y={DECK - 230} width={220} height={70} rx={20} fill="#fff" />
            <text x={R + 90} y={DECK - 185} textAnchor="middle" fontFamily="Cairo" fontWeight={900} fontSize={30} fill={colors.royal}>
              وصلتنا! 👏
            </text>
          </g>
        ) : null}
      </svg>
      <div style={{ position: "absolute", left: 60, top: DECK + 150, fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#E4E6EE" }}>YOUR IDEA · فكرتك</div>
      <div style={{ position: "absolute", right: 60, top: DECK + 150, fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#E4E6EE" }}>AUDIENCE · الجمهور</div>
      {frame >= cross.arrive + 10 ? (
        <div style={{ position: "absolute", left: 540 - 220, top: 620, width: 440, opacity: logo, transform: `scale(${0.8 + logo * 0.2})`, filter: "drop-shadow(0 0 30px rgba(255,255,255,0.6))" }}>
          <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "الجسر / The Bridge" — the idea on one cliff, the audience on the other; the services are the spans between.
export const BridgeVideo: React.FC = () => (
  <Shell
    bg="#081036"
    audio="bridge-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "We build the bridge.", ar: "نبني الجسر بين فكرتك وجمهورك" }}
    flashes={[cross.arrive]}
    captions={[
      { from: gap.from + 16, to: gap.to, kicker: "THE BRIDGE · الجسر", en: "Your idea is here…", ar: "فكرتك هنا…", top: 200 },
      { from: apart.from + 4, to: apart.to, en: "…and your audience is over there.", ar: "…وجمهورك هناك.", enSize: 74, top: 200 },
      { from: towers.from + 4, to: build.from, kicker: "NEO CAPTA", en: "We build the bridge.", ar: "نحن نبني الجسر.", top: 200 },
      ...SERVICES.map((s, k) => ({ from: build.from + k * build.each + 4, to: k < 4 ? build.from + (k + 1) * build.each + 4 : cross.from, kicker: `SPAN ${k + 1}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 180 })),
      { from: cross.arrive + 20, to: outro.from, en: "Your idea meets its people.", ar: "فكرتك… وصلت لناسها.", enSize: 76, top: 190 },
    ]}
  >
    <Valley />
  </Shell>
);
