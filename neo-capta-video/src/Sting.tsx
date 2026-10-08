import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import logo from './logo.json';
import { Lang, STING } from './copy';
import { BLUE, BLUE_LIGHT, FPS, LH, LW, Vignette, WHITE, clamp, ease, fontFor, personCenter } from './shared';

// Vertical 1080×1920 logo sting — intro/outro for social posts. Cues in music/compose.py score_sting.
export const STING_DURATION = 8 * FPS;
const DRAW = 26;
const FILL = 96;
const POP = 104;
const SHINE = 128;
const SERVICES = 146;

const LOGO_W = 900;
const S = LOGO_W / LW;
const LOGO_H = LH * S;
const CY = 860;

/* -------------------------------------------------- halftone wave field */

const SPACING = 40;
const COLS = Math.ceil(1080 / SPACING) + 1;
const ROWS = Math.ceil(1920 / SPACING) + 1;

const Wave: React.FC<{ f: number }> = ({ f }) => {
  const offset = interpolate(f, [0, 70], [-600, 3400], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const settle = interpolate(f, [60, 100], [0, 1], clamp);
  const [pcx, pcy] = personCenter();
  const px = 540 + (pcx - LW / 2) * S;
  const py = CY + (pcy - LH / 2) * S;
  const ring = interpolate(f, [POP, POP + 50], [0, 1400], { ...clamp, easing: Easing.out(Easing.cubic) });
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * SPACING + (r % 2 ? SPACING / 2 : 0);
      const y = r * SPACING;
      const d = x * 0.5 + y - offset;
      const wave = Math.exp(-(d * d) / (2 * 160 * 160));
      const distP = Math.hypot(x - px, y - py);
      const ringD = distP - ring;
      const ringV = f > POP ? Math.exp(-(ringD * ringD) / (2 * 60 * 60)) * interpolate(f, [POP, POP + 50], [1, 0], clamp) : 0;
      const rest = 0.16 * settle * (0.5 + 0.5 * Math.sin(x / 90 + y / 130 + f / 12));
      const v = Math.max(wave * (1 - settle * 0.7), ringV, rest);
      if (v < 0.03) continue;
      const white = wave > 0.6 || ringV > 0.6;
      dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={1 + 8 * v} fill={white ? WHITE : BLUE_LIGHT} opacity={0.25 + 0.6 * v} />);
    }
  }
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {dots}
    </svg>
  );
};

/* --------------------------------------------------------------- logo */

const DrawnLogo: React.FC<{ f: number }> = ({ f }) => {
  const draw = ease(f, DRAW, FILL, [0, 1], Easing.inOut(Easing.quad));
  const fill = ease(f, FILL - 6, FILL + 16, [0, 1]);
  const pop = interpolate(f, [POP - 4, POP + 6, POP + 16], [0, 1.35, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const shine = ease(f, SHINE, SHINE + 34, [-0.4, 1.4], Easing.inOut(Easing.quad));
  const breathe = 1 + interpolate(f, [SHINE, STING_DURATION], [0, 0.035], clamp);
  const [pcx, pcy] = personCenter();
  const stroke = (d: string, color: string, delay: number) => {
    const p = ease(f, DRAW + delay, FILL + delay * 0.4, [0, 1], Easing.inOut(Easing.quad));
    return (
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={4 / S}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
        opacity={1 - fill * 0.9}
      />
    );
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: 540 - LOGO_W / 2,
        top: CY - LOGO_H / 2,
        transform: `scale(${breathe})`,
        filter: `drop-shadow(0 0 ${20 + 20 * fill}px rgba(59,76,192,0.6))`,
      }}
    >
      <svg width={LOGO_W} height={LOGO_H} viewBox={`0 0 ${LW} ${LH}`} style={{ overflow: 'visible' }}>
        <defs>
          <clipPath id="stingShape">
            <path d={logo.neo} />
            <path d={logo.capta} />
            <path d={logo.person} />
          </clipPath>
          <linearGradient id="stingShine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {draw > 0 && stroke(logo.neo, BLUE_LIGHT, 0)}
        {draw > 0 && stroke(logo.capta, WHITE, 8)}
        <path d={logo.neo} fill={BLUE} fillRule="evenodd" opacity={fill} />
        <path d={logo.capta} fill={WHITE} fillRule="evenodd" opacity={fill} />
        <path
          d={logo.person}
          fill={BLUE}
          fillRule="evenodd"
          transform={`translate(${pcx} ${pcy}) scale(${pop}) rotate(${(1 - Math.min(pop, 1)) * -25}) translate(${-pcx} ${-pcy})`}
        />
        <g clipPath="url(#stingShape)">
          <rect x={LW * shine - 260} y={-200} width={520} height={LH + 400} fill="url(#stingShine)" opacity={0.6} transform="skewX(-20)" />
        </g>
      </svg>
    </div>
  );
};

export const Sting: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = STING[lang];
  const fadeOut = interpolate(f, [STING_DURATION - 14, STING_DURATION - 1], [1, 0], clamp);
  const sp = ease(f, SERVICES, SERVICES + 24, [0, 1], Easing.out(Easing.cubic));
  const parts = copy.services.split('•').map((p) => p.trim());
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/sting.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <AbsoluteFill
          style={{
            background: 'radial-gradient(ellipse 90% 60% at 50% 45%, #17246b 0%, #0a1033 40%, #03040d 75%, #000 100%)',
            opacity: interpolate(f, [10, 60], [0, 1], clamp),
          }}
        />
        <Wave f={f} />
        <DrawnLogo f={f} />
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          style={{
            position: 'absolute',
            top: CY + LOGO_H / 2 + 120,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 18,
            fontFamily: fontFor(lang),
            fontWeight: lang === 'ar' ? 700 : 500,
            fontSize: lang === 'ar' ? 48 : 30,
            letterSpacing: lang === 'en' ? `${interpolate(sp, [0, 1], [0.5, 0.16])}em` : undefined,
            textTransform: lang === 'en' ? 'uppercase' : undefined,
            color: 'rgba(232,233,238,0.9)',
            opacity: sp,
            transform: `translateY(${(1 - sp) * 30}px)`,
          }}
        >
          {parts.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ color: BLUE_LIGHT, fontWeight: 800 }}>•</span>}
              <span>{p}</span>
            </React.Fragment>
          ))}
        </div>
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
