import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, silverText } from "../theme";

type Props = {
  en: string;
  ar: string;
  // words (by index) in the English line to highlight in mint
  highlight?: number[];
  wordGap?: number;
  arDelay?: number;
  enSize?: number;
  arSize?: number;
};

// English line revealed word by word (synced to the voice over), Arabic line follows.
export const BilingualTitle: React.FC<Props> = ({
  en,
  ar,
  highlight = [],
  wordGap = 6,
  arDelay = 18,
  enSize = 92,
  arSize = 74,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = en.split(" ");
  const arIn = spring({ frame: frame - arDelay, fps, config: { damping: 200 } });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48, padding: "0 80px" }}>
      <div
        style={{
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: enSize,
          lineHeight: 1.12,
          textAlign: "center",
          letterSpacing: -1,
        }}
      >
        {words.map((w, i) => {
          const p = spring({ frame: frame - i * wordGap, fps, config: { damping: 18, stiffness: 140 } });
          const hl = highlight.includes(i);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity: p,
                transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + p * 0.2})`,
                filter: `blur(${(1 - p) * 14}px)`,
                ...(hl ? { color: colors.mint, textShadow: "0 0 30px rgba(67,214,155,0.6)" } : silverText),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          width: interpolate(arIn, [0, 1], [0, 220]),
          height: 3,
          background: `linear-gradient(90deg, transparent, ${colors.silver}, transparent)`,
        }}
      />
      <div
        dir="rtl"
        style={{
          fontFamily: fonts.ar,
          fontWeight: 700,
          fontSize: arSize,
          lineHeight: 1.5,
          textAlign: "center",
          color: colors.white,
          opacity: arIn,
          transform: `translateY(${(1 - arIn) * 40}px)`,
          filter: `blur(${(1 - arIn) * 10}px)`,
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}
      >
        {ar}
      </div>
    </div>
  );
};
