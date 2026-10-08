import React from 'react';
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from 'remotion';
import logo from './logo.json';
import { Lang } from './copy';
import { loadFonts } from './fonts';

loadFonts();

export const FPS = 30;

// Brand palette sampled from the Neo Capta logo.
export const BLUE = '#3B4CC0';
export const BLUE_LIGHT = '#7486F2';
export const WHITE = '#E8E9EE';

export const LW = logo.w;
export const LH = logo.h;
export const PERSON_BOX = logo.bbox.person as [number, number, number, number];

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const ease = (f: number, from: number, to: number, out: [number, number] = [0, 1], easing = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [from, to], out, { ...clamp, easing });

export const fontFor = (lang: Lang) => (lang === 'ar' ? 'Cairo, sans-serif' : 'Montserrat, sans-serif');

/* --------------------------------------------------------------------- text */

export const AnimatedLine: React.FC<{
  f: number;
  text: string;
  lang: Lang;
  start: number;
  end?: number;
  y: number;
  size: number;
  weight?: number;
  color?: string;
  highlight?: string;
  letterSpacing?: string;
}> = ({ f, text, lang, start, end, y, size, weight = 700, color = WHITE, highlight, letterSpacing }) => {
  if (f < start - 1 || (end !== undefined && f > end + 1)) return null;
  const words = text.split(' ');
  const out = end === undefined ? 1 : interpolate(f, [end - 12, end], [1, 0], clamp);
  const outBlur = end === undefined ? 0 : interpolate(f, [end - 12, end], [0, 14], clamp);
  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        transform: 'translateY(-50%)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.28,
        padding: '0 60px',
        fontFamily: fontFor(lang),
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing,
        opacity: out,
        filter: `blur(${outBlur}px)`,
        lineHeight: 1.3,
      }}
    >
      {words.map((w, i) => {
        const s = start + i * 4;
        const p = interpolate(f, [s, s + 16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const isHi = highlight !== undefined && w === highlight;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 34}px)`,
              filter: `blur(${(1 - p) * 12}px)`,
              ...(isHi
                ? {
                    background: `linear-gradient(90deg, ${BLUE_LIGHT}, ${BLUE} 60%, ${BLUE_LIGHT})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    textShadow: 'none',
                  }
                : { textShadow: '0 6px 30px rgba(0,0,0,0.6)' }),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ----------------------------------------------------------- logo pieces */

export const PersonSvg: React.FC<{ width: number; color?: string }> = ({ width, color = BLUE_LIGHT }) => {
  const [x0, y0, x1, y1] = PERSON_BOX;
  const pad = 10;
  const w = x1 - x0 + pad * 2;
  const h = y1 - y0 + pad * 2;
  return (
    <svg width={width} height={(width * h) / w} viewBox={`${x0 - pad} ${y0 - pad} ${w} ${h}`} style={{ overflow: 'visible' }}>
      <path d={logo.person} fill={color} fillRule="evenodd" />
    </svg>
  );
};

export const personCenter = () => [(PERSON_BOX[0] + PERSON_BOX[2]) / 2, (PERSON_BOX[1] + PERSON_BOX[3]) / 2];


/* ------------------------------------------------------------ backdrop */

export const Backdrop: React.FC<{ f: number; duration: number; reveal?: number; dots?: number }> = ({ f, duration, reveal = 1, dots = 0 }) => {
  const gx = interpolate(f, [0, duration], [25, 75]);
  const gy = interpolate(f, [0, duration], [35, 60]);
  const bandPos = interpolate(f, [0, duration], [-10, 100]);
  const mask = `linear-gradient(120deg, transparent ${bandPos - 28}%, black ${bandPos}%, transparent ${bandPos + 28}%)`;
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
          opacity: dots,
          backgroundImage:
            'radial-gradient(circle, rgba(232,233,238,0.95) 2.2px, transparent 3px), radial-gradient(circle, rgba(116,134,242,0.9) 1.6px, transparent 2.4px)',
          backgroundSize: '24px 24px, 24px 24px',
          backgroundPosition: '0 0, 12px 12px',
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)' }} />
);

/* ------------------------------------------------------------ end card */

