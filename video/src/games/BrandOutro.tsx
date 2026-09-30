import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Shared closing card for the game-themed videos: logo, serif English line, Ruqaa Arabic line.
export const BrandOutro: React.FC<{ en: string; ar: string; children?: React.ReactNode }> = ({ en, ar, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 200 }, durationInFrames: 30 });
  const tag = interpolate(frame, [30, 52], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {children}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 40% at 50% 40%, rgba(94,120,255,0.3), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logo, transform: `translateY(${(1 - logo) * 60}px) scale(${0.9 + logo * 0.1})` }}>
        <Logo width={700} />
      </div>
      <div style={{ position: "absolute", top: 980, left: 60, right: 60, textAlign: "center", opacity: tag }}>
        <div style={{ fontFamily: fonts.serif, fontStyle: "italic", fontSize: 72, color: colors.white, letterSpacing: interpolate(tag, [0, 1], [14, 0]) }}>{en}</div>
        <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 80, color: colors.accent, marginTop: 12 }}>
          {ar}
        </div>
      </div>
    </AbsoluteFill>
  );
};
