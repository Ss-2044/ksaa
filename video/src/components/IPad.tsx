import React from "react";
import { colors } from "../theme";

export const IPAD = { width: 880, height: 1220, bezel: 36 };

// A clean iPad frame in the logo's silver tones. Children render inside the screen.
export const IPad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: IPAD.width,
      height: IPAD.height,
      borderRadius: 78,
      padding: IPAD.bezel,
      boxSizing: "border-box",
      background: "#0c0f0e",
      boxShadow: `0 0 0 5px ${colors.steel}, 0 0 0 8px ${colors.silver}, 0 60px 140px rgba(0,0,0,0.7), 0 0 120px rgba(67,214,155,0.18)`,
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 13,
        left: "50%",
        width: 11,
        height: 11,
        marginLeft: -5,
        borderRadius: "50%",
        background: "#1d2a2f",
      }}
    />
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 44,
        overflow: "hidden",
        position: "relative",
        background: "#000",
      }}
    >
      {children}
      {/* glass reflection */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 35%)",
          pointerEvents: "none",
        }}
      />
    </div>
  </div>
);
