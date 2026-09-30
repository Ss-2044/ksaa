import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "../components/useFonts";
import { colors, fonts } from "../theme";
import { GraphCard } from "../cards/GraphCard";
import { MapCard } from "../cards/MapCard";
import { Logo } from "../components/Logo";

const Page: React.FC<{ children: React.ReactNode; left: boolean }> = ({ children, left }) => (
  <div style={{ width: 1200, height: 1600, position: "relative", overflow: "hidden", background: colors.night }}>
    {children}
    <AbsoluteFill
      style={{
        background: left
          ? "linear-gradient(90deg, rgba(0,0,0,0) 85%, rgba(0,0,0,0.55) 100%)"
          : "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 15%)",
      }}
    />
  </div>
);

const Header: React.FC<{ ar: string; en: string }> = ({ ar, en }) => (
  <div style={{ position: "absolute", top: 60, left: 70, right: 70, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
    <Logo width={200} />
    <div style={{ textAlign: "right" }}>
      <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 56, color: colors.white }}>
        {ar}
      </div>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 5, color: colors.accent }}>{en}</div>
    </div>
  </div>
);

// Open magazine spread (two pages) for the "flipping through the magazine" shots.
// Render the still at the last frame so the chart and route animations are complete.
export const MagazineSpread: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ flexDirection: "row", background: "#000" }}>
      <Page left>
        <Header ar="نمو يُقاس" en="Measured growth" />
        <div style={{ position: "absolute", top: 300, left: 60, transform: "scale(1.25)", transformOrigin: "top left" }}>
          <div style={{ width: 808, height: 1000, position: "relative", overflow: "hidden", borderRadius: 24 }}>
            <GraphCard />
          </div>
        </div>
      </Page>
      <Page left={false}>
        <Header ar="كل فكرة لها طريق" en="Every idea has a road" />
        <div style={{ position: "absolute", top: 300, left: 70, transform: "scale(1.25)", transformOrigin: "top left" }}>
          <div style={{ width: 808, height: 1000, position: "relative", overflow: "hidden", borderRadius: 24 }}>
            <MapCard />
          </div>
        </div>
      </Page>
    </AbsoluteFill>
  );
};
