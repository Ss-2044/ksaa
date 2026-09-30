import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import timeline from "../timeline.json";
import { BilingualTitle } from "../components/BilingualTitle";
import { colors } from "../theme";

// "Every idea starts somewhere." — a single spark of light is born.
export const Vo1Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const spark = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 60 } });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const textAt = timeline.vo1At - timeline.vo1Scene.from;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left: 540, top: 620 }}>
        {[0, 1, 2].map((i) => {
          const t = ((frame + i * 25) % 75) / 75;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 700 * t,
                height: 700 * t,
                left: -350 * t,
                top: -350 * t,
                borderRadius: "50%",
                border: `3px solid ${colors.silver}`,
                opacity: (1 - t) * 0.5 * spark,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            left: -30,
            top: -30,
            borderRadius: "50%",
            background: colors.white,
            transform: `scale(${spark * (1 + Math.sin(frame / 6) * 0.08)})`,
            boxShadow: `0 0 60px 20px rgba(246,248,249,0.8), 0 0 200px 80px rgba(67,214,155,0.55)`,
          }}
        />
      </div>
      <Sequence from={textAt} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 640 }}>
          <BilingualTitle en="Every idea starts somewhere." ar="كل فكرة تبدأ من مكانٍ ما." highlight={[3]} wordGap={9} arDelay={40} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
