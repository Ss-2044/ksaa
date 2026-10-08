import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import logo from './logo.json';
import { GRID, Lang } from './copy';
import { GlimpseIcon } from './icons';
import {
  AnimatedLine,
  BLUE,
  BLUE_LIGHT,
  Backdrop,
  BrandEndCard,
  FPS,
  LH,
  LW,
  PersonSvg,
  Vignette,
  WHITE,
  clamp,
  ease,
  fontFor,
} from './shared';

// Square 1080×1080 — an Instagram-style 3×3 feed plan. Cues mirrored in music/compose.py score_grid.
export const GRID_DURATION = 15 * FPS;
const APPEAR = 14;
const FLIP1 = 60;
const FLIP1_STEP = 14;
const FLIP_LEN = 12;
const FLIP2 = 210;
const MERGE = 270;
const EXIT = 330;
const LOGO = 346;

const TILE = 280;
const CY = 600;

/* ------------------------------------------------------- tile designs */

const Word: React.FC<{ text: string; lang: Lang; color: string; size?: number }> = ({ text, lang, color, size }) => (
  <div
    dir={lang === 'ar' ? 'rtl' : 'ltr'}
    style={{ fontFamily: fontFor(lang), fontWeight: 900, fontSize: size ?? (lang === 'ar' ? 76 : 50), color, lineHeight: 1.1, textAlign: 'center' }}
  >
    {text}
  </div>
);

