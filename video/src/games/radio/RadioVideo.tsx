import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { static: stat, lost, answer, tune, broadcast, outro } = timeline;
const DIAL = { left: 120, width: 840, top: 1020 };
const fx = (f: number) => DIAL.left + ((f - 87.5) / (108 - 87.5)) * DIAL.width;

const Radio: React.FC = () => {
  const frame = useCurrentFrame();
  // needle frequency: drifting, wandering, then stepping onto each station
  let freq = 95 + Math.sin(frame / 30) * 2;
  if (frame >= lost.from && frame < answer.from) freq = 97.5 + Math.sin(frame / 7) * 8 + Math.sin(frame / 3.1) * 2;
  if (frame >= answer.from) freq = interpolate(frame, [answer.from, answer.from + 20], [97.5 + Math.sin(answer.from / 7) * 8, 88], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  tune.freqs.forEach((f, k) => {
    const s = tune.from + k * tune.each;
    const prev = k === 0 ? 88 : tune.freqs[k - 1];
    if (frame >= s) freq = interpolate(frame, [s, s + tune.move], [prev, f], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  });
  const tuned = tune.freqs.filter((_, k) => frame >= tune.from + k * tune.each + tune.move).length;
  const noise = frame >= broadcast.from ? 0 : Math.max(0.05, 1 - tuned * 0.19);
  const bc = interpolate(frame, [broadcast.from, broadcast.from + 30], [0, 1], clamp);
  const radioOut = interpolate(frame, [broadcast.from + 20, broadcast.from + 50], [1, 0], clamp);

  // oscilloscope trace: noise fades into a clean wave
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const x = 170 + i * 6.2;
    const clean = Math.sin(i / 6 + frame / 3) * 60;
    const n = (random(`n${i}-${Math.floor(frame / 2)}`) - 0.5) * 220;
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${(640 + clean * (1 - noise) + n * noise).toFixed(1)} `;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #1b1f2e 0%, #07080d 70%)" }} />
      <AbsoluteFill style={{ opacity: radioOut }}>
        {/* radio body */}
        <div style={{ position: "absolute", left: 70, right: 70, top: 480, height: 1180, borderRadius: 60, background: "linear-gradient(160deg, #2b3350 0%, #121628 100%)", border: "6px solid #8A90A8", boxShadow: "0 50px 120px rgba(0,0,0,0.8)" }} />
        {/* oscilloscope */}
        <div style={{ position: "absolute", left: 150, right: 150, top: 540, height: 200, borderRadius: 20, background: "#030814", border: "3px solid #3a4260", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(94,120,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(94,120,255,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d={d} stroke={tuned === 5 ? colors.accent : "#9fe8c8"} strokeWidth={4} fill="none" style={{ filter: `drop-shadow(0 0 8px ${tuned === 5 ? "#5E78FF" : "#9fe8c8"})` }} />
        </svg>
        {/* signal bars */}
        <div style={{ position: "absolute", top: 790, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12, alignItems: "flex-end", height: 80 }}>
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} style={{ width: 26, height: 20 + k * 14, borderRadius: 4, background: k < tuned ? colors.accent : "#2a3052", boxShadow: k < tuned ? "0 0 12px #5E78FF" : "none" }} />
          ))}
          <span style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 32, color: colors.white, marginLeft: 20 }}>{freq.toFixed(1)} FM</span>
        </div>
        {/* tuning dial */}
        <div style={{ position: "absolute", left: DIAL.left - 20, width: DIAL.width + 40, top: DIAL.top - 40, height: 250, borderRadius: 18, background: "linear-gradient(180deg, #f3e7c6, #d8c79a)", boxShadow: "inset 0 0 30px rgba(0,0,0,0.35)" }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {new Array(41).fill(0).map((_, i) => {
            const f = 88 + i * 0.5;
            const long = i % 4 === 0;
            return <line key={i} x1={fx(f)} x2={fx(f)} y1={DIAL.top + 10} y2={DIAL.top + (long ? 60 : 36)} stroke="#3a2e1a" strokeWidth={long ? 3 : 1.5} />;
          })}
          {[88, 92, 96, 100, 104, 108].map((f) => (
            <text key={f} x={fx(f)} y={DIAL.top + 92} textAnchor="middle" fill="#3a2e1a" fontFamily="Montserrat" fontWeight={800} fontSize={24}>
              {f}
            </text>
          ))}
          {/* stations = services */}
          {tune.freqs.map((f, k) => {
            const on = k < tuned;
            return (
              <g key={k}>
                <circle cx={fx(f)} cy={DIAL.top + 130} r={9} fill={on ? colors.royal : "#8a7a58"} />
                <text x={fx(f)} y={DIAL.top + 172} textAnchor="middle" fill={on ? colors.royal : "#8a7a58"} fontFamily="Aref Ruqaa" fontSize={30}>
                  {SERVICES[k].ar}
                </text>
              </g>
            );
          })}
          {/* needle */}
          <line x1={fx(freq)} x2={fx(freq)} y1={DIAL.top - 30} y2={DIAL.top + 200} stroke="#c8263b" strokeWidth={6} />
        </svg>
        {/* speaker grille + knob */}
        <div style={{ position: "absolute", left: 160, top: 1320, width: 440, height: 280, borderRadius: 24, backgroundImage: "radial-gradient(circle, #0a0c14 5px, transparent 6px)", backgroundSize: "22px 22px", backgroundColor: "#1c2236", transform: `scale(${1 + (1 - noise) * Math.abs(Math.sin(frame / 3)) * 0.015})` }} />
        <div style={{ position: "absolute", left: 700, top: 1360, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #e4e8f0, #6d7488)", transform: `rotate(${(freq - 88) * 18}deg)`, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
          <div style={{ position: "absolute", left: 94, top: 12, width: 12, height: 50, borderRadius: 6, background: "#1b1e27" }} />
        </div>
      </AbsoluteFill>

      {/* broadcast: waves over the city */}
      {bc > 0 ? (
        <AbsoluteFill style={{ opacity: bc }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {new Array(8).fill(0).map((_, i) => {
              const t = ((frame - broadcast.from + i * 12) % 96) / 96;
              return <circle key={i} cx={540} cy={900} r={80 + t * 900} fill="none" stroke={colors.accent} strokeWidth={6 * (1 - t)} opacity={1 - t} />;
            })}
            {new Array(16).fill(0).map((_, i) => {
              const w = 50 + random(`bw${i}`) * 70;
              const h = 150 + random(`bh${i}`) * 450;
              const x = i * 70 - 20;
              return (
                <g key={i}>
                  <rect x={x} y={1920 - h} width={w} height={h} fill="#070a1c" stroke="#1a2350" />
                  {new Array(Math.floor(h / 40)).fill(0).map((__, j) => (
                    <rect key={j} x={x + 10} y={1920 - h + 14 + j * 40} width={w - 20} height={10} fill={random(`w${i}${j}`) < interpolate(frame, [broadcast.from, broadcast.to], [0, 1], clamp) ? "#FFE7A3" : "#131a40"} />
                  ))}
                </g>
              );
            })}
          </svg>
          <div style={{ position: "absolute", left: 540 - 60, top: 900 - 60, width: 120, height: 120, borderRadius: "50%", background: colors.accent, boxShadow: "0 0 60px #5E78FF" }} />
          <div style={{ position: "absolute", left: 540 - 260, top: 1000, width: 520 }}>
            <Img src={staticFile("neocapta-logo.png")} style={{ width: "100%" }} />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// "الراديو / On Air" — static clears station by station until the idea is heard across the city.
export const RadioVideo: React.FC = () => (
  <Shell
    bg="#07080d"
    audio="radio-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Heard everywhere.", ar: "نوصل صوت فكرتك" }}
    flashes={[broadcast.from]}
    captions={[
      { from: stat.from + 16, to: stat.to, kicker: "ON AIR · على الهوا", en: "Every idea has a voice.", ar: "كل فكرة لها صوت.", top: 130 },
      { from: lost.from + 4, to: lost.to, en: "But not every voice gets heard.", ar: "بس مو كل صوت يوصل.", enSize: 76, top: 130 },
      { from: answer.from + 4, to: tune.from, kicker: "NEO CAPTA", en: "We find the frequency.", ar: "نحن نلقى الموجة.", top: 130 },
      ...SERVICES.map((s, k) => ({ from: tune.from + k * tune.each + 4, to: k < 4 ? tune.from + (k + 1) * tune.each + 4 : broadcast.from, kicker: `${tune.freqs[k]} FM`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 130 })),
      { from: broadcast.from + 10, to: outro.from, en: "Your idea, heard everywhere.", ar: "صوت فكرتك… يوصل للكل.", enSize: 78, top: 250 },
    ]}
  >
    <Radio />
  </Shell>
);
