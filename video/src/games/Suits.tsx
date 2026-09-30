import React from "react";

export type Suit = "spade" | "heart" | "diamond" | "club";

// Card suit glyphs as paths (viewBox 0 0 100 100) so they never depend on font coverage.
const PATHS: Record<Suit, string> = {
  heart: "M 50 88 C 20 64 6 48 6 30 C 6 16 17 6 30 6 C 39 6 46 11 50 19 C 54 11 61 6 70 6 C 83 6 94 16 94 30 C 94 48 80 64 50 88 Z",
  diamond: "M 50 4 L 88 50 L 50 96 L 12 50 Z",
  spade: "M 50 6 C 72 30 94 44 94 62 C 94 76 83 84 72 84 C 64 84 57 80 54 74 L 60 96 L 40 96 L 46 74 C 43 80 36 84 28 84 C 17 84 6 76 6 62 C 6 44 28 30 50 6 Z",
  club: "M 50 6 C 62 6 71 15 71 27 C 71 33 69 37 66 41 C 70 39 74 38 78 38 C 89 38 97 47 97 58 C 97 70 88 79 77 79 C 68 79 61 74 56 67 L 62 96 L 38 96 L 44 67 C 39 74 32 79 23 79 C 12 79 3 70 3 58 C 3 47 11 38 22 38 C 26 38 30 39 34 41 C 31 37 29 33 29 27 C 29 15 38 6 50 6 Z",
};

export const SuitIcon: React.FC<{ suit: Suit; size: number; color?: string }> = ({ suit, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d={PATHS[suit]} fill={color ?? (suit === "heart" || suit === "diamond" ? "#C8263B" : "#0A0D1F")} />
  </svg>
);
