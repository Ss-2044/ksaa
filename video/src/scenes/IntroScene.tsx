import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";

// Opening: someone flipping through an iPad. Push in towards the screen.
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 60], [1.0, 1.9], { easing: Easing.in(Easing.cubic) });
  const opacity = interpolate(frame, [0, 8, 48, 60], [0, 1, 1, 0]);
  const blur = interpolate(frame, [44, 60], [0, 14], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#000" }}>
      <Img
        src={staticFile("ipad.webp")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "66% 50%",
          transformOrigin: "62% 48%",
          transform: `scale(${scale})`,
          filter: `blur(${blur}px) saturate(0.9) contrast(1.08)`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(1,50,32,0.35), rgba(1,13,9,0.25) 50%, rgba(1,50,32,0.55))" }} />
    </AbsoluteFill>
  );
};
