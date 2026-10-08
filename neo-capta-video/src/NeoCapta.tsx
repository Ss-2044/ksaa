import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  interpolateColors,
  random,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import logo from './logo.json';
import { COPY, Copy, Lang } from './copy';
import { GlimpseIcon } from './icons';
import {
  AnimatedLine,
  BLUE,
  BLUE_LIGHT,
  FPS,
  LH,
  LW,
  PERSON_BOX,
  PersonSvg,
  WHITE,
  clamp,
  ease,
  fontFor,
  personCenter,
} from './shared';

export { FPS };
export const DURATION = 24 * FPS;

// Scene boundaries (frames).
const S2 = 90;
const S3 = 210;
const S4 = 360;
const S5 = 510;

const POINTS = logo.points as [number, number, number][];

type Layout = { cx: number; cy: number; s: number };
const layout = (cx: number, cy: number, width: number): Layout => ({ cx, cy, s: width / LW });
const L3 = layout(960, 540, 760);
const L5 = layout(960, 400, 720);
const toScreen = (x: number, y: number, l: Layout) => [l.cx + (x - LW / 2) * l.s, l.cy + (y - LH / 2) * l.s];

/* ---------------------------------------------------------------- particles */

const COLS = 38;
const ROWS = 21;
const GX = 1920 / COLS;
const GY = 1080 / ROWS;

type Particle = { gx: number; gy: number; lx: number; ly: number; blue: boolean; d1: number; d2: number };

const buildParticles = (): Particle[] => {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => i).sort(
    (a, b) => random(`cell-${a}`) - random(`cell-${b}`),
  );
  return POINTS.map(([lx, ly, c], i) => {
    const cell = cells[i];
    const row = Math.floor(cell / COLS);
    const gx = (cell % COLS) * GX + GX / 2 + (row % 2 ? GX / 4 : -GX / 4);
    const gy = row * GY + GY / 2;
    const dist = Math.hypot(gx - 960, gy - 540);
    return { gx, gy, lx, ly, blue: c === 1, d1: (dist / 1100) * 26, d2: random(`d2-${i}`) * 55 };
  });
};

const halftoneBand = (x: number, y: number, f: number) => {
  const offset = interpolate(f, [S2, S3 + 30], [-500, 2300], clamp);
  const d = x * 0.55 + y - offset;
  return 0.18 + 0.82 * Math.exp(-(d * d) / (2 * 260 * 260));
};

