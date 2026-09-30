import React from "react";
import { Img, staticFile } from "remotion";

export const Logo: React.FC<{ width: number; style?: React.CSSProperties }> = ({ width, style }) => (
  <Img
    src={staticFile("logo.png")}
    style={{ width, height: "auto", filter: "drop-shadow(0 0 18px rgba(213,218,223,0.35))", ...style }}
  />
);
