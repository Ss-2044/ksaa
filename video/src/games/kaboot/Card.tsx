import React from "react";
import { Img, staticFile } from "remotion";
import { colors, fonts } from "../../theme";
import { Suit, SuitIcon } from "../Suits";

export const CW = 220;
export const CH = 320;

export const CardBack: React.FC = () => (
  <div
    style={{
      width: CW,
      height: CH,
      borderRadius: 18,
      background: `repeating-linear-gradient(45deg, #2B3A9A 0 10px, #344499 10px 20px)`,
      border: "8px solid #F4F5FA",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
    }}
  >
    <div style={{ width: 150, height: 150, borderRadius: "50%", background: colors.night, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${colors.silver}` }}>
      <Img src={staticFile("neocapta-logo.png")} style={{ width: 118 }} />
    </div>
  </div>
);

export const CardFace: React.FC<{ rank: string; suit: Suit; en?: string; ar?: string; logo?: boolean }> = ({ rank, suit, en, ar, logo }) => {
  const red = suit === "heart" || suit === "diamond";
  const ink = red ? "#C8263B" : "#0A0D1F";
  return (
    <div style={{ width: CW, height: CH, borderRadius: 18, background: "#FBFBF8", position: "relative", overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
      {logo ? (
        <div style={{ position: "absolute", inset: 10, borderRadius: 12, background: colors.night, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("neocapta-logo.png")} style={{ width: 170 }} />
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", top: 12, left: 14, textAlign: "center", color: ink }}>
            <div style={{ fontFamily: fonts.serif, fontWeight: 700, fontSize: 42, lineHeight: 1 }}>{rank}</div>
            <SuitIcon suit={suit} size={30} />
          </div>
          <div style={{ position: "absolute", bottom: 12, right: 14, textAlign: "center", color: ink, transform: "rotate(180deg)" }}>
            <div style={{ fontFamily: fonts.serif, fontWeight: 700, fontSize: 42, lineHeight: 1 }}>{rank}</div>
            <SuitIcon suit={suit} size={30} />
          </div>
          <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <SuitIcon suit={suit} size={110} />
          </div>
          {en ? (
            <div style={{ position: "absolute", bottom: 58, left: 10, right: 10, textAlign: "center" }}>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 21, letterSpacing: 1, color: colors.royal }}>{en}</div>
              <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 26, color: "#0A0D1F", lineHeight: 1.2 }}>
                {ar}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};
