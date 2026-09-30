import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

export const RestaurantCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(circle at 50% 35%, #7a3b12 0%, #2a1206 60%, #120803 100%)",
        alignItems: "center",
        paddingTop: 110,
        color: colors.white,
      }}
    >
      <div
        style={{
          fontSize: 360,
          transform: `rotate(${interpolate(frame, [0, 24], [-25, 0])}deg) scale(${spring({ frame, fps, config: { damping: 10 } })})`,
        }}
      >
        🍽️
      </div>
      <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 88, marginTop: 20 }}>
        مطعم البيت
      </div>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 56, letterSpacing: 8, color: "#f3c98b" }}>
        RESTAURANT
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
        {new Array(5).fill(0).map((_, i) => {
          const s = spring({ frame: frame - 3 - i * 2, fps, config: { damping: 8 } });
          return (
            <span key={i} style={{ fontSize: 80, color: "#f5b93a", transform: `scale(${s})`, display: "inline-block" }}>
              ★
            </span>
          );
        })}
      </div>
      <div style={{ fontFamily: fonts.en, fontSize: 44, marginTop: 20, color: colors.silver }}>4.9 · 2,310 reviews</div>
      <div style={{ display: "flex", gap: 30, fontSize: 110, marginTop: 50 }}>
        <span>🥘</span>
        <span>🍔</span>
        <span>🥗</span>
      </div>
    </AbsoluteFill>
  );
};
