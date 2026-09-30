import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { stalled, lost, crew, stop, race, outro } = timeline;
const CAR = { x: 540, y: 1180 };

// Top-down F1 car in NEO CAPTA livery (pointing up). `tires` = which wheels have been changed.
const Car: React.FC<{ tires: boolean[]; wing: boolean }> = ({ tires, wing }) => (
  <svg width={300} height={640} viewBox="-150 -320 300 640" style={{ overflow: "visible" }}>
    {[
      [-120, -190],
      [120, -190],
      [-120, 170],
      [120, 170],
    ].map(([x, y], i) => (
      <rect key={i} x={x - 32} y={y - 55} width={64} height={110} rx={14} fill={tires[i] ? "#1b1d26" : "#3a2e2a"} stroke={tires[i] ? colors.accent : "#6b4a3a"} strokeWidth={5} />
    ))}
    <rect x={-140} y={-310} width={280} height={40} rx={8} fill={wing ? colors.accent : "#56607a"} />
    <rect x={-120} y={260} width={240} height={46} rx={8} fill={colors.royal} />
    <path d="M -30 -300 L 30 -300 L 50 -120 L 95 -60 L 95 140 L 60 260 L -60 260 L -95 140 L -95 -60 L -50 -120 Z" fill={colors.royal} stroke="#E4E6EE" strokeWidth={4} />
    <path d="M -22 -280 L 22 -280 L 30 -140 L -30 -140 Z" fill="#0A1033" />
    <ellipse cx={0} cy={-40} rx={34} ry={50} fill="#0A1033" stroke="#E4E6EE" strokeWidth={3} />
    <circle cx={0} cy={-40} r={20} fill={colors.accent} />
    <rect x={-60} y={40} width={120} height={70} rx={10} fill="#0A1033" />
    <text x={0} y={85} textAnchor="middle" fill="#E4E6EE" fontFamily="Montserrat" fontWeight={800} fontSize={26}>
      NC
    </text>
  </svg>
);

// Crew member seen from above (helmet + shoulders).
const Crew: React.FC<{ active: boolean; label?: string }> = ({ active, label }) => (
  <div style={{ position: "relative", width: 90, height: 90 }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: active ? colors.accent : "#2a3052", border: "5px solid #E4E6EE", boxShadow: active ? "0 0 30px #5E78FF" : "none" }} />
    <div style={{ position: "absolute", left: 22, top: 22, width: 46, height: 46, borderRadius: "50%", background: "#0A1033" }} />
    {label ? (
      <div style={{ position: "absolute", top: 96, left: -80, width: 250, textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: active ? colors.white : colors.steel }}>{label}</div>
    ) : null}
  </div>
);

const CREW_POS = [
  { x: -250, y: -190 },
  { x: 250, y: -190 },
  { x: -250, y: 170 },
  { x: 250, y: 170 },
  { x: 0, y: -440 },
];

