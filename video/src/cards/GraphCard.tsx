import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const pts = [
  [40, 900], [140, 860], [240, 880], [340, 760], [440, 790], [540, 600], [640, 520], [770, 260],
];
const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

export const GraphCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [0, 20], [1, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const badge = spring({ frame: frame - 14, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(200deg, ${colors.green}, ${colors.night})` }}>
      <svg width={808} height={1148}>
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.mint} stopOpacity={0.5} />
            <stop offset="100%" stopColor={colors.mint} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[300, 500, 700, 900].map((y) => (
          <line key={y} x1={40} x2={770} y1={y} y2={y} stroke="rgba(213,218,223,0.12)" strokeWidth={2} />
        ))}
        <clipPath id="reveal">
          <rect x={0} y={0} height={1148} width={40 + (1 - draw) * 740} />
        </clipPath>
        <path d={`${line} L 770 1000 L 40 1000 Z`} fill="url(#area)" clipPath="url(#reveal)" />
        <path
          d={line}
          stroke={colors.mint}
          strokeWidth={12}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={draw}
          style={{ filter: "drop-shadow(0 0 16px #43D69B)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 60,
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 140,
          color: colors.white,
          transform: `scale(${badge})`,
          transformOrigin: "left center",
        }}
      >
        +240% <span style={{ color: colors.mint }}>↑</span>
      </div>
      <div dir="rtl" style={{ position: "absolute", bottom: 60, right: 60, fontFamily: fonts.ar, fontWeight: 700, fontSize: 60, color: colors.silver }}>
        نمو المبيعات · Growth
      </div>
    </AbsoluteFill>
  );
};
