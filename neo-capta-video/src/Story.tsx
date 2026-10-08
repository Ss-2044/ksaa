import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Lang, STORY } from './copy';
import {
  AnimatedLine,
  BLUE,
  BLUE_LIGHT,
  Backdrop,
  BrandEndCard,
  FPS,
  Vignette,
  WHITE,
  clamp,
  ease,
  fontFor,
} from './shared';

// Works at 16:9, 9:16 and 1:1. Cues mirrored in music/compose.py score_story.
export const STORY_DURATION = 17 * FPS;
const Q_STARTS = [10, 66, 122];
const Q_LEN = 50;
const BEGINS = 180;
const BEGINS_END = 244;
const WORD_STARTS = [252, 300, 348];
const WORD_LEN = 48;
const LOGO = 400;

/* ------------------------------------------------------ the questions */

const Question: React.FC<{ f: number; k: number; lang: Lang; cx: number; cy: number }> = ({ f, k, lang, cx, cy }) => {
  const copy = STORY[lang];
  const start = Q_STARTS[k];
  const t = f - start;
  if (t < 0 || t > Q_LEN) return null;
  const pin = ease(t, 0, 12, [0, 1], Easing.out(Easing.cubic));
  const out = ease(t, Q_LEN - 10, Q_LEN, [0, 1], Easing.in(Easing.cubic));
  const markScale = interpolate(t, [0, Q_LEN], [0.9, 1.08]);
  const tilt = [-8, 6, -4][k] + interpolate(t, [0, Q_LEN], [0, 4]);
  const dot = interpolate(t, [0, 24], [1.5, 6], clamp);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy,
          transform: `translateY(-50%) scale(${markScale}) rotate(${tilt}deg)`,
          textAlign: 'center',
          fontFamily: fontFor(lang),
          fontWeight: 900,
          fontSize: 900,
          lineHeight: 1,
          color: 'transparent',
          backgroundImage: `radial-gradient(circle, ${BLUE_LIGHT} ${dot}px, transparent ${dot + 1}px)`,
          backgroundSize: '22px 22px',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          opacity: 0.32 * pin * (1 - out),
        }}
      >
        {copy.qMark}
      </div>
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          top: cy,
          transform: `translateY(-50%) translateY(${(1 - pin) * 40 - out * 30}px) scale(${1 + out * 0.08})`,
          textAlign: 'center',
          fontFamily: fontFor(lang),
          fontWeight: 900,
          fontSize: lang === 'ar' ? Math.min(150, cx * 0.26) : Math.min(120, cx * 0.19),
          lineHeight: 1.2,
          color: WHITE,
          opacity: pin * (1 - out),
          filter: `blur(${(1 - pin) * 14 + out * 12}px)`,
          textShadow: '0 10px 40px rgba(0,0,0,0.7)',
        }}
      >
        {copy.questions[k]}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------- "this is where it begins" */

