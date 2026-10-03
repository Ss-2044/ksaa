import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { Words } from "./Words";
import timeline from "./launch.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { soon, over, live, services, cta, outro } = timeline;

const SERVICES = [
  { ar: "الاستراتيجية", en: "Strategy", line: "نعرف وين تروح فكرتك", icon: "M 50 10 L 90 90 L 50 70 L 10 90 Z" },
  { ar: "الهوية البصرية", en: "Branding", line: "شكل يعرفك فيه الكل", icon: "M 50 10 A 40 40 0 1 1 49.9 10 Z M 50 30 A 20 20 0 1 0 50.1 30 Z" },
  { ar: "صناعة المحتوى", en: "Content", line: "محتوى يوقف السكرول", icon: "M 15 15 L 85 15 L 85 85 L 15 85 Z M 40 35 L 68 50 L 40 65 Z" },
  { ar: "الحملات الإعلانية", en: "Campaigns", line: "نوصلك لجمهورك الصح", icon: "M 15 40 L 55 20 L 55 80 L 15 60 Z M 62 35 L 85 25 M 62 50 L 88 50 M 62 65 L 85 75" },
  { ar: "النمو", en: "Growth", line: "أرقام تكبر معك", icon: "M 10 85 L 35 60 L 55 70 L 88 25 M 70 25 L 88 25 L 88 43" },
];

// "Coming soon" neon sign that flickers, then gets struck through and falls.
const SoonSign: React.FC = () => {
  const frame = useCurrentFrame();
  const flick = frame < over.from ? (random(`f${Math.floor(frame / 3)}`) > 0.12 ? 1 : 0.25) : 1;
  const strike = interpolate(frame, [over.cross, over.cross + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const fall = interpolate(frame, [over.to - 20, over.to], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top: 760, height: 380, transform: `translateY(${fall * 1300}px) rotate(${fall * 18}deg)` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 30, border: `6px solid rgba(160,175,255,${0.5 * flick})`, boxShadow: `0 0 ${50 * flick}px rgba(94,120,255,${0.6 * flick}), inset 0 0 ${40 * flick}px rgba(94,120,255,${0.4 * flick})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 170, lineHeight: 1.1, color: "#DCE4FF", opacity: flick, textShadow: `0 0 ${30 * flick}px #7E93FF` }}>
          قريباً
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 56, letterSpacing: 14, color: "#DCE4FF", opacity: flick * 0.85 }}>COMING SOON</div>
      </div>
      <svg width={900} height={380} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={-20} y1={330} x2={-20 + 940 * strike} y2={330 - 280 * strike} stroke="#e0303a" strokeWidth={22} strokeLinecap="round" />
      </svg>
    </div>
  );
};

const Confetti: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0) return null;
  return (
    <>
      {new Array(70).fill(0).map((_, i) => {
        const a = random(`ca${i}`) * Math.PI * 2;
        const v = 18 + random(`cv${i}`) * 26;
        const x = 540 + Math.cos(a) * v * t;
        const y = 900 + Math.sin(a) * v * t + 0.6 * t * t;
        const c = [colors.accent, "#F4F5FA", colors.royal, "#FFE7A3", "#7E93FF"][i % 5];
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 10, background: c, transform: `rotate(${t * (10 + i)}deg)`, opacity: Math.max(0, 1 - t / 70) }} />;
      })}
    </>
  );
};

