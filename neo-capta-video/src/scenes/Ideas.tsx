import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { useLang } from "../lang";
import { colors, fonts } from "../theme";

export const Ideas: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale, lang } = useLang();
  // highlight travels across the cards once they are in
  const active = Math.floor(interpolate(frame, [70, 165], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill dir={dir} style={{ opacity: sceneOpacity(frame, durationInFrames), padding: "150px 140px 0" }}>
      <div style={{ ...display, fontSize: 120 * scale }}>
        <div style={reveal(frame, 0)}>{t.ideas[0]}</div>
        <div style={{ ...reveal(frame, 12), color: colors.lavender }}>{t.ideas[1]}</div>
      </div>

      <div style={{ display: "flex", gap: 28, marginTop: 90 }}>
        {t.pillars.map((name, i) => {
          const on = i === active;
          const line = progress(frame, 40 + i * 6, 30);
          return (
            <div
              key={name}
              style={{
                ...reveal(frame, 36 + i * 6, 22),
                flex: "1 1 0",
                minWidth: 0,
                height: 280,
                borderRadius: 24,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: `1.5px solid ${on ? colors.lavender : colors.line}`,
                background: on ? "rgba(139,127,255,0.14)" : "rgba(11,11,20,0.5)",
                boxShadow: on ? "0 0 60px rgba(139,127,255,0.35)" : "none",
              }}
            >
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.15em", color: on ? colors.lavender : colors.muted }}>
                0{i + 1}
              </div>
              <div>
                <div style={{ height: 2, width: `${line * 100}%`, background: on ? colors.lavender : colors.line, marginBottom: 24 }} />
                <div
                  style={{
                    ...display,
                    fontWeight: lang === "ar" ? 700 : 800,
                    fontSize: lang === "ar" ? 46 : 40,
                    letterSpacing: lang === "ar" ? 0 : "-0.02em",
                  }}
                >
                  {name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
