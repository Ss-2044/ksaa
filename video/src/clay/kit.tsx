import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";

// «صلصال» series: soft 3D clay look — pastel gradients, puffy rounded shapes, bouncy motion.
export const C = {
  navy: "#1E2350",
  blue: "#344499",
  peri: "#7C8CFF",
  lilac: "#C9BFFF",
  peach: "#FFC9B0",
  mint: "#A8EBCF",
  butter: "#FFE58F",
  pink: "#FFB3CC",
  white: "#FFFFFF",
  muted: "#6B6F94",
};
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// puffy clay surface
export const clay = (color: string, r = 40): React.CSSProperties => ({
  background: color,
  borderRadius: r,
  boxShadow: `inset -14px -16px 28px rgba(30,35,80,0.14), inset 12px 12px 24px rgba(255,255,255,0.65), 0 30px 50px rgba(52,68,153,0.22)`,
});

export const sphere = (color: string): React.CSSProperties => ({
  borderRadius: "50%",
  background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, ${color} 38%, ${color} 62%, rgba(30,35,80,0.35) 100%)`,
  boxShadow: "0 24px 40px rgba(52,68,153,0.25)",
});

export const ClayBg: React.FC = () => {
  const frame = useCurrentFrame();
  const blobs = [
    { x: 120, y: 260, r: 260, c: C.lilac },
    { x: 900, y: 600, r: 320, c: C.peach },
    { x: 200, y: 1500, r: 300, c: C.mint },
    { x: 940, y: 1700, r: 220, c: C.butter },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #EEEAFF 0%, #F7F1FF 45%, #FFF0E8 100%)" }}>
      {blobs.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.x - b.r + Math.sin(frame / 50 + i) * 30, top: b.y - b.r + Math.cos(frame / 60 + i) * 30, width: b.r * 2, height: b.r * 2, borderRadius: "50%", background: b.c, opacity: 0.45, filter: "blur(60px)" }} />
      ))}
    </AbsoluteFill>
  );
};

export const ClayLogo: React.FC = () => (
  <Img src={staticFile("neocapta-logo-dark.png")} style={{ position: "absolute", top: 30, left: 40, width: 150, height: 150 * LOGO_RATIO }} />
);

// caption: Arabic line with a soft pill behind the highlighted word
export const Say: React.FC<{ ar: string; en: string; top: number; from?: number; hl?: number; size?: number }> = ({ ar, en, top, from = 0, hl, size = 92 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ar.split(" ");
  const enP = interpolate(frame, [from + words.length * 4 + 6, from + words.length * 4 + 18], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top, left: 50, right: 50, textAlign: "center" }}>
      <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 22px" }}>
        {words.map((w, i) => {
          const p = spring({ frame: frame - from - i * 4, fps, config: { damping: 9, stiffness: 180 } });
          const isHl = i === hl;
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: fonts.display, fontWeight: 900, fontSize: size, lineHeight: 1.3, color: isHl ? C.white : C.navy, padding: isHl ? `0 ${size * 0.25}px` : 0, ...(isHl ? clay(C.peri, size * 0.5) : {}), transform: `scale(${p}) translateY(${(1 - p) * 30}px)` }}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontFamily: fonts.en, fontWeight: 800, fontSize: size * 0.36, color: C.muted, opacity: enP }}>{en}</div>
    </div>
  );
};

export const ClayEnd: React.FC<{ ar: string; en: string }> = ({ ar, en }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const card = spring({ frame, fps, config: { damping: 10, stiffness: 140 } });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <ClayBg />
      <div style={{ position: "absolute", left: 140, right: 140, top: 430, height: 560, ...clay(C.white, 80), display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${card}) rotate(${(1 - card) * -8}deg)` }}>
        <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 560, height: 560 * LOGO_RATIO }} />
      </div>
      <Say ar={ar} en={en} top={1080} from={14} size={84} />
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center", gap: 18, opacity: interpolate(frame, [36, 50], [0, 1], clamp) }}>
        {["استراتيجية", "هوية", "محتوى", "حملات"].map((t, i) => (
          <span key={t} style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 32, color: C.navy, padding: "10px 24px", ...clay([C.lilac, C.peach, C.mint, C.butter][i], 30) }}>{t}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
