import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { pad, hold, control, count, launch, outro } = timeline;
const BASE = { x: 540, y: 1560 };

const Rocket: React.FC<{ flame: number }> = ({ flame }) => (
  <svg width={260} height={820} viewBox="-130 -700 260 820" style={{ overflow: "visible" }}>
    {flame > 0 ? (
      <g>
        <path d={`M -44 40 Q 0 ${40 + 300 * flame} 44 40 Z`} fill="#FFE7A3" opacity={0.95} />
        <path d={`M -30 40 Q 0 ${40 + 200 * flame} 30 40 Z`} fill="#fff" />
        <path d={`M -54 40 Q 0 ${40 + 420 * flame} 54 40 Z`} fill="#ff9a3c" opacity={0.5} />
      </g>
    ) : null}
    <path d="M -60 20 L -60 -520 C -60 -620 0 -690 0 -690 C 0 -690 60 -620 60 -520 L 60 20 Z" fill="#F4F5FA" stroke="#8A90A8" strokeWidth={3} />
    <path d="M -60 -520 C -60 -620 0 -690 0 -690 C 0 -690 60 -620 60 -520 Z" fill={colors.royal} />
    <rect x={-60} y={-360} width={120} height={26} fill={colors.royal} />
    <rect x={-60} y={-120} width={120} height={14} fill={colors.accent} />
    <circle cx={0} cy={-440} r={26} fill="#0A1033" stroke="#8A90A8" strokeWidth={5} />
    <path d="M -60 -60 L -120 40 L -60 20 Z M 60 -60 L 120 40 L 60 20 Z" fill={colors.royal} />
    <rect x={-40} y={20} width={80} height={24} rx={6} fill="#3a3f4c" />
    <text x={0} y={-230} textAnchor="middle" fill={colors.royal} fontFamily="Montserrat" fontWeight={800} fontSize={40} transform="rotate(-90 0 -230)">
      NEO CAPTA
    </text>
  </svg>
);