const Begins: React.FC<{ f: number; lang: Lang; cx: number; cy: number; width: number }> = ({ f, lang, cx, cy, width }) => {
  if (f < BEGINS - 2 || f > BEGINS_END + 2) return null;
  const copy = STORY[lang];
  const line = ease(f, BEGINS + 6, BEGINS + 36, [0, 1], Easing.inOut(Easing.cubic));
  const out = ease(f, BEGINS_END - 12, BEGINS_END, [0, 1], Easing.in(Easing.cubic));
  const lineW = Math.min(width * 0.7, 900) * line * (1 - out);
  return (
    <AbsoluteFill>
      <AnimatedLine
        f={f}
        lang={lang}
        text={copy.begins}
        highlight={copy.beginsHighlight}
        start={BEGINS + 4}
        end={BEGINS_END}
        y={cy}
        size={lang === 'ar' ? Math.min(110, cx * 0.17) : Math.min(84, cx * 0.14)}
        weight={900}
      />
      <div
        style={{
          position: 'absolute',
          left: cx - lineW / 2,
          top: cy + 110,
          width: lineW,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${BLUE_LIGHT}, ${WHITE}, ${BLUE_LIGHT}, transparent)`,
          boxShadow: `0 0 24px ${BLUE_LIGHT}`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ CONTENT → STORY → IMPACT */

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>0123456789';

const scrambleWord = (f: number, from: string, to: string, start: number) => {
  const len = Math.max(from.length, to.length);
  const chars: { ch: string; settled: boolean }[] = [];
  for (let i = 0; i < len; i++) {
    const settleAt = start + 4 + i * 2.5;
    if (f >= settleAt) {
      if (i < to.length) chars.push({ ch: to[i], settled: true });
    } else if (f < start) {
      if (i < from.length) chars.push({ ch: from[i], settled: true });
    } else {
      const g = GLYPHS[Math.floor(random(`g-${i}-${Math.floor(f / 2)}`) * GLYPHS.length)];
      chars.push({ ch: g, settled: false });
    }
  }
  return chars;
};

const MorphWords: React.FC<{ f: number; lang: Lang; cx: number; cy: number; width: number; height: number }> = ({ f, lang, cx, cy, width, height }) => {
  const words = STORY[lang].words;
  const first = WORD_STARTS[0];
  const end = WORD_STARTS[2] + WORD_LEN;
  if (f < first - 2 || f > end + 4) return null;
  const k = f < WORD_STARTS[1] ? 0 : f < WORD_STARTS[2] ? 1 : 2;
  const start = WORD_STARTS[k];
  const chars = scrambleWord(f, k === 0 ? '' : words[k - 1], words[k], start);
  const pin = ease(f, first, first + 10, [0, 1], Easing.out(Easing.cubic));
  const out = ease(f, end - 10, end, [0, 1], Easing.in(Easing.cubic));
  const punch = interpolate(f - start, [0, 4, 14], [1.12, 1.12, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const size = Math.min(230, width * 0.15);
  const isImpact = k === 2;
  const local = f - start;

  // Layer behind each word.
  let layer: React.ReactNode = null;
  if (k === 0) {
    layer = Array.from({ length: 26 }, (_, i) => {
      const x = random(`cx-${i}`) * width;
      const y = random(`cy-${i}`) * height;
      const w = 70 + random(`cw-${i}`) * 90;
      const drift = (f - first) * (0.6 + random(`cd-${i}`)) * (i % 2 ? 1 : -1);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x + drift,
            top: y,
            width: w,
            height: w * 1.1,
            borderRadius: 10,
            border: '1.5px solid rgba(116,134,242,0.4)',
            background: 'rgba(23,36,107,0.25)',
            opacity: ease(f, first + i * 0.6, first + i * 0.6 + 8) * 0.8,
          }}
        />
      );
    });
  } else if (k === 1) {
    const p = ease(local, 0, 34, [0, 1], Easing.inOut(Easing.cubic));
    const w = Math.min(width * 0.8, 1100);
    const x0 = cx - w / 2;
    const y0 = cy + size * 0.9;
    const d = `M${x0} ${y0} C ${x0 + w * 0.25} ${y0 - 40}, ${x0 + w * 0.35} ${y0 + 60}, ${x0 + w * 0.5} ${y0 - 10} S ${x0 + w * 0.8} ${y0 - 120}, ${x0 + w} ${y0 - 160}`;
    layer = (
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <path d={d} fill="none" stroke={BLUE_LIGHT} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} style={{ filter: `drop-shadow(0 0 10px ${BLUE_LIGHT})` }} />
        {[0, 0.5, 1].map((at, i) => (
          <circle key={i} cx={x0 + w * at} cy={[y0, y0 - 10, y0 - 160][i]} r={12 * ease(p, at - 0.05, at + 0.05)} fill={WHITE} stroke={BLUE_LIGHT} strokeWidth={4} />
        ))}
      </svg>
    );
  } else {
    layer = [0, 6, 12].map((delay) => {
      const r = ease(local, delay, delay + 30, [0, Math.max(width, height) * 0.8], Easing.out(Easing.cubic));
      const a = interpolate(local, [delay, delay + 30], [0.8, 0], clamp);
      return (
        <div
          key={delay}
          style={{
            position: 'absolute',
            left: cx - r,
            top: cy - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: `${6 - delay / 3}px solid ${BLUE_LIGHT}`,
            opacity: a,
            boxShadow: `0 0 40px ${BLUE}`,
          }}
        />
      );
    });
  }

  return (
    <AbsoluteFill style={{ opacity: pin * (1 - out) }}>
      {layer}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy,
          transform: `translateY(-50%) scale(${punch * (1 + out * 0.3)})`,
          display: 'flex',
          justifyContent: 'center',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          fontSize: size,
          letterSpacing: '0.06em',
          lineHeight: 1,
          filter: `blur(${out * 10}px)`,
        }}
      >
        {chars.map((c, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: c.settled ? (isImpact ? BLUE_LIGHT : WHITE) : BLUE_LIGHT,
              opacity: c.settled ? 1 : 0.7,
              textShadow: isImpact && c.settled ? `0 0 40px ${BLUE}, 0 0 80px ${BLUE}` : '0 10px 40px rgba(0,0,0,0.6)',
            }}
          >
            {c.ch}
          </span>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy - size * 0.95,
          textAlign: 'center',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500,
          fontSize: 24,
          letterSpacing: '0.5em',
          color: BLUE_LIGHT,
        }}
      >
        0{k + 1} / 03
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ composition */

export const Story: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const copy = STORY[lang];
  const cx = width / 2;
  const cy = height / 2;
  const wide = width > height;
  const square = width === height;
  const fadeOut = interpolate(f, [STORY_DURATION - 12, STORY_DURATION - 1], [1, 0], clamp);
  const impact = WORD_STARTS[2];
  const shake = f >= impact && f < impact + 10 ? Math.sin(f * 2.9) * (10 - (f - impact)) * 1.6 : 0;
  const flash = interpolate(f, [impact - 1, impact, impact + 6], [0, 0.6, 0], clamp);
  const dark = interpolate(f, [BEGINS_END - 4, BEGINS_END + 2, WORD_STARTS[0] - 2, WORD_STARTS[0] + 4], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/story.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut, transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
        <Backdrop
          f={f}
          duration={STORY_DURATION}
          reveal={interpolate(f, [0, 20, BEGINS, BEGINS + 30, impact, impact + 10], [0.25, 0.4, 0.4, 0.75, 0.75, 1], clamp)}
          dots={interpolate(f, [impact, impact + 20], [0, 0.26], clamp)}
        />
        {[0, 1, 2].map((k) => (
          <Question key={k} f={f} k={k} lang={lang} cx={cx} cy={cy} />
        ))}
        <Begins f={f} lang={lang} cx={cx} cy={cy} width={width} />
        <AbsoluteFill style={{ background: '#000', opacity: dark * 0.7 }} />
        <MorphWords f={f} lang={lang} cx={cx} cy={cy} width={width} height={height} />
        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
          taglineLang={copy.taglineLang}
          taglineAt={58}
          cy={wide ? 400 : square ? 420 : 820}
          width={wide ? 700 : square ? 640 : 840}
        />
        <Vignette />
        <AbsoluteFill style={{ background: WHITE, opacity: flash }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
