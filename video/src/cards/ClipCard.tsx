import React from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";

type Props = { src: string; tagEn: string; tagAr: string; progress?: boolean; live?: boolean };

// Uses a trimmed shot from the uploaded clip, with an overlay UI.
export const ClipCard: React.FC<Props> = ({ src, tagEn, tagAr, progress, live }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: "30% 70%",
          transform: `scale(${interpolate(frame, [0, 30], [1.35, 1.25])})`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(1,13,9,0.5) 0%, rgba(0,0,0,0) 30%, rgba(1,13,9,0.85) 100%)" }} />
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 44,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 26px",
          borderRadius: 40,
          background: live ? "#e0303a" : colors.mint,
          color: live ? colors.white : colors.night,
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 34,
        }}
      >
        {live ? <span style={{ opacity: frame % 10 < 5 ? 1 : 0.3 }}>●</span> : null}
        {tagEn}
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          bottom: progress ? 110 : 70,
          right: 50,
          fontFamily: fonts.ar,
          fontWeight: 900,
          fontSize: 70,
          color: colors.white,
          textShadow: "0 4px 20px rgba(0,0,0,0.6)",
        }}
      >
        {tagAr}
      </div>
      {progress ? (
        <div style={{ position: "absolute", bottom: 60, left: 50, right: 50, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.25)" }}>
          <div
            style={{
              width: `${interpolate(frame, [0, 22], [10, 85], { extrapolateRight: "clamp" })}%`,
              height: "100%",
              borderRadius: 5,
              background: colors.mint,
            }}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