const Pad: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.min(5, Math.max(0, Math.floor((frame - count.from) / count.each) + 1));
  const inCount = frame >= count.from && frame < launch.ignite;
  const local = (frame - count.from) % count.each;
  const numPop = spring({ frame: local, fps, config: { damping: 12 } });
  const ign = interpolate(frame, [launch.ignite, launch.lift], [0, 1], clamp);
  const rise = interpolate(frame, [launch.lift, launch.to], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const shake = frame >= launch.ignite && frame < launch.lift + 60 ? (random(`sh${frame}`) - 0.5) * 16 * (1 - rise) : 0;
  const armsOff = (k: number) => frame >= count.from + k * count.each + 20;
  const logo = spring({ frame: frame - (launch.lift + 110), fps, config: { damping: 200 } }); // after the rocket has cleared the frame
  const holdBlink = frame >= hold.from && frame < control.from && frame % 20 < 10;

  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #010208 0%, #07102e 55%, #152463 85%, #0a0f24 100%)" }} />
      {new Array(80).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`x${i}`) * 1080, top: random(`y${i}`) * 1100, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.3 + 0.6 * Math.abs(Math.sin(frame / 20 + i)) }} />
      ))}
      {/* the rocket rides the world upward */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${rise * -40}px)` }}>
        {/* smoke clouds at ignition */}
        {ign > 0
          ? new Array(26).fill(0).map((_, i) => {
              const spread = (random(`sm${i}`) - 0.5) * 2;
              const t = interpolate(frame, [launch.ignite + i, launch.to], [0, 1], clamp);
              const size = 140 + t * 360 * (0.6 + random(`ss${i}`) * 0.6);
              return <div key={i} style={{ position: "absolute", left: BASE.x + spread * (200 + t * 520) - size / 2, top: BASE.y + 40 - size / 2 - t * 80 * random(`sy${i}`), width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,232,240,0.85), rgba(160,165,185,0.35) 60%, rgba(0,0,0,0) 72%)", opacity: 0.9 }} />;
            })
          : null}
        {/* gantry tower + arms (one arm swings away per count) */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g stroke="#8A90A8" strokeWidth={6} fill="none" opacity={1 - rise}>
            <path d={`M 740 ${BASE.y + 40} L 740 ${BASE.y - 780} M 820 ${BASE.y + 40} L 820 ${BASE.y - 780}`} />
            {new Array(16).fill(0).map((_, i) => (
              <path key={i} d={`M 740 ${BASE.y - i * 50} L 820 ${BASE.y - i * 50 - 50} M 820 ${BASE.y - i * 50} L 740 ${BASE.y - i * 50 - 50}`} strokeWidth={3} />
            ))}
          </g>
          {SERVICES.map((s, k) => {
            const y = BASE.y - 100 - k * 130;
            const off = armsOff(4 - k) ? interpolate(frame, [count.from + (4 - k) * count.each + 20, count.from + (4 - k) * count.each + 36], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 0;
            return (
              <g key={s.en} transform={`rotate(${off * -70} 740 ${y})`} opacity={1 - rise}>
                <rect x={600} y={y - 10} width={140} height={20} fill={armsOff(4 - k) ? colors.accent : "#8A90A8"} />
              </g>
            );
          })}
          <rect x={300} y={BASE.y + 40} width={480} height={40} fill="#1b1e27" />
        </svg>
        <div style={{ position: "absolute", left: BASE.x - 130, top: BASE.y - 700 - rise * 2100 + 0 }}>
          <Rocket flame={ign * (0.8 + 0.2 * Math.sin(frame * 1.7))} />
        </div>
        {/* exhaust trail */}
        {rise > 0 ? <div style={{ position: "absolute", left: BASE.x - 30, top: BASE.y + 120 - rise * 2100, width: 60, height: rise * 2100, background: "linear-gradient(0deg, rgba(220,225,240,0.2), rgba(220,225,240,0.8))", filter: "blur(8px)" }} /> : null}
      </div>
      {/* countdown numeral + status */}
      {inCount ? (
        <div style={{ position: "absolute", left: 60, top: 820, width: 400, textAlign: "center" }}>
          <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 320, lineHeight: 1, color: colors.white, transform: `scale(${1.4 - numPop * 0.4})`, opacity: numPop, textShadow: "0 0 40px rgba(94,120,255,0.8)" }}>{6 - n}</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 60, top: 1300, width: 400, fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, color: colors.steel }}>
        {SERVICES.map((s, k) => {
          const ok = frame >= count.from + k * count.each + 20;
          return (
            <div key={s.en} style={{ color: ok ? colors.accent : "#3a4260", marginBottom: 6 }}>
              {ok ? "✓" : "○"} {s.en.toUpperCase()}
            </div>
          );
        })}
        <div style={{ marginTop: 12, color: holdBlink ? "#e0303a" : frame >= launch.ignite ? colors.accent : colors.steel }}>{frame >= launch.ignite ? "● LIFT-OFF" : frame < control.from && frame >= hold.from ? "● HOLD" : "○ STANDBY"}</div>
      </div>
      {/* the brand written in the sky */}
      {frame >= launch.lift + 110 ? (
        <div style={{ position: "absolute", left: 540 - 260, top: 560, width: 520, opacity: logo, transform: `scale(${0.8 + logo * 0.2})`, filter: "drop-shadow(0 0 30px rgba(160,180,255,0.8))" }}>
          <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// "العد التنازلي / Countdown" — five services, five counts, one launch.
export const CountdownVideo: React.FC = () => (
  <Shell
    bg="#010208"
    audio="countdown-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Ready for launch.", ar: "نطلق فكرتك" }}
    flashes={[launch.ignite]}
    captions={[
      { from: pad.from + 16, to: pad.to, kicker: "COUNTDOWN · العد التنازلي", en: "Your idea is ready…", ar: "فكرتك جاهزة…", top: 200 },
      { from: hold.from + 4, to: hold.to, en: "…but it hasn't launched.", ar: "…بس ما انطلقت.", top: 200 },
      { from: control.from + 4, to: count.from, kicker: "NEO CAPTA", en: "Mission control.", ar: "مركز التحكم.", top: 200 },
      ...SERVICES.map((s, k) => ({ from: count.from + k * count.each + 4, to: k < 4 ? count.from + (k + 1) * count.each + 4 : launch.ignite, kicker: `T-${5 - k}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 180 })),
      { from: launch.lift + 20, to: outro.from, en: "Lift-off.", ar: "انطلقت فكرتك.", enSize: 110, top: 200 },
    ]}
  >
    <Pad />
  </Shell>
);
