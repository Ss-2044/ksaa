import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../../components/useFonts";
import { Flash } from "../../components/Flash";
import { Logo } from "../../components/Logo";
import { colors, fonts } from "../../theme";
import { BrandOutro } from "../BrandOutro";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CHALK = "rgba(240,241,236,0.92)";
const WORLD_H = 3200;
const START = { x: 540, y: 2760 };
const GOAL = { x: 430, y: 530 };

export const players = [
  { x: 320, y: 2460, en: "STRATEGY", ar: "الاستراتيجية" },
  { x: 760, y: 2120, en: "BRANDING", ar: "الهوية" },
  { x: 380, y: 1740, en: "CONTENT", ar: "المحتوى" },
  { x: 720, y: 1380, en: "CAMPAIGNS", ar: "الحملات" },
  { x: 520, y: 1040, en: "GROWTH", ar: "النمو" },
];
const rivals = [
  { x: 580, y: 2300, en: "COMPETITION", ar: "المنافسة", passK: 1 },
  { x: 560, y: 1560, en: "NOISE", ar: "الضجيج", passK: 3 },
  { x: 640, y: 1200, en: "BUDGET", ar: "الميزانية", passK: 4 },
];
const KEEPER = { x: 540, y: 690 };
const lostPath = new Array(7).fill(0).map((_, i) => ({ x: 200 + random(`lx${i}`) * 680, y: 1950 + random(`ly${i}`) * 900 }));

const ChalkFilter: React.FC = () => (
  <defs>
    <filter id="chalk">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
    </filter>
  </defs>
);

