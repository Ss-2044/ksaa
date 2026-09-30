import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { spin, lost, answer, steps, settle, outro } = timeline;
const C = { x: 540, y: 1200 };
const R = 400;
const BRASS = "radial-gradient(circle at 35% 30%, #fff1c2 0%, #d9b45a 30%, #8a6a2e 70%, #4a3714 100%)";
const DIRS = [
  { a: 0, en: "N", ar: "ش" },
  { a: 90, en: "E", ar: "ق" },
  { a: 180, en: "S", ar: "ج" },
  { a: 270, en: "W", ar: "غ" },
];

const Compass: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const done = SERVICES.filter((_, k) => frame >= steps.from + k * steps.each + 20).length;
  // needle: free spin -> frantic -> damped swings that shrink with every service -> locked on north
  let needle = frame * 9;
  if (frame >= lost.from) needle = lost.from * 9 + (frame - lost.from) * 16;
  if (frame >= answer.from) {
    const amp = 140 * Math.pow(0.55, done) * (frame >= settle.lock ? 0 : 1);
    needle = Math.sin((frame - answer.from) / 5) * amp;
  }
  const lockPulse = frame >= settle.lock ? Math.exp(-(frame - settle.lock) / 12) : 0;
  const logo = spring({ frame: frame - settle.lock, fps, config: { damping: 14 } });
  const zoom = interpolate(frame, [settle.lock, settle.to], [1, 1.03], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #1a2040 0%, #070812 70%)" }} />
      <AbsoluteFill style={{ opacity: 0.25, backgroundImage: "linear-gradient(rgba(201,162,74,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,74,0.25) 1px, transparent 1px)", backgroundSize: "90px 90px" }} />
      <div style={{ position: "absolute", left: C.x - R - 40, top: C.y - R - 40, width: (R + 40) * 2, height: (R + 40) * 2, transform: `scale(${zoom})` }}>
        {/* brass case */}
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: BRASS, boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }} />
        {/* face */}
        <div style={{ position: "absolute", inset: 40, borderRadius: "50%", background: "radial-gradient(circle, #F6F1E4 0%, #E9DFC6 100%)", boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)" }} />
        <svg width={(R + 40) * 2} height={(R + 40) * 2} viewBox={`${-R - 40} ${-R - 40} ${(R + 40) * 2} ${(R + 40) * 2}`} style={{ position: "absolute", inset: 0 }}>
          {/* service sectors light up around the rim */}
          {SERVICES.map((s, k) => {
            const a0 = -90 + 36 + k * 57.6;
            const a1 = a0 + 50;
            const r1 = R - 20;
            const r0 = R - 70;
            const p = (a: number, r: number) => `${Math.cos((a * Math.PI) / 180) * r} ${Math.sin((a * Math.PI) / 180) * r}`;
            const on = k < done;
            const mid = ((a0 + a1) / 2) * (Math.PI / 180);
            return (
              <g key={s.en}>
                <path d={`M ${p(a0, r0)} L ${p(a0, r1)} A ${r1} ${r1} 0 0 1 ${p(a1, r1)} L ${p(a1, r0)} A ${r0} ${r0} 0 0 0 ${p(a0, r0)} Z`} fill={on ? colors.royal : "rgba(52,68,153,0.12)"} />
                <text x={Math.cos(mid) * (r0 - 34)} y={Math.sin(mid) * (r0 - 34) + 10} textAnchor="middle" fill={on ? colors.royal : "#b9ad8a"} fontFamily="Aref Ruqaa" fontSize={30}>
                  {s.ar}
                </text>
              </g>
            );
          })}
          {/* ticks + cardinal points */}
          {new Array(72).fill(0).map((_, i) => {
            const a = (i * 5 * Math.PI) / 180;
            const long = i % 9 === 0;
            return <line key={i} x1={Math.cos(a) * (R - 10)} y1={Math.sin(a) * (R - 10)} x2={Math.cos(a) * (R - (long ? 40 : 22))} y2={Math.sin(a) * (R - (long ? 40 : 22))} stroke="#4a3714" strokeWidth={long ? 4 : 2} />;
          })}
          {DIRS.map((d) => {
            const a = ((d.a - 90) * Math.PI) / 180;
            return d.a === 0 && frame >= settle.lock ? null : (
              <g key={d.en}>
                <text x={Math.cos(a) * (R - 110)} y={Math.sin(a) * (R - 110) + 16} textAnchor="middle" fill="#2a1f0c" fontFamily="Playfair Display" fontWeight={700} fontSize={52}>
                  {d.en}
                </text>
                <text x={Math.cos(a) * (R - 160)} y={Math.sin(a) * (R - 160) + 14} textAnchor="middle" fill="#8a6a2e" fontFamily="Cairo" fontWeight={900} fontSize={34}>
                  {d.ar}
                </text>
              </g>
            );
          })}
          {/* compass rose */}
          <g opacity={0.35}>
            {[0, 45, 90, 135].map((a) => (
              <path key={a} d="M 0 -170 L 18 0 L 0 170 L -18 0 Z" fill="#8a6a2e" transform={`rotate(${a})`} />
            ))}
          </g>
          {/* needle */}
          <g transform={`rotate(${needle})`}>
            <path d="M 0 -300 L 26 0 L -26 0 Z" fill={frame >= settle.lock ? colors.accent : "#c8263b"} />
            <path d="M 0 300 L 26 0 L -26 0 Z" fill="#1b1e27" />
            <circle r={22} fill="#d9b45a" stroke="#4a3714" strokeWidth={4} />
          </g>
          {lockPulse > 0 ? <circle r={R - 40 + (1 - lockPulse) * 80} fill="none" stroke={colors.accent} strokeWidth={10} opacity={lockPulse} /> : null}
        </svg>
        {/* glass */}
        <div style={{ position: "absolute", inset: 40, borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 35%)" }} />
      </div>
      {/* north becomes the brand */}
      {frame >= settle.lock ? (
        <div style={{ position: "absolute", left: C.x - 170, top: C.y - R - 250, width: 280, opacity: logo, transform: `translateY(${(1 - logo) * 60}px)`, filter: "drop-shadow(0 0 30px rgba(94,120,255,0.8))" }}>
          <Img src={staticFile("neocapta-logo.png")} style={{ width: "100%" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "البوصلة / The Compass" — a spinning needle steadies with every service until it points one way: the brand.
export const CompassVideo: React.FC = () => (
  <Shell
    bg="#070812"
    audio="compass-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Every idea, a direction.", ar: "لكل فكرة وجهة" }}
    flashes={[settle.lock]}
    captions={[
      { from: spin.from + 16, to: spin.to, kicker: "THE COMPASS · البوصلة", en: "Every idea needs a direction.", ar: "كل فكرة تحتاج اتجاه.", top: 200 },
      { from: lost.from + 4, to: lost.to, en: "But the needle keeps spinning.", ar: "بس الإبرة ما تثبت.", enSize: 76, top: 200 },
      { from: answer.from + 4, to: steps.from, kicker: "NEO CAPTA", en: "We calibrate it.", ar: "نحن نضبطها.", top: 200 },
      ...SERVICES.map((s, k) => ({ from: steps.from + k * steps.each + 4, to: k < 4 ? steps.from + (k + 1) * steps.each + 4 : settle.from, kicker: `STEP ${k + 1}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 170 })),
      { from: settle.lock + 30, to: outro.from, en: "One clear direction.", ar: "اتجاه واحد… واضح.", enSize: 80, top: 190 },
    ]}
  >
    <Compass />
  </Shell>
);
