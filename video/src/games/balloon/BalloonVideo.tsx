import React from "react";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { colors } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { ground, stuck, fire, rise, above, outro } = timeline;
const WORLD = 4800; // world height; the camera climbs it
const B = { x: 540 };

const Balloon: React.FC<{ inflate: number; flame: number }> = ({ inflate, flame }) => (
  <svg width={520} height={760} viewBox="-260 -520 520 760" style={{ overflow: "visible" }}>
    <g transform={`scale(${0.35 + inflate * 0.65}, ${0.2 + inflate * 0.8}) translate(0 ${(1 - inflate) * 260})`}>
      {[colors.royal, "#F4F5FA", colors.accent, "#F4F5FA", colors.royal, "#F4F5FA", colors.accent].map((c, i) => {
        const x0 = -240 + i * (480 / 7);
        const x1 = x0 + 480 / 7;
        return <path key={i} d={`M 0 -500 C ${x0 * 1.6} -480 ${x0 * 1.3} -60 ${x0 * 0.3} 110 L ${x1 * 0.3} 110 C ${x1 * 1.3} -60 ${x1 * 1.6} -480 0 -500 Z`} fill={c} stroke="#0A1033" strokeWidth={2} />;
      })}
      <g transform="translate(-130 -330)">
        <rect x={0} y={0} width={260} height={200} rx={18} fill="#0A1033" opacity={0.85} />
        <image href={staticFile("neocapta-logo-white.png")} x={20} y={12} width={220} height={176} />
      </g>
    </g>
    {flame > 0 ? <path d={`M -18 130 Q 0 ${130 - 120 * flame} 18 130 Z`} fill="#FFB84A" style={{ filter: "drop-shadow(0 0 20px #ffb84a)" }} /> : null}
    <path d="M -50 150 L 50 150 L 44 220 L -44 220 Z" fill="#8a5a33" stroke="#3f2a18" strokeWidth={3} />
    <path d="M -50 150 L -70 110 M 50 150 L 70 110 M -20 150 L -30 110 M 20 150 L 30 110" stroke="#3f2a18" strokeWidth={3} />
  </svg>
);

