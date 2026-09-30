import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

export const AdCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill>
      <Img
        src={staticFile("cabin.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${interpolate(frame, [0, 40], [1.25, 1.05])})`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,12,40,0.1) 30%, rgba(2,3,10,0.92) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 60,
          right: 50,
          width: 190,
          height: 190,
          borderRadius: "50%",
          background: colors.accent,
          color: colors.night,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 62,
          transform: `scale(${pop}) rotate(${(1 - pop) * -40}deg)`,
        }}
      >
        -30%
      </div>
      <div style={{ position: "absolute", bottom: 90, left: 60, right: 60 }}>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 96, color: colors.white, lineHeight: 1 }}>
          FLY BEYOND
        </div>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 80, color: colors.silver }}>
          حلّق أبعد
        </div>
      </div>
    </AbsoluteFill>
  );
};
