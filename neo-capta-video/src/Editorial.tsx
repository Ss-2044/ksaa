import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import logo from './logo.json';
import { EDITORIAL, Lang } from './copy';
import { AnimatedLine, BLUE, BLUE_LIGHT, FPS, LH, LW, clamp, ease, fontFor, personCenter } from './shared';

// Light, magazine-style typography. Works at 16:9, 9:16 and 1:1.
// Cues mirrored in music/compose.py score_editorial.
export const EDITORIAL_DURATION = 15 * FPS;
const RULES = 0;
const LINE0 = 24;
const LINE_LEN = 92;
const STACK = 300;
const STACK_END = 366;
const LOGO = 372;

const PAPER = '#F3F4F8';
const INK = '#0a1033';
const RULE = '#dde0ea';

/* ---------------------------------------------------------- keyword */

const Marked: React.FC<{ text: string; lang: Lang; size: number; mark: number; pop: number }> = ({ text, lang, size, mark, pop }) => {
  const rtl = lang === 'ar';
  return (
    <span style={{ position: 'relative', display: 'inline-block', padding: `0 ${size * 0.08}px` }}>
      <span
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: size * 0.12,
          height: size * 0.42,
          background: BLUE_LIGHT,
          opacity: 0.32,
          transform: `scaleX(${mark}) skewX(-8deg)`,
          transformOrigin: rtl ? 'right center' : 'left center',
          borderRadius: 6,
        }}
      />
      <span
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          position: 'relative',
          fontFamily: fontFor(lang),
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.15,
          color: BLUE,
          display: 'inline-block',
          transform: `translateY(${(1 - pop) * size * 0.4}px)`,
          opacity: pop,
          clipPath: `inset(0 0 ${(1 - pop) * 100}% 0)`,
        }}
      >
        {text}
      </span>
    </span>
  );
};

/* ---------------------------------------------------------- light logo */

