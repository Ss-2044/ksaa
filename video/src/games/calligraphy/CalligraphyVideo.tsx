import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { drop, blot, write, flourish, logo, outro } = timeline;
const INK = "#0A1033";
const CX = 540;
const CY = 1180;

// An organic ink blot: a circle with seeded wobble, growing with `t`.
const blotPath = (t: number, seed: string) => {
  const n = 24;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = (30 + t * 150) * (0.75 + random(`${seed}${i % n}`) * 0.5);
    d += `${i === 0 ? "M" : "L"} ${(CX + Math.cos(a) * r).toFixed(1)} ${(CY + Math.sin(a) * r * 0.8).toFixed(1)} `;
  }
  return d + "Z";
};

const Page: React.FC = () => {
  const frame = useCurrentFrame();
  const fall = interpolate(frame, [drop.from + 10, drop.splat], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const spread = interpolate(frame, [drop.splat, blot.to], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const blotOut = interpolate(frame, [write.from, write.from + 40], [1, 0], clamp);
  const reveal = interpolate(frame, [write.from + 10, write.to], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const flo = interpolate(frame, [flourish.from, flourish.to - 30], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const toLogo = interpolate(frame, [logo.from, logo.from + 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // pen tip travels right-to-left with the reveal
  const penX = 900 - reveal * 720;
  const penY = CY - 40 + Math.sin(reveal * 18) * 50;
  const writing = frame >= write.from + 10 && frame < write.to;

  return (
    <AbsoluteFill>
      {/* paper */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #FBF6EA 0%, #F2E9D4 60%, #E6D9BC 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.35, backgroundImage: "radial-gradient(circle, rgba(120,90,50,0.25) 1px, transparent 1.5px)", backgroundSize: "7px 7px" }} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 720, bottom: 280, border: `2px solid rgba(52,68,153,0.35)`, borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 76, right: 76, top: 736, bottom: 296, border: `1px solid rgba(52,68,153,0.2)`, borderRadius: 6 }} />

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* falling drop */}
        {frame < drop.splat ? <ellipse cx={CX} cy={300 + fall * (CY - 300)} rx={16} ry={24} fill={INK} /> : null}
        {/* the blot and its splashes */}
        {frame >= drop.splat ? (
          <g opacity={blotOut}>
            <path d={blotPath(spread, "b")} fill={INK} />
            {new Array(14).fill(0).map((_, i) => {
              const a = random(`sa${i}`) * Math.PI * 2;
              const d = (120 + random(`sd${i}`) * 200) * Math.min(1, spread * 3);
              return <circle key={i} cx={CX + Math.cos(a) * d} cy={CY + Math.sin(a) * d * 0.8} r={4 + random(`sr${i}`) * 10} fill={INK} />;
            })}
          </g>
        ) : null}
        {/* flourish under the word */}
        <path
          d="M 900 1370 C 760 1440 560 1330 420 1400 S 200 1450 170 1380"
          stroke={colors.royal}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={flo}
          opacity={1 - toLogo}
        />
        {[{ x: 700, y: 900 }, { x: 460, y: 880 }, { x: 330, y: 920 }].map((p, i) => (
          <path key={i} d={`M ${p.x} ${p.y} l 18 -14 l 18 14 l -18 14 Z`} fill={colors.royal} opacity={interpolate(frame, [flourish.from + 40 + i * 10, flourish.from + 50 + i * 10], [0, 1], clamp) * (1 - toLogo)} />
        ))}
      </svg>

      {/* the word, revealed right-to-left as the pen writes */}
      <div
        dir="rtl"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: CY - 330,
          textAlign: "center",
          fontFamily: fonts.handAr,
          fontSize: 400,
          lineHeight: 1.2,
          color: INK,
          clipPath: `inset(0 0 0 ${(1 - reveal) * 100}%)`,
          opacity: 1 - toLogo,
          filter: `blur(${toLogo * 12}px)`,
        }}
      >
        فكرة
      </div>
      {/* the qalam */}
      {writing ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${penX} ${penY}) rotate(-38)`}>
            <rect x={-9} y={-330} width={18} height={300} rx={8} fill="#8a5a33" />
            <path d="M -9 -30 L 9 -30 L 2 6 L -2 6 Z" fill="#3f2a18" />
          </g>
        </svg>
      ) : null}

      {/* margin notes: one per service */}
      <div style={{ position: "absolute", left: 110, right: 110, top: 1500, display: "flex", justifyContent: "space-between", flexDirection: "row-reverse" }}>
        {SERVICES.map((s, k) => {
          const t = write.from + 20 + k * write.noteEach;
          const o = interpolate(frame, [t, t + 14], [0, 1], clamp) * (1 - toLogo);
          return (
            <div key={s.en} style={{ textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
              <div style={{ width: 10, height: 10, margin: "0 auto 8px", transform: "rotate(45deg)", background: colors.royal }} />
              <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 40, color: INK }}>
                {s.ar}
              </div>
              <div style={{ fontFamily: fonts.serif, fontStyle: "italic", fontSize: 22, color: colors.royal }}>{s.en}</div>
            </div>
          );
        })}
      </div>

      {/* the word becomes the brand, like ink settling */}
      <div style={{ position: "absolute", left: CX - 330, top: CY - 300, width: 660, opacity: toLogo, filter: `blur(${(1 - toLogo) * 14}px)` }}>
        <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

// "الخط العربي / Calligraphy" — a drop of ink becomes a written word, then the brand. Calm and light.
export const CalligraphyVideo: React.FC = () => (
  <Shell
    bg="#F2E9D4"
    light
    audio="calligraphy-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Written beautifully.", ar: "نكتب فكرتك بأجمل خط" }}
    captions={[
      { from: drop.from + 20, to: drop.to, kicker: "CALLIGRAPHY · الخط", en: "Every idea is a drop of ink.", ar: "كل فكرة… قطرة حبر." },
      { from: blot.from + 4, to: blot.to, en: "But ink alone isn't calligraphy.", ar: "بس الحبر لحاله… ما يصير خط.", enSize: 74 },
      { from: write.from + 4, to: flourish.from, kicker: "NEO CAPTA", en: "We hold the pen.", ar: "نحن نمسك القلم." },
      { from: flourish.from + 4, to: logo.from, en: "Every stroke, with purpose.", ar: "كل حرف… بمعنى.", enSize: 76 },
      { from: logo.from + 20, to: outro.from, en: "Your idea, beautifully written.", ar: "فكرتك… بأجمل خط.", enSize: 74 },
    ]}
  >
    <Page />
  </Shell>
);
