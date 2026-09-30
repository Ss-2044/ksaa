import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Short light-leak flash, placed inside a <Sequence> at a cut.
export const Flash: React.FC<{ duration?: number; color?: string }> = ({
  duration = 10,
  color = "rgba(246,248,249,1)",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 2, duration], [0, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `radial-gradient(circle at 70% 30%, ${color} 0%, rgba(67,214,155,0.5) 40%, rgba(0,0,0,0) 80%)`,
        mixBlendMode: "screen",
      }}
    />
  );
};
