import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { seed, lost, water, grow, harvest, outro } = timeline;
const GROUND = 1500;
const BASE = { x: 540, y: GROUND };
const TRUNK_H = 620;
const stage = (k: number, frame: number) => interpolate(frame, [grow.from + k * grow.each, grow.from + k * grow.each + 44], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });

const Palm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const roots = stage(0, frame);
  const trunk = stage(1, frame);
  const fronds = stage(2, frame);
  const clusters = stage(3, frame);
  const ripe = stage(4, frame);
  const dropY = interpolate(frame, [water.from, water.drop], [700, GROUND + 60], { ...clamp, easing: Easing.in(Easing.quad) });
  const sun = interpolate(frame, [grow.from, harvest.from], [0, 1], clamp);
  const logo = spring({ frame: frame - harvest.from - 20, fps, config: { damping: 14 } });
  const cracks = frame >= lost.from && frame < water.drop ? interpolate(frame, [lost.from, lost.to], [0, 1], clamp) : frame >= water.drop ? 0 : 0;
  const top = { x: BASE.x + Math.sin(trunk * 0.6) * 20, y: GROUND - TRUNK_H * trunk };
  const sway = Math.sin(frame / 30) * 3;

  return (
    <AbsoluteFill>
      {/* sky warms up as the palm grows */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #06102e 0%, ${sun > 0.5 ? "#2a4bb0" : "#132260"} 55%, #7E93FF 78%, #f3d9a4 ${88 - sun * 6}%, #c89b5c 100%)` }} />
      <div style={{ position: "absolute", left: 540 - 200, top: GROUND - 260 - sun * 420, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,244,210,0.95) 0%, rgba(255,220,160,0.35) 45%, rgba(255,220,160,0) 70%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* soil, cross-section */}
        <path d={`M 0 ${GROUND} C 300 ${GROUND - 30} 700 ${GROUND - 30} 1080 ${GROUND} L 1080 1920 L 0 1920 Z`} fill="#6b4a2a" />
        <path d={`M 0 ${GROUND} C 300 ${GROUND - 30} 700 ${GROUND - 30} 1080 ${GROUND}`} stroke="#c89b5c" strokeWidth={10} fill="none" />
        {new Array(40).fill(0).map((_, i) => (
          <circle key={i} cx={random(`g${i}`) * 1080} cy={GROUND + 30 + random(`h${i}`) * 380} r={3 + random(`r${i}`) * 5} fill="#4a321c" />
        ))}
        {/* dry cracks when the seed is lost */}
        <g stroke="#3a2614" strokeWidth={4} fill="none" opacity={cracks}>
          <path d={`M 420 ${GROUND + 10} l 40 50 l -20 40 l 50 60`} />
          <path d={`M 640 ${GROUND + 5} l -30 60 l 30 30 l -20 70`} />
        </g>
        {/* the seed */}
        <ellipse cx={BASE.x} cy={GROUND + 110} rx={30} ry={18} fill="#8a5a2e" stroke="#3a2614" strokeWidth={3} />
        {/* water drop */}
        {frame >= water.from && frame < water.drop + 2 ? <path d={`M 540 ${dropY - 40} C 520 ${dropY - 10} 520 ${dropY + 10} 540 ${dropY + 10} C 560 ${dropY + 10} 560 ${dropY - 10} 540 ${dropY - 40} Z`} fill="#7ec8ff" /> : null}
        {frame >= water.drop && frame < water.drop + 30 ? <circle cx={540} cy={GROUND + 110} r={(frame - water.drop) * 6} fill="none" stroke="#7ec8ff" strokeWidth={4} opacity={1 - (frame - water.drop) / 30} /> : null}
        {/* 1. roots */}
        <g stroke="#e8c98f" strokeWidth={6} fill="none" strokeLinecap="round">
          {new Array(9).fill(0).map((_, i) => {
            const a = Math.PI * (0.15 + (i / 8) * 0.7);
            const len = 150 + random(`rl${i}`) * 170;
            const ex = BASE.x + Math.cos(a) * len;
            const ey = GROUND + 110 + Math.sin(a) * len;
            return <path key={i} d={`M ${BASE.x} ${GROUND + 110} Q ${(BASE.x + ex) / 2 + (random(`rq${i}`) - 0.5) * 80} ${(GROUND + 110 + ey) / 2} ${ex} ${ey}`} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - roots} />;
          })}
        </g>
        {/* 2. trunk: stacked, slightly tapering segments */}
        <g transform={`rotate(${sway * trunk} ${BASE.x} ${GROUND})`}>
          {new Array(16).fill(0).map((_, i) => {
            const t0 = i / 16;
            if (t0 > trunk) return null;
            const y = GROUND - TRUNK_H * t0;
            const w = 64 - t0 * 22;
            return <path key={i} d={`M ${BASE.x - w / 2} ${y} L ${BASE.x + w / 2} ${y} L ${BASE.x + w / 2 - 3} ${y - TRUNK_H / 16 - 2} L ${BASE.x - w / 2 + 3} ${y - TRUNK_H / 16 - 2} Z`} fill={i % 2 ? "#8a6a3e" : "#a07c48"} stroke="#5d4424" strokeWidth={2} />;
          })}
          {/* 3. fronds */}
          {fronds > 0
            ? new Array(11).fill(0).map((_, i) => {
                const a = -170 + i * 16 + Math.sin(frame / 25 + i) * 3;
                const len = 330 * fronds * (0.8 + random(`fl${i}`) * 0.3);
                const rad = (a * Math.PI) / 180;
                const ex = top.x + Math.cos(rad) * len;
                const ey = top.y + Math.sin(rad) * len * 0.8 + len * 0.35;
                const cx = top.x + Math.cos(rad) * len * 0.5;
                const cy = top.y + Math.sin(rad) * len * 0.5 - 40;
                return (
                  <g key={i}>
                    <path d={`M ${top.x} ${top.y} Q ${cx} ${cy} ${ex} ${ey}`} stroke="#1f6b3a" strokeWidth={8} fill="none" />
                    {new Array(10).fill(0).map((__, j) => {
                      const t = (j + 1) / 11;
                      const px = (1 - t) * (1 - t) * top.x + 2 * (1 - t) * t * cx + t * t * ex;
                      const py = (1 - t) * (1 - t) * top.y + 2 * (1 - t) * t * cy + t * t * ey;
                      return <path key={j} d={`M ${px} ${py} l ${-18 * (1 - t) - 8} ${30 * (1 - t) + 10} M ${px} ${py} l ${18 * (1 - t) + 8} ${30 * (1 - t) + 10}`} stroke={j % 2 ? "#2e8a4e" : "#237a42"} strokeWidth={6} strokeLinecap="round" />;
                    })}
                  </g>
                );
              })
            : null}
          {/* 4-5. date clusters, ripening to gold */}
          {clusters > 0
            ? [-1, 1].map((side) => (
                <g key={side} transform={`translate(${top.x + side * 70} ${top.y + 40}) scale(${clusters})`}>
                  <path d={`M 0 0 Q ${side * 20} 40 ${side * 10} 90`} stroke="#c89b5c" strokeWidth={6} fill="none" />
                  {new Array(22).fill(0).map((_, i) => (
                    <ellipse key={i} cx={side * 10 + (random(`dx${side}${i}`) - 0.5) * 80} cy={60 + random(`dy${side}${i}`) * 90} rx={10} ry={14} fill={ripe > random(`dr${side}${i}`) ? "#e3a83a" : "#c86a2a"} stroke="#6b3a14" strokeWidth={2} />
                  ))}
                </g>
              ))
            : null}
        </g>
      </svg>
      {/* brand planted at the palm's foot */}
      {frame >= harvest.from + 20 ? (
        <div style={{ position: "absolute", left: 540 - 190, top: GROUND + 90, width: 380, padding: "20px 30px", borderRadius: 20, background: "rgba(6,16,46,0.85)", border: `3px solid ${colors.silver}`, opacity: logo, transform: `translateY(${(1 - logo) * 60}px)` }}>
          <Img src={staticFile("neocapta-logo.png")} style={{ width: "100%" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "النخلة / The Palm" — a seed takes root and grows, stage by stage, into a palm heavy with dates.
export const PalmVideo: React.FC = () => (
  <Shell
    bg="#06102e"
    audio="palm-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Plant it. Watch it grow.", ar: "نزرع فكرتك… وتثمر" }}
    flashes={[harvest.from + 20]}
    captions={[
      { from: seed.from + 16, to: seed.to, kicker: "THE PALM · النخلة", en: "Every idea is a seed.", ar: "كل فكرة… نواة.", top: 200 },
      { from: lost.from + 4, to: lost.to, en: "But not every seed takes root.", ar: "بس مو كل نواة تنبت.", enSize: 76, top: 200 },
      { from: water.from + 4, to: grow.from, kicker: "NEO CAPTA", en: "We give it roots.", ar: "نحن نعطيها جذور.", top: 200 },
      ...SERVICES.map((s, k) => ({ from: grow.from + k * grow.each + 4, to: k < 4 ? grow.from + (k + 1) * grow.each + 4 : harvest.from, kicker: ["ROOTS", "TRUNK", "FRONDS", "CLUSTERS", "HARVEST"][k], en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 170 })),
      { from: harvest.from + 30, to: outro.from, en: "Plant it with us… and it bears fruit.", ar: "ازرعها معنا… وتثمر.", enSize: 70, top: 170 },
    ]}
  >
    <Palm />
  </Shell>
);
