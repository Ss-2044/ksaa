import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { Words } from "./Words";
import { EndCard } from "./EndCard";
import series from "./series2.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = series.myths;

const MYTHS = [
  { myth: "كثرة المتابعين يعني مبيعات أكثر", fact: "١٠٠٠ متابع مهتم أفضل من ١٠٠ ألف ما يشترون", factEn: "Right audience > big audience" },
  { myth: "التسويق بس للشركات الكبيرة", fact: "المشاريع الصغيرة أكثر من يحتاجه… وأسرع من يكسب منه", factEn: "Small brands win fastest" },
  { myth: "انشر كل يوم وخلاص", fact: "الاستمرار مهم… بس المحتوى الصح أهم من الكثرة", factEn: "Quality beats quantity" },
];

const W = 880;
const H = 980;

const Face: React.FC<{ back?: boolean; children: React.ReactNode }> = ({ back, children }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: 50,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transform: back ? "rotateY(180deg)" : undefined,
      background: back ? `linear-gradient(150deg, ${colors.royal}, ${colors.accent})` : "linear-gradient(150deg, #2a0a12, #7a1625)",
      border: `5px solid ${back ? "#b9c6ff" : "#ff5a66"}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "70px 60px",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const Pill: React.FC<{ ar: string; en: string; bg: string }> = ({ ar, en, bg }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 36px", borderRadius: 50, background: bg }}>
    <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 54, color: "#fff" }}>{ar}</span>
    <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#fff" }}>{en}</span>
  </div>
);

const MythCard: React.FC<{ k: number }> = ({ k }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = MYTHS[k];
  const inP = spring({ frame, fps, config: { damping: 13 } });
  const flip = interpolate(frame, [T.flip, T.flip + 18], [0, 180], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const stamp = spring({ frame: frame - T.stamp, fps, config: { damping: 9, stiffness: 220 } });
  const outP = interpolate(frame, [T.each - 14, T.each], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const factP = spring({ frame: frame - T.flip - 18, fps, config: { damping: 12 } });
  const lift = Math.sin((flip / 180) * Math.PI) * 120;
  return (
    <AbsoluteFill style={{ perspective: 2200 }}>
      <div
        style={{
          position: "absolute",
          left: 540 - W / 2,
          top: 480,
          width: W,
          height: H,
          transformStyle: "preserve-3d",
          transform: `translateY(${(1 - inP) * 1300 - lift}px) translateX(${outP * -1300}px) rotateZ(${(1 - inP) * 14 - outP * 18}deg) rotateY(${flip}deg) translateZ(${lift}px)`,
        }}
      >
        <Face>
          <Pill ar="خرافة" en="MYTH" bg="#d22f3c" />
          <div dir="rtl" style={{ marginTop: 120, fontFamily: fonts.ar, fontWeight: 900, fontSize: 92, lineHeight: 1.35, color: "#fff", textAlign: "center" }}>
            {m.myth}
          </div>
          <div style={{ position: "absolute", bottom: 120, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: frame >= T.stamp ? 1 : 0, transform: `scale(${3 - stamp * 2}) rotate(-14deg)` }}>
            <div style={{ border: "10px solid #ff5a66", borderRadius: 24, padding: "4px 40px", fontFamily: fonts.ar, fontWeight: 900, fontSize: 120, color: "#ff5a66", lineHeight: 1.2 }}>غلط!</div>
          </div>
        </Face>
        <Face back>
          <Pill ar="حقيقة" en="FACT" bg="rgba(255,255,255,0.18)" />
          <svg width={150} height={150} viewBox="0 0 150 150" style={{ marginTop: 60, transform: `scale(${factP})` }}>
            <circle cx={75} cy={75} r={66} fill="none" stroke="#fff" strokeWidth={8} />
            <path d="M 42 78 L 66 102 L 110 52" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={110} strokeDashoffset={110 * (1 - factP)} />
          </svg>
          <div dir="rtl" style={{ marginTop: 40, fontFamily: fonts.ar, fontWeight: 900, fontSize: 70, lineHeight: 1.45, color: "#fff", textAlign: "center", opacity: factP }}>
            {m.fact}
          </div>
          <div style={{ marginTop: 30, fontFamily: fonts.en, fontWeight: 800, fontSize: 38, color: "#DCE4FF", opacity: factP }}>{m.factEn}</div>
        </Face>
      </div>
      {/* counter */}
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", fontFamily: fonts.en, fontWeight: 900, fontSize: 64, color: colors.white, opacity: inP * (1 - outP) }}>
        <span style={{ color: colors.accent }}>{k + 1}</span>
        <span style={{ opacity: 0.4 }}> / 3</span>
      </div>
    </AbsoluteFill>
  );
};

export const MythsVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badge = spring({ frame: frame - T.title, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Background intensity={1} />
      <Sequence from={0} durationInFrames={T.title} layout="none">
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, opacity: interpolate(frame, [T.title - 10, T.title], [1, 0], clamp) }}>
          <Words text="صدقت هالكلام؟" size={130} color={colors.white} highlight={[1]} delay={4} gap={6} />
        </div>
      </Sequence>
      <Sequence from={T.title} durationInFrames={T.from - T.title} layout="none">
        <div style={{ position: "absolute", top: 640, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ fontFamily: fonts.en, fontWeight: 900, fontSize: 300, lineHeight: 1, color: "#ff5a66", transform: `scale(${badge}) rotate(-6deg)` }}>3</div>
        </div>
        <div style={{ position: "absolute", top: 980, left: 0, right: 0, opacity: interpolate(frame, [T.from - 10, T.from], [1, 0], clamp) }}>
          <Words text="خرافات في التسويق" size={110} color={colors.white} delay={6} highlight={[0]} hlColor="#d22f3c" />
          <div style={{ marginTop: 20 }}>
            <Words text="Marketing myths, busted." size={50} color={colors.silver} ar={false} weight={800} delay={16} />
          </div>
        </div>
      </Sequence>
      {MYTHS.map((_, k) => (
        <Sequence key={k} from={T.from + k * T.each} durationInFrames={T.each}>
          <MythCard k={k} />
        </Sequence>
      ))}
      <Sequence from={T.end} durationInFrames={T.duration - T.end}>
        <EndCard line="تسويق مبني على حقائق" en="Marketing built on facts." />
      </Sequence>
      <Sequence from={0} durationInFrames={T.end}>
        <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 0.8 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      {[T.title, T.from, ...MYTHS.map((_, k) => T.from + k * T.each + T.flip + 10), T.end].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={8}>
          <Flash duration={6} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("myths-music.wav")} />
    </AbsoluteFill>
  );
};
