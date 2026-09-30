import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BilingualTitle } from "../components/BilingualTitle";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { SplitFlap } from "./SplitFlap";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ink = "#10183f";

const Field: React.FC<{ en: string; ar: string; children: React.ReactNode }> = ({ en, ar, children }) => (
  <div>
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#7a819c" }}>{en}</span>
      <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 22, color: "#7a819c" }}>
        {ar}
      </span>
    </div>
    {children}
  </div>
);

const Value: React.FC<{ en: string; ar: string }> = ({ en, ar }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
    <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 48, color: ink }}>{en}</span>
    <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 40, color: colors.royal }}>
      {ar}
    </span>
  </div>
);

// Scene 2 — the idea gets a boarding pass with no destination, until NEO CAPTA stamps one.
export const BoardingPassScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { flapFrom, stampAt, toSettle } = timeline.pass;
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const stamp = spring({ frame: frame - stampAt, fps, config: { damping: 9, stiffness: 200 } });
  const impact = frame >= stampAt ? Math.exp(-(frame - stampAt) / 4) : 0;
  const settled = frame >= toSettle + 14;
  const arTo = interpolate(frame, [toSettle + 8, toSettle + 18], [0, 1], clamp);
  const q1Out = interpolate(frame, [stampAt - 18, stampAt - 6], [1, 0], clamp);
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
  const drift = interpolate(frame, [0, durationInFrames], [0, -40]);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ alignItems: "center", perspective: 1800 }}>
        <div
          style={{
            marginTop: 460 + drift,
            width: 980,
            height: 620,
            display: "flex",
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 60px 140px rgba(0,0,0,0.75), 0 0 90px rgba(94,120,255,0.25)",
            transform: `translateY(${(1 - enter) * 1300 + impact * 14}px) rotateX(${(1 - enter) * 50 + 6}deg) rotateZ(${(1 - enter) * -10 - 2 + impact * 1.5}deg) scale(${1 - impact * 0.02})`,
          }}
        >
          {/* main part */}
          <div style={{ flex: 1, background: "#F4F5FA", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 120, background: colors.night, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px" }}>
              <Logo width={140} />
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 36, letterSpacing: 6, color: colors.white }}>BOARDING PASS</div>
                <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 28, color: colors.accent }}>
                  بطاقة صعود
                </div>
              </div>
            </div>
            <div style={{ padding: "30px 40px", display: "flex", flexDirection: "column", gap: 22 }}>
              <Field en="PASSENGER" ar="الراكب">
                <Value en="YOUR IDEA" ar="فكرتك" />
              </Field>
              <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
                <Field en="FROM" ar="من">
                  <Value en="DRAFT" ar="مسودة" />
                </Field>
                <div style={{ fontSize: 50, color: colors.royal, paddingBottom: 6 }}>✈</div>
                <Field en="TO" ar="إلى">
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6 }}>
                    <SplitFlap text="SUCCESS" length={7} settleAt={toSettle} cycleFrom={flapFrom} size={58} seed="to" color={colors.white} />
                    <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 40, color: colors.royal, opacity: settled ? arTo : frame % 16 < 8 ? 1 : 0.25 }}>
                      {settled ? "النجاح" : "؟؟؟"}
                    </span>
                  </div>
                </Field>
              </div>
              <div style={{ display: "flex", gap: 40, borderTop: "2px solid #dfe2ec", paddingTop: 18 }}>
                {[
                  ["FLIGHT", "NC-2026"],
                  ["GATE", "A1"],
                  ["SEAT", "1A"],
                ].map(([k, v]) => (
                  <Field key={k} en={k} ar="">
                    <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 36, color: ink }}>{v}</div>
                  </Field>
                ))}
                <Field en="STATUS" ar="الحالة">
                  <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 30, color: settled ? colors.royal : "#b23a48", marginTop: 4 }}>
                    {settled ? "BOARDING NOW" : "NO DESTINATION"}
                  </div>
                </Field>
              </div>
            </div>
          </div>
          {/* stub */}
          <div style={{ width: 170, background: "#E9EBF4", borderLeft: "4px dashed #b9bed2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {new Array(34).fill(0).map((_, i) => (
              <div key={i} style={{ width: 110, height: i % 3 === 0 ? 7 : 3, background: ink }} />
            ))}
          </div>
          {/* stamp */}
          <div
            style={{
              position: "absolute",
              right: 14,
              top: 372,
              width: 210,
              height: 210,
              borderRadius: "50%",
              border: `9px double ${colors.royal}`,
              color: colors.royal,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(-14deg)`,
              opacity: frame >= stampAt ? Math.min(1, stamp * 1.6) * 0.92 : 0,
              mixBlendMode: "multiply",
            }}
          >
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 2 }}>NEO CAPTA</div>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34 }}>APPROVED</div>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 36 }}>
              معتمد
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Sequence from={24} durationInFrames={stampAt - 24} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 1000, opacity: q1Out }}>
          <BilingualTitle en="But not every idea knows where to go." ar="لكن ليست كل فكرة تعرف إلى أين تذهب." highlight={[5, 6, 7]} wordGap={5} arDelay={28} enSize={76} arSize={54} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={stampAt + 22} layout="none">
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 1000 }}>
          <BilingualTitle en="We give every idea a direction." ar="نحن نمنح كل فكرة وجهتها." highlight={[5]} wordGap={5} arDelay={20} enSize={80} arSize={60} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
