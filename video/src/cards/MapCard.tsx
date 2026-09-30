import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";

const W = 808;
const H = 1148;
const streets = new Array(22).fill(0).map((_, i) => {
  const vertical = i % 2 === 0;
  const p = random(`street-${i}`) * (vertical ? W : H);
  const tilt = (random(`tilt-${i}`) - 0.5) * 160;
  return vertical ? `M ${p} 0 L ${p + tilt} ${H}` : `M 0 ${p} L ${W} ${p + tilt}`;
});
const pins = [
  { x: 220, y: 360 },
  { x: 560, y: 520 },
  { x: 330, y: 800 },
  { x: 620, y: 930 },
];

export const MapCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const route = interpolate(frame, [2, 26], [1, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#08261b" }}>
      <svg width={W} height={H} style={{ transform: `scale(${interpolate(frame, [0, 30], [1.15, 1])})` }}>
        <path d={`M -20 700 C 200 600, 400 900, ${W + 20} 760`} stroke="#0f4a5a" strokeWidth={70} fill="none" />
        {streets.map((d, i) => (
          <path key={i} d={d} stroke="rgba(213,218,223,0.18)" strokeWidth={i % 5 === 0 ? 10 : 4} fill="none" />
        ))}
        <path
          d="M 220 360 Q 420 380 560 520 T 330 800 T 620 930"
          stroke={colors.mint}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={route}
          style={{ filter: "drop-shadow(0 0 12px #43D69B)" }}
        />
        {pins.map((p, i) => {
          const s = spring({ frame: frame - i * 4, fps, config: { damping: 9 } });
          return (
            <g key={i} transform={`translate(${p.x} ${p.y - (1 - s) * 120}) scale(${s})`}>
              <circle r={36 + (frame % 20) * 2} fill="none" stroke={colors.mint} strokeOpacity={1 - (frame % 20) / 20} />
              <path d="M 0 0 C -30 -40 -30 -80 0 -80 C 30 -80 30 -40 0 0 Z" fill={colors.silver} />
              <circle cy={-55} r={11} fill={colors.green} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
