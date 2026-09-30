import React from "react";
import { Img, staticFile } from "remotion";

export const LOGO_RATIO = 765 / 1041;

export const Logo: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img
    src={staticFile("neocapta-logo.png")}
    style={{ width, height: width * LOGO_RATIO, filter: "drop-shadow(0 0 22px rgba(94,120,255,0.45))", ...style }}
  />
);
