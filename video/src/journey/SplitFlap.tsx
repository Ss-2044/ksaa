import React from "react";
import { random, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type Props = {
  text: string;
  settleAt: number; // frame the first character lands on its letter (Infinity = never)
  cycleFrom?: number; // frame the tiles start spinning
  stagger?: number;
  length?: number; // pad to a fixed number of tiles
  size?: number; // tile height
  seed?: string;
  color?: string;
};

// Airport split-flap display: each tile spins through letters, then lands left to right.
export const SplitFlap: React.FC<Props> = ({
  text,
  settleAt,
  cycleFrom = 0,
  stagger = 2,
  length,
  size = 72,
  seed = "flap",
  color = colors.white,
}) => {
  const frame = useCurrentFrame();
  const chars = (length ? text.padEnd(length, " ") : text).split("");
  const w = size * 0.7;
  return (
    <div style={{ display: "flex", gap: size * 0.06 }} dir="ltr">
      {chars.map((c, i) => {
        const landed = frame >= settleAt + i * stagger;
        const spinning = !landed && frame >= cycleFrom;
        const tick = Math.floor(frame / 2);
        const shown = landed ? c : spinning ? CHARSET[Math.floor(random(`${seed}-${i}-${tick}`) * CHARSET.length)] : " ";
        const flip = spinning && frame % 2 === 0;
        return (
          <div
            key={i}
            style={{
              width: w,
              height: size,
              borderRadius: size * 0.08,
              background: "linear-gradient(180deg, #151a3a 0%, #0c1030 50%, #080b24 50%, #0b0f2c 100%)",
              boxShadow: "inset 0 0 0 1px rgba(228,230,238,0.08), 0 4px 10px rgba(0,0,0,0.5)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <span
              style={{
                fontFamily: fonts.en,
                fontWeight: 800,
                fontSize: size * 0.62,
                color: landed ? color : colors.silver,
                transform: `scaleY(${flip ? 0.55 : 1})`,
                opacity: flip ? 0.6 : 1,
              }}
            >
              {shown}
            </span>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "rgba(0,0,0,0.65)" }} />
          </div>
        );
      })}
    </div>
  );
};