const Pit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const done = (k: number) => frame >= stop.start + k * stop.each + 30;
  const tires = [0, 1, 2, 3].map((k) => done(k));
  const arrive = interpolate(frame, [stop.arrive, stop.start], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const launch = interpolate(frame, [stop.go + 4, race.from + 30], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // before the stop the car is stalled up the lane, then it rolls into the box
  let carY = CAR.y + 900 * (1 - arrive);
  const stalledShow = frame < crew.from;
  carY -= launch * 2200;
  const timer = interpolate(frame, [stop.start, stop.go], [0, 2.4], clamp);
  const goLight = frame >= stop.go;
  const crewIn = spring({ frame: frame - crew.from, fps, config: { damping: 14 } });
  const lostWander = frame >= lost.from && frame < crew.from;
  const finish = frame >= race.finish;
  const flag = spring({ frame: frame - race.finish, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      {/* pit lane asphalt */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, #15171d 0%, #22252e 50%, #15171d 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.3, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1.5px)", backgroundSize: "5px 5px" }} />
      <div style={{ position: "absolute", left: 140, top: 0, bottom: 0, width: 10, background: "repeating-linear-gradient(180deg, #E4E6EE 0 60px, transparent 60px 110px)", transform: `translateY(${(launch * 800) % 110}px)` }} />
      <div style={{ position: "absolute", right: 140, top: 0, bottom: 0, width: 10, background: "repeating-linear-gradient(180deg, #E4E6EE 0 60px, transparent 60px 110px)", transform: `translateY(${(launch * 800) % 110}px)` }} />
      {/* pit box markings */}
      <div style={{ position: "absolute", left: CAR.x - 200, top: CAR.y - 360, width: 400, height: 720, border: `6px solid ${colors.accent}`, borderRadius: 10, opacity: 0.6 * (1 - launch) }} />

      {/* stalled car + smoke (up the lane before the stop) */}
      {stalledShow ? (
        <>
          <div style={{ position: "absolute", left: CAR.x - 150, top: CAR.y - 320 }}>
            <Car tires={[false, false, false, false]} wing={false} />
          </div>
          {new Array(8).fill(0).map((_, i) => {
            const t = ((frame + i * 12) % 90) / 90;
            return <div key={i} style={{ position: "absolute", left: CAR.x - 40 + (random(`sm${i}`) - 0.5) * 100, top: CAR.y + 280 - t * 400, width: 90 + t * 120, height: 90 + t * 120, borderRadius: "50%", background: "rgba(160,160,170,0.35)", opacity: 1 - t, filter: "blur(8px)" }} />;
          })}
        </>
      ) : (
        <div style={{ position: "absolute", left: CAR.x - 150, top: carY - 320 }}>
          <Car tires={tires} wing={done(4)} />
        </div>
      )}
      {/* speed lines on launch */}
      {launch > 0 && launch < 1
        ? new Array(14).fill(0).map((_, i) => <div key={i} style={{ position: "absolute", left: 200 + random(`l${i}`) * 680, top: 0, width: 4, height: 1920, background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.5), transparent)", opacity: launch }} />)
        : null}

      {/* crew */}
      {frame >= lost.from && frame < race.from
        ? CREW_POS.map((p, k) => {
            const wx = lostWander ? Math.sin(frame / 9 + k * 2) * 160 + (random(`wx${k}`) - 0.5) * 400 : 0;
            const wy = lostWander ? Math.cos(frame / 11 + k) * 160 + (random(`wy${k}`) - 0.5) * 300 : 0;
            const settle = interpolate(frame, [crew.from, crew.from + 24], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
            const x = CAR.x + p.x + wx * (1 - settle);
            const y = CAR.y + p.y + wy * (1 - settle) + (frame < crew.from ? 300 : 0) * (1 - settle);
            const s = stop.start + k * stop.each;
            const active = frame >= s && frame < s + stop.each;
            return (
              <div key={k} style={{ position: "absolute", left: x - 45, top: y - 45, transform: `scale(${lostWander ? 0.9 : crewIn})`, opacity: interpolate(frame, [lost.from, lost.from + 12], [0, 1], clamp) * (1 - launch) }}>
                <Crew active={active || done(k)} label={frame >= crew.from ? SERVICES[k].en.toUpperCase() : undefined} />
              </div>
            );
          })
        : null}

      {/* timer + lollipop light */}
      {frame >= stop.arrive && frame < race.from + 20 ? (
        <div style={{ position: "absolute", top: 1590, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 130, color: goLight ? colors.accent : colors.white, textShadow: goLight ? "0 0 30px #5E78FF" : "none" }}>{timer.toFixed(2)}s</div>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 22, letterSpacing: 6, color: colors.steel }}>{goLight ? "GO · انطلق" : "SLOW MOTION ×10"}</div>
        </div>
      ) : null}

      {/* finish line + result */}
      {frame >= race.from + 20 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1500, height: 80, backgroundImage: "conic-gradient(#fff 25%, #0A1033 0 50%, #fff 0 75%, #0A1033 0)", backgroundSize: "80px 80px", transform: `translateY(${interpolate(frame, [race.from + 20, race.finish], [900, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)` }} />
          {finish ? (
            <div style={{ position: "absolute", top: 820, left: 0, right: 0, textAlign: "center", transform: `scale(${interpolate(flag, [0, 1], [2.4, 1])})`, opacity: Math.min(1, flag * 2) }}>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 240, color: colors.white, lineHeight: 1, textShadow: "0 0 40px rgba(94,120,255,0.9)" }}>P1</div>
              <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 90, color: colors.accent }}>
                المركز الأول
              </div>
              <Img src={staticFile("neocapta-logo.png")} style={{ width: 300, marginTop: 20 }} />
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// "البت ستوب / Pit Stop" — the crew (our services) turn a stalled idea around in 2.4 seconds and it wins.
export const PitStopVideo: React.FC = () => (
  <Shell
    bg="#15171d"
    audio="pitstop-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Race-ready.", ar: "نجهّز فكرتك للسباق" }}
    flashes={[stop.go, race.finish]}
    captions={[
      { from: stalled.from + 16, to: stalled.to, kicker: "PIT STOP · البت ستوب", en: "Every idea needs to be race-ready.", ar: "كل فكرة لازم تكون جاهزة للسباق.", enSize: 72, arSize: 68 },
      { from: lost.from + 4, to: lost.to, en: "But not every team knows what to fix.", ar: "بس مو كل فريق يعرف وش يصلّح.", enSize: 72, arSize: 68 },
      { from: crew.from + 4, to: stop.start, kicker: "NEO CAPTA", en: "Meet the crew.", ar: "هذا فريقنا." },
      ...SERVICES.map((s, k) => ({ from: stop.start + k * stop.each + 2, to: k < 4 ? stop.start + (k + 1) * stop.each + 2 : stop.go, kicker: `CREW ${k + 1}`, en: s.en, ar: s.ar, enSize: 92, arSize: 80, top: 230 })),
      { from: race.finish + 16, to: outro.from, en: "From the pit… to P1.", ar: "من الصيانة… للمركز الأول.", enSize: 76, arSize: 72 },
    ]}
  >
    <Pit />
  </Shell>
);
