import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { blueprint, fonts } from "../theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Final drawing sheet: border with registration ticks, the logo plotted in, title block.
export const BlueprintOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
  const border = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: ease });
  const plot = interpolate(frame, [12, 44], [0, 100], { ...clamp, easing: ease });
  const tag = interpolate(frame, [40, 60], [0, 1], { ...clamp, easing: ease });
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #1541A6 0%, ${blueprint.paper} 55%, ${blueprint.paperDeep} 100%)` }} />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(234,241,255,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(234,241,255,0.12) 2px, transparent 2px)",
          backgroundSize: "180px 180px",
        }}
      />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={50} y={50} width={980} height={1820} fill="none" stroke={blueprint.line} strokeWidth={4} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - border} />
        <rect x={70} y={70} width={940} height={1780} fill="none" stroke={blueprint.line} strokeWidth={1.5} opacity={border * 0.6} />
        {new Array(9).fill(0).map((_, i) => (
          <g key={i} opacity={border} stroke={blueprint.line} strokeWidth={2}>
            <line x1={50 + (i + 1) * 98} y1={50} x2={50 + (i + 1) * 98} y2={70} />
            <line x1={50 + (i + 1) * 98} y1={1850} x2={50 + (i + 1) * 98} y2={1870} />
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Img src={staticFile("neocapta-logo-white.png")} style={{ width: 640, clipPath: `inset(0 0 ${100 - plot}% 0)`, filter: "drop-shadow(0 0 24px rgba(190,210,255,0.5))" }} />
        <div style={{ position: "absolute", top: `${(plot / 100) * 470}px`, left: 200, right: 200, height: 3, background: blueprint.lit, opacity: plot > 0 && plot < 100 ? 1 : 0, boxShadow: "0 0 16px #FFE7A3" }} />
      </div>
      <div style={{ position: "absolute", top: 1100, left: 110, right: 110, opacity: tag, transform: `translateY(${(1 - tag) * 24}px)` }}>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 88, color: blueprint.line, letterSpacing: -2 }}>We build ideas.</div>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 84, color: blueprint.lit, textAlign: "right" }}>
          نبني الأفكار.
        </div>
      </div>
      <div style={{ position: "absolute", right: 90, bottom: 90, width: 440, border: `2px solid ${blueprint.line}`, fontFamily: fonts.mono, fontSize: 20, color: blueprint.line, opacity: tag }}>
        {[
          ["CLIENT", "YOUR IDEA"],
          ["STUDIO", "NEO CAPTA"],
          ["STATUS", "APPROVED ✓"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", borderBottom: `1px solid ${blueprint.faint}` }}>
            <div style={{ width: 140, padding: "8px 12px", borderRight: `1px solid ${blueprint.faint}`, color: blueprint.lit }}>{k}</div>
            <div style={{ padding: "8px 12px" }}>{v}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
