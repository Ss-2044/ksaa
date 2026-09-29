import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { reveal, sceneOpacity } from "../anim";
import { colors, fonts } from "../theme";
import { displayAr, displayEn } from "../ui";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20 } });
  const mask = "radial-gradient(circle at 50% 50%, black 40%, transparent 68%)";
  const toBlack = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames, 12), alignItems: "center", justifyContent: "center" }}>
      <Img
        src={staticFile("logo.png")}
        style={{
          marginTop: -60,
          mixBlendMode: "screen",
          width: 520,
          height: 514,
          objectFit: "cover",
          maskImage: mask,
          WebkitMaskImage: mask,
          transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`,
          opacity: s,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: -30 }}>
        <div style={{ ...reveal(frame, 14), ...displayEn, fontSize: 84 }}>
          We see the <span style={{ color: colors.lavender }}>unseen.</span>
        </div>
        <div style={{ ...reveal(frame, 20), width: 2, height: 90, background: colors.line }} />
        <div dir="rtl" style={{ ...reveal(frame, 26), ...displayAr, fontSize: 80 }}>
          نرى ما <span style={{ color: colors.lavender }}>لا يُرى</span>
        </div>
      </div>
      <div
        style={{
          ...reveal(frame, 40),
          position: "absolute",
          bottom: 90,
          fontFamily: fonts.mono,
          fontSize: 24,
          letterSpacing: "0.3em",
          color: colors.muted,
        }}
      >
        NEO CAPTA · MARKETING INTELLIGENCE · RIYADH
      </div>
      <AbsoluteFill style={{ background: "black", opacity: toBlack }} />
    </AbsoluteFill>
  );
};
