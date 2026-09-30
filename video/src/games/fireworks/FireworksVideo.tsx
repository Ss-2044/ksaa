import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";

import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { spark, fizzle, fuse, shells, finale, outro } = timeline;
const GROUND = 1600;

type Firework = { x: number; y: number; hue: number; kind: "peony" | "ring" | "willow" | "crossette" | "palm" };
const SHELLS: Firework[] = [
  { x: 320, y: 820, hue: 228, kind: "peony" },
  { x: 760, y: 760, hue: 200, kind: "ring" },
  { x: 540, y: 700, hue: 45, kind: "willow" },
  { x: 260, y: 640, hue: 260, kind: "crossette" },
  { x: 800, y: 620, hue: 180, kind: "palm" },
];

// One burst: `t` 0..1 after the explosion.
const Burst: React.FC<{ s: Firework; t: number; seed: string }> = ({ s, t, seed }) => {
  const n = s.kind === "palm" ? 9 : 48;
  const fade = 1 - t;
  const R = (s.kind === "ring" ? 260 : 300) * Math.pow(t, 0.4);
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`${seed}a${i}`) * 0.1;
        const rr = s.kind === "ring" ? R : R * (0.7 + random(`${seed}r${i}`) * 0.3);
        const droop = s.kind === "willow" || s.kind === "palm" ? t * t * 260 : t * t * 90;
        const x = s.x + Math.cos(a) * rr;
        const y = s.y + Math.sin(a) * rr + droop;
        const trail = s.kind === "willow" || s.kind === "palm" ? 60 : 24;
        const light = s.kind === "willow" ? 70 : 65;
        const c = `hsla(${s.hue + (i % 3) * 12},95%,${light}%,${fade})`;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={s.x + Math.cos(a) * Math.max(0, rr - trail)} y2={s.y + Math.sin(a) * Math.max(0, rr - trail) + droop * 0.8} stroke={c} strokeWidth={s.kind === "palm" ? 8 : 3} strokeLinecap="round" />
            <circle cx={x} cy={y} r={s.kind === "palm" ? 7 : 4} fill={`hsla(${s.hue},100%,90%,${fade})`} />
            {s.kind === "crossette" && t > 0.5
              ? [-0.5, 0.5].map((d) => <line key={d} x1={x} y1={y} x2={x + Math.cos(a + d) * 60 * (t - 0.5)} y2={y + Math.sin(a + d) * 60 * (t - 0.5)} stroke={c} strokeWidth={2} />)
              : null}
          </g>
        );
      })}
      <circle cx={s.x} cy={s.y} r={80 * (1 - t)} fill={`hsla(${s.hue},100%,90%,${0.5 * (1 - t)})`} />
    </g>
  );
};

