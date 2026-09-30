import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../theme";

// A handwritten idea on lined paper.
export const IdeaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const writeAr = interpolate(frame, [4, 26], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const writeEn = interpolate(frame, [18, 38], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bulb = spring({ frame: frame - 30, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill
      style={{
        background: "#f4efe2",
        backgroundImage:
          "repeating-linear-gradient(180deg, transparent 0px, transparent 78px, rgba(60,110,160,0.28) 78px, rgba(60,110,160,0.28) 80px)",
      }}
    >
      <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, width: 3, background: "rgba(200,60,60,0.45)" }} />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 190,
          transform: `scale(${bulb})`,
          filter: `drop-shadow(0 0 ${bulb * 40}px rgba(255,210,60,0.9))`,
        }}
      >
        💡
      </div>
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 460,
          right: 70,
          left: 130,
          fontFamily: fonts.handAr,
          fontSize: 110,
          color: "#1c2b4a",
          clipPath: `inset(0 0 0 ${100 - writeAr}%)`,
          textAlign: "center",
        }}
      >
        فكرة...
      </div>
      <div
        style={{
          position: "absolute",
          top: 680,
          left: 130,
          right: 70,
          fontFamily: fonts.handEn,
          fontSize: 130,
          color: "#1c2b4a",
          clipPath: `inset(0 ${100 - writeEn}% 0 0)`,
          textAlign: "center",
        }}
      >
        An idea...
      </div>
      <svg width={808} height={1148} style={{ position: "absolute", inset: 0 }}>
        <path
          d="M 220 900 C 330 950, 480 950, 590 890"
          stroke="#1c2b4a"
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={interpolate(frame, [36, 48], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
        />
      </svg>
    </AbsoluteFill>
  );
};
