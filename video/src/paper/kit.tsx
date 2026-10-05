import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";

// Shared look for the paper-and-ink series (The Dot, Paper Plane, Eraser, Stamp).
export const P = { paper: "#F2EFE8", ink: "#121212", blue: "#344499", sky: "#5E78FF", muted: "#8a8780", white: "#ffffff" };
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const PaperBg: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: P.paper }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(18,18,18,0.13) 0 1.6px, transparent 2.2px)", backgroundSize: "40px 40px" }} />
  </AbsoluteFill>
);

export const CornerLogo: React.FC = () => (
  <Img src={staticFile("neocapta-logo-dark.png")} style={{ position: "absolute", top: 30, left: 40, width: 150, height: 150 * LOGO_RATIO, opacity: 0.9 }} />
);

// Arabic line that rises word by word, with a quiet English line under it.
export const Line: React.FC<{ ar: string; en: string; top: number; from?: number; hl?: number; size?: number; hlColor?: string }> = ({ ar, en, top, from = 0, hl, size = 116, hlColor = P.blue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ar.split(" ");
  const enP = interpolate(frame, [from + words.length * 5 + 6, from + words.length * 5 + 20], [0, 1], clamp);
  return (
    <div style={{ position: "absolute", top, left: 60, right: 60, textAlign: "center" }}>
      <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 26px" }}>
        {words.map((w, i) => {
          const p = spring({ frame: frame - from - i * 5, fps, config: { damping: 16, stiffness: 200 } });
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: fonts.display, fontWeight: 900, fontSize: size, lineHeight: 1.25, color: i === hl ? hlColor : P.ink, transform: `translateY(${(1 - p) * 60}px)`, opacity: p }}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontFamily: fonts.en, fontWeight: 500, fontSize: size * 0.38, color: P.muted, opacity: enP, transform: `translateY(${(1 - enP) * 20}px)` }}>{en}</div>
    </div>
  );
};

// Closing card: logo, line, services. Rendered inside its own <Sequence>.
export const PaperEnd: React.FC<{ line: string; en: string; hl?: number; instant?: boolean }> = ({ line, en, hl, instant }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = instant ? 1 : spring({ frame: frame - 2, fps, config: { damping: 13 } });
  const svc = interpolate(frame, [40, 58], [0, 1], clamp);
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: logo, transform: `scale(${0.7 + 0.3 * logo})` }}>
        <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 560, height: 560 * LOGO_RATIO }} />
      </div>
      <Line ar={line} en={en} top={920} from={12} hl={hl} size={96} />
      <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", fontFamily: fonts.display, fontWeight: 500, fontSize: 36, color: P.muted, opacity: svc }}>
        استراتيجية · هوية · محتوى · حملات
      </div>
    </AbsoluteFill>
  );
};
