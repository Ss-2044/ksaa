import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";

import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { rough, hidden, tool, cuts, shine, outro } = timeline;
const C = { x: 540, y: 1180 };

// Brilliant-cut outline (front view), 10 points, and a lumpy rough stone with the same point count.
const CUT: [number, number][] = [
  [-300, -110], [-190, -230], [-60, -250], [60, -250], [190, -230], [300, -110], [150, 60], [40, 240], [0, 330], [-40, 240],
];
const ROUGH: [number, number][] = CUT.map(([x, y], i) => [x * (0.8 + random(`rx${i}`) * 0.35) + (random(`ox${i}`) - 0.5) * 60, y * 0.7 + (random(`oy${i}`) - 0.5) * 90]);
// facets appear with each cut
const FACETS: { pts: [number, number][]; k: number }[] = [
  { pts: [[-60, -250], [60, -250], [100, -110], [-100, -110]], k: 0 },
  { pts: [[-190, -230], [-60, -250], [-100, -110], [-300, -110]], k: 1 },
  { pts: [[190, -230], [60, -250], [100, -110], [300, -110]], k: 1 },
  { pts: [[-300, -110], [-100, -110], [0, 330]], k: 2 },
  { pts: [[300, -110], [100, -110], [0, 330]], k: 2 },
  { pts: [[-100, -110], [100, -110], [0, 330]], k: 3 },
  { pts: [[-300, -110], [-150, 60], [0, 330]], k: 4 },
  { pts: [[300, -110], [150, 60], [0, 330]], k: 4 },
];
const toPts = (p: [number, number][]) => p.map(([x, y]) => `${C.x + x},${C.y + y}`).join(" ");

