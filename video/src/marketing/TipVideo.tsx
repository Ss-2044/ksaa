import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { Words } from "./Words";
import { EndCard } from "./EndCard";
import { TIP_TIMING, Tip, tipCtaFrom } from "./tips";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { title: TITLE, points: POINTS, each: EACH } = TIP_TIMING;

const Hook: React.FC<{ tip: Tip }> = ({ tip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = spring({ frame: frame - 2, fps, config: { damping: 10 } });
  const out = interpolate(frame, [TITLE - 10, TITLE], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: fonts.en, fontWeight: 900, fontSize: 620, lineHeight: 1, color: colors.accent, opacity: 0.16 * q, transform: `scale(${0.5 + q * 0.5}) rotate(${(1 - q) * -30 + Math.sin(frame / 12) * 4}deg)` }}>?</div>
      <div style={{ position: "absolute", top: 760, left: 0, right: 0 }}>
        <Words text={tip.hook} size={122} color={colors.white} highlight={tip.hookHl} delay={4} gap={4} />
      </div>
    </AbsoluteFill>
  );
};

const Title: React.FC<{ tip: Tip }> = ({ tip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const badge = spring({ frame, fps, config: { damping: 9, stiffness: 150 } });
  const out = interpolate(frame, [POINTS - TITLE - 10, POINTS - TITLE], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "14px 44px", borderRadius: 60, background: colors.accent, transform: `scale(${badge}) rotate(-4deg)`, fontFamily: fonts.en, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#fff" }}>
          MARKETING TIP
        </div>
      </div>
      <div style={{ position: "absolute", top: 720, left: 0, right: 0 }}>
        <Words text={tip.title} size={128} color={colors.white} highlight={[0]} delay={6} gap={4} />
        <div style={{ marginTop: 30 }}>
          <Words text={tip.titleEn} size={50} color={colors.silver} ar={false} weight={800} delay={16} gap={2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Mark: React.FC<{ good: boolean; p: number }> = ({ good, p }) => {
  const c = good ? "#3ddc84" : "#ff4b55";
  const len = 140;
  return (
    <svg width={190} height={190} viewBox="0 0 190 190" style={{ transform: `scale(${p})` }}>
      <circle cx={95} cy={95} r={84} fill={`${c}22`} stroke={c} strokeWidth={8} />
      {good ? (
        <path d="M 55 98 L 84 126 L 138 66" fill="none" stroke={c} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
      ) : (
        <g stroke={c} strokeWidth={16} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)}>
          <path d="M 62 62 L 128 128" />
          <path d="M 128 62 L 62 128" />
        </g>
      )}
    </svg>
  );
};

const PointCard: React.FC<{ tip: Tip; k: number }> = ({ tip, k }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pt = tip.points[k];
  const num = spring({ frame, fps, config: { damping: 10, stiffness: 140 } });
  const mark = spring({ frame: frame - 14, fps, config: { damping: 12 } });
  const body = spring({ frame: frame - 34, fps, config: { damping: 14 } });
  const out = interpolate(frame, [EACH - 10, EACH], [1, 0], clamp);
  const slide = interpolate(frame, [EACH - 10, EACH], [0, -160], clamp);
  return (
    <AbsoluteFill style={{ opacity: out, transform: `translateX(${slide}px)` }}>
      {/* giant outlined number */}
      <div style={{ position: "absolute", top: 260, left: 0, right: 0, textAlign: "center", fontFamily: fonts.en, fontWeight: 900, fontSize: 380, lineHeight: 1, color: "transparent", WebkitTextStroke: `6px ${colors.accent}`, opacity: 0.55, transform: `scale(${0.6 + num * 0.4}) translateY(${(1 - num) * 80}px)` }}>
        0{k + 1}
      </div>
      <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Mark good={!!pt.good} p={mark} />
      </div>
      <div style={{ position: "absolute", top: 830, left: 0, right: 0 }}>
        <Words text={pt.title} size={104} color={colors.white} delay={6} gap={3} />
        <div style={{ marginTop: 18 }}>
          <Words text={pt.en} size={46} color={colors.accent} ar={false} weight={800} delay={14} gap={2} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 1230, left: 80, right: 80, padding: "40px 46px", borderRadius: 34, background: "rgba(228,230,238,0.08)", border: `3px solid rgba(94,120,255,0.55)`, borderRight: `14px solid ${pt.good ? colors.accent : "#ff4b55"}`, opacity: body, transform: `translateY(${(1 - body) * 70}px)` }}>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 56, lineHeight: 1.5, color: colors.silver, textAlign: "right" }}>
          {pt.body}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// story-style progress segments across the top
const Progress: React.FC = () => {
  const frame = useCurrentFrame() + POINTS;
  return (
    <div style={{ position: "absolute", top: 120, left: 80, right: 80, display: "flex", gap: 16, direction: "rtl" }}>
      {[0, 1, 2].map((k) => {
        const p = interpolate(frame, [POINTS + k * EACH, POINTS + (k + 1) * EACH], [0, 1], clamp);
        return (
          <div key={k} style={{ flex: 1, height: 12, borderRadius: 6, background: "rgba(228,230,238,0.18)", overflow: "hidden" }}>
            <div style={{ width: `${p * 100}%`, height: "100%", background: colors.accent, marginLeft: "auto" }} />
          </div>
        );
      })}
    </div>
  );
};

export const TipVideo: React.FC<{ tip: Tip }> = ({ tip }) => {
  useFonts();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cuts = [TITLE, POINTS, POINTS + EACH, POINTS + 2 * EACH, tipCtaFrom];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Background intensity={0.9 + Math.sin(frame / 40) * 0.2} />
      <Sequence from={0} durationInFrames={TITLE}>
        <Hook tip={tip} />
      </Sequence>
      <Sequence from={TITLE} durationInFrames={POINTS - TITLE}>
        <Title tip={tip} />
      </Sequence>
      {tip.points.map((_, k) => (
        <Sequence key={k} from={POINTS + k * EACH} durationInFrames={EACH}>
          <PointCard tip={tip} k={k} />
        </Sequence>
      ))}
      <Sequence from={POINTS} durationInFrames={tipCtaFrom - POINTS}>
        <Progress />
      </Sequence>
      <Sequence from={tipCtaFrom} durationInFrames={durationInFrames - tipCtaFrom}>
        <EndCard line={tip.cta} en={tip.ctaEn} />
      </Sequence>
      <Sequence from={0} durationInFrames={tipCtaFrom}>
        <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 0.8 }}>
          <Logo width={170} />
        </div>
      </Sequence>
      {cuts.map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={8}>
          <Flash duration={6} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile(tip.music)} />
    </AbsoluteFill>
  );
};
