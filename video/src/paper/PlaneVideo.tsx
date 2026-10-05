import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «طيّارة الورق»: a sheet folds into a plane, flies with no direction and crashes;
// with a plan it follows a route through audience → message → channel to its target.
const T = TL.plane;
const CX = 540;
const CY = 960;

// six-point outline morphing sheet → plane (points relative to centre, nose up)
type Pt = [number, number];
const K: Pt[][] = [
  [[-300, -400], [0, -400], [300, -400], [300, 400], [0, 400], [-300, 400]],
  [[-300, -100], [0, -400], [300, -100], [300, 400], [0, 400], [-300, 400]],
  [[-150, -60], [0, -400], [150, -60], [150, 400], [0, 400], [-150, 400]],
  [[-290, 280], [0, -400], [290, 280], [60, 220], [0, 340], [-60, 220]],
];
const outline = (frame: number) => {
  let pts = K[0];
  T.folds.forEach((f, i) => {
    const k = interpolate(frame, [f, f + T.foldLen], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    pts = pts.map(([x, y], j) => [x + (K[i + 1][j][0] - x) * k, y + (K[i + 1][j][1] - y) * k]);
  });
  return pts;
};

const Plane: React.FC<{ pts: Pt[]; crease: number }> = ({ pts, crease }) => (
  <g>
    <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={P.white} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M 0 -400 L 0 ${340}`} stroke={P.ink} strokeWidth={4} opacity={crease} />
    <path d={`M 0 -400 L -60 220 M 0 -400 L 60 220`} stroke={P.blue} strokeWidth={4} opacity={crease * 0.8} />
  </g>
);

const LOST = "M 540 960 C 900 760, 960 360, 640 330 S 120 520, 300 880 S 960 1180, 760 1420 S 260 1560, 420 1760";
const LOST_LEN = getLength(LOST);
const START: Pt = [200, 1560];
const TARGET: Pt = [540, 330];
const ROUTE = `M ${START[0]} ${START[1]} C 520 1600, 900 1480, 840 1260 S 220 1100, 250 900 S 860 780, 820 600 S 560 380, ${TARGET[0]} ${TARGET[1]}`;
const ROUTE_LEN = getLength(ROUTE);
const PINS = [
  { ar: "الجمهور", en: "AUDIENCE" },
  { ar: "الرسالة", en: "MESSAGE" },
  { ar: "القناة", en: "CHANNEL" },
];

// dotted trail drawn up to a length
const Trail: React.FC<{ d: string; len: number; upTo: number; color: string; r?: number }> = ({ d, len, upTo, color, r = 4 }) => {
  const dots = [];
  for (let l = 0; l <= Math.min(len, upTo); l += 24) {
    const p = getPointAtLength(d, l);
    if (p) dots.push(<circle key={l} cx={p.x} cy={p.y} r={r} fill={color} />);
  }
  return <>{dots}</>;
};

const Pin: React.FC<{ x: number; y: number; p: number; ar: string; en: string; right: boolean }> = ({ x, y, p, ar, en, right }) => (
  <g transform={`translate(${x} ${y}) scale(${p})`}>
    <path d="M 0 0 C -10 -18, -30 -30, -30 -52 A 30 30 0 1 1 30 -52 C 30 -30, 10 -18, 0 0 Z" fill={P.blue} />
    <circle cx={0} cy={-52} r={11} fill={P.paper} />
    <text x={right ? 62 : -62} y={-52} textAnchor={right ? "start" : "end"} fontFamily={fonts.display} fontWeight={900} fontSize={46} fill={P.ink}>{ar}</text>
    <text x={right ? 62 : -62} y={-14} textAnchor={right ? "start" : "end"} fontFamily={fonts.en} fontWeight={800} fontSize={20} letterSpacing={4} fill={P.muted}>{en}</text>
  </g>
);

export const PlaneVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pts = outline(frame);
  const crease = interpolate(frame, [T.folds[2] + 10, T.folds[2] + T.foldLen], [0, 1], clamp);
  const sheetIn = spring({ frame, fps, config: { damping: 14 } });

  // phase 1: lost flight
  const flyP = interpolate(frame, [T.launch, T.crash], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const lostPt = getPointAtLength(LOST, LOST_LEN * flyP) ?? { x: CX, y: CY };
  const lostTan = getTangentAtLength(LOST, Math.max(1, LOST_LEN * flyP)) ?? { x: 0, y: -1 };
  const lostScale = interpolate(frame, [T.launch, T.launch + 25], [1, 0.3], clamp);
  const crashed = frame >= T.crash;
  // phase 2: planned flight
  const routeDraw = interpolate(frame, [T.route, T.fly[0]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const fly2 = interpolate(frame, [T.fly[0], T.fly[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const rPt = getPointAtLength(ROUTE, Math.max(0.01, ROUTE_LEN * fly2)) ?? { x: START[0], y: START[1] };
  const rTan = getTangentAtLength(ROUTE, Math.max(1, ROUTE_LEN * fly2)) ?? { x: 0, y: -1 };
  const landed = frame >= T.fly[1];
  const hit = landed ? spring({ frame: frame - T.fly[1], fps, config: { damping: 7, stiffness: 180 } }) : 0;
  const angle = (t: { x: number; y: number }) => (Math.atan2(t.y, t.x) * 180) / Math.PI + 90;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      {/* captions */}
      <Sequence from={0} durationInFrames={T.launch} layout="none">
        <Line ar="عندك فكرة؟" en="Got an idea?" top={150} from={6} hl={1} />
      </Sequence>
      <Sequence from={T.launch} durationInFrames={T.reset - T.launch} layout="none">
        <Line ar="طيّرتها… بدون اتجاه؟" en="Launched it with no direction?" top={150} from={4} hl={2} size={96} />
      </Sequence>
      <Sequence from={T.reset} durationInFrames={T.end - T.reset} layout="none">
        <div style={{ position: "absolute", left: 0, right: 0, top: 1660 }}>
          <Line ar="مع خطة… توصل." en="With a plan, it lands." top={0} from={T.route - T.reset} hl={1} size={96} />
        </div>
      </Sequence>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* the sheet → plane, then the lost flight */}
        {frame < T.launch ? (
          <g transform={`translate(${CX} ${CY + (1 - sheetIn) * 300}) scale(${0.9 * sheetIn})`}>
            <Plane pts={pts} crease={crease} />
            {frame < T.folds[0] + 6 ? (
              <text x={0} y={20} textAnchor="middle" fontFamily={fonts.handAr} fontSize={120} fill={P.blue} opacity={interpolate(frame, [T.folds[0] - 4, T.folds[0] + 6], [1, 0], clamp)}>
                فكرتك
              </text>
            ) : null}
          </g>
        ) : null}
        {frame >= T.launch && frame < T.reset ? (
          <>
            <Trail d={LOST} len={LOST_LEN} upTo={LOST_LEN * flyP} color={P.muted} />
            {!crashed ? (
              <g transform={`translate(${lostPt.x} ${lostPt.y}) rotate(${angle(lostTan) + Math.sin(frame / 3) * 12}) scale(${lostScale})`}>
                <Plane pts={K[3]} crease={1} />
              </g>
            ) : (
              <g transform={`translate(420 1760) rotate(${(frame - T.crash) * 9}) scale(${interpolate(frame, [T.crash, T.crash + 8], [0.3, 0.22], clamp)})`}>
                {/* crumpled ball */}
                <circle r={170} fill={P.white} stroke={P.ink} strokeWidth={10} />
                {new Array(7).fill(0).map((_, i) => (
                  <path key={i} d={`M ${-150 + random(`c${i}`) * 300} ${-150 + random(`d${i}`) * 300} l ${-60 + random(`e${i}`) * 120} ${-60 + random(`f${i}`) * 120}`} stroke={P.ink} strokeWidth={8} strokeLinecap="round" />
                ))}
              </g>
            )}
          </>
        ) : null}
        {/* the planned route */}
        {frame >= T.route ? (
          <>
            <Trail d={ROUTE} len={ROUTE_LEN} upTo={ROUTE_LEN * routeDraw} color={P.ink} r={5} />
            {[150, 100, 52].map((r, i) => (
              <circle key={r} cx={TARGET[0]} cy={TARGET[1]} r={r * 0.7 * interpolate(frame, [T.route + 20, T.route + 40], [0, 1], clamp) * (1 + hit * 0.1)} fill={i === 1 ? P.paper : i === 0 ? P.ink : P.blue} stroke={P.ink} strokeWidth={5} />
            ))}
            {T.pins.map((at, i) => {
              const pt = getPointAtLength(ROUTE, ROUTE_LEN * at) ?? { x: 0, y: 0 };
              const appear = spring({ frame: frame - (T.route + 30 + i * 8), fps, config: { damping: 10 } });
              const passed = fly2 >= at;
              return <Pin key={i} x={pt.x} y={pt.y} p={appear * (passed ? 1.15 : 1)} ar={PINS[i].ar} en={PINS[i].en} right={pt.x < 540} />;
            })}
            {!landed || frame < T.fly[1] + 2 ? (
              <g transform={`translate(${rPt.x} ${rPt.y}) rotate(${angle(rTan)}) scale(0.18)`} opacity={interpolate(frame, [T.route + 10, T.route + 20], [0, 1], clamp)}>
                <Plane pts={K[3]} crease={1} />
              </g>
            ) : null}
            {landed && frame < T.fly[1] + 30
              ? [0, 8].map((d) => {
                  const k = interpolate(frame - T.fly[1] - d, [0, 22], [0, 1], clamp);
                  return <circle key={d} cx={TARGET[0]} cy={TARGET[1]} r={105 + k * 240} fill="none" stroke={P.blue} strokeWidth={6 * (1 - k)} opacity={1 - k} />;
                })
              : null}
          </>
        ) : null}
      </svg>
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="لكل فكرة وجهة." en="Every idea, a direction." hl={2} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("plane-music.wav")} />
    </AbsoluteFill>
  );
};
