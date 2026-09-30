import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BilingualTitle } from "../components/BilingualTitle";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { SplitFlap } from "./SplitFlap";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const departures = [
  { time: "09:00", en: "STRATEGY", ar: "الاستراتيجية", status: "ON TIME", statusAr: "في الموعد" },
  { time: "09:15", en: "BRANDING", ar: "الهوية البصرية", status: "BOARDING", statusAr: "صعود" },
  { time: "09:30", en: "CONTENT", ar: "صناعة المحتوى", status: "ON TIME", statusAr: "في الموعد" },
  { time: "09:45", en: "CAMPAIGNS", ar: "الحملات الإعلانية", status: "BOARDING", statusAr: "صعود" },
  { time: "10:00", en: "GROWTH", ar: "النمو", status: "FINAL CALL", statusAr: "نداء أخير" },
];

// Scene 3 — an airport departures board where every destination is a NEO CAPTA service.
export const DeparturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { firstRow, rowGap } = timeline.departures;
  const board = spring({ frame, fps, config: { damping: 200 } });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 40,
          right: 40,
          borderRadius: 30,
          padding: "36px 34px",
          background: "linear-gradient(180deg, #070a1f, #03040d)",
          border: "2px solid rgba(228,230,238,0.12)",
          boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 80px rgba(94,120,255,0.15)",
          transform: `scale(${interpolate(board, [0, 1], [1.12, 1])}) translateY(${interpolate(frame, [0, durationInFrames], [0, -30])}px)`,
          opacity: board,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div>
            <SplitFlap text="DEPARTURES" settleAt={4} cycleFrom={0} stagger={1} size={62} seed="hdr" color={colors.accent} />
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 44, color: colors.white, marginTop: 8, textAlign: "left" }}>
              المغادرة
            </div>
          </div>
          <Logo width={190} />
        </div>
        {departures.map((d, r) => {
          const settle = firstRow + r * rowGap;
          const done = frame >= settle + d.en.length * 2 + 2;
          const pill = spring({ frame: frame - (settle + 20), fps, config: { damping: 14 } });
          const boarding = d.status !== "ON TIME";
          return (
            <div key={d.en} style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 0", borderTop: "1px solid rgba(228,230,238,0.1)" }}>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34, color: colors.steel, width: 100 }}>{d.time}</div>
              <div style={{ flex: 1 }}>
                <SplitFlap text={d.en} length={10} settleAt={settle} cycleFrom={Math.max(0, settle - 14)} size={56} seed={`row${r}`} />
                <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 32, color: colors.silver, marginTop: 6, textAlign: "left", opacity: done ? 1 : 0 }}>
                  {d.ar}
                </div>
              </div>
              <div
                style={{
                  width: 200,
                  textAlign: "center",
                  padding: "10px 0",
                  borderRadius: 14,
                  background: boarding ? colors.accent : "rgba(228,230,238,0.12)",
                  color: colors.white,
                  transform: `scale(${pill})`,
                  opacity: boarding && frame % 20 < 6 ? 0.55 : 1,
                }}
              >
                <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24 }}>{d.status}</div>
                <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 22 }}>
                  {d.statusAr}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Sequence from={firstRow + 5 * rowGap + 20} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
          <BilingualTitle en="Every service, a destination." ar="كل خدمة… وجهة." highlight={[3]} wordGap={4} arDelay={14} enSize={72} arSize={58} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
