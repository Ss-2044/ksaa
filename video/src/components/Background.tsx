import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

// Deep navy gradient with a drifting halftone light band, echoing the NEO CAPTA logo artwork.
export const Background: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();
  const angle = 150 + frame * 0.2;
  const band = ((frame * 0.25) % 160) - 30;
  const glow = interpolate(Math.sin(frame / 45), [-1, 1], [0.12, 0.25]) * intensity;
  const bandMask = `linear-gradient(125deg, transparent ${band - 22}%, #000 ${band}%, transparent ${band + 22}%)`;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${colors.night} 0%, ${colors.deep} 45%, ${colors.navy} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 70% 30%, rgba(52,68,153,${glow * 2}) 0%, rgba(52,68,153,0) 60%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.55 * intensity,
          backgroundImage:
            "radial-gradient(circle, rgba(228,230,238,0.9) 0 2.6px, transparent 3.2px), radial-gradient(circle, rgba(94,120,255,0.9) 0 2.6px, transparent 3.2px)",
          backgroundSize: "18px 18px, 18px 18px",
          backgroundPosition: "0 0, 9px 9px",
          WebkitMaskImage: bandMask,
          maskImage: bandMask,
        }}
      />
    </AbsoluteFill>
  );
};
