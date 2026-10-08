import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { COUNTDOWN, Lang } from './copy';
import {
  AnimatedLine,
  BLUE,
  BLUE_LIGHT,
  Backdrop,
  BrandEndCard,
  FPS,
  PersonSvg,
  Vignette,
  WHITE,
  clamp,
  ease,
  fontFor,
} from './shared';

// Square 1080×1080. Cues mirrored in music/compose.py score_countdown.
export const COUNTDOWN_DURATION = 12 * FPS;
const DIGIT0 = 30;
const DIGIT_LEN = 60;
const GO = 210;
const LOGO = 252;

const CX = 540;
const CY = 590;
const RING_R = 360;

const Digit: React.FC<{ f: number; k: number; lang: Lang }> = ({ f, k, lang }) => {
  const start = DIGIT0 + k * DIGIT_LEN;
  const t = f - start;
  if (t < 0 || t > DIGIT_LEN) return null;
  const copy = COUNTDOWN[lang];
  const pin = ease(t, 0, 9, [0, 1], Easing.out(Easing.cubic));
  const out = ease(t, DIGIT_LEN - 9, DIGIT_LEN, [0, 1], Easing.in(Easing.cubic));
  const dot = interpolate(t, [0, 30], [2, 9.5], { ...clamp, easing: Easing.out(Easing.quad) });
  const last = k === 2;
  const dotColor = last ? BLUE_LIGHT : WHITE;
  const progress = interpolate(t, [0, DIGIT_LEN - 6], [0, 1], clamp);
  const circ = 2 * Math.PI * RING_R;
  const ticks = 60;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - out }}>
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="rgba(232,233,238,0.1)" strokeWidth={6} />
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          stroke={last ? BLUE_LIGHT : WHITE}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - progress)}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ filter: `drop-shadow(0 0 12px ${BLUE_LIGHT})` }}
        />
        {Array.from({ length: ticks }, (_, i) => {
          const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
          const lit = i / ticks <= progress;
          const r1 = RING_R + 26;
          const r2 = RING_R + (i % 5 === 0 ? 50 : 38);
          return (
            <line
              key={i}
              x1={CX + Math.cos(a) * r1}
              y1={CY + Math.sin(a) * r1}
              x2={CX + Math.cos(a) * r2}
              y2={CY + Math.sin(a) * r2}
              stroke={lit ? BLUE_LIGHT : 'rgba(232,233,238,0.18)'}
              strokeWidth={i % 5 === 0 ? 4 : 2}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CY,
          transform: `translateY(-52%) scale(${interpolate(pin, [0, 1], [1.5, 1]) * (1 - out * 0.4)})`,
          textAlign: 'center',
          fontFamily: fontFor(lang),
          fontWeight: 900,
          fontSize: lang === 'ar' ? 600 : 560,
          lineHeight: 1,
          color: 'transparent',
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dot}px, transparent ${dot + 1}px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: 'center',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextStroke: `3px ${last ? BLUE_LIGHT : 'rgba(232,233,238,0.7)'}`,
          opacity: pin * (1 - out),
          filter: `blur(${(1 - pin) * 14 + out * 10}px) drop-shadow(0 0 30px rgba(59,76,192,0.6))`,
        }}
      >
        {copy.digits[k]}
      </div>
    </AbsoluteFill>
  );
};

const Launch: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const t = f - GO;
  if (t < -6 || t > LOGO - GO + 6) return null;
  const copy = COUNTDOWN[lang];
  const pin = ease(t, 0, 8, [0, 1], Easing.out(Easing.back(2)));
  const out = ease(t, LOGO - GO - 10, LOGO - GO + 4, [0, 1], Easing.in(Easing.cubic));
  const ring = ease(t, 0, 34, [0, 1], Easing.out(Easing.cubic));
  const fly = (tt: number) => ease(tt, -4, 34, [0, 1], Easing.inOut(Easing.cubic));
  const runnerPos = (tt: number) => {
    const p = fly(tt);
    return [interpolate(p, [0, 1], [-260, 1360]), interpolate(p, [0, 1], [960, 80]) - Math.sin(p * Math.PI) * 120];
  };
  const [rx, ry] = runnerPos(t);
  return (
    <AbsoluteFill>
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        const r = ring * (300 + random(`gr-${i}`) * 420);
        const size = (6 + random(`gs-${i}`) * 12) * (1 - ring * 0.6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: CX + Math.cos(a) * r - size / 2,
              top: CY + Math.sin(a) * r - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: i % 3 === 0 ? WHITE : BLUE_LIGHT,
              opacity: (1 - ring) * (t >= 0 ? 1 : 0),
              boxShadow: `0 0 12px ${BLUE_LIGHT}`,
            }}
          />
        );
      })}
      {[6, 4, 2].map((k) => {
        const [gx, gy] = runnerPos(t - k);
        return (
          <div key={k} style={{ position: 'absolute', left: gx - 120, top: gy - 100, opacity: 0.1 * (8 - k) * (1 - out) }}>
            <PersonSvg width={240} color={BLUE} />
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: rx - 130,
          top: ry - 110,
          opacity: 1 - out,
          filter: 'drop-shadow(0 0 30px rgba(90,110,255,0.95))',
        }}
      >
        <PersonSvg width={260} />
      </div>
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CY,
          transform: `translateY(-50%) scale(${pin * (1 + out * 0.6)})`,
          textAlign: 'center',
          fontFamily: fontFor(lang),
          fontWeight: 900,
          fontSize: lang === 'ar' ? 280 : 300,
          lineHeight: 1.1,
          color: WHITE,
          opacity: Math.min(pin, 1) * (1 - out),
          textShadow: `0 0 60px ${BLUE_LIGHT}, 0 0 120px ${BLUE}`,
          letterSpacing: lang === 'en' ? '0.04em' : undefined,
        }}
      >
        {copy.go}
      </div>
    </AbsoluteFill>
  );
};

export const Countdown: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = COUNTDOWN[lang];
  const fadeOut = interpolate(f, [COUNTDOWN_DURATION - 12, COUNTDOWN_DURATION - 1], [1, 0], clamp);
  const flash = interpolate(f, [GO - 2, GO, GO + 8], [0, 0.85, 0], clamp);
  const shake = f >= GO && f < GO + 10 ? Math.sin(f * 2.7) * (10 - (f - GO)) * 1.5 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/countdown.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <Backdrop
          f={f}
          duration={COUNTDOWN_DURATION}
          reveal={interpolate(f, [0, 30, GO - 10, GO], [0.3, 0.6, 0.6, 1], clamp)}
          dots={interpolate(f, [GO, GO + 20], [0, 0.28], clamp)}
        />
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.lead}
          start={4}
          end={GO - 4}
          y={120}
          size={lang === 'ar' ? 66 : 54}
          weight={lang === 'ar' ? 700 : 600}
          color="rgba(232,233,238,0.85)"
        />
        {[0, 1, 2].map((k) => (
          <Digit key={k} f={f} k={k} lang={lang} />
        ))}
        <Launch f={f} lang={lang} />
        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
          taglineAt={54}
          cy={420}
          width={640}
        />
        <Vignette />
        <AbsoluteFill style={{ background: WHITE, opacity: flash }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
