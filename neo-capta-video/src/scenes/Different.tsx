import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { useLang } from "../lang";
import { colors } from "../theme";

export const Different: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale } = useLang();
  const strike = progress(frame, 30, 22);
  const oldOut = progress(frame, 72, 18);
  const NEW = 86;

  return (
    <AbsoluteFill dir={dir} style={{ opacity: sceneOpacity(frame, durationInFrames), justifyContent: "center", alignItems: "center" }}>
      {/* the old way, crossed out */}
      <div
        style={{
          position: "absolute",
          opacity: 1 - oldOut,
          transform: `translateY(${-oldOut * 80}px) scale(${1 - oldOut * 0.1})`,
          filter: `blur(${oldOut * 12}px)`,
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{ ...reveal(frame, 0), ...display, fontSize: 130 * scale, color: colors.muted, whiteSpace: "nowrap" }}>{t.old}</div>
          <div
            style={{
              position: "absolute",
              top: "52%",
              insetInlineStart: -30,
              height: 12,
              width: `calc(${strike * 100}% + ${strike * 60}px)`,
              background: colors.lavender,
              borderRadius: 6,
              boxShadow: `0 0 30px ${colors.lavender}`,
              transform: `rotate(${dir === "rtl" ? 3 : -3}deg)`,
            }}
          />
        </div>
      </div>

      {/* the Neo Capta way */}
      <div style={{ ...display, fontSize: 200 * scale, textAlign: "center", whiteSpace: "nowrap" }}>
        <div style={reveal(frame, NEW)}>{t.fresh[0]}</div>
        <div style={{ ...reveal(frame, NEW + 14), color: colors.lavender }}>{t.fresh[1]}</div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 130,
          height: 2,
          width: interpolate(progress(frame, NEW + 30, 40), [0, 1], [0, 1640]),
          background: `linear-gradient(90deg, transparent, ${colors.lavender}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
