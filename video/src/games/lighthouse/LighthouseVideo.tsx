import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { storm, lost, light, path, harbor, outro } = timeline;
const LAMP = { x: 900, y: 820 };
// buoys the ship passes (service markers) and the harbour
const BUOYS = [
  { x: 200, y: 1560 },
  { x: 430, y: 1440 },
  { x: 250, y: 1320 },
  { x: 520, y: 1230 },
  { x: 380, y: 1130 },
];
const PORT = { x: 640, y: 1050 };
const START = { x: 160, y: 1700 };

const waveLine = (y: number, amp: number, frame: number, speed: number, seed: number) => {
  let d = `M -20 ${y}`;
  for (let x = -20; x <= 1100; x += 30) d += ` L ${x} ${(y + Math.sin(x / 70 + frame / speed + seed) * amp).toFixed(1)}`;
  return d + " L 1100 1920 L -20 1920 Z";
};

const Sea: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = interpolate(frame, [light.on, light.on + 14], [0, 1], clamp);
  const beamAng = frame < light.on ? 0 : (frame - light.on) * 2.4;
  const reached = (k: number) => frame >= path.from + k * path.each + 30;
  const fog = interpolate(frame, [storm.from, lost.to, light.to, harbor.from], [0.55, 0.75, 0.5, 0.15], clamp);
  const calm = interpolate(frame, [light.to, harbor.from], [1, 0.35], clamp);

  // ship: tossed in the storm, then follows the buoys to port
  let ship = { x: START.x + Math.sin(frame / 20) * 40, y: START.y };
  const pts = [START, ...BUOYS, PORT];
  for (let k = 0; k < 6; k++) {
    const s = k < 5 ? path.from + k * path.each : harbor.from;
    const e = k < 5 ? s + 40 : harbor.arrive;
    const t = interpolate(frame, [s, e], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
    if (t > 0) ship = { x: pts[k].x + (pts[k + 1].x - pts[k].x) * t, y: pts[k].y + (pts[k + 1].y - pts[k].y) * t };
  }
  const roll = Math.sin(frame / 7) * 10 * calm;
  const bob = Math.sin(frame / 9) * 10 * calm;
  const scale = interpolate(ship.y, [1050, 1700], [0.6, 1.1]);
  const sign = spring({ frame: frame - harbor.arrive, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #02030a 0%, #0a1233 45%, #16215c 62%, #0a1030 100%)" }} />
      {/* rain in the storm */}
      {frame < light.to
        ? new Array(70).fill(0).map((_, i) => {
            const y = ((random(`ry${i}`) * 1920 + frame * 40) % 2000) - 80;
            return <div key={i} style={{ position: "absolute", left: random(`rx${i}`) * 1080, top: y, width: 2, height: 60, background: "rgba(200,210,255,0.35)", transform: "rotate(14deg)", opacity: 1 - on * 0.6 }} />;
          })
        : null}
      {/* lighthouse on its rock */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M 760 1180 L 1080 1100 L 1080 1400 L 740 1400 Z" fill="#05070f" />
        <path d="M 860 1140 L 940 1140 L 925 860 L 875 860 Z" fill="#E4E6EE" />
        <path d="M 866 1060 L 934 1060 L 931 1000 L 869 1000 Z M 872 940 L 928 940 L 926 900 L 874 900 Z" fill="#c8263b" />
        <rect x={868} y={800} width={64} height={60} fill={on > 0 ? "#FFF3C4" : "#2a3052"} stroke="#8A90A8" strokeWidth={4} />
        <path d="M 860 800 L 940 800 L 900 760 Z" fill="#8A90A8" />
        {/* beam: a rotating cone */}
        {on > 0 ? (
          <g opacity={on * 0.85} style={{ mixBlendMode: "screen" }}>
            <defs>
              <radialGradient id="beam" cx={LAMP.x} cy={LAMP.y} r={1400} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF6D0" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FFF6D0" stopOpacity={0} />
              </radialGradient>
            </defs>
            {[0, 180].map((off) => {
              const a = ((beamAng + off) * Math.PI) / 180;
              const w = 0.13;
              return <polygon key={off} points={`${LAMP.x},${LAMP.y} ${LAMP.x + Math.cos(a - w) * 1500},${LAMP.y + Math.sin(a - w) * 1500 * 0.55} ${LAMP.x + Math.cos(a + w) * 1500},${LAMP.y + Math.sin(a + w) * 1500 * 0.55}`} fill="url(#beam)" />;
            })}
            <circle cx={LAMP.x} cy={LAMP.y} r={60} fill="#FFF6D0" opacity={0.6} style={{ filter: "blur(10px)" }} />
          </g>
        ) : null}
        {/* harbour on the far shore */}
        <path d="M 520 1060 L 800 1060 L 800 1090 L 520 1090 Z" fill="#0b0f22" />
        {new Array(6).fill(0).map((_, i) => (
          <rect key={i} x={540 + i * 42} y={1035} width={14} height={14} fill={frame >= harbor.arrive ? "#FFE7A3" : "#1a2350"} />
        ))}
        {/* sea layers */}
        {[
          { y: 1100, amp: 8, sp: 14, c: "#0b1440" },
          { y: 1300, amp: 14, sp: 11, c: "#0a1236" },
          { y: 1500, amp: 22, sp: 9, c: "#070d2a" },
          { y: 1700, amp: 30, sp: 7, c: "#050920" },
        ].map((w, i) => (
          <path key={i} d={waveLine(w.y, w.amp * (0.4 + calm * 0.6), frame, w.sp, i * 2)} fill={w.c} opacity={0.92} />
        ))}
        {/* buoys */}
        {BUOYS.map((b, k) => {
          const lit = reached(k);
          const shown = frame >= path.from + k * path.each - 10;
          const by = b.y + Math.sin(frame / 8 + k) * 6;
          return shown ? (
            <g key={k}>
              {lit ? <circle cx={b.x} cy={by - 40} r={46} fill="rgba(126,147,255,0.35)" /> : null}
              <path d={`M ${b.x - 16} ${by} L ${b.x + 16} ${by} L ${b.x + 8} ${by - 50} L ${b.x - 8} ${by - 50} Z`} fill={lit ? colors.accent : "#3a4260"} />
              <circle cx={b.x} cy={by - 58} r={10} fill={lit ? "#FFF6D0" : "#555"} />
              <text x={b.x + (b.x > 400 ? 30 : 30)} y={by - 40} fill="#DCE4FF" fontFamily="Aref Ruqaa" fontSize={34} opacity={lit ? 1 : 0} style={{ paintOrder: "stroke" }} stroke="#050920" strokeWidth={6}>
                {SERVICES[k].ar}
              </text>
            </g>
          ) : null;
        })}
        {/* the ship */}
        <g transform={`translate(${ship.x} ${ship.y + bob}) rotate(${roll}) scale(${scale})`}>
          <path d="M -70 0 L 70 0 L 50 30 L -50 30 Z" fill="#E4E6EE" />
          <rect x={-4} y={-110} width={8} height={110} fill="#E4E6EE" />
          <path d="M 4 -104 L 60 -20 L 4 -20 Z" fill={colors.accent} />
          <path d="M -4 -90 L -48 -20 L -4 -20 Z" fill="#c9d2ff" />
        </g>
      </svg>
      {/* fog */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,130,170,0) 30%, rgba(120,130,170,0.5) 60%, rgba(120,130,170,0.2) 100%)", opacity: fog }} />
      {/* the brand above the harbour */}
      {frame >= harbor.arrive ? (
        <div style={{ position: "absolute", left: 150, top: PORT.y - 360, width: 440, opacity: sign, transform: `scale(${0.8 + sign * 0.2})`, filter: "drop-shadow(0 0 30px rgba(255,240,200,0.6))" }}>
          <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "المنارة / The Lighthouse" — a ship lost in the fog is guided buoy by buoy into harbour.
export const LighthouseVideo: React.FC = () => (
  <Shell
    bg="#02030a"
    audio="lighthouse-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Your light in the dark.", ar: "نكون نورك في الطريق" }}
    flashes={[light.on, harbor.arrive]}
    captions={[
      { from: storm.from + 16, to: storm.to, kicker: "THE LIGHTHOUSE · المنارة", en: "Every idea sets sail.", ar: "كل فكرة… تبحر." },
      { from: lost.from + 4, to: lost.to, en: "But not every idea finds the shore.", ar: "بس مو كل فكرة تلقى البر.", enSize: 74 },
      { from: light.from + 4, to: path.from, kicker: "NEO CAPTA", en: "We are the light.", ar: "نحن النور." },
      ...SERVICES.map((s, k) => ({ from: path.from + k * path.each + 4, to: k < 4 ? path.from + (k + 1) * path.each + 4 : harbor.from, kicker: `BUOY ${k + 1}`, en: s.en, ar: s.ar, enSize: 92, arSize: 80 })),
      { from: harbor.arrive + 10, to: outro.from, en: "Guiding your idea home.", ar: "نوصل فكرتك لبرّ الأمان.", enSize: 78, top: 200 },
    ]}
  >
    <Sea />
  </Shell>
);
