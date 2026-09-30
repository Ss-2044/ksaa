import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, light } from "../theme";
import { EditorialTitle } from "./Editorial";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Scene 4 — an overhead airport wayfinding sign swings in: "Welcome to your destination".
export const WelcomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 7, stiffness: 70 } });
  const swing = Math.sin(frame / 7) * 3 * Math.exp(-frame / 30);
  const arrow = interpolate(Math.sin(frame / 5), [-1, 1], [0, 18]);
  const push = interpolate(frame, [durationInFrames - 26, durationInFrames], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 60,
          right: 60,
          transformOrigin: "50% 0",
          transform: `translateY(${(drop - 1) * 900}px) rotate(${swing}deg) scale(${1 + push * 1.6})`,
          opacity: 1 - push * 0.6,
        }}
      >
        {/* cables */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 120px" }}>
          <div style={{ width: 8, height: 600, background: light.muted }} />
          <div style={{ width: 8, height: 600, background: light.muted }} />
        </div>
        <div style={{ background: light.ink, borderRadius: 26, padding: "54px 56px", boxShadow: "0 50px 80px rgba(10,13,31,0.35)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ width: 170, height: 170, borderRadius: 22, background: light.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={120} height={120} viewBox="0 0 100 100" style={{ transform: `translateY(${-arrow}px)` }}>
                <path d="M 50 8 L 88 50 L 64 50 L 64 92 L 36 92 L 36 50 L 12 50 Z" fill={light.paper} />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 108, letterSpacing: -3, color: light.paper, lineHeight: 1 }}>Welcome</div>
              <div style={{ fontFamily: fonts.en, fontWeight: 500, fontSize: 38, color: light.accent }}>to your destination</div>
            </div>
          </div>
          <div style={{ height: 3, background: "rgba(242,241,236,0.2)", margin: "40px 0 30px" }} />
          <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 70, color: light.paper, lineHeight: 1.3 }}>
            أهلاً بفكرتك في وجهتها
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 34 }}>
            {["STRATEGY", "BRANDING", "CONTENT", "CAMPAIGNS", "GROWTH"].map((g, i) => (
              <div key={g} style={{ flex: 1, padding: "12px 0", borderRadius: 10, background: i === 4 ? light.accent : "rgba(242,241,236,0.1)", color: light.paper, textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>
                {g}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Sequence from={24} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 170, opacity: 1 - push }}>
          <EditorialTitle label="05 — THE DESTINATION · الوجهة" lines={[{ text: "Next stop:" }, { text: "your success.", color: light.royal }]} ar="المحطة القادمة: نجاحك." size={96} arSize={56} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