const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const inflate = interpolate(frame, [ground.from, stuck.from, stuck.to, fire.to], [0.1, 0.45, 0.35, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const burns = SERVICES.filter((_, k) => frame >= rise.from + k * rise.each).length;
  let flame = frame >= fire.from + 20 && frame < fire.to ? 1 : 0;
  for (let k = 0; k < 5; k++) {
    const s = rise.from + k * rise.each;
    if (frame >= s && frame < s + 30) flame = 0.7 + 0.3 * Math.sin(frame * 1.3);
  }
  // altitude: each burn lifts the balloon one step; ease between
  let alt = 0;
  for (let k = 0; k < 5; k++) alt += interpolate(frame, [rise.from + k * rise.each, rise.from + k * rise.each + 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) }) * 520;
  alt += interpolate(frame, [above.from, above.to], [0, 200], clamp);
  const camY = Math.min(WORLD - 1920, alt); // world scrolls down as we climb
  const sun = interpolate(frame, [0, above.to], [0, 1], clamp);
  const bob = Math.sin(frame / 20) * 12;

  return (
    <AbsoluteFill>
      {/* sky shifts from dusk to golden light above the clouds */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${sun > 0.7 ? "#26357e" : "#0f1a4a"} 0%, #5a6fd0 40%, #ffb86b ${70 - sun * 10}%, #ffdca8 85%, #d99a5a 100%)` }} />
      <div style={{ position: "absolute", left: 540 - 220, top: 1180 - sun * 300, width: 440, height: 440, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,200,1) 0%, rgba(255,200,120,0.5) 40%, rgba(255,200,120,0) 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: WORLD, transform: `translateY(${-(WORLD - 1920) + camY}px)` }}>
        <svg width={1080} height={WORLD} style={{ position: "absolute", inset: 0 }}>
          {/* AlUla-style sandstone rocks on the ground */}
          <path d={`M 0 ${WORLD - 300} L 60 ${WORLD - 520} C 90 ${WORLD - 600} 200 ${WORLD - 610} 230 ${WORLD - 520} L 260 ${WORLD - 300} Z`} fill="#8a4a2a" />
          <path d={`M 760 ${WORLD - 300} L 800 ${WORLD - 640} C 830 ${WORLD - 720} 960 ${WORLD - 720} 990 ${WORLD - 620} L 1040 ${WORLD - 300} Z`} fill="#7a3f24" />
          <rect x={0} y={WORLD - 300} width={1080} height={300} fill="#c07a44" />
          <path d={`M 0 ${WORLD - 300} C 300 ${WORLD - 330} 700 ${WORLD - 280} 1080 ${WORLD - 310} L 1080 ${WORLD - 280} L 0 ${WORLD - 270} Z`} fill="#d99a5a" />
          {/* birds */}
          {new Array(5).fill(0).map((_, i) => {
            const x = ((random(`bx${i}`) * 1080 + frame * (2 + i)) % 1200) - 60;
            const y = WORLD - 1300 - i * 90;
            const w = Math.sin(frame / 4 + i) * 10;
            return <path key={i} d={`M ${x - 20} ${y - w} Q ${x - 10} ${y - 12} ${x} ${y} Q ${x + 10} ${y - 12} ${x + 20} ${y - w}`} stroke="#2a1f14" strokeWidth={4} fill="none" />;
          })}
          {/* cloud layer */}
          {new Array(10).fill(0).map((_, i) => {
            const x = ((random(`cx${i}`) * 1300 + frame * 0.6) % 1400) - 160;
            const y = WORLD - 2500 + random(`cy${i}`) * 260;
            const w = 260 + random(`cw${i}`) * 220;
            return <ellipse key={i} cx={x} cy={y} rx={w} ry={w * 0.32} fill="rgba(255,244,230,0.9)" />;
          })}
          {/* altitude markers: one per service */}
          {SERVICES.map((s, k) => {
            const y = WORLD - 900 - k * 520;
            const on = k < burns;
            return (
              <g key={s.en} opacity={on ? 1 : 0.3}>
                <line x1={70} x2={200} y1={y} y2={y} stroke="#fff" strokeWidth={3} strokeDasharray="10 8" />
                <text x={70} y={y - 16} fill="#fff" fontFamily="Aref Ruqaa" fontSize={38} style={{ paintOrder: "stroke" }} stroke="rgba(0,0,0,0.35)" strokeWidth={6}>
                  {s.ar}
                </text>
              </g>
            );
          })}
        </svg>
        {/* the balloon, placed in world space */}
        <div style={{ position: "absolute", left: B.x - 260, top: WORLD - 300 - 760 - alt + 20 + bob }}>
          <Balloon inflate={inflate} flame={flame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// "المنطاد / The Balloon" — every burst of flame lifts the idea higher, from the desert floor above the clouds.
export const BalloonVideo: React.FC = () => (
  <Shell
    bg="#0f1a4a"
    audio="balloon-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "Rising above.", ar: "نرفع فكرتك… لفوق" }}
    captions={[
      { from: ground.from + 16, to: ground.to, kicker: "THE BALLOON · المنطاد", en: "Every idea wants to rise.", ar: "كل فكرة تبي ترتفع.", top: 200 },
      { from: stuck.from + 4, to: stuck.to, en: "But it's stuck on the ground.", ar: "بس لاصقة بالأرض.", enSize: 76, top: 200 },
      { from: fire.from + 4, to: rise.from, kicker: "NEO CAPTA", en: "We light the fire.", ar: "نحن نشعل النار.", top: 200 },
      ...SERVICES.map((s, k) => ({ from: rise.from + k * rise.each + 4, to: k < 4 ? rise.from + (k + 1) * rise.each + 4 : above.from, kicker: `FLAME ${k + 1}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 180 })),
      { from: above.from + 20, to: outro.from, en: "Above the clouds.", ar: "فوق الغيوم.", enSize: 84, top: 200 },
    ]}
  >
    <Sky />
  </Shell>
);