const ServiceCard: React.FC<{ k: number }> = ({ k }) => {
  const frame = useCurrentFrame() + services.from; // rendered inside the services Sequence
  const { fps } = useVideoConfig();
  const s = SERVICES[k];
  const start = services.from + k * services.each;
  const inP = spring({ frame: frame - (services.from + k * 6), fps, config: { damping: 14 } });
  const active = frame >= start && frame < start + services.each;
  const done = frame >= start + services.each;
  const row = k;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 640 + row * 196,
        height: 170,
        borderRadius: 28,
        background: active ? `linear-gradient(90deg, ${colors.royal}, ${colors.accent})` : "rgba(228,230,238,0.07)",
        border: `3px solid ${active ? "#fff" : done ? colors.accent : "rgba(228,230,238,0.2)"}`,
        boxShadow: active ? "0 0 50px rgba(94,120,255,0.7)" : "none",
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "0 34px",
        direction: "rtl",
        transform: `translateX(${(1 - inP) * (k % 2 ? -1200 : 1200)}px) scale(${active ? 1.04 : 1})`,
      }}
    >
      <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <path d={s.icon} fill="none" stroke={active || done ? "#fff" : colors.steel} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 52, color: colors.white, lineHeight: 1.2 }}>{s.ar}</div>
        <div style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 32, color: active ? "#DCE4FF" : colors.steel, opacity: active || done ? 1 : 0.5 }}>{s.line}</div>
      </div>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: active ? "#fff" : colors.steel, direction: "ltr" }}>{s.en.toUpperCase()}</div>
    </div>
  );
};

const CTA: React.FC = () => {
  const frame = useCurrentFrame() + cta.from; // rendered inside the CTA Sequence
  const { fps } = useVideoConfig();
  const inP = spring({ frame: frame - cta.from - 30, fps, config: { damping: 12 } });
  const press = frame >= cta.click && frame < cta.click + 8 ? 0.92 : 1;
  const pulse = 1 + Math.sin(frame / 5) * 0.03;
  const cursorT = interpolate(frame, [cta.from + 50, cta.click], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const ripple = frame >= cta.click ? interpolate(frame - cta.click, [0, 25], [0, 1], clamp) : 0;
  return (
    <>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0 }}>
        <Words text="أول عملائنا… ممكن تكون أنت" size={86} color={colors.white} highlight={[3, 4]} />
        <div style={{ marginTop: 20 }}>
          <Words text="Our first client could be you." size={44} color={colors.silver} ar={false} weight={800} delay={10} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 540 - 300, top: 1160, width: 600, height: 150, borderRadius: 80, background: `linear-gradient(90deg, ${colors.royal}, ${colors.accent})`, boxShadow: "0 20px 60px rgba(94,120,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, transform: `scale(${inP * press * pulse})` }}>
        <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 60, color: "#fff" }}>تواصل معنا</span>
        <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 30, color: "#DCE4FF" }}>GET IN TOUCH</span>
      </div>
      {ripple > 0 ? <div style={{ position: "absolute", left: 540 - 300 * (1 + ripple), top: 1235 - 75 * (1 + ripple * 2), width: 600 * (1 + ripple), height: 150 * (1 + ripple * 2), borderRadius: 120, border: `4px solid ${colors.accent}`, opacity: 1 - ripple }} /> : null}
      {/* tapping finger/cursor */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${900 - cursorT * 300} ${1600 - cursorT * 330}) scale(${press})`} opacity={interpolate(frame, [cta.from + 40, cta.from + 50], [0, 1], clamp)}>
          <path d="M 0 0 L 0 70 L 18 54 L 32 86 L 46 80 L 32 48 L 56 48 Z" fill="#fff" stroke="#0A1033" strokeWidth={4} />
        </g>
      </svg>
    </>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  const tag = interpolate(frame, [26, 46], [0, 1], clamp);
  const badge = spring({ frame: frame - 50, fps, config: { damping: 10 } });
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${0.7 + logo * 0.3})`, opacity: logo }}>
        <Logo width={720} />
      </div>
      <div style={{ position: "absolute", top: 1100, left: 0, right: 0, textAlign: "center", opacity: tag }}>
        <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 92, color: colors.white }}>
          لكل فكرة وجهة
        </div>
        <div style={{ fontFamily: fonts.serif, fontStyle: "italic", fontSize: 54, color: colors.accent }}>Every idea, a direction.</div>
      </div>
      <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "18px 40px", borderRadius: 60, border: `4px solid ${colors.accent}`, display: "flex", gap: 18, alignItems: "center", transform: `scale(${badge})` }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#3ddc84", boxShadow: "0 0 16px #3ddc84", opacity: frame % 30 < 20 ? 1 : 0.4 }} />
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34, letterSpacing: 4, color: colors.white }}>NOW OPEN</span>
          <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 40, color: colors.white }}>
            مفتوحين الحين
          </span>
        </div>
      </div>
      <Confetti from={8} />
    </AbsoluteFill>
  );
};