// where the ball is at a given frame
const ballAt = (frame: number) => {
  const { lost, passes, shot } = timeline;
  if (frame < lost.from) return START;
  if (frame < passes.from) {
    // wandering, then back to the start spot for the plan
    const t = interpolate(frame, [lost.from, lost.to - 10], [0, lostPath.length - 1], clamp);
    const i = Math.min(lostPath.length - 2, Math.floor(t));
    const a = lostPath[i];
    const b = lostPath[i + 1];
    const f = t - i;
    const p = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f - Math.sin(Math.PI * f) * 60 };
    const back = interpolate(frame, [lost.to - 10, passes.from - 20], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    return { x: p.x + (START.x - p.x) * back, y: p.y + (START.y - p.y) * back };
  }
  let pos = START;
  players.forEach((pl, k) => {
    const s = passes.from + k * passes.each;
    const t = interpolate(frame, [s, s + passes.travel], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
    if (t > 0) {
      const from = k === 0 ? START : players[k - 1];
      pos = { x: from.x + (pl.x - from.x) * t, y: from.y + (pl.y - from.y) * t };
    }
  });
  const st = interpolate(frame, [shot.kick, shot.goal], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  if (st > 0) {
    const a = players[4];
    const c = { x: 180, y: 780 }; // curl
    const u = 1 - st;
    pos = { x: u * u * a.x + 2 * u * st * c.x + st * st * GOAL.x, y: u * u * a.y + 2 * u * st * c.y + st * st * GOAL.y };
  }
  return pos;
};

const Board: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro, lost, plan, passes, shot } = timeline;
  const ball = ballAt(frame);
  const camY = Math.max(-420, Math.min(WORLD_H - 1920, ball.y - 1300)); // may drop below 0 so the goal sits mid-screen
  const pitch = interpolate(frame, [4, intro.pitchTo], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const planDraw = interpolate(frame, [plan.from + 10, plan.to - 10], [0, 1], clamp);
  const keeperDive = interpolate(frame, [shot.kick + 12, shot.goal - 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const net = frame >= shot.goal ? Math.sin((frame - shot.goal) * 1.2) * Math.exp(-(frame - shot.goal) / 10) * 14 : 0;
  const route = [START, ...players, GOAL];
  const passedCount = players.filter((_, k) => frame >= passes.from + k * passes.each + passes.travel).length;

  return (
    <svg width={1080} height={WORLD_H} style={{ position: "absolute", left: 0, top: -camY }}>
      <ChalkFilter />
      <g filter="url(#chalk)" stroke={CHALK} fill="none" strokeWidth={5}>
        {[
          "M 60 560 L 1020 560 L 1020 3160 L 60 3160 Z",
          "M 60 1860 L 1020 1860",
          "M 260 560 L 260 860 L 820 860 L 820 560",
          "M 400 560 L 400 660 L 680 660 L 680 560",
          "M 440 560 L 440 500 L 640 500 L 640 560",
          "M 260 3160 L 260 2860 L 820 2860 L 820 3160",
        ].map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeDasharray="1" strokeDashoffset={pitch} />
        ))}
        <circle cx={540} cy={1860} r={150} pathLength={1} strokeDasharray="1" strokeDashoffset={pitch} />
        <path d="M 440 860 A 110 110 0 0 0 640 860" pathLength={1} strokeDasharray="1" strokeDashoffset={pitch} />
        {/* net */}
        <g opacity={1 - pitch} strokeWidth={2}>
          {new Array(9).fill(0).map((_, i) => (
            <line key={`v${i}`} x1={445 + i * 24} y1={503 - Math.abs(net) * (i % 2 ? 1 : 0.6)} x2={445 + i * 24} y2={558} />
          ))}
          {new Array(3).fill(0).map((_, i) => (
            <line key={`h${i}`} x1={442} y1={515 + i * 16 - net * 0.5} x2={638} y2={515 + i * 16 - net * 0.5} />
          ))}
        </g>
        {/* lost scribbles */}
        {frame >= lost.from && frame < plan.from + 20
          ? lostPath.slice(0, -1).map((p, i) => {
              const q = lostPath[i + 1];
              const t = interpolate(frame, [lost.from + i * 14, lost.from + i * 14 + 14], [0, 1], clamp);
              const fade = interpolate(frame, [plan.from, plan.from + 20], [0.7, 0], clamp);
              return <path key={i} d={`M ${p.x} ${p.y} Q ${(p.x + q.x) / 2 + 120} ${(p.y + q.y) / 2 - 80} ${q.x} ${q.y}`} strokeWidth={4} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - t} opacity={fade} />;
            })
          : null}
        {frame >= lost.from && frame < plan.from + 20
          ? lostPath.map((p, i) => (
              <text key={i} x={p.x + 30} y={p.y - 30} fill={CHALK} stroke="none" fontFamily="Caveat" fontWeight={700} fontSize={70} opacity={interpolate(frame, [lost.from + i * 14, lost.from + i * 14 + 8, plan.from, plan.from + 20], [0, 1, 1, 0], clamp)}>
                ?
              </text>
            ))
          : null}
        {/* the play */}
        {frame >= plan.from
          ? route.slice(0, -1).map((p, i) => {
              const q = route[i + 1];
              const t = interpolate(planDraw * (route.length - 1) - i, [0, 1], [0, 1], clamp);
              const done = i < passedCount || (i === 5 && frame >= shot.goal);
              return (
                <g key={i} opacity={done ? 0.35 : 1}>
                  <line x1={p.x} y1={p.y} x2={p.x + (q.x - p.x) * t} y2={p.y + (q.y - p.y) * t} strokeWidth={6} strokeDasharray="22 16" />
                  {t >= 1 ? <path d={`M ${q.x - (q.x - p.x) * 0.08} ${q.y - (q.y - p.y) * 0.08} m ${-14} 0 l 14 ${(q.y - p.y) > 0 ? 18 : -18} l 14 ${(q.y - p.y) > 0 ? -18 : 18}`} strokeWidth={6} /> : null}
                </g>
              );
            })
          : null}
      </g>

      {/* rivals */}
      {frame >= lost.from + 20
        ? rivals.map((r, i) => {
            const pop = spring({ frame: frame - (lost.from + 20 + i * 8), fps, config: { damping: 12 } });
            const beaten = frame >= passes.from + r.passK * passes.each + passes.travel;
            return (
              <g key={r.en} transform={`translate(${r.x} ${r.y}) scale(${pop})`} opacity={beaten ? 0.35 : 1}>
                <circle r={44} fill="#0a0d1f" stroke="#8A90A8" strokeWidth={5} />
                <path d="M -18 -18 L 18 18 M 18 -18 L -18 18" stroke="#E4E6EE" strokeWidth={6} strokeLinecap="round" />
                <rect x={-120} y={52} width={240} height={62} rx={10} fill="rgba(10,13,31,0.85)" />
                <text y={80} textAnchor="middle" fill="#E4E6EE" fontFamily="Montserrat" fontWeight={800} fontSize={22} letterSpacing={2}>
                  {r.en}
                </text>
                <text y={106} textAnchor="middle" fill="#8A90A8" fontFamily="Cairo" fontWeight={700} fontSize={22}>
                  {r.ar}
                </text>
                {beaten ? <path d="M -130 60 L 130 110" stroke={colors.accent} strokeWidth={6} /> : null}
              </g>
            );
          })
        : null}
      {/* keeper = the market */}
      {frame >= lost.from + 44 ? (
        <g transform={`translate(${KEEPER.x + keeperDive * 170} ${KEEPER.y}) rotate(${keeperDive * 70})`}>
          <circle r={46} fill="#0a0d1f" stroke="#8A90A8" strokeWidth={5} />
          <text y={12} textAnchor="middle" fill="#E4E6EE" fontFamily="Montserrat" fontWeight={800} fontSize={30}>
            GK
          </text>
        </g>
      ) : null}
      {frame >= lost.from + 44 ? (
        <g transform={`translate(${KEEPER.x + 250} ${KEEPER.y + 10})`} opacity={1 - keeperDive}>
          <rect x={-10} y={-40} width={250} height={70} rx={10} fill="rgba(10,13,31,0.85)" />
          <text x={115} y={-8} textAnchor="middle" fill="#E4E6EE" fontFamily="Montserrat" fontWeight={800} fontSize={22} letterSpacing={2}>
            THE MARKET
          </text>
          <text x={115} y={20} textAnchor="middle" fill="#8A90A8" fontFamily="Cairo" fontWeight={700} fontSize={22}>
            السوق
          </text>
        </g>
      ) : null}
      {/* our players */}
      {frame >= plan.from
        ? players.map((p, k) => {
            const pop = spring({ frame: frame - (plan.from + k * 6), fps, config: { damping: 11 } });
            const recv = passes.from + k * passes.each + passes.travel;
            const pulse = frame >= recv ? Math.exp(-(frame - recv) / 10) : 0;
            return (
              <g key={p.en} transform={`translate(${p.x} ${p.y}) scale(${pop})`}>
                <circle r={60 + pulse * 40} fill="none" stroke={colors.accent} strokeWidth={4} opacity={pulse} />
                <circle r={46} fill={colors.royal} stroke={CHALK} strokeWidth={5} />
                <text y={14} textAnchor="middle" fill="#fff" fontFamily="Montserrat" fontWeight={800} fontSize={38}>
                  {k + 1}
                </text>
                <text x={p.x > 540 ? -70 : 70} y={-6} textAnchor={p.x > 540 ? "end" : "start"} fill={CHALK} fontFamily="Montserrat" fontWeight={800} fontSize={28} letterSpacing={2}>
                  {p.en}
                </text>
                <text x={p.x > 540 ? -70 : 70} y={28} textAnchor={p.x > 540 ? "end" : "start"} fill={colors.accent} fontFamily="Cairo" fontWeight={900} fontSize={30}>
                  {p.ar}
                </text>
              </g>
            );
          })
        : null}
      {/* the ball (the idea) */}
      <g transform={`translate(${ball.x} ${ball.y}) rotate(${frame * 12})`}>
        <circle r={frame < intro.pitchTo ? 30 * interpolate(frame, [30, intro.pitchTo], [0, 1], clamp) : 30} fill="#fff" stroke="#0a0d1f" strokeWidth={3} style={{ filter: "drop-shadow(0 0 16px rgba(255,255,255,0.8))" }} />
        <path d="M 0 -12 L 11 -4 L 7 10 L -7 10 L -11 -4 Z" fill="#0a0d1f" />
      </g>
    </svg>
  );
};

