import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { colors } from "../theme";
import { displayAr, displayEn, Pill } from "../ui";

export const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const divider = progress(frame, 4, 30);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames), padding: "0 140px", flexDirection: "row", alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <div style={reveal(frame, 0)}>
          <Pill>MARKETING INTELLIGENCE · RIYADH</Pill>
        </div>
        <div style={{ ...displayEn, fontSize: 136, marginTop: 56, whiteSpace: "nowrap" }}>
          <div style={reveal(frame, 10)}>We see</div>
          <div style={reveal(frame, 22)}>
            the <span style={{ color: colors.lavender }}>unseen.</span>
          </div>
        </div>
      </div>

      <div style={{ width: 2, height: 560 * divider, background: colors.line, margin: "0 70px" }} />

      <div style={{ flex: 1, textAlign: "right" }} dir="rtl">
        <div style={reveal(frame, 34)}>
          <Pill dir="rtl">ذكاء تسويقي · الرياض</Pill>
        </div>
        <div style={{ ...displayAr, fontSize: 172, marginTop: 30 }}>
          <div style={reveal(frame, 44)}>نرى</div>
          <div style={reveal(frame, 56)}>
            ما <span style={{ color: colors.lavender }}>لا يُرى</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
