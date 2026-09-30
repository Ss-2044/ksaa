import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { fonts, light } from "../theme";
import { EditorialTitle } from "./Editorial";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene 1 — giant "فكرة / IDEA" type, then the editorial headline "Every idea starts somewhere."
export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { splitAt } = timeline.opening;
  const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
  const word = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: ease });
  const shrink = interpolate(frame, [splitAt - 6, splitAt + 10], [0, 1], { ...clamp, easing: Easing.bezier(0.7, 0, 0.3, 1) });
  const idea = interpolate(frame, [0, splitAt + 10], [-120, 60]);
  return (
    <AbsoluteFill>
      {/* outlined IDEA drifting behind */}
      <div
        style={{
          position: "absolute",
          top: 560 - shrink * 330,
          left: idea,
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 420,
          letterSpacing: -20,
          color: "transparent",
          WebkitTextStroke: `4px ${light.royal}`,
          opacity: 0.35 + word * 0.35 - shrink * 0.35,
          whiteSpace: "nowrap",
        }}
      >
        IDEA
      </div>
      {/* big Arabic word, clipped reveal then slides up into a smaller position */}
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: interpolate(shrink, [0, 1], [560, 250]),
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: fonts.ar,
          fontWeight: 900,
          fontSize: interpolate(shrink, [0, 1], [330, 150]),
          lineHeight: 1.2,
          color: light.royal,
          clipPath: `inset(0 0 ${(1 - word) * 100}% 0)`,
        }}
      >
        فكرة
      </div>
      <Sequence from={splitAt + 4} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", paddingTop: 480 }}>
          <EditorialTitle
            label="01 — THE START · البداية"
            lines={[{ text: "Every idea" }, { text: "starts" }, { text: "somewhere.", color: light.royal }]}
            ar="كل فكرة تبدأ من مكانٍ ما."
            size={138}
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
