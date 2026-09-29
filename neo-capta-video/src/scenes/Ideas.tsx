import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal, sceneOpacity } from "../anim";
import { colors, fonts } from "../theme";
import { displayAr, displayEn } from "../ui";

const pillars = [
  { en: "Strategy", ar: "استراتيجية" },
  { en: "Creators", ar: "صنّاع محتوى" },
  { en: "Content", ar: "محتوى" },
  { en: "Performance", ar: "أداء" },
  { en: "Intelligence", ar: "ذكاء" },
];

export const Ideas: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // highlight travels across the cards once they are in
  const active = Math.floor(interpolate(frame, [70, 165], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, durationInFrames), padding: "150px 140px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ ...displayEn, fontSize: 96 }}>
          <div style={reveal(frame, 0)}>New ideas.</div>
          <div style={{ ...reveal(frame, 10), color: colors.lavender }}>Real intelligence.</div>
        </div>
        <div dir="rtl" style={{ ...displayAr, fontSize: 92, textAlign: "right" }}>
          <div style={reveal(frame, 20)}>أفكار جديدة.</div>
          <div style={{ ...reveal(frame, 30), color: colors.lavender }}>ذكاء حقيقي.</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 28, marginTop: 110 }}>
        {pillars.map((p, i) => {
          const on = i === active;
          const line = progress(frame, 40 + i * 6, 30);
          return (
            <div
              key={p.en}
              style={{
                ...reveal(frame, 36 + i * 6, 22),
                flex: "1 1 0",
                minWidth: 0,
                height: 300,
                borderRadius: 24,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: `1.5px solid ${on ? colors.lavender : colors.line}`,
                background: on ? "rgba(139,127,255,0.14)" : "rgba(11,11,20,0.5)",
                boxShadow: on ? `0 0 60px rgba(139,127,255,0.35)` : "none",
              }}
            >
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: "0.15em", color: on ? colors.lavender : colors.muted }}>
                0{i + 1}
              </div>
              <div>
                <div style={{ height: 2, width: `${line * 100}%`, background: on ? colors.lavender : colors.line, marginBottom: 22 }} />
                <div style={{ ...displayEn, fontWeight: 800, fontSize: 40, letterSpacing: "-0.02em" }}>{p.en}</div>
                <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 500, fontSize: 36, color: colors.muted, textAlign: "right", marginTop: 8 }}>
                  {p.ar}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
