import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import T from "./timeline.json";

// "النقطة / The Dot": the first NEO CAPTA idea re-told on paper. A montage of marketing scenes
// collapses into one dot (the idea), it wanders lost, then shoots straight to its target.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const P = { paper: "#F2EFE8", ink: "#121212", blue: "#344499", sky: "#5E78FF", muted: "#8a8780" };
const DOT = { x: 540, y: 1230, r: 24 };
const TARGET = { x: 540, y: 560 };

// ---------- montage tiles ----------
type Tile = { ar: string; en: string; icon?: (c: string) => React.ReactNode; word?: string; tone: "ink" | "paper" | "blue" };
const stroke = (c: string) => ({ fill: "none", stroke: c, strokeWidth: 10, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
const TILES: Tile[] = [
  { ar: "إعلان", en: "AD", tone: "ink", icon: (c) => <><rect x={30} y={45} width={140} height={90} rx={6} {...stroke(c)} /><path d="M 100 135 L 100 170 M 70 170 L 130 170" {...stroke(c)} /><text x={100} y={105} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={40} fill={c}>AD</text></> },
  { ar: "خريطة", en: "MAP", tone: "paper", icon: (c) => <><path d="M 25 50 L 75 30 L 125 50 L 175 30 L 175 150 L 125 170 L 75 150 L 25 170 Z M 75 30 L 75 150 M 125 50 L 125 170" {...stroke(c)} /><circle cx={100} cy={92} r={14} fill={P.blue} /></> },
  { ar: "بيانات", en: "DATA", tone: "blue", icon: (c) => <><path d="M 30 170 L 170 170" {...stroke(c)} /><path d="M 50 170 L 50 110 M 85 170 L 85 70 M 120 170 L 120 125 M 155 170 L 155 40" {...stroke(c)} strokeWidth={22} strokeLinecap="butt" /></> },
  { ar: "سوشال", en: "SOCIAL", tone: "paper", icon: (c) => <><path d="M 30 40 L 170 40 L 170 130 L 90 130 L 55 165 L 60 130 L 30 130 Z" {...stroke(c)} /><path d="M 100 112 C 72 92 70 80 70 74 C 70 64 78 58 86 58 C 93 58 97 63 100 67 C 103 63 107 58 114 58 C 122 58 130 64 130 74 C 130 80 128 92 100 112 Z" fill={P.blue} /></> },
  { ar: "مطعم", en: "FOOD", tone: "ink", icon: (c) => <><circle cx={100} cy={105} r={55} {...stroke(c)} /><circle cx={100} cy={105} r={32} {...stroke(c)} strokeWidth={6} /><path d="M 25 40 L 25 90 M 15 40 L 15 70 Q 25 85 35 70 L 35 40 M 25 90 L 25 170 M 178 40 Q 160 70 175 100 L 175 170" {...stroke(c)} strokeWidth={7} /></> },
  { ar: "منتج", en: "PRODUCT", tone: "paper", icon: (c) => <><path d="M 100 25 L 165 60 L 165 140 L 100 175 L 35 140 L 35 60 Z M 35 60 L 100 95 L 165 60 M 100 95 L 100 175" {...stroke(c)} /><path d="M 68 42 L 132 78" stroke={P.blue} strokeWidth={10} /></> },
  { ar: "جمهور", en: "AUDIENCE", tone: "blue", icon: (c) => <><path d="M 15 100 Q 100 20 185 100 Q 100 180 15 100 Z" {...stroke(c)} /><circle cx={100} cy={100} r={30} fill={c} /><circle cx={110} cy={90} r={9} fill={P.blue} /></> },
  { ar: "وين؟", en: "WHERE?", tone: "paper", word: "وين؟" },
  { ar: "حملة", en: "CAMPAIGN", tone: "ink", icon: (c) => <><path d="M 30 80 L 110 45 L 110 155 L 30 120 Z M 45 120 L 60 170 L 80 170 L 70 128" {...stroke(c)} /><path d="M 135 70 L 170 55 M 140 100 L 180 100 M 135 130 L 170 145" {...stroke(c)} /></> },
  { ar: "نمو", en: "GROWTH", tone: "paper", icon: (c) => <><path d="M 25 165 L 175 165 M 25 165 L 25 30" {...stroke(c)} strokeWidth={6} /><path d="M 35 145 L 75 110 L 105 125 L 165 50" {...stroke(c)} stroke={P.blue} /><path d="M 130 50 L 165 50 L 165 85" {...stroke(c)} stroke={P.blue} /></> },
  { ar: "كيف؟", en: "HOW?", tone: "ink", word: "كيف؟" },
  { ar: "فكرة", en: "IDEA", tone: "blue", icon: (c) => <><path d="M 100 25 C 55 25 40 60 45 85 C 50 110 72 118 75 140 L 125 140 C 128 118 150 110 155 85 C 160 60 145 25 100 25 Z M 78 158 L 122 158 M 85 175 L 115 175" {...stroke(c)} /><circle cx={100} cy={88} r={16} fill={c} /></> },
];
const IDEA = TILES.length - 1;
const COLS = 3;
const SIZE = 330;
const GAP = 18;
const GRID_TOP = 300;
const tilePos = (i: number) => {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  return { x: 540 + (1 - c) * (SIZE + GAP), y: GRID_TOP + SIZE / 2 + r * (SIZE + GAP) }; // centre, filled right-to-left
};

const TileView: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TILES[i];
  const start = T.grid.from + i * T.grid.each;
  const inP = spring({ frame: frame - start, fps, config: { damping: 13, stiffness: 220 } });
  const { x, y } = tilePos(i);
  // collapse: every tile flies into the idea tile, which then becomes the dot
  const col = interpolate(frame, [T.collapse.from + (i === IDEA ? 30 : (i % 4) * 4), T.collapse.from + (i === IDEA ? 58 : 20 + (i % 4) * 4)], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const idea = tilePos(IDEA);
  const tx = i === IDEA ? DOT.x : idea.x;
  const ty = i === IDEA ? DOT.y : idea.y;
  const cx = x + (tx - x) * col;
  const cy = y + (ty - y) * col;
  const scale = i === IDEA ? 1 - col * (1 - (DOT.r * 2) / SIZE) : 1 - col;
  if (frame < start || frame >= T.collapse.to || (col >= 1 && i !== IDEA)) return null;
  const bg = t.tone === "ink" ? P.ink : t.tone === "blue" ? P.blue : "#fff";
  const fg = t.tone === "paper" ? P.ink : P.paper;
  const radius = i === IDEA ? interpolate(col, [0.6, 1], [14, SIZE / 2], clamp) : 14;
  const contentFade = i === IDEA ? interpolate(col, [0, 0.5], [1, 0], clamp) : 1;
  return (
    <div style={{ position: "absolute", left: cx - SIZE / 2, top: cy - SIZE / 2, width: SIZE, height: SIZE, borderRadius: radius, background: i === IDEA && col > 0.6 ? P.blue : bg, border: t.tone === "paper" ? `3px solid ${P.ink}` : "none", transform: `scale(${inP * scale}) rotate(${(1 - inP) * (i % 2 ? 8 : -8)}deg)`, overflow: "hidden" }}>
      <div style={{ opacity: contentFade, width: "100%", height: "100%" }}>
        {t.word ? (
          <div dir="rtl" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 900, fontSize: 110, color: fg }}>{t.word}</div>
        ) : (
          <svg width={SIZE} height={SIZE} viewBox="-30 -20 260 260">{t.icon?.(fg)}</svg>
        )}
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 18, letterSpacing: 3, color: fg, opacity: 0.7 }}>{t.en}</span>
          <span style={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: 18, color: fg, opacity: 0.6 }}>{String(i + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
};

// ---------- the wandering scribble ----------
const scribblePath = (() => {
  const pts: [number, number][] = [[DOT.x, DOT.y]];
  let x = DOT.x;
  let y = DOT.y;
  for (let i = 0; i < 22; i++) {
    const a = random(`sa${i}`) * Math.PI * 2;
    const d = 120 + random(`sd${i}`) * 200;
    x = Math.min(960, Math.max(120, x + Math.cos(a) * d));
    y = Math.min(1720, Math.max(980, y + Math.sin(a) * d));
    pts.push([x, y]);
  }
  // Catmull-Rom → cubic Bézier
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 5} ${p1[1] + (p2[1] - p0[1]) / 5}, ${p2[0] - (p3[0] - p1[0]) / 5} ${p2[1] - (p3[1] - p1[1]) / 5}, ${p2[0]} ${p2[1]}`;
  }
  return d;
})();
const SCRIBBLE_LEN = getLength(scribblePath);

// ---------- text ----------
const Line: React.FC<{ ar: string; en: string; top: number; from: number; hl?: number }> = ({ ar, en, top, from, hl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ar.split(" ");
  const enP = interpolate(frame, [from + words.length * 5 + 6, from + words.length * 5 + 20], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center" }}>
      <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 28px" }}>
        {words.map((w, i) => {
          const p = spring({ frame: frame - from - i * 5, fps, config: { damping: 16, stiffness: 200 } });
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: fonts.display, fontWeight: 900, fontSize: 124, lineHeight: 1.25, color: i === hl ? P.blue : P.ink, transform: `translateY(${(1 - p) * 60}px)`, opacity: p, clipPath: "inset(-20% -10% -20% -10%)" }}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontFamily: fonts.en, fontWeight: 500, fontSize: 46, color: P.muted, opacity: enP, transform: `translateY(${(1 - enP) * 20}px)` }}>{en}</div>
    </div>
  );
};

export const DotVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // dot position through the story
  const wanderP = interpolate(frame, [T.wander.from, T.wander.to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const retractP = interpolate(frame, [T.retract.from, T.retract.to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const drawn = SCRIBBLE_LEN * wanderP * (1 - retractP);
  const onPath = getPointAtLength(scribblePath, Math.max(0.01, drawn)) ?? { x: DOT.x, y: DOT.y };
  const travel = interpolate(frame, [T.shoot.travel, T.shoot.hit], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const dotX = frame < T.shoot.travel ? onPath.x : DOT.x + (TARGET.x - DOT.x) * travel;
  const dotY = frame < T.shoot.travel ? onPath.y : DOT.y + (TARGET.y - DOT.y) * travel;
  const dotIn = spring({ frame: frame - T.dot, fps, config: { damping: 9, stiffness: 200 } });
  const dotVisible = (frame >= T.dot && frame < T.grid.from + 6) || (frame >= T.collapse.to && frame < T.shoot.hit + 2);
  const dotScale = frame < T.grid.from + 6 ? dotIn * interpolate(frame, [T.grid.from - 4, T.grid.from + 6], [1, 0], clamp) : 1;
  const lineP = interpolate(frame, [T.shoot.line, T.shoot.travel], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const targetIn = spring({ frame: frame - T.shoot.target, fps, config: { damping: 12 } });
  const hit = frame >= T.shoot.hit ? spring({ frame: frame - T.shoot.hit, fps, config: { damping: 7, stiffness: 180 } }) : 0;
  const toLogo = interpolate(frame, [T.outro, T.outro + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const logoIn = spring({ frame: frame - T.outro - 10, fps, config: { damping: 13 } });
  const end = interpolate(frame, [T.durationInFrames - 14, T.durationInFrames], [1, 0], clamp);
  const shake = frame >= T.shoot.hit && frame < T.shoot.hit + 8 ? (random(`h${frame}`) - 0.5) * 16 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: P.paper, overflow: "hidden", opacity: end }}>
      {/* paper: faint dot grid + grain */}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(18,18,18,0.13) 0 1.6px, transparent 2.2px)", backgroundSize: "40px 40px" }} />
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake / 2}px)` }}>
        {/* montage */}
        {TILES.map((_, i) => (
          <TileView key={i} i={i} />
        ))}
        <Sequence from={T.grid.from} durationInFrames={T.collapse.from - T.grid.from} layout="none">
          <div style={{ position: "absolute", top: 150, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: interpolate(frame, [T.collapse.from - 14, T.collapse.from], [1, 0], clamp) }}>
            <span style={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: 26, color: P.muted }}>{String(Math.min(12, Math.max(0, Math.floor((frame - T.grid.from) / T.grid.each) + 1))).padStart(2, "0")} / 12</span>
            <span dir="rtl" style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 40, color: P.ink }}>أفكار في كل مكان…</span>
          </div>
        </Sequence>
        {/* line 1 */}
        <Sequence from={T.line1} durationInFrames={T.wander.from - T.line1 + 4} layout="none">
          <div style={{ opacity: interpolate(frame, [T.wander.from - 8, T.wander.from + 4], [1, 0], clamp) }}>
              <Line ar="كل فكرة تبدأ من مكان ما." en="Every idea starts somewhere." top={430} from={0} hl={1} />
          </div>
        </Sequence>
        {/* line 2 + scribble */}
        <Sequence from={T.wander.from} durationInFrames={T.shoot.target - T.wander.from} layout="none">
          <div style={{ opacity: interpolate(frame, [T.retract.to - 6, T.shoot.target], [1, 0], clamp) }}>
              <Line ar="بس مو كل فكرة تعرف وين تروح." en="But not every idea knows where to go." top={300} from={4} hl={5} />
          </div>
        </Sequence>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {frame >= T.wander.from && frame < T.retract.to ? <path d={scribblePath} fill="none" stroke={P.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${drawn} ${SCRIBBLE_LEN}`} /> : null}
          {/* the shot: straight line to the target */}
          {frame >= T.shoot.line && frame < T.outro + 20 ? (
            <line x1={DOT.x} y1={DOT.y} x2={DOT.x} y2={DOT.y + (TARGET.y - DOT.y) * lineP} stroke={P.ink} strokeWidth={7} strokeDasharray="2 18" strokeLinecap="round" opacity={1 - toLogo} />
          ) : null}
          {/* target */}
          {frame >= T.shoot.target ? (
            <g transform={`translate(${TARGET.x} ${TARGET.y}) scale(${targetIn * (1 + hit * 0.12) * (1 - toLogo)})`}>
              {[150, 105, 60].map((r, i) => (
                <circle key={r} r={r} fill={i === 1 ? P.paper : i === 0 ? P.ink : P.blue} stroke={P.ink} strokeWidth={6} />
              ))}
              <circle r={DOT.r} fill={frame >= T.shoot.hit ? P.paper : P.blue} />
            </g>
          ) : null}
          {dotVisible ? <circle cx={dotX} cy={dotY} r={DOT.r * dotScale} fill={P.blue} /> : null}
          {/* impact rings */}
          {frame >= T.shoot.hit && frame < T.shoot.hit + 30
            ? [0, 8].map((d) => {
                const k = interpolate(frame - T.shoot.hit - d, [0, 22], [0, 1], clamp);
                return <circle key={d} cx={TARGET.x} cy={TARGET.y} r={150 + k * 260} fill="none" stroke={P.blue} strokeWidth={6 * (1 - k)} opacity={1 - k} />;
              })
            : null}
        </svg>
        {/* answer */}
        <Sequence from={T.shoot.hit + 6} layout="none">
            <Line ar="لكل فكرة وجهة." en="Every idea, a direction." top={1060} from={0} hl={2} />
        </Sequence>
        {/* logo */}
        {frame >= T.outro ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: TARGET.y - 200, display: "flex", justifyContent: "center", opacity: logoIn, transform: `scale(${0.6 + 0.4 * logoIn})` }}>
            <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 560, height: 560 * LOGO_RATIO }} />
          </div>
        ) : null}
        {frame >= T.outro + 30 ? (
          <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontFamily: fonts.display, fontWeight: 500, fontSize: 38, color: P.muted, opacity: interpolate(frame, [T.outro + 30, T.outro + 50], [0, 1], clamp) }}>
            استراتيجية · هوية · محتوى · حملات
          </div>
        ) : null}
      </AbsoluteFill>
      {/* corner logo */}
      {frame < T.outro ? <Img src={staticFile("neocapta-logo-dark.png")} style={{ position: "absolute", top: 30, left: 40, width: 150, height: 150 * LOGO_RATIO, opacity: 0.9 }} /> : null}
      <Audio src={staticFile("dot-music.wav")} />
    </AbsoluteFill>
  );
};
