import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { blueprint, fonts } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Plotter-style caption: mono kicker, English typed out with a cursor, Arabic fades in.
export const BlueprintTitle: React.FC<{ kicker: string; en: string; ar: string; size?: number; arSize?: number }> = ({ kicker, en, ar, size = 82, arSize = 64 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const chars = Math.floor(interpolate(frame, [4, 4 + en.length * 1.2], [0, en.length], clamp));
  const typing = chars < en.length;
  const arIn = interpolate(frame, [4 + en.length * 1.2, 16 + en.length * 1.2], [0, 1], clamp);
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);
  return (
    <div style={{ padding: "0 70px", opacity: out }}>
      <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: blueprint.lit, marginBottom: 16 }}>{kicker}</div>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: size, lineHeight: 1.1, color: blueprint.line, letterSpacing: -1, minHeight: size * 1.1 }}>
        {en.slice(0, chars)}
        <span style={{ opacity: typing || frame % 16 < 8 ? 1 : 0, color: blueprint.lit }}>▍</span>
      </div>
      <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: arSize, color: blueprint.line, textAlign: "right", marginTop: 14, opacity: arIn * 0.95, transform: `translateY(${(1 - arIn) * 20}px)` }}>
        {ar}
      </div>
    </div>
  );
};
