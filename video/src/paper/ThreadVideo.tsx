import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «الخيط»: every place a customer meets you, threaded into one experience.
const T = TL.thread;
type Pt = [number, number];
const ICONS: { ar: string; en: string; at: Pt; glyph: React.ReactNode }[] = [
  { ar: "إنستقرام", en: "INSTAGRAM", at: [260, 650], glyph: <><rect x={-36} y={-36} width={72} height={72} rx={20} fill="none" stroke={P.ink} strokeWidth={7} /><circle r={17} fill="none" stroke={P.ink} strokeWidth={7} /><circle cx={22} cy={-22} r={5} fill={P.ink} /></> },
  { ar: "قوقل", en: "SEARCH", at: [800, 800], glyph: <><circle cx={-8} cy={-8} r={26} fill="none" stroke={P.ink} strokeWidth={8} /><path d="M 12 12 L 36 36" stroke={P.ink} strokeWidth={10} strokeLinecap="round" /></> },
  { ar: "الموقع", en: "WEBSITE", at: [300, 1090], glyph: <><rect x={-42} y={-32} width={84} height={64} rx={8} fill="none" stroke={P.ink} strokeWidth={7} /><path d="M -42 -14 L 42 -14" stroke={P.ink} strokeWidth={6} /><circle cx={-30} cy={-23} r={3} fill={P.ink} /></> },
  { ar: "المتجر", en: "STORE", at: [790, 1300], glyph: <><path d="M -40 -10 L 40 -10 L 40 36 L -40 36 Z" fill="none" stroke={P.ink} strokeWidth={7} /><path d="M -46 -10 L -36 -38 L 36 -38 L 46 -10 Z" fill={P.blue} stroke={P.ink} strokeWidth={6} /><rect x={-10} y={10} width={20} height={26} fill={P.ink} /></> },
  { ar: "واتساب", en: "CHAT", at: [380, 1530], glyph: <><path d="M -38 -30 L 38 -30 L 38 22 L -6 22 L -26 40 L -22 22 L -38 22 Z" fill="none" stroke={P.ink} strokeWidth={7} strokeLinejoin="round" /><path d="M -20 -4 L 20 -4" stroke={P.ink} strokeWidth={6} strokeLinecap="round" /></> },
];
const START: Pt = [80, 470];
const RING = { x: 540, y: 1080, r: 330 };
const ringPos = (i: number): Pt => {
  const a = -Math.PI / 2 + (i / ICONS.length) * Math.PI * 2;
  return [RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r];
};

const smooth = (pts: Pt[], closed: boolean) => {
  const n = pts.length;
  const get = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 5} ${p1[1] + (p2[1] - p0[1]) / 5}, ${p2[0] - (p3[0] - p1[0]) / 5} ${p2[1] - (p3[1] - p1[1]) / 5}, ${p2[0]} ${p2[1]}`;
  }
  return closed ? d + " Z" : d;
};
const SEW = smooth([START, ...ICONS.map((c) => c.at)], false);
const SEW_LEN = getLength(SEW);
// fraction of the path where the needle reaches each icon
const ARRIVE = ICONS.map((c) => {
  for (let l = 0; l <= SEW_LEN; l += 6) {
    const p = getPointAtLength(SEW, l);
    if (p && Math.hypot(p.x - c.at[0], p.y - c.at[1]) < 20) return l / SEW_LEN;
  }
  return 1;
});

const Needle: React.FC = () => (
  <g>
    <path d="M 0 -70 L 7 30 L 0 46 L -7 30 Z" fill="#9aa0a6" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={0} cy={-48} rx={3} ry={10} fill={P.paper} stroke={P.ink} strokeWidth={2} />
  </g>
);

export const ThreadVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sew = interpolate(frame, [T.needle[0], T.needle[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const tight = interpolate(frame, [T.tighten[0], T.tighten[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const pos = ICONS.map((c, i) => {
    const r = ringPos(i);
    return [c.at[0] + (r[0] - c.at[0]) * tight, c.at[1] + (r[1] - c.at[1]) * tight] as Pt;
  });
  const needlePt = getPointAtLength(SEW, Math.max(0.01, SEW_LEN * sew)) ?? { x: START[0], y: START[1] };
  const needleTan = getTangentAtLength(SEW, Math.max(1, SEW_LEN * sew)) ?? { x: 0, y: 1 };
  const reached = (i: number) => sew >= ARRIVE[i];
  const knot = spring({ frame: frame - T.tighten[1], fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <Sequence from={0} durationInFrames={T.needle[0] + 60} layout="none">
        <Line ar="عميلك يشوفك في أكثر من مكان…" en="Your customer meets you in many places…" top={150} from={4} hl={3} size={80} />
      </Sequence>
      <Sequence from={T.needle[0] + 60} durationInFrames={T.line - T.needle[0] - 60} layout="none">
        <Line ar="…لازم كلها تكون خيط واحد." en="…they should all be one thread." top={150} from={2} hl={4} size={80} />
      </Sequence>
      <Sequence from={T.line} durationInFrames={T.end - T.line} layout="none">
        <Line ar="تجربة وحدة… من أول نظرة لآخر شراء." en="One experience, from first look to purchase." top={150} from={4} hl={1} size={76} />
      </Sequence>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* thread */}
        {tight === 0 && frame >= T.needle[0] ? <path d={SEW} fill="none" stroke={P.blue} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${SEW_LEN * sew} ${SEW_LEN}`} /> : null}
        {tight > 0 ? <path d={smooth(pos, true)} fill="none" stroke={P.blue} strokeWidth={7 + tight * 3} strokeLinecap="round" /> : null}
        {/* icons */}
        {ICONS.map((c, i) => {
          const p = spring({ frame: frame - T.icons - i * 9, fps, config: { damping: 11 } });
          const hit = reached(i);
          const [x, y] = pos[i];
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${p})`}>
              <circle r={78} fill={P.white} stroke={hit ? P.blue : P.ink} strokeWidth={hit ? 9 : 6} />
              {c.glyph}
              <text y={128} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={42} fill={P.ink}>{c.ar}</text>
              <text y={158} textAnchor="middle" fontFamily={fonts.en} fontWeight={800} fontSize={17} letterSpacing={4} fill={P.muted}>{c.en}</text>
            </g>
          );
        })}
        {/* needle */}
        {frame >= T.needle[0] - 10 && frame < T.tighten[0] ? (
          <g transform={`translate(${needlePt.x} ${needlePt.y}) rotate(${(Math.atan2(needleTan.y, needleTan.x) * 180) / Math.PI + 90})`} opacity={interpolate(frame, [T.needle[0] - 10, T.needle[0]], [0, 1], clamp)}>
            <Needle />
          </g>
        ) : null}
        {/* the knot: brand mark in the middle of the loop */}
        {frame >= T.tighten[1] ? (
          <g transform={`translate(${RING.x} ${RING.y}) scale(${knot})`}>
            <circle r={120} fill={P.blue} />
            <text y={18} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={54} fill={P.paper}>علامتك</text>
          </g>
        ) : null}
      </svg>
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="نربط كل نقطة… بتجربة وحدة." en="Every touchpoint, one experience." hl={1} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("thread-music.wav")} />
    </AbsoluteFill>
  );
};
