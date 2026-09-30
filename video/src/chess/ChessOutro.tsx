import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Logo over a receding checkerboard floor, serif tagline.
export const ChessOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = spring({ frame: frame - 8, fps, config: { damping: 200 }, durationInFrames: 30 });
  const tag = interpolate(frame, [34, 56], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 900 }}>
        <div
          style={{
            position: "absolute",
            left: -900,
            right: -900,
            top: 1150,
            height: 2400,
            transformOrigin: "50% 0",
            transform: `rotateX(72deg) translateY(${-(frame * 3) % 230}px)`,
            backgroundImage: "conic-gradient(#D5D9E4 25%, #14161d 0 50%, #D5D9E4 0 75%, #14161d 0)",
            backgroundSize: "230px 230px",
            opacity: 0.55,
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 30%)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 40% at 50% 38%, rgba(94,120,255,0.3), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logo, transform: `translateY(${(1 - logo) * 60}px) scale(${0.9 + logo * 0.1})` }}>
        <Logo width={700} />
      </div>
      <div style={{ position: "absolute", top: 930, left: 0, right: 0, textAlign: "center", opacity: tag }}>
        <div style={{ fontFamily: fonts.serif, fontStyle: "italic", fontSize: 76, color: colors.white, letterSpacing: interpolate(tag, [0, 1], [14, 0]) }}>Your next move.</div>
        <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 78, color: colors.accent, marginTop: 12 }}>
          خطوتك القادمة… تبدأ هنا
        </div>
      </div>
    </AbsoluteFill>
  );
};
