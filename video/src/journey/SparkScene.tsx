import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BilingualTitle } from "../components/BilingualTitle";
import { colors } from "../theme";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BULB =
  "M 540 470 C 390 470 320 600 350 730 C 370 820 435 855 455 920 L 460 985 L 620 985 L 625 920 C 645 855 710 820 730 730 C 760 600 690 470 540 470 Z";
const BASE = "M 470 1025 L 610 1025 M 490 1065 L 590 1065";
const FILAMENT = "M 500 930 L 510 790 L 540 845 L 570 790 L 580 930";

// Scene 1 — a line sketches a light bulb, it lights up: "Every idea starts somewhere."
export const SparkScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const g = timeline.spark.glowAt;
  const draw = interpolate(frame, [4, g - 4], [1, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glow = interpolate(frame, [g, g + 6, g + 30], [0, 1, 0.8], clamp);
  const rays = interpolate(frame, [g, g + 20], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 420,
          top: 730 - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(94,120,255,0.75) 0%, rgba(94,120,255,0.18) 40%, rgba(0,0,0,0) 70%)",
          opacity: glow,
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {new Array(12).fill(0).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r1 = 260 + rays * 40;
          const r2 = r1 + rays * 90;
          return (
            <line
              key={i}
              x1={540 + Math.cos(a) * r1}
              y1={730 + Math.sin(a) * r1}
              x2={540 + Math.cos(a) * r2}
              y2={730 + Math.sin(a) * r2}
              stroke={colors.silver}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={rays * (1 - rays * 0.4)}
            />
          );
        })}
        <path d={BULB} fill={`rgba(228,230,238,${glow * 0.18})`} stroke={colors.silver} strokeWidth={8} strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={draw} />
        <path d={BASE} stroke={colors.silver} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={draw} fill="none" />
        <path
          d={FILAMENT}
          stroke={glow > 0 ? colors.white : colors.steel}
          strokeWidth={7}
          fill="none"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={draw}
          style={{ filter: `drop-shadow(0 0 ${glow * 24}px #FFFFFF)` }}
        />
      </svg>
      <Sequence from={g + 6} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 900 }}>
          <BilingualTitle en="Every idea starts somewhere." ar="كل فكرة تبدأ من مكانٍ ما." highlight={[3]} wordGap={4} arDelay={16} enSize={84} arSize={64} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
