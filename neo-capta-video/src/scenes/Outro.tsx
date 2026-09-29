import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { reveal, sceneOpacity } from "../anim";
import { useLang } from "../lang";
import { colors } from "../theme";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { t, dir, display, scale, small, lang } = useLang();
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
      <div dir={dir} style={{ ...reveal(frame, 14), ...display, fontSize: 110 * scale, marginTop: -20, whiteSpace: "nowrap" }}>
        {t.tagline[0]} {t.tagline[1]}
        <span style={{ color: colors.lavender }}>{t.tagline[2]}</span>
      </div>
      <div dir={dir} style={{ ...reveal(frame, 36), ...small, position: "absolute", bottom: 90, letterSpacing: lang === "ar" ? 0 : "0.3em" }}>
        {t.footer}
      </div>
      <AbsoluteFill style={{ background: "black", opacity: toBlack }} />
    </AbsoluteFill>
  );
};
