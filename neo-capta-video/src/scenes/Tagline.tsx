import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { reveal, sceneOpacity } from "../anim";
import { useLang } from "../lang";
import { colors } from "../theme";
import { Pill } from "../ui";

export const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale } = useLang();
  const [line1, lead, accent] = t.tagline;

  return (
    <AbsoluteFill dir={dir} style={{ opacity: sceneOpacity(frame, durationInFrames), padding: "0 160px", justifyContent: "center" }}>
      <div style={reveal(frame, 0)}>
        <Pill dir={dir}>{t.pill}</Pill>
      </div>
      <div style={{ ...display, fontSize: 210 * scale, marginTop: 50, whiteSpace: "nowrap" }}>
        <div style={reveal(frame, 12)}>{line1}</div>
        <div style={reveal(frame, 26)}>
          {lead}
          <span style={{ color: colors.lavender }}>{accent}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
