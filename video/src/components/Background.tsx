import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

// Slowly rotating deep-green gradient with a drifting silver glow.
export const Background: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const angle = 150 + frame * 0.25;
  const gx = 50 + Math.sin(frame / 70) * 25;
  const gy = 40 + Math.cos(frame / 90) * 20;
  const glow = interpolate(Math.sin(frame / 45), [-1, 1], [0.1, 0.22]) * intensity;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${colors.night} 0%, ${colors.green} 45%, ${colors.emerald} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(213,218,223,${glow}) 0%, rgba(213,218,223,0) 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${100 - gx}% ${100 - gy}%, rgba(67,214,155,${glow * 0.8}) 0%, rgba(67,214,155,0) 50%)`,
        }}
      />
    </AbsoluteFill>
  );
};
