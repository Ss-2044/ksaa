import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BilingualTitle } from "../components/BilingualTitle";
import { Logo } from "../components/Logo";
import { colors } from "../theme";

// The answer to "not every idea knows where to go": the scattered paths straighten into one arrow.
export const AnswerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const draw = interpolate(frame, [0, 22], [1, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const logo = spring({ frame: frame - 16, fps, config: { damping: 200 } });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M 140 1000 L 860 1000 M 800 950 L 860 1000 L 800 1050"
          stroke={colors.accent}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={draw}
          style={{ filter: "drop-shadow(0 0 20px #5E78FF)" }}
        />
      </svg>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logo, transform: `scale(${0.85 + logo * 0.15})` }}>
        <Logo width={560} />
      </div>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 700 }}>
        <BilingualTitle en="We give every idea a direction." ar="نحن نمنح كل فكرة وجهتها." highlight={[5]} wordGap={4} arDelay={22} enSize={80} arSize={64} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
