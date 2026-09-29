import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { colors } from "../theme";
import { displayAr, displayEn } from "../ui";

export const Different: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const strike = progress(frame, 34, 22);
  const oldOut = progress(frame, 72, 18);
  const NEW = 86;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames), justifyContent: "center", alignItems: "center" }}>
      {/* the old way, crossed out */}
      <div
        style={{
          position: "absolute",
          textAlign: "center",
          opacity: 1 - oldOut,
          transform: `translateY(${-oldOut * 80}px) scale(${1 - oldOut * 0.1})`,
          filter: `blur(${oldOut * 12}px)`,
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <div style={{ ...reveal(frame, 0), ...displayEn, fontSize: 110, color: colors.muted }}>Traditional marketing.</div>
          <div dir="rtl" style={{ ...reveal(frame, 10), ...displayAr, fontSize: 96, color: colors.muted, marginTop: 20 }}>
            التسويق التقليدي
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: -30,
              height: 10,
              width: `calc(${strike * 100}% + ${strike * 60}px)`,
              background: colors.lavender,
              borderRadius: 5,
              boxShadow: `0 0 30px ${colors.lavender}`,
              transform: "rotate(-4deg)",
            }}
          />
        </div>
      </div>

      {/* the Neo Capta way */}
      <div style={{ position: "absolute", width: "100%", padding: "0 140px", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, ...displayEn, fontSize: 150 }}>
          <div style={reveal(frame, NEW)}>Marketing,</div>
          <div style={{ ...reveal(frame, NEW + 12), color: colors.lavender }}>reimagined.</div>
        </div>
        <div dir="rtl" style={{ flex: 1, textAlign: "right", ...displayAr, fontSize: 140, whiteSpace: "nowrap" }}>
          <div style={reveal(frame, NEW + 24)}>تسويق</div>
          <div style={{ ...reveal(frame, NEW + 36), color: colors.lavender }}>بشكل مختلف</div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 150,
          height: 2,
          width: interpolate(progress(frame, NEW + 30, 40), [0, 1], [0, 1640]),
          background: `linear-gradient(90deg, transparent, ${colors.lavender}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
