import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { Words } from "./Words";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Bookmark: React.FC = () => (
  <svg width={56} height={56} viewBox="0 0 100 100">
    <path d="M 24 10 L 76 10 L 76 92 L 50 72 L 24 92 Z" fill="none" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
  </svg>
);

// Shared closing card: line + logo + "contact us" + "save & share".
export const EndCard: React.FC<{ line: string; en: string }> = ({ line, en }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = spring({ frame: frame - 26, fps, config: { damping: 12 } });
  const btn = spring({ frame: frame - 50, fps, config: { damping: 10 } });
  const save = spring({ frame: frame - 76, fps, config: { damping: 12 } });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0 }}>
        <Words text={line} size={92} color={colors.white} delay={2} gap={3} />
        <div style={{ marginTop: 16 }}>
          <Words text={en} size={46} color={colors.silver} ar={false} weight={800} delay={12} gap={2} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 720, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logo, transform: `scale(${0.7 + logo * 0.3})` }}>
        <Logo width={560} />
      </div>
      <div style={{ position: "absolute", top: 1200, left: 540 - 290, width: 580, height: 140, borderRadius: 80, background: `linear-gradient(90deg, ${colors.royal}, ${colors.accent})`, boxShadow: "0 20px 60px rgba(94,120,255,0.55)", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, transform: `scale(${btn * (1 + Math.sin(frame / 5) * 0.025)})` }}>
        <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 56, color: "#fff" }}>تواصل معنا</span>
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 28, color: "#DCE4FF" }}>GET IN TOUCH</span>
      </div>
      <div style={{ position: "absolute", top: 1440, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: save, transform: `translateY(${(1 - save) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 36px", borderRadius: 60, border: "3px dashed rgba(228,230,238,0.45)" }}>
          <Bookmark />
          <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: 46, color: colors.white }}>
            احفظ المقطع وشاركه
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
