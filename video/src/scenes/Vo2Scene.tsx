import React from "react";
import { AbsoluteFill, Sequence, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "../timeline.json";
import { BilingualTitle } from "../components/BilingualTitle";
import { colors } from "../theme";

const CX = 540;
const CY = 600;

// Paths that wander off in every direction and never arrive anywhere.
const paths = new Array(16).fill(0).map((_, i) => {
  let x = CX;
  let y = CY;
  let a = (i / 16) * Math.PI * 2 + random(`a-${i}`) * 0.4;
  let d = `M ${x} ${y}`;
  for (let s = 0; s < 5; s++) {
    a += (random(`t-${i}-${s}`) - 0.5) * 2.2;
    const len = 70 + random(`l-${i}-${s}`) * 90;
    const cx = x + Math.cos(a) * len * 0.6;
    const cy = y + Math.sin(a) * len * 0.6;
    x += Math.cos(a) * len;
    y += Math.sin(a) * len;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return { d, end: { x, y }, delay: random(`d-${i}`) * 20 };
});

export const Vo2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const textAt = timeline.vo2At - timeline.vo2Scene.from;
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {paths.map((p, i) => {
          const draw = interpolate(frame, [p.delay, p.delay + 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const fadeOut = interpolate(frame, [p.delay + 80, p.delay + 130], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={i} opacity={fadeOut}>
              <path
                d={p.d}
                stroke={i % 3 === 0 ? colors.mint : colors.silver}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="1"
                pathLength={1}
                strokeDashoffset={draw}
                opacity={0.8}
              />
              <text
                x={p.end.x}
                y={p.end.y}
                fill={colors.silver}
                fontSize={46}
                fontFamily="Montserrat"
                fontWeight={800}
                textAnchor="middle"
                opacity={interpolate(draw, [0, 0.05], [1, 0], { extrapolateRight: "clamp" })}
              >
                ?
              </text>
            </g>
          );
        })}
        <circle cx={CX} cy={CY} r={26} fill={colors.white} style={{ filter: "drop-shadow(0 0 30px #43D69B)" }} />
      </svg>
      <Sequence from={textAt} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 780 }}>
          <BilingualTitle
            en="But not every idea knows where to go."
            ar="لكن ليست كل فكرة تعرف إلى أين تذهب."
            highlight={[5, 6, 7]}
            wordGap={8}
            arDelay={50}
            enSize={84}
            arSize={56}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
