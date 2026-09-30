import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { empty, lost, enter, pour, serve, outro } = timeline;
const CUP = { x: 540, y: 1460 };
const GOLD = "#C9A24A";

// Side-view Saudi dallah (spout on the left), drawn around its pivot (the handle side).
const Dallah: React.FC = () => (
  <svg width={420} height={560} viewBox="-210 -300 420 560" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="brass" x1="0" x2="1">
        <stop offset="0%" stopColor="#6b4f1d" />
        <stop offset="35%" stopColor="#d9b45a" />
        <stop offset="48%" stopColor="#fff1c2" />
        <stop offset="62%" stopColor="#c9a24a" />
        <stop offset="100%" stopColor="#5a4217" />
      </linearGradient>
    </defs>
    {/* spout: long crescent beak */}
    <path d="M -60 60 C -120 40 -150 -40 -205 -150 L -190 -156 C -130 -70 -100 -10 -40 20 Z" fill="url(#brass)" stroke="#5a4217" strokeWidth={3} />
    {/* body */}
    <path d="M -70 200 C -100 120 -80 40 -40 0 C -30 -40 -40 -80 -30 -110 L 30 -110 C 40 -80 30 -40 40 0 C 80 40 100 120 70 200 Z" fill="url(#brass)" stroke="#5a4217" strokeWidth={3} />
    <rect x={-80} y={196} width={160} height={24} rx={6} fill="url(#brass)" stroke="#5a4217" strokeWidth={3} />
    {/* lid + finial */}
    <path d="M -40 -110 C -40 -170 40 -170 40 -110 Z" fill="url(#brass)" stroke="#5a4217" strokeWidth={3} />
    <path d="M -8 -165 L 0 -230 L 8 -165 Z" fill={GOLD} stroke="#5a4217" strokeWidth={2} />
    <circle cx={0} cy={-238} r={10} fill={GOLD} />
    {/* handle */}
    <path d="M 40 -90 C 150 -90 170 60 70 130" stroke="url(#brass)" strokeWidth={18} fill="none" />
    {/* engraved bands */}
    <path d="M -58 150 L 58 150 M -44 20 L 44 20" stroke="#5a4217" strokeWidth={3} opacity={0.7} />
  </svg>
);

// Handle-less Arabic coffee cup (finjan), side view, with its fill level 0..1.
const Finjan: React.FC<{ level: number; wobble: number }> = ({ level, wobble }) => (
  <svg width={260} height={220} viewBox="-130 -110 260 220" style={{ overflow: "visible", transform: `rotate(${wobble}deg)` }}>
    <defs>
      <clipPath id="cupIn">
        <path d="M -100 -80 L 100 -80 C 96 10 70 70 0 76 C -70 70 -96 10 -100 -80 Z" />
      </clipPath>
    </defs>
    <path d="M -110 -90 L 110 -90 C 106 10 76 84 0 90 C -76 84 -106 10 -110 -90 Z" fill="#F6F2EA" stroke="#c9c1b0" strokeWidth={4} />
    <g clipPath="url(#cupIn)">
      <rect x={-110} y={76 - level * 150} width={220} height={200} fill="#8a6a2e" />
      <rect x={-110} y={76 - level * 150} width={220} height={8} fill="#b8924a" />
    </g>
    <path d="M -110 -90 L 110 -90" stroke={GOLD} strokeWidth={6} />
    <path d="M -60 40 C -20 60 20 60 60 40" stroke={colors.royal} strokeWidth={5} fill="none" opacity={0.7} />
  </svg>
);

