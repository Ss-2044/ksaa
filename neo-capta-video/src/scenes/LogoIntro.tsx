import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { sceneOpacity } from "../anim";
import { colors } from "../theme";

export const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18, mass: 0.9 } });
  const scale = interpolate(s, [0, 1], [1.25, 1]);
  const blur = interpolate(s, [0, 1], [18, 0]);
  const sweep = interpolate(frame, [20, 70], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mask = "radial-gradient(circle at 50% 50%, black 42%, transparent 70%)";

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: sceneOpacity(frame, durationInFrames, 10) }}>
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.indigo}55 0%, transparent 65%)`,
          opacity: s,
        }}
      />
      <div style={{ position: "relative", mixBlendMode: "lighten", width: 780, height: 780, transform: `scale(${scale * exit})`, filter: `blur(${blur}px)` }}>
        <Img
          src={staticFile("logo.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "lighten", maskImage: mask, WebkitMaskImage: mask }}
        />
        {/* light sweep across the mark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,255,255,0.28) ${sweep}%, transparent ${sweep + 12}%)`,
            mixBlendMode: "screen",
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
