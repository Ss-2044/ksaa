import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

// A premium product box on a turntable with a studio light sweep.
export const ProductCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14 } });
  const turn = interpolate(frame, [0, 30], [-28, 12]);
  const sweep = interpolate(frame, [4, 24], [-60, 160]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #1a2466 0%, ${colors.night} 70%)`, alignItems: "center" }}>
      <div style={{ marginTop: 170, perspective: 1400 }}>
        <div
          style={{
            width: 380,
            height: 560,
            borderRadius: 26,
            background: `linear-gradient(160deg, #11163a, #05060f)`,
            border: `3px solid ${colors.steel}`,
            boxShadow: `0 60px 90px rgba(0,0,0,0.8), 0 0 80px rgba(94,120,255,0.35)`,
            transform: `rotateY(${turn}deg) scale(${s})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Img src={staticFile("neocapta-logo.png")} style={{ width: 300 }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(105deg, transparent ${sweep - 15}%, rgba(255,255,255,0.35) ${sweep}%, transparent ${sweep + 15}%)`,
            }}
          />
        </div>
        <div style={{ width: 460, height: 40, margin: "40px auto 0", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(94,120,255,0.5), transparent 70%)" }} />
      </div>
      <div style={{ position: "absolute", top: 44, left: 44, padding: "12px 26px", borderRadius: 40, background: colors.accent, color: colors.white, fontFamily: fonts.en, fontWeight: 800, fontSize: 34 }}>
        NEW
      </div>
      <div dir="rtl" style={{ position: "absolute", bottom: 80, fontFamily: fonts.ar, fontWeight: 900, fontSize: 76, color: colors.white }}>
        منتج جديد
      </div>
    </AbsoluteFill>
  );
};
