import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «البذرة»: marketing isn't luck, it's growing something: plan, content, consistency → a tree that bears fruit.
const T = TL.seed;
const GROUND = 1460;
const X = 540;
const DROPS = [
  { ar: "خطة", en: "PLAN" },
  { ar: "محتوى", en: "CONTENT" },
  { ar: "استمرار", en: "CONSISTENCY" },
];
const LEAVES = [
  { h: 70, side: -1, at: 0 },
  { h: 110, side: 1, at: 0 },
  { h: 200, side: -1, at: 1 },
  { h: 250, side: 1, at: 1 },
  { h: 330, side: -1, at: 2 },
  { h: 380, side: 1, at: 2 },
];
const CANOPY = [
  [0, -560, 190],
  [-170, -470, 150],
  [170, -470, 150],
  [-90, -660, 140],
  [100, -650, 140],
];
const FRUITS = new Array(11).fill(0).map((_, i) => [(random(`fx${i}`) - 0.5) * 400, -420 - random(`fy${i}`) * 320] as const);

export const SeedVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seedFall = interpolate(frame, [T.seed, T.seed + 20], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  // stem height grows a stage after every drop, then the tree
  const stage = (i: number) => interpolate(frame, [T.drops[i] + 22, T.drops[i] + 50], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const h = 20 + stage(0) * 110 + stage(1) * 160 + stage(2) * 160 + interpolate(frame, [T.tree, T.tree + 40], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) * 120;
  const trunk = interpolate(frame, [T.tree, T.tree + 40], [8, 34], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <Sequence from={0} durationInFrames={T.drops[0] + 20} layout="none">
        <Line ar="التسويق مو ضربة حظ…" en="Marketing isn't luck…" top={150} from={4} hl={3} size={92} />
      </Sequence>
      <Sequence from={T.drops[0] + 20} durationInFrames={T.line - T.drops[0] - 20} layout="none">
        <Line ar="…هو زراعة." en="…it's something you grow." top={150} from={2} hl={1} size={92} />
      </Sequence>
      <Sequence from={T.line} durationInFrames={T.end - T.line} layout="none">
        <Line ar="واللي يزرع صح… يحصد." en="Plant it right, and you harvest." top={150} from={4} hl={3} size={88} />
      </Sequence>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* soil */}
        <path d={`M 60 ${GROUND} L 1020 ${GROUND}`} stroke={P.ink} strokeWidth={8} strokeLinecap="round" />
        {new Array(14).fill(0).map((_, i) => (
          <path key={i} d={`M ${100 + i * 64} ${GROUND + 30 + (i % 3) * 18} l 22 0`} stroke={P.ink} strokeWidth={5} strokeLinecap="round" opacity={0.35} />
        ))}
        {/* seed */}
        {frame >= T.seed && frame < T.drops[0] + 40 ? <ellipse cx={X} cy={420 + seedFall * (GROUND - 432)} rx={18} ry={12} fill="#8b5a2b" stroke={P.ink} strokeWidth={4} /> : null}
        {/* water drops with labels */}
        {T.drops.map((d, i) => {
          const fall = interpolate(frame, [d, d + 22], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
          if (frame < d - 14 || frame > d + 26) return null;
          const y = 520 + fall * (GROUND - 520 - 30);
          const appear = interpolate(frame, [d - 14, d], [0, 1], clamp);
          return (
            <g key={i} opacity={appear * (1 - interpolate(frame, [d + 22, d + 26], [0, 1], clamp))}>
              <path d={`M ${X} ${y - 46} C ${X + 30} ${y - 6}, ${X + 30} ${y + 24}, ${X} ${y + 24} C ${X - 30} ${y + 24}, ${X - 30} ${y - 6}, ${X} ${y - 46} Z`} fill={P.sky} stroke={P.ink} strokeWidth={4} />
              <text x={X + 60} y={y + 10} fontFamily={fonts.display} fontWeight={900} fontSize={60} fill={P.ink}>{DROPS[i].ar}</text>
              <text x={X + 60} y={y + 44} fontFamily={fonts.en} fontWeight={800} fontSize={20} letterSpacing={4} fill={P.muted}>{DROPS[i].en}</text>
            </g>
          );
        })}
        {/* splash rings */}
        {T.drops.map((d) => {
          const t = frame - d - 22;
          if (t < 0 || t > 18) return null;
          return <ellipse key={d} cx={X} cy={GROUND} rx={20 + t * 7} ry={6 + t * 1.5} fill="none" stroke={P.sky} strokeWidth={5 * (1 - t / 18)} />;
        })}
        {/* the plant */}
        {frame >= T.drops[0] + 22 ? (
          <g>
            <path d={`M ${X} ${GROUND} C ${X - 10} ${GROUND - h * 0.4}, ${X + 12} ${GROUND - h * 0.7}, ${X} ${GROUND - h}`} fill="none" stroke={frame >= T.tree ? "#6b4423" : "#1f8a4c"} strokeWidth={trunk} strokeLinecap="round" />
            {LEAVES.map((l, i) => {
              const p = stage(l.at);
              if (p <= 0 || l.h > h) return null;
              const y = GROUND - l.h;
              return <ellipse key={i} cx={X + l.side * 46 * p} cy={y} rx={46 * p} ry={20 * p} fill="#1f8a4c" stroke={P.ink} strokeWidth={4} transform={`rotate(${l.side * -25} ${X} ${y})`} opacity={1 - interpolate(frame, [T.tree + 20, T.tree + 40], [0, 1], clamp)} />;
            })}
            {CANOPY.map(([cx, cy, r], i) => {
              const p = spring({ frame: frame - T.tree - 14 - i * 5, fps, config: { damping: 11 } });
              return <circle key={i} cx={X + cx} cy={GROUND + cy} r={r * p} fill="#1f8a4c" stroke={P.ink} strokeWidth={6} />;
            })}
            {FRUITS.map(([fx, fy], i) => {
              const p = spring({ frame: frame - T.fruits - i * 6, fps, config: { damping: 8, stiffness: 200 } });
              return (
                <g key={i} transform={`translate(${X + fx} ${GROUND + fy}) scale(${p})`}>
                  <circle r={26} fill={P.blue} stroke={P.ink} strokeWidth={4} />
                  <circle cx={-8} cy={-8} r={6} fill={P.paper} opacity={0.8} />
                </g>
              );
            })}
          </g>
        ) : null}
      </svg>
      {frame >= T.fruits + 40 && frame < T.end ? (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: GROUND + 90, display: "flex", justifyContent: "center", opacity: interpolate(frame, [T.fruits + 40, T.fruits + 54], [0, 1], clamp) }}>
          <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 48, color: P.paper, background: P.blue, padding: "8px 30px", borderRadius: 40 }}>عملاء · مبيعات · ولاء</span>
        </div>
      ) : null}
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="نزرع لك نمو حقيقي." en="Growth that's real." hl={2} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("seed-music.wav")} />
    </AbsoluteFill>
  );
};
