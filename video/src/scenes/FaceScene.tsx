import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Close-up portrait: slow push in, light sweep, brand-blue grade and cinematic bars.
export const FaceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.25, 1.45]);
  const panY = interpolate(frame, [0, durationInFrames], [2, -2]);
  const bars = interpolate(frame, [0, 12], [0, 170], { extrapolateRight: "clamp" });
  const fade = interpolate(frame, [0, 8, durationInFrames - 10, durationInFrames], [0, 1, 1, 0]);
  const sweep = interpolate(frame, [20, 70], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade, overflow: "hidden" }}>
      <Img
        src={staticFile("me.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "55% 35%",
          transformOrigin: "58% 34%",
          transform: `scale(${zoom}) translateY(${panY}%)`,
          filter: "contrast(1.12) saturate(0.75) brightness(0.92)",
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(52,68,153,0.45), rgba(0,0,0,0) 45%, rgba(2,3,10,0.7))", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 35%, rgba(0,0,0,0) 35%, rgba(2,3,10,0.75) 90%)" }} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(110deg, transparent ${sweep - 10}%, rgba(200,210,255,0.22) ${sweep}%, transparent ${sweep + 10}%)`,
          mixBlendMode: "screen",
        }}
      />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bars, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bars, background: "#000" }} />
    </AbsoluteFill>
  );
};
