import React from "react";
import { colors } from "../theme";

// Top-down jet silhouette pointing right (+x).
export const Plane: React.FC<{ size?: number; color?: string }> = ({ size = 1, color = colors.silver }) => (
  <g transform={`scale(${size})`}>
    <path d="M -34 -5 L 28 -5 Q 44 0 28 5 L -34 5 Z" fill={color} />
    <path d="M 2 -5 L -14 -42 L -4 -42 L 16 -5 Z" fill={color} />
    <path d="M 2 5 L -14 42 L -4 42 L 16 5 Z" fill={color} />
    <path d="M -28 -5 L -38 -18 L -32 -18 L -20 -5 Z" fill={color} />
    <path d="M -28 5 L -38 18 L -32 18 L -20 5 Z" fill={color} />
  </g>
);
