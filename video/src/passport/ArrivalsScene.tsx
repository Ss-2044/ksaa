import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, light } from "../theme";
import { EditorialTitle } from "./Editorial";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const arrivals = [
  { code: "STR", en: "Strategy", ar: "الاستراتيجية", value: 0, text: "CLEAR PLAN", unit: "خطة واضحة" },
  { code: "BRD", en: "Branding", ar: "الهوية البصرية", value: 85, prefix: "+", suffix: "%", unit: "تذكّر العلامة" },
  { code: "CNT", en: "Content", ar: "صناعة المحتوى", value: 1.2, suffix: "M", decimals: 1, unit: "مشاهدة" },
  { code: "CMP", en: "Campaigns", ar: "الحملات الإعلانية", value: 3.4, suffix: "M", decimals: 1, unit: "وصول" },
  { code: "GRW", en: "Growth", ar: "النمو", value: 240, prefix: "+", suffix: "%", unit: "نمو" },
];

// Landing plane pictogram (airport signage style).
const LandingIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <g transform="rotate(20 50 50)">
      <path d="M 12 47 L 78 47 Q 92 50 78 53 L 12 53 Z" fill={color} />
      <path d="M 40 47 L 30 20 L 38 20 L 56 47 Z" fill={color} />
      <path d="M 40 53 L 30 80 L 38 80 L 56 53 Z" fill={color} />
      <path d="M 16 47 L 9 36 L 14 36 L 22 47 Z" fill={color} />
    </g>
    <rect x={8} y={88} width={84} height={6} fill={color} />
  </svg>
);

const Row: React.FC<{ r: (typeof arrivals)[number]; landAt: number }> = ({ r, landAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame: frame - (landAt - 18), fps, config: { damping: 200 } });
  const landed = frame >= landAt;
  const pop = spring({ frame: frame - landAt, fps, config: { damping: 11, stiffness: 180 } });
  const count = interpolate(frame, [landAt, landAt + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shown = r.value ? `${r.prefix ?? ""}${(r.value * count).toFixed(r.decimals ?? 0)}${r.suffix ?? ""}` : r.text;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "22px 0",
        borderBottom: `3px solid ${light.ink}`,
        opacity: inP,
        transform: `translateX(${(1 - inP) * 200}px)`,
      }}
    >
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 96, letterSpacing: -3, color: landed ? light.royal : light.muted, width: 250, lineHeight: 1 }}>{r.code}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 32, color: light.ink }}>{r.en}</div>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 30, color: light.muted, textAlign: "left" }}>
          {r.ar}
        </div>
      </div>
      <div style={{ width: 280, textAlign: "right", opacity: landed ? 1 : 0.25 }}>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: r.value ? 60 : 38, color: light.ink, lineHeight: 1.05 }}>{landed ? shown : "—"}</div>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 26, color: light.royal, textAlign: "right" }}>
          {r.unit}
        </div>
      </div>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: landed ? light.royal : "transparent",
          border: `4px solid ${landed ? light.royal : light.muted}`,
          color: light.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          fontWeight: 800,
          transform: `scale(${landed ? 0.6 + pop * 0.4 : 1})`,
          opacity: landed ? 1 : frame % 16 < 8 ? 1 : 0.3,
        }}
      >
        {landed ? "✓" : ""}
      </div>
    </div>
  );
};

// Scene 3 — arrivals hall: each service lands and reports its result.
export const ArrivalsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { firstRow, rowGap } = timeline.arrivals;
  const band = interpolate(frame, [0, 14], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1) });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  const allIn = firstRow + (arrivals.length - 1) * rowGap + 16;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      {/* signage band */}
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, height: 230, background: light.ink, transform: `scaleX(${band})`, transformOrigin: "left" }} />
      <div style={{ position: "absolute", top: 150, left: 70, right: 70, height: 230, display: "flex", alignItems: "center", gap: 34, opacity: band }}>
        <div style={{ width: 150, height: 150, borderRadius: 20, background: light.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LandingIcon size={120} color={light.paper} />
        </div>
        <div>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 104, letterSpacing: -2, color: light.paper, lineHeight: 1 }}>Arrivals</div>
          <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 62, color: light.accent, textAlign: "left" }}>
            صالة الوصول
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 420, left: 70, right: 70, display: "flex", justifyContent: "space-between", fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: light.muted, opacity: band }}>
        <span>FROM · من</span>
        <span>RESULT · النتيجة</span>
      </div>
      <div style={{ position: "absolute", top: 470, left: 70, right: 70, borderTop: `6px solid ${light.ink}` }}>
        {arrivals.map((r, i) => (
          <Row key={r.code} r={r} landAt={firstRow + i * rowGap} />
        ))}
      </div>
      <Sequence from={allIn} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 150 }}>
          <EditorialTitle label="04 — THE ARRIVAL · الوصول" lines={[{ text: "Arrived." }, { text: "With results.", color: light.royal }]} ar="وصلت… ومعها نتائج." size={100} arSize={56} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