const Gem: React.FC = () => {
  const frame = useCurrentFrame();
  const done = SERVICES.filter((_, k) => frame >= cuts.from + k * cuts.each + cuts.laser).length;
  const cutP = interpolate(frame, [cuts.from, cuts.from + 5 * cuts.each], [0, 1], clamp);
  const shape = ROUGH.map(([x, y], i): [number, number] => [x + (CUT[i][0] - x) * cutP, y + (CUT[i][1] - y) * cutP]);
  const sh = interpolate(frame, [shine.from, shine.from + 30], [0, 1], clamp);
  const spin = frame >= shine.from ? Math.sin((frame - shine.from) / 14) : 0;
  const bob = Math.sin(frame / 25) * 10;
  // laser for the current cut
  const k = Math.min(4, Math.floor((frame - cuts.from) / cuts.each));
  const lt = frame >= cuts.from && frame < shine.from ? interpolate((frame - cuts.from) % cuts.each, [0, cuts.laser], [0, 1], clamp) : 0;
  const laserY = C.y - 300 + k * 130;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #1a1030 0%, #0a0616 55%, #030208 100%)" }} />
      {/* velvet display */}
      <div style={{ position: "absolute", left: 540 - 420, top: C.y + 380, width: 840, height: 120, borderRadius: "50%", background: "radial-gradient(ellipse, #3a1a4a, #12061a)" }} />
      <div style={{ position: "absolute", left: C.x - 420, top: C.y - 480, width: 840, height: 840, borderRadius: "50%", background: `radial-gradient(circle, rgba(200,210,255,${0.12 + sh * 0.3}) 0%, rgba(0,0,0,0) 65%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6b6f80" />
            <stop offset="100%" stopColor="#2a2d38" />
          </linearGradient>
          <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#c9d2ff" />
            <stop offset="100%" stopColor="#5E78FF" />
          </linearGradient>
        </defs>
        <g transform={`translate(0 ${bob}) translate(${C.x} ${C.y}) scale(${1 - Math.abs(spin) * 0.06} 1) translate(${-C.x} ${-C.y})`}>
          <polygon points={toPts(shape)} fill={done >= 5 ? "url(#gem)" : "url(#stone)"} stroke="#c9d2ff" strokeWidth={done > 0 ? 3 : 0} opacity={1} />
          {FACETS.map((f, i) =>
            f.k < done ? (
              <polygon key={i} points={toPts(f.pts)} fill={`rgba(${200 + (i % 3) * 20},${210 + (i % 2) * 20},255,${0.18 + 0.25 * Math.abs(Math.sin(frame / 18 + i + spin * 3))})`} stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
            ) : null,
          )}
          {/* chips flying off the current cut */}
          {lt > 0 && lt < 1
            ? new Array(8).fill(0).map((_, i) => (
                <rect key={i} x={C.x + (random(`cx${k}${i}`) - 0.5) * 500 + lt * (random(`vx${i}`) - 0.5) * 300} y={laserY + lt * 200 * random(`vy${i}`)} width={10} height={10} fill="#8A90A8" transform={`rotate(${lt * 400} ${C.x} ${laserY})`} />
              ))
            : null}
        </g>
        {/* laser */}
        {lt > 0 && lt < 1 ? (
          <g>
            <line x1={-40} x2={1120} y1={laserY} y2={laserY + 60} stroke="#ff4d6d" strokeWidth={4} style={{ filter: "drop-shadow(0 0 12px #ff4d6d)" }} opacity={Math.sin(lt * Math.PI)} />
            <circle cx={C.x - 320 + lt * 640} cy={laserY + ((C.x - 320 + lt * 640 + 40) / 1160) * 60} r={14} fill="#fff" style={{ filter: "drop-shadow(0 0 16px #ff4d6d)" }} />
          </g>
        ) : null}
        {/* sparkle + dispersion once polished */}
        {sh > 0
          ? new Array(10).fill(0).map((_, i) => {
              const a = (i / 10) * Math.PI * 2 + frame / 60;
              const hue = (i * 36 + frame * 2) % 360;
              return <polygon key={i} points={`${C.x},${C.y - 40} ${C.x + Math.cos(a - 0.05) * 900},${C.y + Math.sin(a - 0.05) * 900} ${C.x + Math.cos(a + 0.05) * 900},${C.y + Math.sin(a + 0.05) * 900}`} fill={`hsla(${hue},90%,70%,${0.14 * sh})`} style={{ mixBlendMode: "screen" }} />;
            })
          : null}
        {sh > 0
          ? new Array(12).fill(0).map((_, i) => {
              const t = ((frame + i * 9) % 50) / 50;
              const x = C.x + (random(`px${i}`) - 0.5) * 520;
              const y = C.y + (random(`py${i}`) - 0.5) * 480;
              const s = Math.sin(t * Math.PI) * 26;
              return <path key={i} d={`M ${x - s} ${y} L ${x + s} ${y} M ${x} ${y - s} L ${x} ${y + s}`} stroke="#fff" strokeWidth={3} opacity={Math.sin(t * Math.PI)} />;
            })
          : null}
      </svg>
      {/* the brand at the heart of the gem */}
      <div style={{ position: "absolute", left: C.x - 150, top: C.y - 190 + bob, width: 300, opacity: sh, filter: "drop-shadow(0 0 20px rgba(255,255,255,0.9))" }}>
        <Img src={staticFile("neocapta-logo.png")} style={{ width: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

// "الماسة / The Diamond" — a rough stone is cut facet by facet into a brilliant.
export const DiamondVideo: React.FC = () => (
  <Shell
    bg="#030208"
    audio="diamond-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Polished to shine.", ar: "نصقل فكرتك لين تلمع" }}
    flashes={[shine.from]}
    captions={[
      { from: rough.from + 16, to: rough.to, kicker: "THE DIAMOND · الماسة", en: "Every idea is a rough stone.", ar: "كل فكرة… حجر خام.", top: 200 },
      { from: hidden.from + 4, to: hidden.to, en: "Its value is hidden.", ar: "قيمتها مخفية.", top: 200 },
      { from: tool.from + 4, to: cuts.from, kicker: "NEO CAPTA", en: "We cut and polish.", ar: "نحن نقطع ونصقل.", top: 200 },
      ...SERVICES.map((s, k) => ({ from: cuts.from + k * cuts.each + 4, to: k < 4 ? cuts.from + (k + 1) * cuts.each + 4 : shine.from, kicker: `CUT ${k + 1}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 180 })),
      { from: shine.from + 20, to: outro.from, en: "Polished until it shines.", ar: "نصقل فكرتك… لين تلمع.", enSize: 80, top: 200 },
    ]}
  >
    <Gem />
  </Shell>
);