const ChalkTitle: React.FC<{ kicker?: string; en: string; ar: string; size?: number }> = ({ kicker, en, ar, size = 110 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, 16], [0, 1], clamp);
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  return (
    <div style={{ textAlign: "center", padding: "0 60px", opacity: out }}>
      {kicker ? <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, letterSpacing: 8, color: colors.accent, opacity: p }}>{kicker}</div> : null}
      <div style={{ fontFamily: fonts.handEn, fontWeight: 700, fontSize: size, lineHeight: 1, color: CHALK, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, filter: "url(#chalk-html)" }}>{en}</div>
      <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: size * 0.6, color: colors.accent, marginTop: 6, opacity: interpolate(frame, [10, 24], [0, 1], clamp) }}>
        {ar}
      </div>
    </div>
  );
};

// "سبورة التكتيك / The Play" — the idea is the ball; every pass is a service; the goal beats the market.
export const FootballVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro, lost, plan, passes, shot, outro } = timeline;
  const goal = spring({ frame: frame - shot.goal, fps, config: { damping: 8, stiffness: 140 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1a2a47 0%, #0d182c 60%, #070d18 100%)", overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="chalk-html">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        </filter>
      </svg>
      {/* chalk dust */}
      <AbsoluteFill style={{ opacity: 0.18, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1.5px)", backgroundSize: "9px 9px" }} />
      <Sequence from={0} durationInFrames={outro.from} layout="none">
        <Board />
        {frame >= shot.goal ? (
          <div style={{ position: "absolute", top: 1240, left: 0, right: 0, textAlign: "center", transform: `scale(${interpolate(goal, [0, 1], [3, 1])}) rotate(-5deg)`, opacity: Math.min(1, goal * 2) }}>
            <div style={{ fontFamily: fonts.handEn, fontWeight: 700, fontSize: 260, lineHeight: 1, color: "#fff", textShadow: "0 0 50px rgba(94,120,255,0.9)" }}>GOAL!</div>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 150, color: colors.accent, lineHeight: 1.1 }}>
              هدف!
            </div>
          </div>
        ) : null}
      </Sequence>
      {/* keeps the captions readable over the pitch */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,13,24,0.95) 0%, rgba(7,13,24,0.85) 22%, rgba(7,13,24,0) 34%)", pointerEvents: "none" }} />

      <Sequence from={intro.from + 30} durationInFrames={intro.to - intro.from - 30}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <ChalkTitle kicker="THE PLAY · الخطة" en="Every idea is a ball." ar="كل فكرة… كورة." />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={lost.from + 4} durationInFrames={lost.to - lost.from - 4}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <ChalkTitle en="But where do you pass it?" ar="بس لمين تمرّرها؟" />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={plan.from + 4} durationInFrames={plan.to - plan.from - 4}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <ChalkTitle kicker="NEO CAPTA" en="We draw the play." ar="نحن نرسم الخطة." />
        </AbsoluteFill>
      </Sequence>
      {players.map((p, k) => (
        <Sequence key={p.en} from={passes.from + k * passes.each + passes.travel - 4} durationInFrames={k === 4 ? shot.kick - (passes.from + k * passes.each + passes.travel - 4) : passes.each}>
          <AbsoluteFill style={{ paddingTop: 230 }}>
            <ChalkTitle kicker={`PASS ${k + 1}`} en={p.en.charAt(0) + p.en.slice(1).toLowerCase()} ar={p.ar} size={120} />
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={shot.goal + 20} durationInFrames={outro.from - shot.goal - 20}>
        <AbsoluteFill style={{ paddingTop: 230 }}>
          <ChalkTitle en="Goal… for your idea." ar="هدف… لفكرتك." size={100} />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={outro.from} durationInFrames={outro.duration}>
        <BrandOutro en="We play to win." ar="نلعب عشان نفوز" />
      </Sequence>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: 0.85 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      {[shot.goal, outro.from].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={12}>
          <Flash duration={10} />
        </Sequence>
      ))}
      <Audio src={staticFile("football-music.wav")} />
    </AbsoluteFill>
  );
};
