import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";

// "Someone watching an ad" — the viewer's face lit by the screen, with a playing-ad UI.
export const WatchCard: React.FC = () => {
  const frame = useCurrentFrame();
  const flicker = 0.85 + Math.sin(frame * 1.7) * 0.08;
  return (
    <AbsoluteFill>
      <Img
        src={staticFile("me.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "55% 30%",
          transformOrigin: "58% 32%",
          transform: `scale(${interpolate(frame, [0, 30], [1.9, 1.75])})`,
          filter: `brightness(${flicker}) contrast(1.1) saturate(0.8)`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(200deg, rgba(94,120,255,0.35), rgba(0,0,0,0) 45%, rgba(2,3,10,0.85) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 44,
          padding: "12px 26px",
          borderRadius: 40,
          background: colors.accent,
          color: colors.white,
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 34,
        }}
      >
        ▶ Ad · 0:15
      </div>
      <div dir="rtl" style={{ position: "absolute", bottom: 110, right: 50, fontFamily: fonts.ar, fontWeight: 900, fontSize: 70, color: colors.white, textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
        يشاهد الإعلان
      </div>
      <div style={{ position: "absolute", bottom: 60, left: 50, right: 50, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.25)" }}>
        <div style={{ width: `${interpolate(frame, [0, 22], [10, 85], { extrapolateRight: "clamp" })}%`, height: "100%", borderRadius: 5, background: colors.accent }} />
      </div>
    </AbsoluteFill>
  );
};
