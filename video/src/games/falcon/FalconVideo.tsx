import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { perch, blind, unhood, circles, dive, outro } = timeline;
const PERCH = { x: 560, y: 1330 };
const TARGET = { x: 540, y: 1560 };
const SPIRAL = { x: 540, y: 900 };

// Perched falcon (side view, facing left). `hood` 0..1 lifts the leather hood off.
const Perched: React.FC<{ hood: number; glint: number }> = ({ hood, glint }) => (
  <svg width={260} height={340} viewBox="-130 -300 260 340" style={{ overflow: "visible" }}>
    <path d="M 20 -40 C 60 -20 70 40 40 60 L -10 70 C -30 30 -40 -40 -10 -120 C 0 -150 30 -150 40 -120 C 50 -90 30 -70 20 -40 Z" fill="#6b5a4a" />
    <path d="M 10 -90 C 60 -60 80 20 50 70 L 90 110 L 30 80 C 10 20 0 -40 10 -90 Z" fill="#4a3d31" />
    <path d="M -5 -95 C 5 -60 10 -10 0 40" stroke="#8a7a68" strokeWidth={6} fill="none" opacity={0.6} />
    <circle cx={10} cy={-150} r={34} fill="#6b5a4a" />
    <path d="M -22 -150 L -44 -140 L -24 -132 Z" fill="#e0b64a" />
    <circle cx={-2} cy={-156} r={7} fill="#111" />
    <circle cx={-4} cy={-158} r={2.5} fill="#fff" opacity={glint} />
    {/* hood */}
    <g transform={`translate(${hood * 60} ${-hood * 180}) rotate(${hood * 40} 10 -160)`} opacity={1 - hood}>
      <path d="M -26 -150 C -26 -196 46 -196 46 -150 L 40 -128 L -20 -128 Z" fill="#7a1f1a" stroke="#3a0e0b" strokeWidth={3} />
      <path d="M 10 -190 L 10 -214 M 2 -212 L 18 -212" stroke="#c9a24a" strokeWidth={5} />
    </g>
    {/* claws on the glove */}
    <path d="M -10 70 L -20 86 M 10 70 L 6 88 M 30 66 L 36 84" stroke="#e0b64a" strokeWidth={5} />
  </svg>
);

// Flying falcon, wings flapping by `flap` (-1..1).
const Flying: React.FC<{ flap: number; size?: number }> = ({ flap, size = 1 }) => (
  <svg width={320 * size} height={200 * size} viewBox="-160 -100 320 200" style={{ overflow: "visible" }}>
    <path d={`M -10 0 C -60 ${-30 - flap * 40} -120 ${-50 - flap * 60} -155 ${-20 - flap * 70} C -110 ${-5 - flap * 20} -60 10 -10 14 Z`} fill="#2e2620" />
    <path d={`M 10 0 C 60 ${-30 - flap * 40} 120 ${-50 - flap * 60} 155 ${-20 - flap * 70} C 110 ${-5 - flap * 20} 60 10 10 14 Z`} fill="#2e2620" />
    <path d="M 0 -30 C 16 -30 20 0 12 40 L 22 70 L 0 58 L -22 70 L -12 40 C -20 0 -16 -30 0 -30 Z" fill="#4a3d31" />
    <circle cx={0} cy={-36} r={13} fill="#4a3d31" />
    <path d="M -5 -48 L 0 -58 L 5 -48 Z" fill="#e0b64a" />
  </svg>
);