const LightLogo: React.FC<{ f: number; width: number; lang: Lang }> = ({ f, width, lang }) => {
  const r = f - LOGO;
  const height = (LH / LW) * width;
  const neo = ease(r, 0, 24, [0, 1], Easing.out(Easing.cubic));
  const wipe = ease(r, 4, 40, [0, 1], Easing.inOut(Easing.cubic));
  const person = ease(r, 18, 44, [0, 1], Easing.out(Easing.back(1.4)));
  const [pcx, pcy] = personCenter();
  const clipX = lang === 'ar' ? LW * (1 - wipe) : 0;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${LW} ${LH}`} style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="edWipe">
          <rect x={clipX} y={0} width={LW * wipe} height={LH} />
        </clipPath>
      </defs>
      <g opacity={neo} transform={`translate(0 ${(1 - neo) * -80})`}>
        <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
      </g>
      <g clipPath="url(#edWipe)">
        <path d={logo.capta} fill={INK} fillRule="evenodd" />
      </g>
      <path
        d={logo.person}
        fill={BLUE}
        fillRule="evenodd"
        opacity={person > 0 ? 1 : 0}
        transform={`translate(${pcx} ${pcy}) scale(${person}) rotate(${(1 - person) * -40}) translate(${-pcx} ${-pcy})`}
      />
    </svg>
  );
};

/* ---------------------------------------------------------- composition */

export const Editorial: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const copy = EDITORIAL[lang];
  const rtl = lang === 'ar';
  const cx = width / 2;
  const cy = height / 2;
  const wide = width > height;
  const fadeOut = interpolate(f, [EDITORIAL_DURATION - 12, EDITORIAL_DURATION - 1], [1, 0], clamp);
  const aSize = Math.min(rtl ? 96 : 84, width * (rtl ? 0.085 : 0.07));
  const kSize = Math.min(rtl ? 230 : 170, width * (rtl ? 0.19 : 0.12));
  const k = Math.min(2, Math.max(0, Math.floor((f - LINE0) / LINE_LEN)));
  const inLines = f >= LINE0 && f < LINE0 + 3 * LINE_LEN;
  const pad = wide ? 80 : 60;

  const ruleCount = Math.ceil(width / 160) + 1;
  const rules = Array.from({ length: ruleCount }, (_, i) => {
    const p = ease(f, RULES + i * 1.5, RULES + i * 1.5 + 20, [0, 1], Easing.out(Easing.cubic));
    return <div key={i} style={{ position: 'absolute', left: i * 160, top: 0, width: 1, height: height * p, background: RULE }} />;
  });

  let line: React.ReactNode = null;
  if (inLines) {
    const start = LINE0 + k * LINE_LEN;
    const t = f - start;
    const aIn = ease(t, 0, 14, [0, 1], Easing.out(Easing.cubic));
    const pop = ease(t, 12, 26, [0, 1], Easing.out(Easing.cubic));
    const mark = ease(t, 22, 36, [0, 1], Easing.inOut(Easing.cubic));
    const out = ease(t, LINE_LEN - 12, LINE_LEN, [0, 1], Easing.in(Easing.cubic));
    const baseLine = ease(t, 6, 30, [0, 1], Easing.inOut(Easing.cubic));
    line = (
      <AbsoluteFill style={{ opacity: 1 - out, transform: `translateY(${-out * 80}px)` }}>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          style={{
            position: 'absolute',
            left: pad,
            right: pad,
            top: cy - kSize * 0.95,
            transform: `translateY(-100%) translateX(${(1 - aIn) * (rtl ? 60 : -60)}px)`,
            textAlign: 'center',
            fontFamily: fontFor(lang),
            fontWeight: rtl ? 700 : 600,
            fontSize: aSize,
            color: INK,
            opacity: aIn,
          }}
        >
          {copy.lines[k].a}
        </div>
        <div style={{ position: 'absolute', left: pad, right: pad, top: cy - kSize * 0.7, textAlign: 'center' }}>
          <Marked text={copy.lines[k].b} lang={lang} size={kSize} mark={mark} pop={pop} />
        </div>
        <div style={{ position: 'absolute', left: cx - (width * 0.35 * baseLine), top: cy + kSize * 0.75, width: width * 0.7 * baseLine, height: 2, background: INK, opacity: 0.15 }} />
      </AbsoluteFill>
    );
  }

  // Stack: all three verdicts together, escalating.
  let stack: React.ReactNode = null;
  if (f >= STACK - 2 && f <= STACK_END + 2) {
    const out = ease(f, STACK_END - 10, STACK_END, [0, 1], Easing.in(Easing.cubic));
    const sizes = [kSize * 0.42, kSize * 0.52, kSize * 0.68];
    stack = (
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 6, opacity: 1 - out }}>
        {copy.lines.map((l, i) => {
          const s = STACK + i * 9;
          const pop = ease(f, s, s + 12, [0, 1], Easing.out(Easing.cubic));
          const mark = i === 2 ? ease(f, s + 10, s + 24, [0, 1], Easing.inOut(Easing.cubic)) : 0;
          return (
            <div key={i} style={{ opacity: i === 2 ? 1 : 0.55 }}>
              <Marked text={l.b} lang={lang} size={sizes[i]} mark={mark} pop={pop} />
            </div>
          );
        })}
      </AbsoluteFill>
    );
  }

  const logoW = wide ? 640 : width === height ? 580 : 760;
  const logoH = (LH / LW) * logoW;
  const logoCy = wide ? 420 : width === height ? 430 : 820;
  const sp = ease(f, LOGO + 46, LOGO + 70, [0, 1], Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <Audio src={staticFile('audio/editorial.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {rules}
        {/* masthead */}
        <div
          style={{
            position: 'absolute',
            top: wide ? 50 : 70,
            left: pad,
            right: pad,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '0.4em',
            color: INK,
            opacity: ease(f, 6, 24) * (1 - ease(f, LOGO - 10, LOGO)),
            borderBottom: `2px solid ${INK}`,
            paddingBottom: 14,
          }}
        >
          <span>NEO CAPTA</span>
          <span style={{ color: BLUE }}>{inLines ? `0${k + 1} / 03` : f >= STACK ? '—' : ''}</span>
        </div>
        {line}
        {stack}
        {f >= LOGO && (
          <>
            <div style={{ position: 'absolute', left: cx - logoW / 2, top: logoCy - logoH / 2 }}>
              <LightLogo f={f} width={logoW} lang={lang} />
            </div>
            <div
              dir={rtl ? 'rtl' : 'ltr'}
              style={{
                position: 'absolute',
                top: logoCy + logoH / 2 + 60,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: fontFor(lang),
                fontWeight: rtl ? 700 : 600,
                fontSize: rtl ? 38 : 24,
                letterSpacing: rtl ? undefined : '0.25em',
                textTransform: rtl ? undefined : 'uppercase',
                color: INK,
                opacity: sp * 0.75,
              }}
            >
              {copy.services}
            </div>
            <AnimatedLine
              f={f}
              lang={lang}
              text={copy.tagline}
              highlight={copy.taglineHighlight}
              start={LOGO + 52}
              y={logoCy + logoH / 2 + 160}
              size={Math.min(rtl ? 64 : 52, width * 0.055)}
              weight={900}
              color={INK}
              shadow={false}
            />
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
