import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import TL from "./timelines.json";

// «المستوى التالي»: an 8-bit platformer. Jump the competition, a limited budget and distraction;
// hit the NEO CAPTA block for a plan, collect customers, reach the flag.
const T = TL.level;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GROUND = 1450;
const PX = 10;
const START_X = 200;
const END_X = 3300;
export const LEVEL = {
  pipe: 1000,
  block: { x: 1400, y: 1090 },
  pit: [2120, 2290] as [number, number],
  enemy: 2620,
  flag: END_X,
  coins: [600, 680, 760, 1750, 1830, 1910, 2700, 2780, 2860, 2940],
  jumps: [
    { cx: 1000, w: 170, h: 330 },
    { cx: 1400, w: 120, h: 230 },
    { cx: 2205, w: 190, h: 300 },
    { cx: 2600, w: 130, h: 230 },
    { cx: 3240, w: 120, h: 380 },
  ],
};
export const heroXAt = (frame: number) => interpolate(frame, [T.run[0], T.flag], [START_X, END_X], clamp);
export const frameAtX = (x: number) => T.run[0] + ((x - START_X) / (END_X - START_X)) * (T.flag - T.run[0]);

const SPRITE = [
  "..RRRRRR..",
  ".RRWRRWRR.",
  ".RSSSSSSR.",
  ".RSKSSKSR.",
  ".RSSSSSSR.",
  "..SSKKSS..",
  "..WWWWWW..",
  ".WWWWWWWW.",
  "SWWWWWWWWS",
  "SWWWWWWWWS",
  ".WWWWWWWW.",
  ".WWWWWWWW.",
];
const LEGS = [["..KK..KK..", "..KK..KK.."], [".KK....KK.", "KK......KK"]];
const PAL: Record<string, string> = { R: "#E52521", W: "#FFFFFF", S: "#E8B98A", K: "#111111" };

const Hero: React.FC<{ step: number; glow: boolean }> = ({ step, glow }) => {
  const rows = [...SPRITE, ...LEGS[step % 2]];
  return (
    <g>
      {glow ? <rect x={-12} y={-12} width={10 * PX + 24} height={14 * PX + 24} fill="#FFD60A" opacity={0.35} /> : null}
      {rows.map((r, y) =>
        r.split("").map((ch, x) => (ch === "." ? null : <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX} height={PX} fill={PAL[ch]} />)),
      )}
    </g>
  );
};

const Sign: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="Lalezar" fontSize={56} fill="#FFFFFF" stroke="#111111" strokeWidth={10} paintOrder="stroke">{text}</text>
);

const Coin: React.FC<{ x: number; y: number; spin: number }> = ({ x, y, spin }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.abs(Math.cos(spin))} 1)`}>
    <rect x={-20} y={-30} width={40} height={60} fill="#FFD60A" stroke="#111" strokeWidth={6} />
    <rect x={-6} y={-18} width={12} height={36} fill="#E8A400" />
  </g>
);

const Ground: React.FC<{ from: number; to: number }> = ({ from, to }) => (
  <g>
    <rect x={from} y={GROUND} width={to - from} height={500} fill="#C84C0C" />
    {new Array(Math.ceil((to - from) / 80)).fill(0).map((_, i) => (
      <g key={i}>
        <path d={`M ${from + i * 80} ${GROUND} L ${from + i * 80} ${GROUND + 500}`} stroke="#7A2A00" strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M ${from + i * 80} ${GROUND + k * 80} L ${from + i * 80 + 80} ${GROUND + k * 80}`} stroke="#7A2A00" strokeWidth={6} />)}
      </g>
    ))}
    <rect x={from} y={GROUND - 10} width={to - from} height={20} fill="#3BAA35" stroke="#1E6B1A" strokeWidth={4} />
  </g>
);

