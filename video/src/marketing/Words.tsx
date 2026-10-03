import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../theme";

// Social-style kinetic text: words pop in one after another. Arabic flows right-to-left.
export const Words: React.FC<{
  text: string;
  size: number;
  color: string;
  ar?: boolean;
  delay?: number;
  gap?: number;
  highlight?: number[]; // word indexes drawn on an accent block
  hlColor?: string;
  weight?: number;
}> = ({ text, size, color, ar = true, delay = 0, gap = 3, highlight = [], hlColor = "#5E78FF", weight = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div dir={ar ? "rtl" : "ltr"} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${size * 0.12}px ${size * 0.28}px`, padding: "0 60px" }}>
      {words.map((w, i) => {
        const p = spring({ frame: frame - delay - i * gap, fps, config: { damping: 11, stiffness: 180 } });
        const hl = highlight.includes(i);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: ar ? fonts.ar : fonts.en,
              fontWeight: weight,
              fontSize: size,
              lineHeight: 1.25,
              color,
              opacity: Math.min(1, p * 1.4),
              transform: `translateY(${(1 - p) * size * 0.5}px) scale(${0.6 + p * 0.4})`,
              padding: hl ? `0 ${size * 0.18}px` : 0,
              borderRadius: hl ? size * 0.16 : 0,
              background: hl ? hlColor : "transparent",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
