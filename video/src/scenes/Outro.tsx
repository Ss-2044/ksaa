import React from "react";
import { AbsoluteFill, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Logo, LOGO_RATIO } from "../components/Logo";
import { colors, fonts } from "../theme";

// NEO CAPTA reveal on the halftone artwork, red-carpet style camera flashes, bilingual tagline.
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const shine = interpolate(frame, [22, 55], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const logoW = 820;
  const logo = staticFile("neocapta-logo.png");
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      <Background intensity={1.8} />
      {new Array(6).fill(0).map((_, i) => {
        const at = 6 + Math.floor(random(`o${i}`) * 50);
        const life = frame - at;
        if (life < 0 || life > 4) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: random(`ox${i}`) * 1080 - 200,
              top: random(`oy${i}`) * 1920 - 200,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.9), rgba(0,0,0,0) 65%)",
              opacity: 1 - life / 4,
            }}
          />
        );
      })}
      <div
        style={{
          position: "relative",
          width: logoW,
          height: logoW * LOGO_RATIO,
          marginTop: -160,
          transform: `scale(${interpolate(s, [0, 1], [1.3, 1])})`,
          opacity: s,
          filter: `blur(${(1 - s) * 18}px)`,
        }}
      >
        <Logo width={logoW} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `url(${logo})`,
            WebkitMaskSize: "100% 100%",
            background: `linear-gradient(100deg, transparent ${shine - 12}%, rgba(255,255,255,0.9) ${shine}%, transparent ${shine + 12}%)`,
          }}
        />
      </div>
      <div style={{ position: "absolute", top: 1240, textAlign: "center", opacity: tag, transform: `translateY(${(1 - tag) * 30}px)` }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 70, color: colors.white }}>
          لكل فكرة وجهة
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: 40, letterSpacing: 6, color: colors.accent, marginTop: 6 }}>
          EVERY IDEA, A DIRECTION
        </div>
      </div>
    </AbsoluteFill>
  );
};
