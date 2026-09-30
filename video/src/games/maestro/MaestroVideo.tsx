import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { noise, lost, baton, sections, finale, outro } = timeline;
const beat = (60 / timeline.bpm) * timeline.fps;

// Orchestra sections on an arc: each one a service.
const SEATS = [
  { x: 190, y: 1180, icon: "🎻" },
  { x: 350, y: 980, icon: "🎹" },
  { x: 540, y: 920, icon: "🥁" },
  { x: 730, y: 980, icon: "🎺" },
  { x: 890, y: 1180, icon: "🎷" },
];

const Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const joined = (k: number) => frame >= sections.from + k * sections.each + 10;
  const count = SEATS.filter((_, k) => joined(k)).length;
  const chaos = frame < baton.from;
  // baton: idle, raised, then conducting in time
  let batonAng = -20;
  if (frame >= baton.from) batonAng = interpolate(frame, [baton.from, baton.up], [-20, -70], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (frame >= sections.from) batonAng = -45 + Math.sin(((frame - sections.from) / beat) * Math.PI) * 30;
  if (frame >= finale.hit - 10) batonAng = interpolate(frame, [finale.hit - 10, finale.hit], [-80, 10], { ...clamp, easing: Easing.in(Easing.cubic) });
  const fin = spring({ frame: frame - finale.hit, fps, config: { damping: 12 } });
  const spot = frame >= baton.from ? 1 : 0.4;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #2a0f18 0%, #12060a 55%, #050204 100%)" }} />
      {/* stage curtains */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 110, background: "repeating-linear-gradient(90deg, #5a0f1c 0 20px, #3a0812 20px 40px)" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 110, background: "repeating-linear-gradient(90deg, #5a0f1c 0 20px, #3a0812 20px 40px)" }} />
      <div style={{ position: "absolute", left: 540 - 520, top: 700, width: 1040, height: 900, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(255,240,210,${0.18 * spot}) 0%, rgba(0,0,0,0) 70%)` }} />
      {/* sound bars: noisy, then in unison */}
      <div style={{ position: "absolute", left: 200, right: 200, top: 700, height: 130, display: "flex", alignItems: "flex-end", gap: 8 }}>
        {new Array(24).fill(0).map((_, i) => {
          const h = chaos || frame < sections.from ? random(`b${i}-${Math.floor(frame / 3)}`) * 100 : (0.25 + 0.75 * Math.abs(Math.sin(frame / 6 + i / 3))) * (20 + count * 16);
          return <div key={i} style={{ flex: 1, height: h, borderRadius: 4, background: chaos ? "#8a3a4a" : colors.accent, opacity: 0.8 }} />;
        })}
      </div>
      {/* sections */}
      {SEATS.map((s, k) => {
        const on = joined(k);
        const shake = chaos ? (random(`s${k}-${Math.floor(frame / 2)}`) - 0.5) * 16 : 0;
        const pulse = on ? 1 + Math.abs(Math.sin((frame / beat) * Math.PI)) * 0.06 : 1;
        return (
          <div key={k} style={{ position: "absolute", left: s.x - 90 + shake, top: s.y - 90, width: 180, textAlign: "center" }}>
            <div style={{ width: 180, height: 180, borderRadius: "50%", background: on ? `radial-gradient(circle, ${colors.accent}, ${colors.royal})` : "#2a1a22", border: `4px solid ${on ? "#fff" : "#5a3a44"}`, boxShadow: on ? "0 0 50px rgba(94,120,255,0.8)" : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, transform: `scale(${pulse})`, filter: on || chaos ? "none" : "grayscale(1) brightness(0.6)" }}>
              {s.icon}
            </div>
            <div style={{ marginTop: 10, fontFamily: fonts.serif, fontStyle: "italic", fontSize: 32, color: on ? colors.white : "#6a5a60" }}>{SERVICES[k].en}</div>
            <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 32, color: on ? colors.accent : "#6a5a60" }}>
              {SERVICES[k].ar}
            </div>
          </div>
        );
      })}
      {/* notes: chaotic, then flowing up in time */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {new Array(16).fill(0).map((_, i) => {
          const k = i % 5;
          const t = ((frame + i * 11) % 70) / 70;
          if (!chaos && !joined(k)) return null;
          const x = SEATS[k].x + (chaos ? (random(`nx${i}${Math.floor(frame / 5)}`) - 0.5) * 200 : Math.sin(t * 6 + i) * 30);
          const y = SEATS[k].y - 100 - t * 300;
          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={1 - t}>
              <ellipse rx={12} ry={9} fill={chaos ? "#c05060" : "#DCE4FF"} transform="rotate(-20)" />
              <line x1={11} y1={-2} x2={11} y2={-44} stroke={chaos ? "#c05060" : "#DCE4FF"} strokeWidth={4} />
            </g>
          );
        })}
      </svg>
      {/* conductor from behind + baton */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={380} y={1700} width={320} height={60} rx={10} fill="#1a0a10" stroke="#5a3a44" strokeWidth={3} />
        <path d="M 440 1700 C 440 1560 640 1560 640 1700 Z" fill="#050204" />
        <circle cx={540} cy={1530} r={52} fill="#050204" />
        <g transform={`translate(620 1590) rotate(${batonAng})`}>
          <line x1={0} y1={0} x2={80} y2={0} stroke="#050204" strokeWidth={26} strokeLinecap="round" />
          <line x1={70} y1={0} x2={250} y2={0} stroke="#F4F5FA" strokeWidth={6} strokeLinecap="round" style={{ filter: frame >= baton.from ? "drop-shadow(0 0 10px #fff)" : "none" }} />
        </g>
      </svg>
      {/* finale */}
      {frame >= finale.hit ? (
        <div style={{ position: "absolute", left: 540 - 260, top: 1250, width: 520, opacity: fin, transform: `scale(${0.7 + fin * 0.3})`, filter: "drop-shadow(0 0 40px rgba(94,120,255,0.9))" }}>
          <Img src={staticFile("neocapta-logo.png")} style={{ width: "100%" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "المايسترو / The Maestro" — scattered instruments become one symphony under a conductor.
export const MaestroVideo: React.FC = () => (
  <Shell
    bg="#050204"
    audio="maestro-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "A masterpiece.", ar: "ننسّق فكرتك لين تصير تحفة" }}
    flashes={[finale.hit]}
    captions={[
      { from: noise.from + 16, to: noise.to, kicker: "THE MAESTRO · المايسترو", en: "Every idea is an instrument.", ar: "كل فكرة… آلة.", top: 200 },
      { from: lost.from + 4, to: lost.to, en: "But alone, it's just noise.", ar: "بس لحالها… مجرد ضجة.", enSize: 76, top: 200 },
      { from: baton.from + 4, to: sections.from, kicker: "NEO CAPTA", en: "We conduct.", ar: "نحن نقود الأوركسترا.", top: 200 },
      ...SERVICES.map((s, k) => ({ from: sections.from + k * sections.each + 4, to: k < 4 ? sections.from + (k + 1) * sections.each + 4 : finale.from, kicker: `SECTION ${k + 1}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 170 })),
      { from: finale.hit + 10, to: outro.from, en: "Your idea, a masterpiece.", ar: "فكرتك… تحفة.", enSize: 80, top: 200 },
    ]}
  >
    <Stage />
  </Shell>
);
