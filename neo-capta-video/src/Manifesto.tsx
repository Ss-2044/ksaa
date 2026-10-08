import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { Lang, MANIFESTO, ManifestoCopy } from './copy';
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

export const MANIFESTO_DURATION = 20 * FPS;

// Scene boundaries (frames) — keep in sync with music/compose.py score_manifesto.
const SLAM = 180;
const SLAM_LEN = 50;
const RUN = 330;
const LOGO = 450;

/* ------------------------------------------------------------- the noise */

const NOISE_COUNT = 110;

const Noise: React.FC<{ f: number; copy: ManifestoCopy; lang: Lang }> = ({ f, copy, lang }) => {
  if (f > 140) return null;
  const collapse = ease(f, 116, 136, [0, 1], Easing.in(Easing.cubic));
  const shake = interpolate(f, [0, 110], [1, 7], clamp);
  return (
    <AbsoluteFill>
      {Array.from({ length: NOISE_COUNT }, (_, i) => {
        const appear = Math.pow(random(`na-${i}`), 0.7) * 100;
        if (f < appear) return null;
        const x0 = random(`nx-${i}`) * 1920;
        const y0 = random(`ny-${i}`) * 1080;
        const x = x0 + (960 - x0) * collapse + Math.sin(f * 1.7 + i) * shake;
        const y = y0 + (540 - y0) * collapse + Math.cos(f * 2.1 + i * 3) * shake;
        const size = 18 + random(`ns-${i}`) * 46;
        const flicker = 0.5 + 0.5 * Math.sin(f * (0.6 + random(`nf-${i}`)) + i);
        const pop = interpolate(f, [appear, appear + 4], [0, 1], clamp);
        const isBlue = random(`nb-${i}`) < 0.18;
        return (
          <div
            key={i}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${pop * (1 - collapse)}) rotate(${(random(`nr-${i}`) - 0.5) * 16}deg)`,
              fontFamily: fontFor(lang),
              fontWeight: random(`nw-${i}`) < 0.5 ? 900 : 400,
              fontSize: size,
              whiteSpace: 'nowrap',
              color: isBlue ? BLUE_LIGHT : WHITE,
              opacity: (0.12 + 0.3 * flicker) * (1 - collapse),
            }}
          >
            {copy.noise[i % copy.noise.length]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- the slams */

const PANELS = [
  { bg: '#05081a', fg: WHITE, echo: 'rgba(116,134,242,0.35)' },
  { bg: BLUE, fg: WHITE, echo: 'rgba(232,233,238,0.3)' },
  { bg: WHITE, fg: BLUE, echo: 'rgba(59,76,192,0.25)' },
];

const Slams: React.FC<{ f: number; copy: ManifestoCopy; lang: Lang }> = ({ f, copy, lang }) => {
  if (f < SLAM - 2 || f > RUN + 16) return null;
  return (
    <AbsoluteFill>
      {copy.slams.map((word, k) => {
        const start = SLAM + k * SLAM_LEN;
        const local = f - start;
        if (local < 0 || f > RUN + 16) return null;
        const panel = PANELS[k];
        const radius = ease(local, 0, 13, [0, 2300], Easing.in(Easing.quad)) * ease(f, RUN, RUN + 14, [1, 0], Easing.in(Easing.quad));
        const originX = k % 2 === 0 ? 0 : 1920;
        const pin = ease(local, 2, 12, [0, 1], Easing.out(Easing.cubic));
        const scale = interpolate(pin, [0, 1], [1.4, 1]) * interpolate(local, [12, SLAM_LEN], [1, 1.06], clamp);
        const row = (y: number, dir: number) => (
          <div
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            style={{
              position: 'absolute',
              top: y,
              left: -400,
              whiteSpace: 'nowrap',
              transform: `translateX(${dir * local * 7}px)`,
              fontFamily: fontFor(lang),
              fontWeight: 900,
              fontSize: 150,
              color: 'transparent',
              WebkitTextStroke: `2px ${panel.echo}`,
              lineHeight: 1.2,
            }}
          >
            {Array.from({ length: 6 }, () => word).join('   ')}
          </div>
        );
        return (
          <AbsoluteFill key={k} style={{ backgroundColor: panel.bg, clipPath: `circle(${radius}px at ${originX}px 540px)` }}>
            {row(90, -1)}
            {row(800, 1)}
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
              <div
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: 24,
                  letterSpacing: '0.5em',
                  color: panel.fg,
                  opacity: 0.7 * pin,
                  marginBottom: 10,
                }}
              >
                0{k + 1}
              </div>
              <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                style={{
                  fontFamily: fontFor(lang),
                  fontWeight: 900,
                  fontSize: lang === 'ar' ? 250 : 210,
                  lineHeight: 1.15,
                  color: panel.fg,
                  opacity: pin,
                  transform: `scale(${scale})`,
                  filter: `blur(${(1 - pin) * 16}px)`,
                }}
              >
                {word}
              </div>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- the runner */

const runnerX = (ff: number) => interpolate(ff, [RUN + 6, LOGO - 14], [-320, 2260], { ...clamp, easing: Easing.inOut(Easing.sin) });
const runnerY = (ff: number) => 470 + Math.sin(ff / 4) * 10;

const Runner: React.FC<{ f: number }> = ({ f }) => {
  if (f < RUN || f > LOGO) return null;
  const x = runnerX(f);
  const y = runnerY(f);
  const width = 330;
  const trail = Array.from({ length: 80 }, (_, j) => {
    const born = RUN + 8 + j * 1.3;
    if (f < born) return null;
    const age = (f - born) / 34;
    if (age > 1) return null;
    const bx = runnerX(born) - 120 - random(`tx-${j}`) * 120;
    const by = runnerY(born) + (random(`ty-${j}`) - 0.5) * 220;
    const r = (3 + random(`tr-${j}`) * 7) * (1 - age);
    return (
      <div
        key={j}
        style={{
          position: 'absolute',
          left: bx - r - age * 60,
          top: by - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          background: random(`tc-${j}`) < 0.3 ? WHITE : BLUE_LIGHT,
          opacity: 1 - age,
          boxShadow: `0 0 12px ${BLUE}`,
        }}
      />
    );
  });
  const lines = Array.from({ length: 14 }, (_, j) => {
    const period = 14 + random(`lp-${j}`) * 10;
    const t = ((f - RUN + random(`lph-${j}`) * period) % period) / period;
    const ly = y + (random(`ly-${j}`) - 0.5) * 300;
    const len = 160 + random(`ll-${j}`) * 360;
    return (
      <div
        key={j}
        style={{
          position: 'absolute',
          left: x - 200 - t * 700 - len,
          top: ly,
          width: len,
          height: 2.5,
          borderRadius: 2,
          background: `linear-gradient(90deg, rgba(116,134,242,0), ${BLUE_LIGHT})`,
          opacity: Math.sin(Math.PI * t) * 0.8,
        }}
      />
    );
  });
  return (
    <AbsoluteFill>
      {lines}
      {trail}
      <div
        style={{
          position: 'absolute',
          left: x - width / 2,
          top: y,
          transform: 'translateY(-50%)',
          filter: 'drop-shadow(0 0 30px rgba(90,110,255,0.9)) drop-shadow(0 0 8px rgba(200,210,255,0.6))',
        }}
      >
        <PersonSvg width={width} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ composition */

export const Manifesto: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = MANIFESTO[lang];
  const fadeOut = interpolate(f, [MANIFESTO_DURATION - 14, MANIFESTO_DURATION - 1], [1, 0], clamp);
  const quiet = ease(f, 116, 140, [0, 1]);
  const dot = interpolate(f, [128, 140, SLAM - 6, SLAM], [0, 1, 1, 0], clamp);
  const flash = interpolate(f, [LOGO - 8, LOGO, LOGO + 10], [0, 0.8, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/manifesto.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop
          f={f}
          duration={MANIFESTO_DURATION}
          reveal={interpolate(f, [0, 20, 116, 140, RUN, RUN + 20], [0.35, 0.5, 0.5, 0.15, 0.15, 1], clamp)}
          dots={interpolate(f, [RUN, RUN + 30], [0, 0.28], clamp)}
        />
        <Noise f={f} copy={copy} lang={lang} />
        <AbsoluteFill
          style={{
            background: 'radial-gradient(ellipse 40% 22% at 50% 50%, rgba(0,0,0,0.9), rgba(0,0,0,0))',
            opacity: interpolate(f, [8, 20, 112, 120], [0, 1, 1, 0], clamp),
          }}
        />
        <AnimatedLine f={f} lang={lang} text={copy.loud} start={10} end={60} y={540} size={lang === 'ar' ? 100 : 88} weight={900} />
        <AnimatedLine f={f} lang={lang} text={copy.talking} start={64} end={116} y={540} size={lang === 'ar' ? 100 : 88} weight={900} />

        {/* Silence: one voice */}
        <div
          style={{
            position: 'absolute',
            left: 960 - 9,
            top: 430 - 9,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: BLUE_LIGHT,
            boxShadow: `0 0 ${20 + 14 * Math.sin(f / 5)}px ${BLUE_LIGHT}`,
            opacity: dot * quiet,
          }}
        />
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.heard}
          highlight={copy.heardHighlight}
          start={134}
          end={SLAM - 2}
          y={560}
          size={lang === 'ar' ? 84 : 76}
          weight={lang === 'ar' ? 700 : 600}
        />

        <Slams f={f} copy={copy} lang={lang} />

        <Runner f={f} />
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.forward}
          highlight={copy.forwardHighlight}
          start={RUN + 26}
          end={LOGO - 4}
          y={790}
          size={lang === 'ar' ? 92 : 80}
          weight={lang === 'ar' ? 900 : 800}
        />

        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
        />
        <Vignette />
        <AbsoluteFill style={{ background: WHITE, opacity: flash }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
