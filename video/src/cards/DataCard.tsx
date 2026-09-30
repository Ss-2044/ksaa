import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";

const stats = [
  { label: "Reach · الوصول", value: 2.4, suffix: "M", decimals: 1 },
  { label: "Engagement · التفاعل", value: 128, suffix: "%", decimals: 0, prefix: "+" },
  { label: "Clicks · النقرات", value: 86500, suffix: "", decimals: 0 },
];

export const DataCard: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${colors.night}, ${colors.green})`, padding: 60, gap: 34 }}>
      {stats.map((s, i) => (
        <div
          key={s.label}
          style={{
            borderRadius: 32,
            padding: "34px 44px",
            background: "rgba(213,218,223,0.07)",
            border: "2px solid rgba(213,218,223,0.2)",
            transform: `translateX(${(1 - t) * (i + 1) * 120}px)`,
          }}
        >
          <div style={{ fontFamily: fonts.ar, fontSize: 36, color: colors.steel }}>{s.label}</div>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 120, color: i === 1 ? colors.mint : colors.white }}>
            {s.prefix ?? ""}
            {(s.value * t).toLocaleString("en-US", { minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals })}
            {s.suffix}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 170, flexShrink: 0, padding: "0 10px" }}>
        {[0.4, 0.6, 0.5, 0.8, 0.7, 1, 0.9].map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h * 100 * interpolate(frame, [i * 1.5, i * 1.5 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
              borderRadius: 12,
              background: `linear-gradient(180deg, ${colors.mint}, ${colors.emerald})`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
