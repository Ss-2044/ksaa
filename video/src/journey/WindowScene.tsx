import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BilingualTitle } from "../components/BilingualTitle";
import { colors } from "../theme";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WW = 700;
const WH = 980;
const CX = WW / 2;
const CY = WH / 2;
const MAXD = Math.hypot(CX, CY);

const lights = new Array(320).fill(0).map((_, i) => {
  const x = random(`lx${i}`) * WW;
  const y = random(`ly${i}`) * WH;
  const d = Math.hypot(x - CX, y - CY) / MAXD;
  const warm = random(`lc${i}`) > 0.35;
  return { x, y, d, r: 2 + random(`lr${i}`) * 4, color: warm ? "#FFD48A" : random(`lb${i}`) > 0.5 ? "#E4E6EE" : "#7E93FF", jitter: random(`lj${i}`) * 10 };
});
const blocks = new Array(90).fill(0).map((_, i) => ({
  x: random(`bx${i}`) * WW,
  y: random(`by${i}`) * WH,
  w: 20 + random(`bw${i}`) * 60,
  h: 20 + random(`bh${i}`) * 60,
}));
const HIGHWAYS = [
  "M -20 820 C 180 700, 300 640, 720 560",
  "M 120 -20 C 220 300, 380 600, 460 1000",
  "M -20 260 C 250 330, 480 300, 720 180",
];

// Scene 5 — window seat: the shade lifts on a night city whose lights switch on around NEO CAPTA.
export const WindowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { shadeUp, lightsFrom, lightsTo, logoAt, pushFrom } = timeline.arrival;
  const shade = interpolate(frame, [4, shadeUp], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const logo = interpolate(frame, [logoAt, logoAt + 20], [0, 1], clamp);
  const push = interpolate(frame, [pushFrom, durationInFrames], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const drift = interpolate(frame, [0, durationInFrames], [0, -60]);
  const q1Out = interpolate(frame, [100, 110], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #151a2c 0%, #0b0e1c 60%, #05060e 100%)" }}>
      {/* cabin panel lines */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 180px)" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
        <div
          style={{
            transform: `scale(${1 + push * 2.4})`,
            transformOrigin: "50% 45%",
            opacity: 1 - push * 0.3,
          }}
        >
          {/* window frame */}
          <div
            style={{
              width: WW + 70,
              height: WH + 70,
              borderRadius: 340,
              padding: 35,
              boxSizing: "border-box",
              background: "linear-gradient(145deg, #d9dce6 0%, #9ea4b8 45%, #6d7390 100%)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.7), inset 0 4px 12px rgba(255,255,255,0.5)",
            }}
          >
            <div style={{ width: WW, height: WH, borderRadius: 310, overflow: "hidden", position: "relative", boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)" }}>
              {/* city at night, seen from above */}
              <div style={{ position: "absolute", inset: 0, background: "#03050f", transform: `translateY(${drift}px) scale(1.08)` }}>
                <svg width={WW} height={WH + 120}>
                  {blocks.map((b, i) => (
                    <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#0a0f26" />
                  ))}
                  {HIGHWAYS.map((d, i) => (
                    <g key={i}>
                      <path d={d} stroke="#12183a" strokeWidth={16} fill="none" />
                      <path
                        d={d}
                        stroke={i === 1 ? "#FF6A5A" : "#FFE2A8"}
                        strokeWidth={4}
                        fill="none"
                        strokeDasharray="10 30"
                        strokeDashoffset={-frame * (4 + i)}
                        opacity={interpolate(frame, [lightsFrom, lightsFrom + 20], [0, 0.9], clamp)}
                      />
                    </g>
                  ))}
                  {lights.map((l, i) => {
                    const on = lightsFrom + l.d * (lightsTo - lightsFrom) + l.jitter;
                    const o = interpolate(frame, [on, on + 5], [0, 1], clamp);
                    const twinkle = 0.75 + 0.25 * Math.sin(frame / 4 + i);
                    return <circle key={i} cx={l.x} cy={l.y} r={l.r} fill={l.color} opacity={o * twinkle} style={{ filter: `drop-shadow(0 0 6px ${l.color})` }} />;
                  })}
                </svg>
                {/* the brand glowing at the heart of the city */}
                <div
                  style={{
                    position: "absolute",
                    left: CX - 330,
                    top: CY - 330,
                    width: 660,
                    height: 660,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(94,120,255,0.55) 0%, rgba(94,120,255,0.12) 45%, rgba(0,0,0,0) 70%)",
                    opacity: logo,
                  }}
                />
                <Img
                  src={staticFile("neocapta-logo.png")}
                  style={{
                    position: "absolute",
                    left: CX - 190,
                    top: CY - 140,
                    width: 380,
                    opacity: logo,
                    transform: `scale(${0.85 + logo * 0.15})`,
                    filter: "drop-shadow(0 0 24px rgba(126,147,255,0.9))",
                  }}
                />
              </div>
              {/* window shade */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, #c9ccd6, #aeb3c2)",
                  transform: `translateY(${-shade * 102}%)`,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ position: "absolute", bottom: 26, left: "50%", width: 120, height: 16, marginLeft: -60, borderRadius: 8, background: "#8c91a3" }} />
              </div>
              {/* glass reflection */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(130deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 35%)" }} />
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Sequence from={lightsFrom} durationInFrames={110 - lightsFrom} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, opacity: q1Out * (1 - push) }}>
          <BilingualTitle en="Your idea has landed." ar="وصلت فكرتك." highlight={[3]} wordGap={4} arDelay={12} enSize={80} arSize={62} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={112} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, opacity: 1 - push }}>
          <BilingualTitle en="And everyone can see it." ar="والكل يشوفها." highlight={[2, 3]} wordGap={4} arDelay={12} enSize={80} arSize={62} />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ background: colors.white, opacity: interpolate(push, [0.6, 1], [0, 0.35], clamp), mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
