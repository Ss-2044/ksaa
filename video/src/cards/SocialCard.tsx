import React from "react";
import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";

export const SocialCard: React.FC = () => {
  const frame = useCurrentFrame();
  const likes = Math.round(interpolate(frame, [0, 24], [1200, 48900], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: "#0b0f0e", fontFamily: fonts.en, color: colors.white }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "40px 40px 28px" }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: `conic-gradient(${colors.mint}, ${colors.silver}, ${colors.emerald}, ${colors.mint})`,
            padding: 5,
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: colors.green }} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 38 }}>talent.club</div>
          <div style={{ fontSize: 28, color: colors.steel }}>Sponsored · مُموَّل</div>
        </div>
      </div>
      <div
        style={{
          height: 700,
          background: `linear-gradient(135deg, ${colors.emerald}, ${colors.night})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Img src={staticFile("logo.png")} style={{ width: 900, transform: `scale(${interpolate(frame, [0, 24], [1, 1.08])})` }} />
        {new Array(9).fill(0).map((_, i) => {
          const start = i * 2;
          const life = frame - start;
          if (life < 0) return null;
          const x = 120 + random(`h-${i}`) * 560;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                bottom: 40 + life * 22,
                fontSize: 70 + random(`s-${i}`) * 40,
                opacity: interpolate(life, [0, 4, 18], [0, 1, 0], { extrapolateRight: "clamp" }),
              }}
            >
              ❤️
            </div>
          );
        })}
      </div>
      <div style={{ padding: 40, fontSize: 60, display: "flex", gap: 36 }}>
        <span>❤️</span>
        <span>💬</span>
        <span>📤</span>
      </div>
      <div style={{ padding: "0 40px", fontWeight: 800, fontSize: 44 }}>{likes.toLocaleString("en-US")} likes</div>
    </AbsoluteFill>
  );
};