const Particles: React.FC<{ f: number }> = ({ f }) => {
  const particles = useMemo(buildParticles, []);
  if (f >= 620) return null;

  // Dot path in scene 1: appears, then spirals into the centre.
  const spiral = ease(f, 50, S2, [0, 1], Easing.inOut(Easing.quad));
  const theta = -Math.PI / 2 + spiral * Math.PI * 2.4;
  const R = 70 * (1 - spiral);
  const dotPos = (ff: number) => {
    const sp = ease(ff, 50, S2, [0, 1], Easing.inOut(Easing.quad));
    const th = -Math.PI / 2 + sp * Math.PI * 2.4;
    const rr = 70 * (1 - sp);
    return [960 + rr * Math.cos(th), 540 + rr * Math.sin(th)];
  };
  const originX = 960 + R * Math.cos(theta);
  const originY = 540 + R * Math.sin(theta);

  const lay: Layout =
    f < S5
      ? L3
      : {
          cx: L3.cx,
          cy: interpolate(f, [S5, S5 + 35], [L3.cy, L5.cy], { ...clamp, easing: Easing.inOut(Easing.cubic) }),
          s: interpolate(f, [S5, S5 + 35], [L3.s, L5.s], { ...clamp, easing: Easing.inOut(Easing.cubic) }),
        };

  const dim = interpolate(f, [S4, S4 + 25, S5, S5 + 30, 565, 610], [1, 0.12, 0.12, 1, 1, 0], clamp);
  const firstDot = interpolate(f, [6, 20], [0, 7], { ...clamp, easing: Easing.out(Easing.back(3)) });

  const circles: React.ReactNode[] = [];

  if (f < S2 + 4) {
    for (let k = 6; k >= 1; k--) {
      const [tx, ty] = dotPos(f - k * 2);
      const a = f > 52 ? (1 - k / 7) * 0.35 : 0;
      circles.push(<circle key={`t${k}`} cx={tx} cy={ty} r={firstDot * (1 - k / 9)} fill={BLUE_LIGHT} opacity={a} />);
    }
    circles.push(<circle key="dot" cx={originX} cy={originY} r={firstDot} fill={BLUE_LIGHT} />);
  }

  if (f >= S2) {
    particles.forEach((p, i) => {
      const e = interpolate(f, [S2 + p.d1, S2 + p.d1 + 28], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
      const c = interpolate(f, [S3 + 5 + p.d2, S3 + 5 + p.d2 + 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
      const [lx, ly] = toScreen(p.lx, p.ly, lay);
      const wobble = Math.sin(f / 9 + i) * 3 * (1 - c);
      const x = interpolate(c, [0, 1], [960 + (p.gx - 960) * e, lx]) + wobble;
      const y = interpolate(c, [0, 1], [540 + (p.gy - 540) * e, ly]) + wobble * 0.6;
      const band = halftoneBand(p.gx, p.gy, f);
      const gridR = 1.4 + 6.2 * band;
      const logoR = 0.36 * 34 * lay.s * 1.05;
      const r = interpolate(c, [0, 1], [gridR * Math.min(e * 1.2, 1), logoR]) * (f > 565 ? dim : 1);
      const gridColor = interpolateColors(band, [0.3, 0.75], [BLUE, WHITE]);
      const fill = interpolateColors(c, [0, 1], [gridColor, p.blue ? BLUE_LIGHT : WHITE]);
      const opacity = Math.min(e * 2, 1) * (f > S4 ? dim : 1);
      circles.push(<circle key={i} cx={x} cy={y} r={Math.max(r, 0)} fill={fill} opacity={opacity} />);
    });
  }

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">{circles}</g>
    </svg>
  );
};

/* --------------------------------------------------------------- background */

const Background: React.FC<{ f: number }> = ({ f }) => {
  const reveal = interpolate(f, [60, 140], [0, 1], clamp);
  const gx = interpolate(f, [0, DURATION], [25, 75]);
  const gy = interpolate(f, [0, DURATION], [30, 60]);
  const bandPos = interpolate(f, [S3, DURATION], [-10, 90]);
  const halftone = interpolate(f, [S3 + 20, S3 + 70, S5, S5 + 40], [0, 0.32, 0.32, 0.2], clamp);
  const halftoneMask = `linear-gradient(120deg, transparent ${bandPos - 28}%, black ${bandPos}%, transparent ${bandPos + 28}%)`;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill
        style={{
          opacity: reveal,
          background: `radial-gradient(ellipse 80% 90% at ${gx}% ${gy}%, #17246b 0%, #0a1033 38%, #03040d 72%, #000 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: reveal * 0.8,
          background: `linear-gradient(${interpolate(f, [0, DURATION], [110, 150])}deg, rgba(59,76,192,0) 20%, rgba(59,76,192,0.22) 45%, rgba(232,233,238,0.06) 55%, rgba(59,76,192,0) 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: halftone,
          backgroundImage:
            'radial-gradient(circle, rgba(232,233,238,0.95) 2.2px, transparent 3px), radial-gradient(circle, rgba(116,134,242,0.9) 1.6px, transparent 2.4px)',
          backgroundSize: '24px 24px, 24px 24px',
          backgroundPosition: '0 0, 12px 12px',
          WebkitMaskImage: halftoneMask,
          maskImage: halftoneMask,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ scene 2 words */

const FlashWords: React.FC<{ f: number; copy: Copy; lang: Lang }> = ({ f, copy, lang }) => {
  const step = 25;
  const first = S2 + 18;
  const idx = Math.floor((f - first) / step);
  if (idx < 0 || idx >= copy.words.length) return null;
  const local = f - first - idx * step;
  const pin = interpolate(local, [0, 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pout = interpolate(local, [step - 4, step], [1, 0], clamp);
  const scale = interpolate(pin, [0, 1], [1.35, 1]) * interpolate(local, [6, step], [1, 0.96], clamp);
  const isLast = idx === copy.words.length - 1;
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 38% 30% at 50% 50%, rgba(0,0,0,0.85), rgba(0,0,0,0) 100%)',
          opacity: interpolate(f, [S2 + 10, S2 + 20, S3 - 6, S3], [0, 1, 1, 0], clamp),
        }}
      />
      <div
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: '0.5em',
          color: BLUE_LIGHT,
          opacity: pin * pout,
          marginBottom: 6,
        }}
      >
        0{idx + 1} / 0{copy.words.length}
      </div>
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{
          fontFamily: fontFor(lang),
          fontWeight: lang === 'ar' ? 900 : 800,
          fontSize: lang === 'ar' ? 210 : 190,
          letterSpacing: lang === 'en' ? '0.08em' : undefined,
          lineHeight: 1.15,
          color: isLast ? BLUE_LIGHT : WHITE,
          opacity: pin * pout,
          transform: `scale(${scale})`,
          filter: `blur(${(1 - pin) * 18}px)`,
          textShadow: isLast ? `0 0 60px ${BLUE}` : '0 0 40px rgba(0,0,0,0.8)',
        }}
      >
        {copy.words[idx]}
      </div>
      <div
        style={{
          height: 4,
          width: interpolate(local, [2, step - 2], [0, 420], { ...clamp, easing: Easing.out(Easing.cubic) }),
          background: `linear-gradient(90deg, transparent, ${BLUE_LIGHT}, transparent)`,
          opacity: pout,
          marginTop: 8,
        }}
      />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------- scene 3 glimpses */

const GLIMPSE_SLOTS: [side: 'L' | 'R', y: number][] = [
  ['L', 150],
  ['R', 440],
  ['L', 730],
  ['R', 150],
  ['L', 440],
  ['R', 730],
];

const Glimpses: React.FC<{ f: number; copy: Copy; lang: Lang }> = ({ f, copy, lang }) => (
  <>
    {copy.glimpses.map((label, k) => {
      const start = S3 + 12 + k * 22;
      const end = start + 34;
      if (f < start || f > end) return null;
      const local = f - start;
      const [side, y] = GLIMPSE_SLOTS[k];
      const wipe = interpolate(local, [0, 8], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
      const flash = interpolate(local, [0, 3, 10], [0, 0.7, 0], clamp);
      const out = interpolate(local, [26, 34], [1, 0], clamp);
      const dx = interpolate(local, [26, 34], [0, side === 'L' ? -50 : 50], clamp);
      const fromRight = lang === 'ar';
      return (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: side === 'L' ? 130 : 1920 - 130 - 340,
            top: y,
            width: 340,
            height: 220,
            borderRadius: 20,
            overflow: 'hidden',
            background: 'linear-gradient(160deg, rgba(23,36,107,0.85), rgba(5,8,26,0.9))',
            border: `1.5px solid rgba(116,134,242,0.55)`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59,76,192,0.35)`,
            clipPath: fromRight ? `inset(0 0 0 ${wipe}%)` : `inset(0 ${wipe}% 0 0)`,
            opacity: out,
            transform: `translateX(${dx}px) scale(${interpolate(local, [0, 10], [1.08, 1], clamp)})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          <GlimpseIcon index={k} t={local} />
          <div
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            style={{
              fontFamily: fontFor(lang),
              fontWeight: 700,
              fontSize: lang === 'ar' ? 34 : 28,
              letterSpacing: lang === 'en' ? '0.12em' : undefined,
              textTransform: lang === 'en' ? 'uppercase' : undefined,
              color: WHITE,
            }}
          >
            {label}
          </div>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: flash }} />
        </div>
      );
    })}
  </>
);

/* --------------------------------------------------------- scene 4 hero */

const PersonHero: React.FC<{ f: number }> = ({ f }) => {
  if (f < S4 || f > S5 + 4) return null;
  const [pcx, pcy] = personCenter();
  const [sx, sy] = toScreen(pcx, pcy, L3);
  const startW = (PERSON_BOX[2] - PERSON_BOX[0]) * L3.s;
  const grow = ease(f, S4, S4 + 32, [0, 1], Easing.out(Easing.cubic));
  const run = interpolate(f, [S4 + 32, S5 - 14], [0, 1], clamp);
  const exit = ease(f, S5 - 14, S5 + 4, [0, 1], Easing.in(Easing.cubic));
  const heroW = 470;
  const width = interpolate(grow, [0, 1], [startW, heroW]) * (1 + exit * 1.6);
  const x = interpolate(grow, [0, 1], [sx, 800]) + run * 240 + exit * 900;
  const y = interpolate(grow, [0, 1], [sy, 420]) + Math.sin((f - S4) / 4.5) * 8 * grow - exit * 120;
  const opacity = 1 - exit;

  const lines = Array.from({ length: 16 }, (_, j) => {
    const period = 16 + random(`lp-${j}`) * 10;
    const t = (((f - S4 + random(`lph-${j}`) * period) % period) + period) % period / period;
    const ly = y + (random(`ly-${j}`) - 0.5) * 320;
    const len = 140 + random(`ll-${j}`) * 320;
    const lx = x - 160 - t * 900;
    const a = Math.sin(Math.PI * t) * 0.85 * grow * opacity;
    return (
      <div
        key={j}
        style={{
          position: 'absolute',
          left: lx - len,
          top: ly,
          width: len,
          height: j % 3 === 0 ? 3 : 2,
          borderRadius: 2,
          background: `linear-gradient(90deg, rgba(116,134,242,0), ${j % 4 === 0 ? WHITE : BLUE_LIGHT})`,
          opacity: a,
        }}
      />
    );
  });

  const ghosts = [3, 2, 1].map((k) => (
    <div
      key={k}
      style={{
        position: 'absolute',
        left: x - width / 2 - k * 38 * grow,
        top: y,
        transform: 'translateY(-50%)',
        opacity: 0.12 * (4 - k) * grow * opacity,
      }}
    >
      <PersonSvg width={width} color={BLUE} />
    </div>
  ));

  return (
    <AbsoluteFill>
      {lines}
      {ghosts}
      <div
        style={{
          position: 'absolute',
          left: x - width / 2,
          top: y,
          transform: 'translateY(-50%)',
          opacity,
          filter: `drop-shadow(0 0 ${30 * grow}px rgba(90,110,255,0.9)) drop-shadow(0 0 ${8 * grow}px rgba(200,210,255,0.6))`,
        }}
      >
        <PersonSvg width={width} />
      </div>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------- scene 5 logo */

const LogoReveal: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  if (f < S5 + 30) return null;
  const width = LW * L5.s;
  const height = LH * L5.s;
  const neo = ease(f, 545, 578, [0, 1], Easing.out(Easing.cubic));
  const wipe = ease(f, 550, 592, [0, 1], Easing.inOut(Easing.cubic));
  const person = ease(f, 566, 596, [0, 1], Easing.out(Easing.cubic));
  const shine = ease(f, 605, 645, [-0.4, 1.4], Easing.inOut(Easing.quad));
  const breathe = 1 + interpolate(f, [600, DURATION], [0, 0.03], clamp);
  const [pcx, pcy] = personCenter();
  const personT = (k: number) => {
    const p = Math.max(0, person - k * 0.06);
    return `translate(${(1 - p) * -1500} ${(1 - p) * 260}) translate(${pcx} ${pcy}) scale(${1 + (1 - p) * 0.8}) translate(${-pcx} ${-pcy})`;
  };
  const clipX = lang === 'ar' ? LW * (1 - wipe) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: L5.cx - width / 2,
        top: L5.cy - height / 2,
        width,
        height,
        transform: `scale(${breathe})`,
        filter: 'drop-shadow(0 0 28px rgba(59,76,192,0.45))',
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${LW} ${LH}`} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="captaWipe">
            <rect x={clipX} y={0} width={LW * wipe} height={LH} />
          </clipPath>
          <clipPath id="logoShape">
            <path d={logo.neo} />
            <path d={logo.capta} />
            <path d={logo.person} />
          </clipPath>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g opacity={neo} transform={`translate(0 ${(1 - neo) * -90})`}>
          <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
        </g>
        <g clipPath="url(#captaWipe)">
          <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
        </g>
        {[3, 2, 1].map((k) => (
          <path key={k} d={logo.person} fill={BLUE_LIGHT} fillRule="evenodd" transform={personT(k)} opacity={person > 0.02 && person < 0.98 ? 0.18 * (4 - k) : 0} />
        ))}
        <path d={logo.person} fill={BLUE} fillRule="evenodd" transform={personT(0)} opacity={person > 0 ? 1 : 0} />
        <g clipPath="url(#logoShape)">
          <rect x={LW * shine - 260} y={-200} width={520} height={LH + 400} fill="url(#shine)" opacity={0.55} transform={`skewX(-20)`} />
        </g>
      </svg>
    </div>
  );
};

const EndLines: React.FC<{ f: number; copy: Copy; lang: Lang }> = ({ f, copy, lang }) => {
  if (f < 600) return null;
  const sp = ease(f, 612, 645, [0, 1], Easing.out(Easing.cubic));
  const lineW = interpolate(sp, [0, 1], [0, 180]);
  const parts = copy.services.split('•').map((s) => s.trim());
  return (
    <>
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{
          position: 'absolute',
          top: 742,
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 26,
          opacity: sp,
          fontFamily: fontFor(lang),
          fontWeight: lang === 'ar' ? 700 : 500,
          fontSize: lang === 'ar' ? 38 : 30,
          letterSpacing: lang === 'en' ? `${interpolate(sp, [0, 1], [0.6, 0.28])}em` : undefined,
          textTransform: lang === 'en' ? 'uppercase' : undefined,
          color: 'rgba(232,233,238,0.88)',
        }}
      >
        <div style={{ width: lineW, height: 1.5, background: `linear-gradient(${lang === 'ar' ? 270 : 90}deg, transparent, ${BLUE_LIGHT})` }} />
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: BLUE_LIGHT, fontWeight: 800 }}>•</span>}
            <span>{p}</span>
          </React.Fragment>
        ))}
        <div style={{ width: lineW, height: 1.5, background: `linear-gradient(${lang === 'ar' ? 90 : 270}deg, transparent, ${BLUE_LIGHT})` }} />
      </div>
      <AnimatedLine
        f={f}
        lang={lang}
        text={`${copy.final[0]} ${copy.final[1]}`}
        highlight={copy.final[1].split(' ').pop()}
        start={648}
        y={850}
        size={lang === 'ar' ? 72 : 62}
        weight={lang === 'ar' ? 900 : 800}
      />
    </>
  );
};

/* --------------------------------------------------------------- composition */

export const NeoCapta: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = COPY[lang];
  const fadeOut = interpolate(f, [DURATION - 14, DURATION - 1], [1, 0], clamp);
  const impactWords = copy.impact.split(' ');
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/from-idea-to-impact.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Background f={f} />
        <Particles f={f} />

        {/* Scene 1 */}
        <AnimatedLine f={f} lang={lang} text={copy.start} start={24} end={S2 - 2} y={650} size={lang === 'ar' ? 66 : 58} weight={lang === 'ar' ? 700 : 500} />

        {/* Scene 2 */}
        <FlashWords f={f} copy={copy} lang={lang} />

        {/* Scene 3 */}
        <Glimpses f={f} copy={copy} lang={lang} />

        {/* Scene 4 */}
        <PersonHero f={f} />
        <AnimatedLine f={f} lang={lang} text={copy.notOnly} start={S4 + 30} end={S4 + 86} y={790} size={lang === 'ar' ? 70 : 62} weight={lang === 'ar' ? 700 : 600} color="rgba(232,233,238,0.9)" />
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.impact}
          highlight={impactWords[impactWords.length - 1]}
          start={S4 + 90}
          end={S5 + 2}
          y={790}
          size={lang === 'ar' ? 110 : 100}
          weight={lang === 'ar' ? 900 : 800}
        />

        {/* Scene 5 */}
        <LogoReveal f={f} lang={lang} />
        <EndLines f={f} copy={copy} lang={lang} />

        {/* Vignette */}
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