const Night: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = (f0: number) => interpolate(frame, [f0, f0 + 6, f0 + 40], [0, 1, 0], clamp);
  let skyLight = 0;
  SHELLS.forEach((_, k) => (skyLight = Math.max(skyLight, glow(shells.from + k * shells.each + shells.rise))));
  skyLight = Math.max(skyLight, glow(finale.logo) * 1.2);
  const logo = interpolate(frame, [finale.logo, finale.logo + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fuseT = interpolate(frame, [fuse.from + 10, fuse.to], [0, 1], clamp);

  // particles converging into the brand for the finale
  const conv = interpolate(frame, [finale.from + 10, finale.logo], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #010108 0%, #070a24 60%, #11163e 100%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(160,170,255,${0.25 * skyLight}) 0%, rgba(0,0,0,0) 70%)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* the first spark that fizzles */}
        {frame < fuse.from
          ? [0, 1].map((j) => {
              const f0 = j === 0 ? spark.from + 20 : fizzle.from + 20;
              const p = interpolate(frame, [f0, f0 + 40], [0, 1], clamp);
              if (p <= 0 || p >= 1) return null;
              return <circle key={j} cx={540 + j * 120 - 60} cy={GROUND - 40 - p * 420} r={6 * (1 - p)} fill="#FFE7A3" opacity={1 - p} style={{ filter: "drop-shadow(0 0 10px #FFE7A3)" }} />;
            })
          : null}
        {/* the fuse */}
        {frame >= fuse.from && frame < shells.from + 10 ? (
          <g>
            <path d={`M 140 ${GROUND + 40} C 400 ${GROUND + 80} 600 ${GROUND} 900 ${GROUND + 40}`} stroke="#6b5a4a" strokeWidth={6} fill="none" />
            <circle cx={140 + fuseT * 760} cy={GROUND + 40 + Math.sin(fuseT * Math.PI) * 30} r={10} fill="#FFB84A" style={{ filter: "drop-shadow(0 0 14px #ffb84a)" }} />
          </g>
        ) : null}
        {/* five shells: rise, then burst */}
        {SHELLS.map((s, k) => {
          const f0 = shells.from + k * shells.each;
          const up = interpolate(frame, [f0, f0 + shells.rise], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
          const bt = interpolate(frame, [f0 + shells.rise, f0 + shells.rise + 70], [0, 1], clamp);
          return (
            <g key={k}>
              {up > 0 && up < 1 ? <line x1={s.x} y1={GROUND - (GROUND - s.y) * up} x2={s.x} y2={GROUND - (GROUND - s.y) * up + 60} stroke="#FFE7A3" strokeWidth={4} opacity={0.8} /> : null}
              {bt > 0 && bt < 1 ? <Burst s={s} t={bt} seed={`s${k}`} /> : null}
              {bt > 0.05 && bt < 0.9 ? (
                <text x={s.x} y={s.y + 12} textAnchor="middle" fill="#fff" fontFamily="Aref Ruqaa" fontSize={42} opacity={Math.sin(bt * Math.PI)} style={{ paintOrder: "stroke" }} stroke="rgba(0,0,0,0.4)" strokeWidth={6}>
                  {SERVICES[k].ar}
                </text>
              ) : null}
            </g>
          );
        })}
        {/* finale: a volley, then particles pulled into the logo */}
        {frame >= finale.from
          ? new Array(60).fill(0).map((_, i) => {
              const sx = 540 + (random(`fx${i}`) - 0.5) * 1000;
              const sy = 400 + random(`fy${i}`) * 700;
              const tx = 540 + (random(`tx${i}`) - 0.5) * 460;
              const ty = 760 + (random(`ty${i}`) - 0.5) * 300;
              const x = sx + (tx - sx) * conv;
              const y = sy + (ty - sy) * conv;
              const hue = [228, 200, 45, 260, 180][i % 5];
              return <circle key={i} cx={x} cy={y} r={5} fill={`hsl(${hue},100%,75%)`} opacity={1 - logo} style={{ filter: `drop-shadow(0 0 8px hsl(${hue},100%,70%))` }} />;
            })
          : null}
        {/* Riyadh-style skyline with the crowd below */}
        <g fill="#03040c">
          <path d={`M 470 ${GROUND} L 480 ${GROUND - 560} Q 540 ${GROUND - 700} 600 ${GROUND - 560} L 610 ${GROUND} Z`} />
          <path d={`M 505 ${GROUND - 560} Q 540 ${GROUND - 640} 575 ${GROUND - 560} L 570 ${GROUND - 500} L 510 ${GROUND - 500} Z`} fill="#11163e" />
          <path d={`M 740 ${GROUND} L 760 ${GROUND - 420} L 780 ${GROUND - 470} L 800 ${GROUND - 420} L 820 ${GROUND} Z`} />
          {new Array(14).fill(0).map((_, i) => {
            const x = i * 80 - 20;
            if (x > 440 && x < 640) return null;
            const h = 120 + random(`bh${i}`) * 260;
            return <rect key={i} x={x} y={GROUND - h} width={70} height={h} />;
          })}
          <rect x={0} y={GROUND} width={1080} height={320} />
          {new Array(30).fill(0).map((_, i) => (
            <circle key={i} cx={20 + i * 36} cy={GROUND + 70 + (i % 2) * 14} r={18} />
          ))}
        </g>
      </svg>
      {/* the brand, lit by the finale */}
      <div style={{ position: "absolute", left: 540 - 250, top: 580, width: 500, opacity: logo, transform: `scale(${0.8 + logo * 0.2})`, filter: "drop-shadow(0 0 40px rgba(170,185,255,0.9))" }}>
        <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
      </div>
      {/* phones in the crowd lighting up */}
      {frame >= finale.logo
        ? new Array(10).fill(0).map((_, i) => <div key={i} style={{ position: "absolute", left: 60 + i * 100, top: GROUND + 20 - (i % 3) * 12, width: 14, height: 22, borderRadius: 3, background: "#DCE4FF", boxShadow: "0 0 12px #DCE4FF", opacity: interpolate(frame, [finale.logo + i * 3, finale.logo + i * 3 + 8], [0, 1], clamp) }} />)
        : null}
    </AbsoluteFill>
  );
};

// "الألعاب النارية / Fireworks" — one spark fizzles; lit properly, five shells burst and the finale draws the brand.
export const FireworksVideo: React.FC = () => (
  <Shell
    bg="#010108"
    audio="fireworks-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Worth celebrating.", ar: "فكرتك تستاهل احتفال" }}
    flashes={[finale.logo]}
    captions={[
      { from: spark.from + 16, to: spark.to, kicker: "FIREWORKS · الألعاب النارية", en: "Every idea starts as a spark.", ar: "كل فكرة… شرارة.", top: 190 },
      { from: fizzle.from + 4, to: fizzle.to, en: "But not every spark lights up the sky.", ar: "بس مو كل شرارة تنوّر السما.", enSize: 72, top: 190 },
      { from: fuse.from + 4, to: shells.from, kicker: "NEO CAPTA", en: "We light the fuse.", ar: "نحن نشعل الفتيل.", top: 190 },
      ...SERVICES.map((s, k) => ({ from: shells.from + k * shells.each + 4, to: k < 4 ? shells.from + (k + 1) * shells.each + 4 : finale.from, kicker: `SHELL ${k + 1}`, en: s.en, ar: s.ar, enSize: 84, arSize: 72, top: 150 })),
      { from: finale.logo + 20, to: outro.from, en: "Your idea deserves a celebration.", ar: "فكرتك… تستاهل احتفال.", enSize: 72, top: 170 },
    ]}
  >
    <Night />
  </Shell>
);