const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hood = interpolate(frame, [unhood.from + 10, unhood.from + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glint = interpolate(frame, [unhood.from + 40, unhood.from + 50, unhood.from + 70], [0, 1, 0.6], clamp);
  const flying = frame >= circles.from - 16;
  const takeoff = interpolate(frame, [circles.from - 16, circles.from + 10], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });

  // position while circling (5 rising loops), then the dive
  const loops = interpolate(frame, [circles.from, circles.from + 5 * circles.each], [0, 5], clamp);
  const ang = loops * Math.PI * 2 - Math.PI / 2;
  const rad = 330 - loops * 18;
  let fx = SPIRAL.x + Math.cos(ang) * rad;
  let fy = SPIRAL.y - loops * 60 + Math.sin(ang) * rad * 0.45;
  if (frame < circles.from) {
    fx = PERCH.x + (SPIRAL.x + Math.cos(-Math.PI / 2) * 330 - PERCH.x) * takeoff;
    fy = PERCH.y - 150 + (SPIRAL.y - 150 - PERCH.y + 150) * takeoff;
  }
  const dv = interpolate(frame, [dive.from, dive.hit], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const lastX = fx;
  const lastY = fy;
  if (frame >= dive.from) {
    fx = lastX + (TARGET.x - lastX) * dv;
    fy = lastY + (TARGET.y - 60 - lastY) * dv;
  }
  const flap = frame >= dive.from ? -0.8 : Math.sin(frame / 3.2);
  const hit = spring({ frame: frame - dive.hit, fps, config: { damping: 12 } });
  const shock = frame >= dive.hit ? interpolate(frame - dive.hit, [0, 30], [0, 1], clamp) : 0;
  const dusk = interpolate(frame, [circles.from, dive.from], [0, 1], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #050a24 0%, #14246a ${40 + dusk * 10}%, #5a6fd0 72%, #c9d2ff 80%, #2a2440 86%, #120e18 100%)` }} />
      <div style={{ position: "absolute", left: 540 - 180, top: 1330 - 180, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,220,0.95) 0%, rgba(255,220,200,0.4) 40%, rgba(255,255,255,0) 70%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M 0 1480 C 260 1420 480 1450 700 1500 S 980 1450 1080 1470 L 1080 1920 L 0 1920 Z" fill="#1a1522" />
        <path d="M 0 1620 C 300 1560 560 1600 820 1650 S 1020 1620 1080 1630 L 1080 1920 L 0 1920 Z" fill="#0c0a10" />
        {/* the target on the ground */}
        <g transform={`translate(${TARGET.x} ${TARGET.y})`} opacity={interpolate(frame, [unhood.from + 40, unhood.from + 60], [0, 1], clamp)}>
          {[1, 2, 3].map((k) => (
            <ellipse key={k} rx={40 * k + shock * 200} ry={14 * k + shock * 70} fill="none" stroke="#8FA2FF" strokeWidth={4} opacity={(1 - shock) * 0.8} />
          ))}
        </g>
        {/* flight trail */}
        {flying && frame < dive.hit
          ? new Array(20).fill(0).map((_, k) => {
              const f = frame - k * 1.5;
              const l = interpolate(f, [circles.from, circles.from + 5 * circles.each], [0, 5], clamp);
              const a = l * Math.PI * 2 - Math.PI / 2;
              const r = 330 - l * 18;
              return frame >= circles.from ? <circle key={k} cx={SPIRAL.x + Math.cos(a) * r} cy={SPIRAL.y - l * 60 + Math.sin(a) * r * 0.45} r={4 - k * 0.15} fill="#DCE4FF" opacity={(1 - k / 20) * 0.6} /> : null;
            })
          : null}
        {/* dive speed lines */}
        {dv > 0 && dv < 1
          ? new Array(10).fill(0).map((_, k) => (
              <line key={k} x1={fx + (random(`s${k}`) - 0.5) * 120} y1={fy - 80 - random(`t${k}`) * 300} x2={fx + (random(`s${k}`) - 0.5) * 120} y2={fy - 60} stroke="#fff" strokeWidth={3} opacity={0.5} />
            ))
          : null}
      </svg>
      {/* glove + arm */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M 1080 ${PERCH.y + 120} L 700 ${PERCH.y + 70} C 640 ${PERCH.y + 60} 600 ${PERCH.y + 80} 610 ${PERCH.y + 120} L 1080 ${PERCH.y + 230} Z`} fill="#e9e4da" />
        <path d={`M 700 ${PERCH.y + 70} C 640 ${PERCH.y + 60} 600 ${PERCH.y + 80} 610 ${PERCH.y + 120} L 760 ${PERCH.y + 150} L 780 ${PERCH.y + 80} Z`} fill="#8a5a33" />
      </svg>
      {!flying || takeoff < 0.3 ? (
        <div style={{ position: "absolute", left: PERCH.x - 130, top: PERCH.y - 300 + 90, opacity: 1 - takeoff * 3 }}>
          <Perched hood={hood} glint={glint} />
        </div>
      ) : null}
      {flying && takeoff > 0.1 && frame < dive.hit + 4 ? (
        <div style={{ position: "absolute", left: fx - 160, top: fy - 100, transform: `rotate(${frame >= dive.from ? 180 * dv : Math.cos(ang) * 15}deg)` }}>
          <Flying flap={flap} size={frame >= dive.from ? 1 + dv * 0.3 : 0.9} />
        </div>
      ) : null}
      {/* the brand where the falcon struck */}
      <div style={{ position: "absolute", left: TARGET.x - 250, top: TARGET.y - 520, width: 500, opacity: hit, transform: `scale(${0.7 + hit * 0.3})`, filter: "drop-shadow(0 0 30px rgba(140,160,255,0.9))" }}>
        <Img src={staticFile("neocapta-logo-white.png")} style={{ width: "100%" }} />
      </div>
    </AbsoluteFill>
  );
};

// "الصقر / The Falcon" — a hooded falcon is given vision, circles through the services and strikes its target.
export const FalconVideo: React.FC = () => (
  <Shell
    bg="#050a24"
    audio="falcon-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Aim true.", ar: "نوجّه فكرتك لهدفها" }}
    flashes={[dive.hit]}
    captions={[
      { from: perch.from + 20, to: perch.to, kicker: "THE FALCON · الصقر", en: "Every idea is strong…", ar: "كل فكرة قوية…" },
      { from: blind.from + 4, to: blind.to, en: "…but can't see its target.", ar: "…بس ما تشوف هدفها.", enSize: 76 },
      { from: unhood.from + 4, to: unhood.to, kicker: "NEO CAPTA", en: "We give it vision.", ar: "نحن نعطيها الرؤية." },
      ...SERVICES.map((s, k) => ({ from: circles.from + k * circles.each + 4, to: circles.from + (k + 1) * circles.each + (k === 4 ? 0 : 4), kicker: `CIRCLE ${k + 1}`, en: s.en, ar: s.ar, enSize: 96, arSize: 84 })),
      { from: dive.hit + 8, to: outro.from, en: "Straight to the target.", ar: "على الهدف… مباشرة.", enSize: 80 },
    ]}
  >
    <Scene />
  </Shell>
);