export const LevelVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hx = heroXAt(frame);
  const jump = LEVEL.jumps.reduce((acc, j) => {
    const d = (hx - j.cx) / j.w;
    return Math.abs(d) < 1 ? Math.max(acc, j.h * (1 - d * d)) : acc;
  }, 0);
  const heroH = 14 * PX;
  const hy = GROUND - heroH - jump;
  const ZOOM = 1.4;
  const camX = Math.max(0, hx - 300 / ZOOM);
  const blockHit = frame >= frameAtX(LEVEL.block.x);
  const tBlock = frame - frameAtX(LEVEL.block.x);
  const powered = blockHit && tBlock > 12;
  const enemyStomp = frame >= frameAtX(LEVEL.enemy - 10);
  const coins = LEVEL.coins.filter((c) => hx >= c).length;
  const step = Math.floor(frame / 4);
  const running = frame >= T.run[0] && frame < T.flag;
  const flagP = interpolate(frame, [T.flag, T.flag + 30], [0, 1], clamp);
  const clear = spring({ frame: frame - T.flag - 10, fps, config: { damping: 9 } });
  const enemyX = LEVEL.enemy + (enemyStomp ? 0 : Math.sin(frame / 8) * 30);
  return (
    <AbsoluteFill style={{ background: "#5C94FC", overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* far hills + clouds (parallax) */}
        <g transform={`translate(${-camX * 0.3} 0)`}>
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${i * 900 - 100} ${GROUND} Q ${i * 900 + 200} ${GROUND - 380} ${i * 900 + 500} ${GROUND} Z`} fill="#3BAA35" opacity={0.6} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${200 + i * 700} ${500 + (i % 2) * 180})`}>
              <rect x={0} y={20} width={220} height={60} fill="#FFFFFF" />
              <rect x={40} y={0} width={140} height={30} fill="#FFFFFF" />
            </g>
          ))}
        </g>
        <g transform={`translate(0 ${GROUND + 120}) scale(${ZOOM}) translate(${-camX} ${-GROUND})`}>
          <Ground from={-200} to={LEVEL.pit[0]} />
          <Ground from={LEVEL.pit[1]} to={END_X + 900} />
          {/* pit sign */}
          <Sign x={(LEVEL.pit[0] + LEVEL.pit[1]) / 2} y={GROUND - 420} text="ميزانية محدودة" />
          {/* pipe: competition */}
          <rect x={LEVEL.pipe - 80} y={GROUND - 220} width={160} height={220} fill="#3BAA35" stroke="#111" strokeWidth={8} />
          <rect x={LEVEL.pipe - 100} y={GROUND - 260} width={200} height={60} fill="#3BAA35" stroke="#111" strokeWidth={8} />
          <Sign x={LEVEL.pipe} y={GROUND - 520} text="منافسة" />
          {/* NEO CAPTA block */}
          <g transform={`translate(${LEVEL.block.x - 50} ${LEVEL.block.y - (blockHit && tBlock < 6 ? 20 : 0)})`}>
            <rect width={100} height={100} fill={blockHit ? "#B5651D" : "#FFB300"} stroke="#111" strokeWidth={8} />
            <text x={50} y={74} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={64} fill="#111">{blockHit ? "N" : "?"}</text>
          </g>
          {/* power-up rising out of the block */}
          {blockHit && tBlock < 14 ? (
            <g transform={`translate(${LEVEL.block.x} ${LEVEL.block.y - 60 - tBlock * 6})`}>
              <polygon points="0,-40 11,-12 40,-12 16,6 25,36 0,18 -25,36 -16,6 -40,-12 -11,-12" fill="#FFD60A" stroke="#111" strokeWidth={5} />
            </g>
          ) : null}
          {blockHit && tBlock < 50 ? <Sign x={hx + 60} y={hy - 60 - Math.min(tBlock, 20) * 3} text="+ خطة نيو كابتا" /> : null}
          {/* enemy: distraction */}
          <g transform={`translate(${enemyX} ${GROUND})`}>
            {enemyStomp ? (
              <rect x={-60} y={-24} width={120} height={24} fill="#8B4513" stroke="#111" strokeWidth={6} />
            ) : (
              <>
                <path d="M -60 0 L -60 -60 Q 0 -120 60 -60 L 60 0 Z" fill="#8B4513" stroke="#111" strokeWidth={6} />
                <rect x={-30} y={-70} width={16} height={22} fill="#FFFFFF" />
                <rect x={14} y={-70} width={16} height={22} fill="#FFFFFF" />
              </>
            )}
          </g>
          {enemyStomp && frame - frameAtX(LEVEL.enemy - 10) < 30 ? <Sign x={LEVEL.enemy} y={GROUND - 160 - (frame - frameAtX(LEVEL.enemy - 10)) * 3} text="+100" /> : null}
          <Sign x={LEVEL.enemy} y={GROUND - 420} text="تشتت" />
          {/* coins = customers */}
          {LEVEL.coins.map((c, i) => (hx < c ? <Coin key={i} x={c} y={GROUND - 330 - (i % 3 === 1 ? 40 : 0)} spin={frame / 6 + i} /> : null))}
          {/* flag */}
          <rect x={END_X + 40} y={GROUND - 700} width={14} height={700} fill="#2E7D32" stroke="#111" strokeWidth={4} />
          <circle cx={END_X + 47} cy={GROUND - 710} r={20} fill="#FFD60A" stroke="#111" strokeWidth={4} />
          <polygon points={`${END_X + 54},${GROUND - 640 - flagP * 0} ${END_X + 54 + 120},${GROUND - 600} ${END_X + 54},${GROUND - 560}`} fill="#344499" stroke="#111" strokeWidth={4} transform={`translate(0 ${(1 - flagP) * 480})`} />
          {/* hero */}
          <g transform={`translate(${hx - 50} ${hy}) scale(${powered ? 1.15 : 1})`}>
            <Hero step={running && jump === 0 ? step : 1} glow={powered && Math.floor(frame / 3) % 2 === 0 && tBlock < 60} />
          </g>
        </g>
      </svg>
      {/* HUD */}
      <div style={{ position: "absolute", top: 40, left: 220, right: 40, display: "flex", justifyContent: "space-between", fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: "#FFFFFF", textShadow: "4px 4px 0 #111" }}>
        <div>
          <div>WORLD</div>
          <div>1-1</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div dir="rtl" style={{ fontFamily: fonts.punch, fontSize: 44 }}>عملاء</div>
          <div>×{String(coins * 12).padStart(3, "0")}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>PLAN</div>
          <div style={{ color: powered ? "#FFD60A" : "#FFFFFF" }}>{powered ? "ON" : "--"}</div>
        </div>
      </div>
      <Img src={staticFile("neocapta-logo-white.png")} style={{ position: "absolute", top: 28, left: 34, width: 150, height: 150 * LOGO_RATIO }} />
      {/* title card */}
      {frame < T.title[1] ? (
        <AbsoluteFill style={{ background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
          <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 72, color: "#FFFFFF" }}>WORLD 1-1</div>
          <div dir="rtl" style={{ fontFamily: fonts.punch, fontSize: 110, color: "#FFD60A" }}>مشروعك</div>
          <svg width={100} height={140}><Hero step={0} glow={false} /></svg>
        </AbsoluteFill>
      ) : null}
      {/* level clear */}
      {frame >= T.flag + 10 && frame < T.end ? (
        <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", transform: `scale(${clear})` }}>
          <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 84, color: "#FFFFFF", textShadow: "6px 6px 0 #111" }}>LEVEL CLEAR!</div>
          <div dir="rtl" style={{ fontFamily: fonts.punch, fontSize: 80, color: "#FFD60A", WebkitTextStroke: "4px #111", paintOrder: "stroke fill", marginTop: 20 }}>المستوى التالي: التوسّع</div>
        </div>
      ) : null}
      {/* end card */}
      {frame >= T.end ? (
        <AbsoluteFill style={{ background: "#111", opacity: interpolate(frame, [T.duration - 12, T.duration], [1, 0], clamp) }}>
          <div style={{ position: "absolute", top: 480, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${0.7 + 0.3 * spring({ frame: frame - T.end, fps, config: { damping: 12 } })})` }}>
            <Img src={staticFile("neocapta-logo-white.png")} style={{ width: 580, height: 580 * LOGO_RATIO }} />
          </div>
          <div dir="rtl" style={{ position: "absolute", top: 1000, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ fontFamily: fonts.punch, fontSize: 92, color: "#FFFFFF" }}>معك… في كل مستوى.</div>
            <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 34, color: "#FFD60A", marginTop: 20 }}>PRESS START ▶</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 34, color: "#9AA0B4", marginTop: 70 }}>استراتيجية · هوية · محتوى · حملات</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Audio src={staticFile("idea-level-music.wav")} />
    </AbsoluteFill>
  );
};
