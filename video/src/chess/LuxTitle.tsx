import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Elegant serif title: letters tighten in from wide tracking, Arabic in Ruqaa below. Fades out at the end.
export const LuxTitle: React.FC<{ en: string; ar: string; kicker?: string; enSize?: number; arSize?: number; fadeOut?: boolean }> = ({
  en,
  ar,
  kicker,
  enSize = 84,
  arSize = 76,
  fadeOut = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
  const p = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: ease });
  const ar2 = interpolate(frame, [10, 32], [0, 1], { ...clamp, easing: ease });
  const out = fadeOut ? interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp) : 1;
  return (
    <div style={{ textAlign: "center", padding: "0 70px", opacity: out }}>
      {kicker ? (
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, letterSpacing: 10, color: colors.accent, opacity: p, marginBottom: 18 }}>{kicker}</div>
      ) : null}
      <div
        style={{
          fontFamily: fonts.serif,
          fontStyle: "italic",
          fontSize: enSize,
          lineHeight: 1.15,
          color: colors.white,
          letterSpacing: interpolate(p, [0, 1], [18, 0]),
          opacity: p,
          filter: `blur(${(1 - p) * 10}px)`,
        }}
      >
        {en}
      </div>
      <div style={{ width: 160 * p, height: 2, background: `linear-gradient(90deg, transparent, ${colors.accent}, transparent)`, margin: "26px auto" }} />
      <div
        dir="rtl"
        style={{
          fontFamily: fonts.handAr,
          fontSize: arSize,
          lineHeight: 1.35,
          color: colors.silver,
          opacity: ar2,
          transform: `translateY(${(1 - ar2) * 24}px)`,
        }}
      >
        {ar}
      </div>
    </div>
  );
};
