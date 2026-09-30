import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";
import { LuxTitle } from "./LuxTitle";
import { Logo } from "../components/Logo";
import { Piece } from "./Pieces";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const S = 115; // square size
const B = S * 8;
const center = (c: number, r: number) => ({ x: c * S + S / 2, y: r * S + S / 2 });

type Square = { c: number; r: number; en?: string; ar?: string; san?: string };

// The idea's route (col, row; row 0 = far rank). Move 3 captures the competition.
export const route: Square[] = [
  { c: 4, r: 6 },
  { c: 4, r: 5, en: "STRATEGY", ar: "الاستراتيجية", san: "e3" },
  { c: 4, r: 4, en: "BRANDING", ar: "الهوية البصرية", san: "e4" },
  { c: 3, r: 3, en: "BEAT THE COMPETITION", ar: "تجاوز المنافسة", san: "exd5" },
  { c: 3, r: 2, en: "CONTENT", ar: "صناعة المحتوى", san: "d6" },
  { c: 3, r: 1, en: "CAMPAIGNS", ar: "الحملات الإعلانية", san: "d7" },
  { c: 3, r: 0, en: "GROWTH", ar: "النمو", san: "d8=Q#" },
];
const RIVAL = { c: 3, r: 3 };
const KING = { c: 6, r: 0 };
const extras = [
  { c: 0, r: 0, kind: "rook" as const },
  { c: 0, r: 1, kind: "pawn" as const },
  { c: 1, r: 1, kind: "pawn" as const },
  { c: 6, r: 1, kind: "pawn" as const },
  { c: 7, r: 1, kind: "pawn" as const },
];
const confusion = [
  [0, 2], [7, 3], [2, 5], [6, 6], [1, 7], [7, 0], [5, 2], [2, 1], [6, 4], [0, 5], [5, 7], [1, 3],
];

const moveStart = (k: number) => timeline.moves.from + k * timeline.moves.each;
const landFrame = (k: number) => moveStart(k) + timeline.moves.hop;

const pawnAt = (f: number) => {
  let pos = center(route[0].c, route[0].r);
  let lift = 0;
  for (let k = 0; k < route.length - 1; k++) {
    const t = interpolate(f, [moveStart(k), landFrame(k)], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    if (t <= 0) break;
    const a = center(route[k].c, route[k].r);
    const b = center(route[k + 1].c, route[k + 1].r);
    pos = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    lift = Math.sin(Math.PI * t) * 70;
  }
  return { ...pos, lift };
};

// Billboard: stands a flat element up on the tilted board, always facing the camera.
const Standing: React.FC<{ x: number; y: number; rx: number; rz: number; children: React.ReactNode; extra?: string; opacity?: number }> = ({ x, y, rx, rz, children, extra = "", opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transformStyle: "preserve-3d" }}>
    <div style={{ position: "absolute", left: 0, bottom: 0, width: "max-content", transformStyle: "preserve-3d", transformOrigin: "0 100%", transform: `rotateZ(${-rz}deg) rotateX(${-rx}deg) ${extra}` }}>
      <div style={{ transform: "translateX(-50%)", opacity }}>{children}</div>
    </div>
  </div>
);