const Majlis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame: frame - enter.from, fps, config: { damping: 16, stiffness: 70 } });
  // tilt: pour on each step, rest between
  let tilt = 0;
  let flowing = 0;
  for (let k = 0; k < 5; k++) {
    const s = pour.from + k * pour.each;
    const t = interpolate(frame, [s, s + 10, s + pour.flow, s + pour.flow + 10], [0, 1, 1, 0], { ...clamp, easing: Easing.inOut(Easing.sin) });
    tilt = Math.max(tilt, t);
    if (frame >= s + 8 && frame < s + pour.flow + 4) flowing = 1;
  }
  const level = interpolate(frame, [pour.from, pour.from + 5 * pour.each], [0, 0.85], clamp);
  const wobble = frame >= lost.from && frame < enter.from ? Math.sin(frame / 3) * 6 : 0;
  const dallahX = interpolate(inP, [0, 1], [1300, 760]);
  const dallahY = 1010;
  // spout tip position in screen space (rotated with the pot)
  const ang = (-tilt * 48 * Math.PI) / 180;
  const tipLocal = { x: -205, y: -150 };
  const tip = { x: dallahX + tipLocal.x * Math.cos(ang) - tipLocal.y * Math.sin(ang), y: dallahY + tipLocal.x * Math.sin(ang) + tipLocal.y * Math.cos(ang) };
  const top = interpolate(frame, [serve.from, serve.top], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const art = interpolate(frame, [serve.top + 6, serve.top + 50], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

  return (
    <AbsoluteFill>
      {/* majlis: warm dark wall, sadu-striped cushion line, tray */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #3a2a1a 0%, #1a120b 60%, #0b0704 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, height: 60, background: "repeating-linear-gradient(90deg, #9E2B25 0 40px, #14110f 40px 60px, #EFE7D6 60px 70px, #344499 70px 110px, #14110f 110px 130px)", opacity: 0.8 * (1 - top) }} />
      <div style={{ position: "absolute", left: CUP.x - 320, top: CUP.y + 70, width: 640, height: 60, borderRadius: "50%", background: "radial-gradient(ellipse, #d9b45a, #6b4f1d)", opacity: 1 - top }} />

      {/* side view */}
      <AbsoluteFill style={{ opacity: 1 - top }}>
        <div style={{ position: "absolute", left: CUP.x - 130, top: CUP.y - 110 }}>
          <Finjan level={level} wobble={wobble} />
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {/* steam */}
          {level > 0.3
            ? [0, 1, 2].map((k) => {
                const t = ((frame + k * 20) % 60) / 60;
                return <path key={k} d={`M ${CUP.x - 40 + k * 40} ${CUP.y - 110 - t * 160} c 20 -30 -20 -60 0 -90`} stroke="rgba(255,255,255,0.45)" strokeWidth={6} fill="none" strokeLinecap="round" opacity={1 - t} />;
              })
            : null}
          {/* the pour: a curved stream from the spout into the cup */}
          {flowing ? <path d={`M ${tip.x} ${tip.y} Q ${tip.x - 60} ${tip.y + 60} ${CUP.x + 10} ${CUP.y - 70}`} stroke="#8a6a2e" strokeWidth={10} fill="none" strokeLinecap="round" /> : null}
        </svg>
        {frame >= enter.from ? (
          <div style={{ position: "absolute", left: dallahX - 210, top: dallahY - 300, transformOrigin: "210px 300px", transform: `rotate(${-tilt * 48}deg)` }}>
            <Dallah />
          </div>
        ) : null}
      </AbsoluteFill>

      {/* top-down view of the full cup with the brand drawn on the coffee */}
      {top > 0 ? (
        <div style={{ position: "absolute", left: 540 - 380, top: 1200 - 380, width: 760, height: 760, opacity: top, transform: `scale(${0.7 + top * 0.3})` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#F6F2EA", border: `14px solid ${GOLD}`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }} />
          <div style={{ position: "absolute", inset: 60, borderRadius: "50%", background: "radial-gradient(circle at 45% 40%, #b8924a 0%, #8a6a2e 55%, #5d4518 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Img src={staticFile("neocapta-logo-white.png")} style={{ width: 460, opacity: art * 0.9, transform: `scale(${0.8 + art * 0.2}) rotate(${(1 - art) * -20}deg)`, filter: "sepia(0.6) brightness(1.05)" }} />
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "الدلّة / The Dallah" — an idea served the right way: five pours, one per service, and the brand in the cup.
export const DallahVideo: React.FC = () => (
  <Shell
    bg="#1a120b"
    audio="dallah-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Served the right way.", ar: "نقدّم فكرتك بأصولها" }}
    flashes={[serve.top]}
    captions={[
      { from: empty.from + 16, to: empty.to, kicker: "THE DALLAH · الدلّة", en: "Every idea deserves to be served right.", ar: "كل فكرة تستاهل تُقدَّم صح.", enSize: 72, arSize: 70 },
      { from: lost.from + 4, to: lost.to, en: "But not everyone knows how.", ar: "بس مو كل أحد يعرف الأصول.", enSize: 76 },
      { from: enter.from + 4, to: pour.from, kicker: "NEO CAPTA", en: "We know the etiquette.", ar: "نحن نعرف الأصول." },
      ...SERVICES.map((s, k) => ({ from: pour.from + k * pour.each + 4, to: k < 4 ? pour.from + (k + 1) * pour.each + 4 : serve.from, kicker: `POUR ${k + 1}`, en: s.en, ar: s.ar, enSize: 92, arSize: 80 })),
      { from: serve.top + 10, to: outro.from, en: "Your idea, served with honour.", ar: "فكرتك… تُقدَّم بأصولها.", enSize: 74 },
    ]}
  >
    <Majlis />
  </Shell>
);
