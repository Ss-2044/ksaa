import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

// Logo reveal with a silver shine sweep and bilingual tagline.
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const shine = interpolate(frame, [18, 50], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag = spring({ frame: frame - 26, fps, config: { damping: 200 } });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const logoW = 1300;
  const logo = staticFile("logo.png");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      <div
        style={{
          position: "relative",
          width: logoW,
          transform: `translateX(-4.5%) scale(${interpolate(s, [0, 1], [1.25, 1])})`,
          opacity: s,
          filter: `blur(${(1 - s) * 16}px)`,
          marginTop: -120,
        }}
      >
        <Img src={logo} style={{ width: logoW, filter: "drop-shadow(0 0 22px rgba(213,218,223,0.45))" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `url(${logo})`,
            WebkitMaskSize: "100% 100%",
            background: `linear-gradient(100deg, transparent ${shine - 12}%, rgba(255,255,255,0.95) ${shine}%, transparent ${shine + 12}%)`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1180,
          textAlign: "center",
          opacity: tag,
          transform: `translateY(${(1 - tag) * 30}px)`,
        }}
      >
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 64, color: colors.white }}>
          حيث تجد الأفكار طريقها
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: 40, letterSpacing: 6, color: colors.silver, marginTop: 10 }}>
          WHERE IDEAS FIND THEIR WAY
        </div>
      </div>
    </AbsoluteFill>
  );
};