export const BrandEndCard: React.FC<{
  f: number;
  start: number;
  lang: Lang;
  services: string;
  tagline?: string;
  highlight?: string;
  taglineAt?: number;
  cy?: number;
  width?: number;
}> = ({ f, start, lang, services, tagline, highlight, taglineAt = 96, cy = 400, width = 700 }) => {
  const { width: videoWidth } = useVideoConfig();
  const cx = videoWidth / 2;
  const narrow = videoWidth < 1200;
  const r = f - start;
  if (r < 0) return null;
  const s = width / LW;
  const height = LH * s;
  const neo = ease(r, 0, 30, [0, 1], Easing.out(Easing.cubic));
  const wipe = ease(r, 6, 46, [0, 1], Easing.inOut(Easing.cubic));
  const person = ease(r, 18, 48, [0, 1], Easing.out(Easing.cubic));
  const shine = ease(r, 58, 95, [-0.4, 1.4], Easing.inOut(Easing.quad));
  const breathe = 1 + interpolate(r, [55, 200], [0, 0.03], clamp);
  const [pcx, pcy] = personCenter();
  const personT = (k: number) => {
    const p = Math.max(0, person - k * 0.06);
    return `translate(${(1 - p) * -1500} ${(1 - p) * 260}) translate(${pcx} ${pcy}) scale(${1 + (1 - p) * 0.8}) translate(${-pcx} ${-pcy})`;
  };
  const clipX = lang === 'ar' ? LW * (1 - wipe) : 0;
  const sp = ease(r, 62, 92, [0, 1], Easing.out(Easing.cubic));
  const lineW = interpolate(sp, [0, 1], [0, narrow ? 60 : 180]);
  const parts = services.split('•').map((p) => p.trim());
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: cx - width / 2,
          top: cy - height / 2,
          width,
          height,
          transform: `scale(${breathe})`,
          filter: 'drop-shadow(0 0 28px rgba(59,76,192,0.45))',
        }}
      >
        <svg width={width} height={height} viewBox={`0 0 ${LW} ${LH}`} style={{ overflow: 'visible' }}>
          <defs>
            <clipPath id={`wipe-${start}`}>
              <rect x={clipX} y={0} width={LW * wipe} height={LH} />
            </clipPath>
            <clipPath id={`shape-${start}`}>
              <path d={logo.neo} />
              <path d={logo.capta} />
              <path d={logo.person} />
            </clipPath>
            <linearGradient id={`shine-${start}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g opacity={neo} transform={`translate(0 ${(1 - neo) * -90})`}>
            <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
          </g>
          <g clipPath={`url(#wipe-${start})`}>
            <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
          </g>
          {[3, 2, 1].map((k) => (
            <path
              key={k}
              d={logo.person}
              fill={BLUE_LIGHT}
              fillRule="evenodd"
              transform={personT(k)}
              opacity={person > 0.02 && person < 0.98 ? 0.18 * (4 - k) : 0}
            />
          ))}
          <path d={logo.person} fill={BLUE} fillRule="evenodd" transform={personT(0)} opacity={person > 0 ? 1 : 0} />
          <g clipPath={`url(#shape-${start})`}>
            <rect x={LW * shine - 260} y={-200} width={520} height={LH + 400} fill={`url(#shine-${start})`} opacity={0.55} transform="skewX(-20)" />
          </g>
        </svg>
      </div>
      <div
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        style={{
          position: 'absolute',
          top: cy + height / 2 + 75,
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: narrow ? 16 : 26,
          opacity: sp,
          fontFamily: fontFor(lang),
          fontWeight: lang === 'ar' ? 700 : 500,
          fontSize: lang === 'ar' ? (narrow ? 42 : 38) : narrow ? 26 : 30,
          letterSpacing: lang === 'en' ? `${interpolate(sp, [0, 1], [0.6, narrow ? 0.16 : 0.28])}em` : undefined,
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
      {tagline && (
        <AnimatedLine
          f={f}
          lang={lang}
          text={tagline}
          highlight={highlight}
          start={start + taglineAt}
          y={cy + height / 2 + 180}
          size={lang === 'ar' ? 66 : 58}
          weight={lang === 'ar' ? 900 : 800}
        />
      )}
    </AbsoluteFill>
  );
};
