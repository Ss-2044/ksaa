import React from "react";
import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

const towers = new Array(11).fill(0).map((_, i) => ({
  w: 60 + random(`w${i}`) * 60,
  h: 200 + random(`h${i}`) * 360,
}));

// A city-wide campaign: billboard lighting up over a night skyline, reach counter climbing.
export const CampaignCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = spring({ frame: frame - 3, fps, config: { damping: 20 } });
  const reach = Math.round(interpolate(frame, [0, 24], [120000, 3400000], { extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #050818 0%, #10184a 70%, #1c2a7a 100%)` }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "flex-end", gap: 6 }}>
        {towers.map((t, i) => (
          <div key={i} style={{ width: t.w, height: t.h, background: "#03050f", flexShrink: 0 }} />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 70,
          right: 70,
          height: 400,
          borderRadius: 12,
          border: `8px solid #1b1f33`,
          background: `radial-gradient(circle at 50% 50%, rgba(94,120,255,${0.35 * on}), #02030a 80%)`,
          boxShadow: `0 0 ${140 * on}px rgba(94,120,255,${0.6 * on})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img src={staticFile("neocapta-logo.png")} style={{ width: 360, opacity: on }} />
      </div>
      <div style={{ position: "absolute", top: 650, left: 520, width: 14, height: 300, background: "#1b1f33" }} />
      <div style={{ position: "absolute", top: 44, left: 44, display: "flex", gap: 14, alignItems: "center", padding: "12px 26px", borderRadius: 40, background: "#e0303a", color: colors.white, fontFamily: fonts.en, fontWeight: 800, fontSize: 34 }}>
        <span style={{ opacity: frame % 10 < 5 ? 1 : 0.3 }}>●</span> LIVE CAMPAIGN
      </div>
      <div style={{ position: "absolute", top: 120, left: 44, fontFamily: fonts.en, fontWeight: 800, fontSize: 64, color: colors.white }}>
        {(reach / 1e6).toFixed(1)}M <span style={{ fontSize: 36, color: colors.steel }}>reach</span>
      </div>
      <div dir="rtl" style={{ position: "absolute", bottom: 70, right: 50, fontFamily: fonts.ar, fontWeight: 900, fontSize: 70, color: colors.white, textShadow: "0 4px 20px rgba(0,0,0,0.7)" }}>
        الحملة انطلقت
      </div>
    </AbsoluteFill>
  );
};
