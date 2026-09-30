import React from "react";

type Kind = "pawn" | "queen" | "king" | "rook";
const BASE = "M 14 152 L 86 152 L 80 132 L 20 132 Z";
const shapes: Record<Kind, string[]> = {
  pawn: [BASE, "M 28 132 C 30 105 40 92 40 80 L 60 80 C 60 92 70 105 72 132 Z", "M 30 80 L 70 80 L 66 70 L 34 70 Z"],
  queen: [BASE, "M 24 132 C 28 100 36 80 38 60 L 62 60 C 64 80 72 100 76 132 Z", "M 30 60 L 22 26 L 38 44 L 50 16 L 62 44 L 78 26 L 70 60 Z"],
  king: [BASE, "M 24 132 C 28 100 36 80 38 60 L 62 60 C 64 80 72 100 76 132 Z", "M 32 60 L 35 34 L 65 34 L 68 60 Z"],
  rook: [BASE, "M 30 132 L 34 62 L 66 62 L 70 132 Z", "M 24 62 L 24 28 L 36 28 L 36 40 L 44 40 L 44 28 L 56 28 L 56 40 L 64 40 L 64 28 L 76 28 L 76 62 Z"],
};

// Flat, modern chess piece silhouettes (viewBox 100x160). "light" = NEO CAPTA side, "dark" = opponent.
export const Piece: React.FC<{ kind: Kind; side: "light" | "dark"; width: number; glow?: number }> = ({ kind, side, width, glow = 0 }) => {
  const id = `${kind}-${side}`;
  const stroke = side === "light" ? "#5E78FF" : "#8A90A8";
  return (
    <svg width={width} height={width * 1.6} viewBox="0 0 100 160" style={{ overflow: "visible" }}>
      <defs>
        {/* glow lives inside the SVG: a CSS filter on an element in a 3D scene paints a dark box */}
        <filter id={`${id}-glow`} x="-60%" y="-40%" width="220%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation={3 + glow * 12} floodColor="#5E78FF" floodOpacity={0.35 + glow * 0.6} />
        </filter>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          {side === "light" ? (
            <>
              <stop offset="0%" stopColor="#8E95AE" />
              <stop offset="45%" stopColor="#F7F8FC" />
              <stop offset="100%" stopColor="#A9AFC4" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#000000" />
              <stop offset="45%" stopColor="#2A2D38" />
              <stop offset="100%" stopColor="#050507" />
            </>
          )}
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-glow)`}>
      {shapes[kind].map((d, i) => (
        <path key={i} d={d} fill={`url(#${id})`} stroke={stroke} strokeWidth={2} />
      ))}
      {kind === "pawn" ? <circle cx={50} cy={48} r={22} fill={`url(#${id})`} stroke={stroke} strokeWidth={2} /> : null}
      {kind === "queen"
        ? [
            [22, 24],
            [50, 13],
            [78, 24],
          ].map(([x, y]) => <circle key={x} cx={x} cy={y} r={6} fill={`url(#${id})`} stroke={stroke} strokeWidth={2} />)
        : null}
      {kind === "king" ? (
        <>
          <rect x={45} y={2} width={10} height={32} fill={`url(#${id})`} stroke={stroke} strokeWidth={2} />
          <rect x={36} y={11} width={28} height={9} fill={`url(#${id})`} stroke={stroke} strokeWidth={2} />
        </>
      ) : null}
      </g>
    </svg>
  );
};