// Scene — "Your next move": a lone pawn (the idea) finds its path across the board, promotes and checkmates.
export const BoardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro, confusion: conf, answer, promotion, mate } = timeline;

  // camera
  const rx = interpolate(frame, [0, 50, 330, 700, 760, 860, 930, mate.rise, mate.rise + 50], [8, 55, 55, 57, 63, 38, 44, 44, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const sc = interpolate(frame, [0, 50, 250, 330, 700, 760, 860, 930, mate.rise, mate.rise + 50], [0.72, 1, 1, 1.32, 1.32, 1.6, 1.6, 0.98, 0.98, 1.08], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const follow = interpolate(frame, [250, 330, 860, 930], [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const rz = interpolate(frame, [0, mate.rise, mate.rise + 50], [-8, 6, 0], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const pawn = pawnAt(frame);
  const tx = -(pawn.x - B / 2) * follow;
  const ty = -(pawn.y - B / 2) * follow;

  const promoted = frame >= promotion.at;
  const burst = interpolate(frame, [promotion.at - 4, promotion.at + 24], [0, 1], clamp);
  const pawnScale = interpolate(frame, [promotion.at - 8, promotion.at], [1, 0], clamp);
  const queenIn = spring({ frame: frame - promotion.at, fps, config: { damping: 9, stiffness: 140 } });
  const rivalHit = frame - landFrame(2) + 4;
  const rivalT = interpolate(rivalHit, [0, 22], [0, 1], clamp);
  const topple = spring({ frame: frame - mate.topple, fps, config: { damping: 8, stiffness: 90 } });
  const beam = interpolate(frame, [mate.from + 10, mate.topple - 4], [0, 1], clamp);
  const confVis = interpolate(frame, [conf.from, conf.from + 10, answer.from - 6, answer.from + 4], [0, 1, 1, 0], clamp);
  const routeDraw = interpolate(frame, [answer.from + 6, answer.to - 10], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const kingPos = center(KING.c, KING.r);
  const piecesOut = interpolate(frame, [mate.rise + 20, mate.logo], [1, 0], clamp);
  const queenPos = center(3, 0);

  return (
    <AbsoluteFill>
      {/* spotlight */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 45% at 50% 62%, rgba(180,190,255,0.22) 0%, rgba(94,120,255,0.08) 40%, rgba(0,0,0,0) 75%)" }} />
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div
          style={{
            position: "absolute",
            left: 540 - B / 2,
            top: 1200 - B / 2,
            width: B,
            height: B,
            transformStyle: "preserve-3d",
            transform: `scale(${sc}) rotateX(${rx}deg) rotateZ(${rz}deg) translate(${tx}px, ${ty}px)`,
          }}
        >
          {/* frame + squares */}
          <div style={{ position: "absolute", inset: -26, borderRadius: 10, background: "linear-gradient(135deg, #2a2d38, #0b0c10)", boxShadow: "0 0 0 2px #8A90A8, 0 60px 120px rgba(0,0,0,0.9)" }} />
          {new Array(64).fill(0).map((_, i) => {
            const c = i % 8;
            const r = Math.floor(i / 8);
            const d = Math.hypot(c - 3.5, r - 3.5) / 5;
            const s = interpolate(frame, [d * intro.squaresTo, d * intro.squaresTo + 10], [0, 1], clamp);
            const lit = route.findIndex((p, k) => k > 0 && p.c === c && p.r === r);
            const litOn = (lit > 0 && frame >= landFrame(lit - 1)) || frame >= mate.ripple + Math.hypot(c - 3, r) * 5;
            const dark = (c + r) % 2 === 1;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: c * S,
                  top: r * S,
                  width: S,
                  height: S,
                  background: litOn ? (dark ? "#2B3A9A" : "#5E78FF") : dark ? "#14161d" : "#D5D9E4",
                  transform: `scale(${s})`,
                  boxShadow: litOn ? "inset 0 0 30px rgba(255,255,255,0.35)" : "none",
                }}
              />
            );
          })}
          {/* glossy sheen */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 40%)" }} />

          {/* flat overlays on the board: confusion arrows, planned route, check beam */}
          <svg width={B} height={B} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <defs>
              <marker id="head" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 Z" fill="#E4E6EE" />
              </marker>
            </defs>
            <g opacity={confVis}>
              {confusion.map(([c, r], i) => {
                const a = center(4, 6);
                const b = center(c, r);
                const bend = (random(`bend${i}`) - 0.5) * 300;
                const mx = (a.x + b.x) / 2 + bend;
                const my = (a.y + b.y) / 2 - bend * 0.5;
                const start = conf.from + i * 4;
                const draw = interpolate(frame, [start, start + 18], [1, 0], clamp);
                const flicker = 0.55 + 0.45 * Math.sin(frame / 3 + i * 2);
                return (
                  <path
                    key={i}
                    d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                    stroke="#E4E6EE"
                    strokeWidth={5}
                    fill="none"
                    strokeDasharray="1"
                    pathLength={1}
                    strokeDashoffset={draw}
                    markerEnd={draw < 0.05 ? "url(#head)" : undefined}
                    opacity={flicker}
                  />
                );
              })}
            </g>
            <polyline
              points={route.map((p) => `${center(p.c, p.r).x},${center(p.c, p.r).y}`).join(" ")}
              stroke={colors.accent}
              strokeWidth={10}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={routeDraw}
              opacity={frame >= answer.from ? interpolate(frame, [promotion.from, promotion.at], [0.9, 0.25], clamp) : 0}
              style={{ filter: "drop-shadow(0 0 14px #5E78FF)" }}
            />
            {frame >= mate.from ? (
              <line x1={queenPos.x} y1={queenPos.y} x2={queenPos.x + (kingPos.x - queenPos.x) * beam} y2={kingPos.y} stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" opacity={piecesOut} style={{ filter: "drop-shadow(0 0 18px #5E78FF)" }} />
            ) : null}
            {frame >= mate.topple ? (
              <circle cx={kingPos.x} cy={kingPos.y} r={40 + (frame - mate.topple) * 12} fill="none" stroke={colors.accent} strokeWidth={6} opacity={interpolate(frame - mate.topple, [0, 24], [1, 0], clamp)} />
            ) : null}
          </svg>

          {/* the brand appears on the lit board once the camera is overhead */}
          <div style={{ position: "absolute", left: B / 2 - 330, top: B / 2 - 243, width: 660, opacity: interpolate(frame, [mate.logo, mate.logo + 20], [0, 1], clamp), transform: `scale(${interpolate(frame, [mate.logo, mate.logo + 30], [1.15, 1], clamp)})` }}>
            <div style={{ position: "absolute", inset: -60, background: "radial-gradient(circle, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 70%)" }} />
            <Logo width={660} />
          </div>

          {/* opponent pieces */}
          {extras.map((p, i) => {
            const pos = center(p.c, p.r);
            const fall = spring({ frame: frame - (mate.domino + i * 6), fps, config: { damping: 9, stiffness: 110 } });
            return (
              <Standing key={i} x={pos.x} y={pos.y} rx={rx} rz={rz} opacity={piecesOut} extra={`rotateZ(${fall * (i % 2 === 0 ? -80 : 80)}deg)`}>
                <Piece kind={p.kind} side="dark" width={70} />
              </Standing>
            );
          })}
          <Standing x={kingPos.x} y={kingPos.y} rx={rx} rz={rz} opacity={piecesOut} extra={`rotateZ(${topple * 82}deg)`}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#E4E6EE", background: "#000", border: "2px solid #8A90A8", borderRadius: 8, padding: "4px 10px", marginBottom: 8, whiteSpace: "nowrap", opacity: 1 - topple }}>
                THE MARKET · السوق
              </div>
              <Piece kind="king" side="dark" width={86} />
            </div>
          </Standing>
          {rivalT < 1 ? (
            <Standing x={center(RIVAL.c, RIVAL.r).x} y={center(RIVAL.c, RIVAL.r).y} rx={rx} rz={rz} extra={`translate(${rivalT * 380}px, ${-rivalT * 420 + rivalT * rivalT * 200}px) rotateZ(${rivalT * 140}deg)`}>
              <div style={{ opacity: 1 - rivalT, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#E4E6EE", background: "#000", border: "2px solid #8A90A8", borderRadius: 8, padding: "4px 10px", marginBottom: 8, whiteSpace: "nowrap" }}>
                  COMPETITION · المنافسة
                </div>
                <Piece kind="rook" side="dark" width={74} />
              </div>
            </Standing>
          ) : null}

          {/* the idea */}
          <Standing x={pawn.x} y={pawn.y} rx={rx} rz={rz} opacity={piecesOut} extra={`translateY(${-pawn.lift}px)`}>
            <div style={{ display: "grid", justifyItems: "center", alignItems: "end" }}>
              {pawnScale > 0 ? (
                <div style={{ gridArea: "1 / 1", transform: `scale(${pawnScale})`, transformOrigin: "50% 100%" }}>
                  <Piece kind="pawn" side="light" width={80} glow={interpolate(frame, [intro.pawnDrop, intro.pawnDrop + 20], [0, 0.4], clamp)} />
                </div>
              ) : null}
              {promoted ? (
                <div style={{ gridArea: "1 / 1", transform: `scale(${queenIn})`, transformOrigin: "50% 100%" }}>
                  <Piece kind="queen" side="light" width={96} glow={0.9} />
                </div>
              ) : null}
              {burst > 0 && burst < 1 ? (
                <svg width={500} height={500} viewBox="-250 -250 500 500" style={{ gridArea: "1 / 1", marginBottom: -60, overflow: "visible" }}>
                  {new Array(16).fill(0).map((_, i) => {
                    const a = (i / 16) * Math.PI * 2;
                    return <line key={i} x1={Math.cos(a) * 60 * burst} y1={Math.sin(a) * 60 * burst - 100} x2={Math.cos(a) * 240 * burst} y2={Math.sin(a) * 240 * burst - 100} stroke="#FFFFFF" strokeWidth={6} opacity={1 - burst} strokeLinecap="round" />;
                  })}
                  <circle cx={0} cy={-100} r={200 * burst} fill="rgba(94,120,255,0.35)" opacity={1 - burst} />
                </svg>
              ) : null}
            </div>
          </Standing>
        </div>
      </AbsoluteFill>
      {frame >= promotion.at - 2 && frame < promotion.at + 8 ? <AbsoluteFill style={{ background: "#FFFFFF", opacity: interpolate(frame, [promotion.at - 2, promotion.at + 8], [0.7, 0], clamp) }} /> : null}

      {/* captions */}
      <Sequence from={20} durationInFrames={conf.from - 20}>
        <AbsoluteFill style={{ paddingTop: 300 }}>
          <LuxTitle kicker="YOUR NEXT MOVE" en="Every idea starts small." ar="كل فكرة تبدأ صغيرة." />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={conf.from + 6} durationInFrames={answer.from - conf.from - 6}>
        <AbsoluteFill style={{ paddingTop: 280 }}>
          <LuxTitle en="But not every idea knows its next move." ar="لكن ليست كل فكرة تعرف خطوتها التالية." enSize={74} arSize={64} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={answer.from + 2} durationInFrames={answer.to - answer.from - 2}>
        <AbsoluteFill style={{ paddingTop: 300 }}>
          <LuxTitle kicker="NEO CAPTA" en="We plan every move." ar="نحن نخطط لكل خطوة." />
        </AbsoluteFill>
      </Sequence>
      {route.slice(1).map((m, k) => (
        <Sequence key={k} from={landFrame(k) - 6} durationInFrames={k === route.length - 2 ? promotion.at - landFrame(k) : timeline.moves.each}>
          <AbsoluteFill style={{ paddingTop: 300 }}>
            <LuxTitle kicker={`MOVE ${String(k + 1).padStart(2, "0")} · ${m.san}`} en={(m.en ?? "").charAt(0) + (m.en ?? "").slice(1).toLowerCase()} ar={m.ar ?? ""} enSize={96} arSize={80} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={promotion.at + 6} durationInFrames={promotion.to - promotion.at - 6}>
        <AbsoluteFill style={{ paddingTop: 280 }}>
          <LuxTitle kicker="PROMOTION" en="From an idea… to a leader." ar="من فكرة… إلى الريادة." enSize={80} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={mate.topple} durationInFrames={mate.rise + 10 - mate.topple}>
        <AbsoluteFill style={{ paddingTop: 300 }}>
          <LuxTitle kicker="d8=Q#" en="Checkmate." ar="كش ملك." enSize={120} arSize={96} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={mate.rise + 14} durationInFrames={timeline.board.duration - mate.rise - 14}>
        <AbsoluteFill style={{ paddingTop: 260 }}>
          <LuxTitle kicker="NEO CAPTA" en="Checkmate the market." ar="كش ملك… للسوق." enSize={90} arSize={90} />
        </AbsoluteFill>
      </Sequence>

      <WinBar />
      {/* opening: a spotlight switches on over the board */}
      <AbsoluteFill
        style={{
          background: "#000",
          WebkitMaskImage: `radial-gradient(circle at 50% 62%, transparent ${interpolate(frame, [4, 44], [0, 1400], { ...clamp, easing: Easing.in(Easing.quad) })}px, #000 ${interpolate(frame, [4, 44], [0, 1400], { ...clamp, easing: Easing.in(Easing.quad) }) + 120}px)`,
          opacity: frame < 50 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};

// Engine-style evaluation bar: the idea's chance of winning climbs with every planned move.
const WinBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { intro, confusion: conf, answer, promotion, mate } = timeline;
  const keys = [intro.pawnDrop, conf.from + 20, answer.from + 20, ...[0, 1, 2, 3, 4].map(landFrame), promotion.at, mate.topple];
  const vals = [18, 9, 30, 38, 46, 64, 72, 80, 92, 100];
  const win = interpolate(frame, keys, vals, clamp);
  const vis = interpolate(frame, [intro.pawnDrop, intro.pawnDrop + 15, mate.rise, mate.rise + 20], [0, 1, 1, 0], clamp);
  const mated = frame >= mate.topple;
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 612, opacity: vis }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: colors.steel }}>
          WIN CHANCE ·{" "}
          <span dir="rtl" style={{ fontFamily: fonts.ar, letterSpacing: 0, fontSize: 24 }}>
            فرصة الفوز
          </span>
        </span>
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 36, color: mated ? colors.accent : colors.white }}>{mated ? "M1" : `${Math.round(win)}%`}</span>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: "#1a1c24", border: "2px solid #3a3e4d", overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${win}%`, height: "100%", background: "linear-gradient(90deg, #AEB8FF, #FFFFFF)", boxShadow: "0 0 20px rgba(94,120,255,0.8)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: "#5E78FF" }} />
      </div>
    </div>
  );
};
