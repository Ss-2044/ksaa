import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, light } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Latin only: Arabic shaping breaks on an SVG textPath.
const RING_TEXT = "NEO CAPTA · EVERY IDEA · A DIRECTION · NEO CAPTA · 2026 · ";

// Scene 5 — dark logo on paper inside a rotating seal, editorial tagline.
export const PassportOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 14 } });
  const ring = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const tag = interpolate(frame, [30, 50], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: out }}>
      <div style={{ position: "absolute", top: 330, width: 820, height: 820 }}>
        <svg width={820} height={820} style={{ position: "absolute", inset: 0, transform: `rotate(${frame * 0.6}deg) scale(${0.8 + ring * 0.2})`, opacity: ring }}>
          <defs>
            <path id="seal" d="M 410 410 m -345 0 a 345 345 0 1 1 690 0 a 345 345 0 1 1 -690 0" />
          </defs>
          <circle cx={410} cy={410} r={395} fill="none" stroke={light.ink} strokeWidth={4} />
          <circle cx={410} cy={410} r={300} fill="none" stroke={light.royal} strokeWidth={3} strokeDasharray="4 12" />
          <text fontFamily="Montserrat" fontWeight={800} fontSize={40} letterSpacing={6} fill={light.ink}>
            <textPath href="#seal">{RING_TEXT}</textPath>
          </text>
        </svg>
        <Img
          src={staticFile("neocapta-logo-dark.png")}
          style={{ position: "absolute", left: 410 - 230, top: 410 - 170, width: 460, transform: `scale(${logo})`, opacity: logo }}
        />
      </div>
      <div style={{ position: "absolute", top: 1250, left: 70, right: 70, opacity: tag, transform: `translateY(${(1 - tag) * 30}px)` }}>
        <div style={{ height: 6, background: light.ink, width: `${tag * 100}%` }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 26 }}>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 64, letterSpacing: -2, color: light.ink, lineHeight: 1.05 }}>
            Every idea,
            <br />
            <span style={{ color: light.royal }}>a direction.</span>
          </div>
          <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 70, color: light.royal }}>
            لكل فكرة وجهة
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
