import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Close-up on the face, graded to the brand palette with cinematic bars.
export const FaceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.14, 1.2]);
  const bars = interpolate(frame, [0, 10], [0, 170], { extrapolateRight: "clamp" });
  const fade = interpolate(frame, [0, 6, durationInFrames - 8, durationInFrames], [0, 1, 1, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <OffthreadVideo
        src={staticFile("face.mp4")}
        muted
        playbackRate={0.9}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${zoom})`,
          transformOrigin: "15% 90%",
          filter: "contrast(1.12) saturate(0.85) brightness(0.95)",
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(160deg, rgba(1,50,32,0.35), rgba(0,0,0,0) 50%, rgba(11,107,69,0.3))", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bars, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bars, background: "#000" }} />
    </AbsoluteFill>
  );
};
