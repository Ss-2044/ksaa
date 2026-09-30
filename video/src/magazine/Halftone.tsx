import React from "react";
import { AbsoluteFill } from "remotion";

// Static halftone light band like the NEO CAPTA artwork.
export const Halftone: React.FC<{ angle?: number; at?: number; opacity?: number }> = ({ angle = 125, at = 70, opacity = 0.7 }) => {
  const mask = `linear-gradient(${angle}deg, transparent ${at - 28}%, #000 ${at}%, transparent ${at + 28}%)`;
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage:
          "radial-gradient(circle, rgba(228,230,238,0.95) 0 3.4px, transparent 4.2px), radial-gradient(circle, rgba(94,120,255,0.95) 0 3.4px, transparent 4.2px)",
        backgroundSize: "22px 22px, 22px 22px",
        backgroundPosition: "0 0, 11px 11px",
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
};