const center: React.CSSProperties = { width: TILE, height: TILE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden' };

const TileDesign: React.FC<{ k: number; t: number; lang: Lang }> = ({ k, t, lang }) => {
  const words = GRID[lang].tiles;
  switch (k) {
    case 0:
      return (
        <div style={{ ...center, background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE})` }}>
          <Word text={words[0]} lang={lang} color={WHITE} />
          <div style={{ width: 60, height: 5, borderRadius: 3, background: WHITE }} />
        </div>
      );
    case 1:
      return (
        <div style={{ ...center, background: 'radial-gradient(circle at 50% 40%, #2a3a9e, #0a1033)' }}>
          <svg width={120} height={170} viewBox="0 0 120 170" style={{ transform: `rotate(${Math.sin(t / 12) * 5}deg)` }}>
            <rect x={42} y={0} width={36} height={30} rx={5} fill={WHITE} />
            <rect x={10} y={26} width={100} height={140} rx={24} fill={BLUE_LIGHT} />
            <rect x={24} y={44} width={12} height={100} rx={6} fill="#fff" opacity={0.5} />
          </svg>
        </div>
      );
    case 2:
      return (
        <div style={{ ...center, background: '#0a1033', alignItems: 'flex-start', padding: '0 34px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 120, lineHeight: 0.6, color: BLUE_LIGHT, marginTop: 30 }}>“</div>
          {[0.95, 0.8, 0.55].map((w, i) => (
            <div key={i} style={{ height: 14, width: `${w * 100}%`, borderRadius: 7, background: i === 2 ? BLUE_LIGHT : 'rgba(232,233,238,0.8)' }} />
          ))}
        </div>
      );
    case 3:
      return (
        <div style={{ ...center, background: BLUE }}>
          <AbsoluteFill style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 2.5px, transparent 3.5px)', backgroundSize: '22px 22px', WebkitMaskImage: 'linear-gradient(135deg, transparent 15%, black 50%, transparent 85%)' }} />
          <div style={{ transform: `translateX(${Math.sin(t / 8) * 8}px)`, filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.5))' }}>
            <PersonSvg width={170} color={WHITE} />
          </div>
        </div>
      );
    case 4:
      return (
        <div style={{ ...center, background: WHITE }}>
          <Word text={words[1]} lang={lang} color={BLUE} />
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 64, color: BLUE_LIGHT, lineHeight: 1 }}>%</div>
        </div>
      );
    case 5:
      return (
        <div style={{ ...center, background: '#0a1033', justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end', gap: 16, padding: 40, boxSizing: 'border-box' }}>
          {[0.3, 0.5, 0.42, 0.72, 0.95].map((h, i) => (
            <div key={i} style={{ width: 28, height: 190 * h * ease(t, 4 + i * 3, 18 + i * 3), borderRadius: 6, background: i === 4 ? BLUE_LIGHT : BLUE }} />
          ))}
        </div>
      );
    case 6:
      return (
        <div style={{ ...center, background: 'linear-gradient(160deg, #17246b, #05081a)' }}>
          <svg width={130} height={130} viewBox="0 0 24 24" style={{ transform: `scale(${1 + Math.max(0, Math.sin(t / 5)) * 0.12})` }}>
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.2 0 3.6 1.3 5.4 3.3 1.8-2 3.2-3.3 5.4-3.3 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" fill="#ff5a7a" />
          </svg>
          <Word text={words[3]} lang={lang} color={WHITE} size={lang === 'ar' ? 48 : 34} />
        </div>
      );
    case 7:
      return (
        <div style={{ ...center, background: `linear-gradient(200deg, #5a3fd0, ${BLUE})` }}>
          <Word text={words[2]} lang={lang} color={WHITE} size={lang === 'ar' ? 64 : 46} />
        </div>
      );
    default:
      return (
        <div style={{ ...center, background: '#101850' }}>
          <div style={{ transform: 'scale(1.3)' }}>
            <GlimpseIcon index={2} t={t} />
          </div>
          <Word text={words[4]} lang={lang} color={BLUE_LIGHT} size={lang === 'ar' ? 46 : 32} />
        </div>
      );
  }
};

// One big brand image, sliced across the nine tiles.
const BigPicture: React.FC = () => {
  const size = TILE * 3;
  const w = 600;
  const h = (LH / LW) * w;
  return (
    <div style={{ width: size, height: size, position: 'relative', background: `radial-gradient(circle at 45% 40%, #2a3dbb 0%, #121a5a 45%, #05081a 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(232,233,238,0.5) 2.5px, transparent 3.5px)',
          backgroundSize: '24px 24px',
          WebkitMaskImage: 'linear-gradient(120deg, transparent 20%, black 50%, transparent 80%)',
          maskImage: 'linear-gradient(120deg, transparent 20%, black 50%, transparent 80%)',
          opacity: 0.6,
        }}
      />
      <svg width={w} height={h} viewBox={`0 0 ${LW} ${LH}`} style={{ position: 'absolute', left: (size - w) / 2, top: (size - h) / 2, filter: 'drop-shadow(0 0 30px rgba(59,76,192,0.7))' }}>
        <path d={logo.neo} fill={BLUE_LIGHT} fillRule="evenodd" />
        <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
        <path d={logo.person} fill={BLUE_LIGHT} fillRule="evenodd" />
      </svg>
    </div>
  );
};

/* ---------------------------------------------------------- one tile */

const flipState = (f: number, at: number) => {
  const p = interpolate(f, [at, at + FLIP_LEN], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return { p, scaleX: Math.abs(Math.cos(Math.PI * p)), passed: p >= 0.5 };
};

const Tile: React.FC<{ f: number; k: number; lang: Lang; gap: number; radius: number }> = ({ f, k, lang, gap, radius }) => {
  const row = Math.floor(k / 3);
  const col = k % 3;
  const step = TILE + gap;
  const x = 540 - (3 * TILE + 2 * gap) / 2 + col * step;
  const y = CY - (3 * TILE + 2 * gap) / 2 + row * step;
  const appear = ease(f, APPEAR + k * 3, APPEAR + k * 3 + 12, [0, 1], Easing.out(Easing.back(1.6)));
  const a = flipState(f, FLIP1 + k * FLIP1_STEP);
  const b = flipState(f, FLIP2 + (row + col) * 8);
  const scaleX = b.p > 0 ? b.scaleX : a.scaleX;
  // In RTL the slicing stays the same (it is one picture); only the reading order of flips changes.
  let content: React.ReactNode;
  if (b.passed) {
    content = (
      <div style={{ position: 'absolute', left: -col * TILE, top: -row * TILE }}>
        <BigPicture />
      </div>
    );
  } else if (a.passed) {
    content = <TileDesign k={k} t={f - FLIP1 - k * FLIP1_STEP} lang={lang} />;
  } else {
    content = (
      <div style={{ ...center, border: '2px dashed rgba(116,134,242,0.55)', borderRadius: radius, boxSizing: 'border-box', background: 'rgba(10,16,51,0.4)' }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 64, fontWeight: 300, color: 'rgba(116,134,242,0.7)' }}>+</div>
      </div>
    );
  }
  const glint = a.p > 0 && a.p < 1 ? Math.sin(Math.PI * a.p) : b.p > 0 && b.p < 1 ? Math.sin(Math.PI * b.p) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: TILE,
        height: TILE,
        borderRadius: radius,
        overflow: 'hidden',
        transform: `scale(${appear}) scaleX(${Math.max(scaleX, 0.02)})`,
        boxShadow: a.passed ? '0 14px 40px rgba(0,0,0,0.45)' : 'none',
      }}
    >
      {content}
      <AbsoluteFill style={{ background: '#fff', opacity: glint * 0.5 }} />
    </div>
  );
};

export const Grid: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = GRID[lang];
  const fadeOut = interpolate(f, [GRID_DURATION - 12, GRID_DURATION - 1], [1, 0], clamp);
  const gap = interpolate(f, [MERGE, MERGE + 26], [12, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const radius = interpolate(f, [MERGE, MERGE + 26], [18, 0], clamp);
  const exit = ease(f, EXIT, EXIT + 18, [0, 1], Easing.in(Easing.cubic));
  const zoom = 1 + interpolate(f, [MERGE, EXIT], [0, 0.04], clamp);
  const glow = ease(f, MERGE + 10, MERGE + 30);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/grid.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={GRID_DURATION} reveal={interpolate(f, [0, 30], [0.4, 1], clamp)} dots={interpolate(f, [MERGE, MERGE + 30, EXIT, LOGO], [0, 0.25, 0.25, 0.3], clamp)} />
        <AnimatedLine f={f} lang={lang} text={copy.plan} highlight={copy.planHighlight} start={FLIP1 + 6} end={FLIP2 - 6} y={90} size={lang === 'ar' ? 64 : 54} weight={900} />
        <AnimatedLine f={f} lang={lang} text={copy.together} highlight={copy.togetherHighlight} start={FLIP2 + 16} end={EXIT + 4} y={90} size={lang === 'ar' ? 64 : 52} weight={900} />
        <AbsoluteFill
          style={{
            opacity: 1 - exit,
            transform: `scale(${zoom * (1 - exit * 0.3)})`,
            transformOrigin: `540px ${CY}px`,
            filter: `drop-shadow(0 0 ${40 * glow}px rgba(90,110,255,${0.6 * glow}))`,
          }}
        >
          {Array.from({ length: 9 }, (_, k) => (
            <Tile key={k} f={f} k={k} lang={lang} gap={gap} radius={radius} />
          ))}
        </AbsoluteFill>
        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
          taglineAt={58}
          cy={420}
          width={640}
        />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