// "بدينا! / We're live" — the official launch: the "coming soon" sign is struck out and the agency opens.
export const LaunchVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame: frame - live.slam, fps, config: { damping: 9, stiffness: 160 } });
  const shake = frame >= live.slam && frame < live.slam + 14 ? (random(`s${frame}`) - 0.5) * 30 * (1 - (frame - live.slam) / 14) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
        <Background intensity={frame < live.from ? 0.4 : 1.4} />
        <Sequence from={0} durationInFrames={live.from} layout="none">
          <SoonSign />
          <div style={{ position: "absolute", top: 300, left: 0, right: 0, opacity: interpolate(frame, [10, 30], [0, 1], clamp) }}>
            <Words text="كنا نقول…" size={80} color={colors.steel} delay={10} />
          </div>
          <Sequence from={over.cross + 8} layout="none">
            <div style={{ position: "absolute", top: 1300, left: 0, right: 0 }}>
              <Words text="خلاص… انتهى الانتظار" size={84} color={colors.white} highlight={[2]} />
              <div style={{ marginTop: 16 }}>
                <Words text="The wait is over." size={46} color={colors.silver} ar={false} weight={800} delay={8} />
              </div>
            </div>
          </Sequence>
        </Sequence>
        {/* the slam */}
        <Sequence from={live.from} durationInFrames={live.to - live.from} layout="none">
          <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${interpolate(slam, [0, 1], [3, 1])})`, opacity: Math.min(1, slam * 2) }}>
            <Logo width={640} />
          </div>
          <div style={{ position: "absolute", top: 1080, left: 0, right: 0, textAlign: "center", transform: `scale(${interpolate(slam, [0, 1], [2, 1])}) rotate(-3deg)`, opacity: Math.min(1, slam * 2) }}>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 210, lineHeight: 1, color: colors.white, textShadow: "0 0 60px rgba(94,120,255,0.9)" }}>
              بدينا!
            </div>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 64, letterSpacing: 8, color: colors.accent, marginTop: 20 }}>WE&apos;RE OFFICIALLY LIVE</div>
          </div>
          <Confetti from={live.slam - live.from} />
        </Sequence>
        {/* what we do */}
        <Sequence from={services.from} durationInFrames={cta.from - services.from} layout="none">
          <div style={{ position: "absolute", top: 300, left: 0, right: 0 }}>
            <Words text="وش نسوي لك؟" size={96} color={colors.white} highlight={[1]} />
            <div style={{ marginTop: 10 }}>
              <Words text="What we do for you" size={44} color={colors.silver} ar={false} weight={800} delay={6} />
            </div>
          </div>
          {SERVICES.map((_, k) => (
            <ServiceCard key={k} k={k} />
          ))}
        </Sequence>
        <Sequence from={cta.from} durationInFrames={cta.to - cta.from} layout="none">
          <CTA />
        </Sequence>
        <Sequence from={outro.from} durationInFrames={outro.duration}>
          <Outro />
        </Sequence>
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={outro.from}>
        <div style={{ position: "absolute", top: 70, right: 60, opacity: frame < live.from ? 0 : 0.85 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      {[live.slam, services.from, cta.from, outro.from].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={12}>
          <Flash duration={10} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("launch-music.wav")} />
    </AbsoluteFill>
  );
};

