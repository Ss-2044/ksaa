import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import logo from './logo.json';
import { Lang, RUSH } from './copy';
import { AnimatedLine, BLUE, BLUE_LIGHT, Backdrop, FPS, LH, LW, PersonSvg, Vignette, WHITE, clamp, ease, fontFor } from './shared';

// Beat-cut energy piece (~128 BPM: one beat = 14 frames). Works at 16:9, 9:16 and 1:1.
// Cues mirrored in music/compose.py score_rush.
export const RUSH_DURATION = 14 * FPS;
const BEAT = 14;
const CUTS = 30;
const DOUBLE = CUTS + 8 * BEAT; // 142
const HALF = 7;
const FREEZE = DOUBLE + 8 * HALF; // 198
const ALL_THIS = 206;
const ROOF = 238;
const LOGO = 300;

const NAVY = '#05081a';
const PALETTE: [string, string][] = [
  [BLUE, WHITE],
  [WHITE, BLUE],
  [NAVY, BLUE_LIGHT],
  [BLUE_LIGHT, NAVY],
];

const rgbSplit = (d: number) => (d > 0.5 ? `${d}px 0 #ff2a6d, ${-d}px 0 #00e5ff` : 'none');

const Cut: React.FC<{ i: number; t: number; len: number; lang: Lang; width: number; height: number; small?: boolean }> = ({ i, t, len, lang, width, height, small }) => {
  const words = RUSH[lang].words;
  const rtl = lang === 'ar';
  const [bg, fg] = PALETTE[(i + (small ? 2 : 0)) % PALETTE.length];
  const size = Math.min(rtl ? 300 : 240, width * (rtl ? 0.24 : width < 1200 ? 0.17 : 0.15)) * (small ? 0.8 : 1);
  const punch = interpolate(t, [0, 4], [1.25, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const split = interpolate(t, [0, 3], [14, 0], clamp);
  const jx = (random(`jx-${i}-${small}`) - 0.5) * 80;
  const jy = (random(`jy-${i}-${small}`) - 0.5) * 60;
  const rot = (random(`jr-${i}-${small}`) - 0.5) * 8;
  const accent = i % 3;
  const m = Math.min(width, height);
  return (
    <AbsoluteFill style={{ backgroundColor: bg, overflow: 'hidden' }}>
      {accent === 0 && (
        <div
          style={{
            position: 'absolute',
            left: width / 2 - m * 0.42,
            top: height / 2 - m * 0.42,
            width: m * 0.84,
            height: m * 0.84,
            borderRadius: '50%',
            border: `${m * 0.03}px solid ${fg}`,
            opacity: 0.18,
            transform: `scale(${interpolate(t, [0, len], [0.85, 1.05])})`,
          }}
        />
      )}
      {accent === 1 &&
        [0, 1, 2].map((b) => (
          <div
            key={b}
            style={{
              position: 'absolute',
              left: -width * 0.2,
              top: height * (0.2 + b * 0.3) + (t - len / 2) * 6 * (b % 2 ? 1 : -1),
              width: width * 1.4,
              height: m * 0.05,
              background: fg,
              opacity: 0.14,
              transform: 'rotate(-12deg)',
            }}
          />
        ))}
      {accent === 2 && (
        <AbsoluteFill
          style={{
            backgroundImage: `radial-gradient(circle, ${fg} 3px, transparent 4px)`,
            backgroundSize: '28px 28px',
            opacity: 0.22,
            WebkitMaskImage: `linear-gradient(${120 + t * 4}deg, transparent 25%, black 50%, transparent 75%)`,
            maskImage: `linear-gradient(${120 + t * 4}deg, transparent 25%, black 50%, transparent 75%)`,
          }}
        />
      )}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div
          dir={rtl ? 'rtl' : 'ltr'}
          style={{
            fontFamily: fontFor(lang),
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1.1,
            letterSpacing: rtl ? undefined : '0.02em',
            color: fg,
            transform: `translate(${jx}px, ${jy}px) rotate(${rot}deg) scale(${punch})`,
            textShadow: rgbSplit(split),
          }}
        >
          {words[i % words.length]}
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', top: 40, [rtl ? 'right' : 'left']: 50, fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '0.2em', color: fg, opacity: 0.7 }}>
        0{(i % 8) + 1}
      </div>
      <div style={{ position: 'absolute', bottom: 50, [rtl ? 'left' : 'right']: 50 + (t / len) * 60, opacity: 0.85 }}>
        <PersonSvg width={90} color={fg} />
      </div>
    </AbsoluteFill>
  );
};

const LogoArt: React.FC<{ width: number; tint?: string }> = ({ width, tint }) => (
  <svg width={width} height={(LH / LW) * width} viewBox={`0 0 ${LW} ${LH}`}>
    <path d={logo.neo} fill={tint ?? BLUE} fillRule="evenodd" />
    <path d={logo.capta} fill={tint ?? WHITE} fillRule="evenodd" />
    <path d={logo.person} fill={tint ?? BLUE} fillRule="evenodd" />
  </svg>
);

export const Rush: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const copy = RUSH[lang];
  const rtl = lang === 'ar';
  const fadeOut = interpolate(f, [RUSH_DURATION - 12, RUSH_DURATION - 1], [1, 0], clamp);
  const wide = width > height;
  const square = width === height;

  let cut: React.ReactNode = null;
  if (f >= CUTS && f < DOUBLE) {
    const i = Math.floor((f - CUTS) / BEAT);
    cut = <Cut i={i} t={f - CUTS - i * BEAT} len={BEAT} lang={lang} width={width} height={height} />;
  } else if (f >= DOUBLE && f < FREEZE) {
    const i = Math.floor((f - DOUBLE) / HALF);
    cut = <Cut i={i} t={f - DOUBLE - i * HALF} len={HALF} lang={lang} width={width} height={height} small />;
  }

  // Glitch bars on the freeze and on the logo reveal.
  const glitchAt = (at: number, len: number) => f >= at && f < at + len;
  const glitch = glitchAt(FREEZE, 6) || glitchAt(LOGO, 8) || glitchAt(LOGO + 50, 2) || glitchAt(LOGO + 86, 2);
  const bars = glitch
    ? Array.from({ length: 10 }, (_, b) => {
        const y = random(`gy-${b}-${f}`) * height;
        const h = 4 + random(`gh-${b}-${f}`) * 40;
        return <div key={b} style={{ position: 'absolute', left: 0, right: 0, top: y, height: h, background: b % 3 === 0 ? BLUE_LIGHT : b % 3 === 1 ? '#ff2a6d' : WHITE, opacity: 0.35 + random(`go-${b}-${f}`) * 0.5, transform: `translateX(${(random(`gx-${b}-${f}`) - 0.5) * 200}px)` }} />;
      })
    : null;

  const logoW = wide ? 700 : square ? 640 : 840;
  const logoH = (LH / LW) * logoW;
  const logoCy = wide ? 400 : square ? 420 : 820;
  const settle = ease(f, LOGO, LOGO + 18, [0, 1], Easing.out(Easing.cubic));
  const slices = 8;
  const logoNode =
    f >= LOGO ? (
      <div style={{ position: 'absolute', left: width / 2 - logoW / 2, top: logoCy - logoH / 2, width: logoW, height: logoH, filter: 'drop-shadow(0 0 28px rgba(59,76,192,0.5))' }}>
        {settle < 1 &&
          ['#ff2a6d', '#00e5ff'].map((c, k) => (
            <div key={c} style={{ position: 'absolute', inset: 0, transform: `translateX(${(k ? -1 : 1) * 18 * (1 - settle)}px)`, opacity: 0.55 * (1 - settle), mixBlendMode: 'screen' }}>
              <LogoArt width={logoW} tint={c} />
            </div>
          ))}
        {Array.from({ length: slices }, (_, s) => {
          const off = (random(`ls-${s}`) - 0.5) * 260 * (1 - settle);
          return (
            <div key={s} style={{ position: 'absolute', inset: 0, clipPath: `inset(${(s / slices) * 100}% 0 ${((slices - 1 - s) / slices) * 100}% 0)`, transform: `translateX(${off}px)`, opacity: Math.min(1, settle * 3) }}>
              <LogoArt width={logoW} />
            </div>
          );
        })}
      </div>
    ) : null;

  const sp = ease(f, LOGO + 22, LOGO + 44, [0, 1], Easing.out(Easing.cubic));
  const ready = f < CUTS;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/rush.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={RUSH_DURATION} reveal={f >= FREEZE ? ease(f, FREEZE + 6, FREEZE + 30) : 0.3} dots={f >= LOGO ? 0.25 : 0} />
        {ready && (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
              dir={rtl ? 'rtl' : 'ltr'}
              style={{
                fontFamily: fontFor(lang),
                fontWeight: 900,
                fontSize: Math.min(rtl ? 130 : 110, width * 0.12),
                color: WHITE,
                opacity: Math.floor(f / 5) % 2 === 0 || f > 16 ? ease(f, 2, 10) : 0.2,
                transform: `scale(${interpolate(f, [0, CUTS], [0.9, 1.15])})`,
                textShadow: rgbSplit(f > 24 ? (f - 24) * 3 : 0),
              }}
            >
              {copy.ready}
            </div>
          </AbsoluteFill>
        )}
        {cut}
        <AnimatedLine f={f} lang={lang} text={copy.allThis} start={ALL_THIS} end={LOGO - 4} y={height / 2 - Math.min(110, width * 0.08)} size={Math.min(rtl ? 92 : 76, width * 0.08)} weight={rtl ? 700 : 600} color="rgba(232,233,238,0.85)" />
        <AnimatedLine f={f} lang={lang} text={copy.roof} highlight={copy.roofHighlight} start={ROOF} end={LOGO - 4} y={height / 2 + Math.min(60, width * 0.05)} size={Math.min(rtl ? 130 : 104, width * 0.1)} weight={900} />
        {logoNode}
        {f >= LOGO && (
          <>
            <div
              dir={rtl ? 'rtl' : 'ltr'}
              style={{
                position: 'absolute',
                top: logoCy + logoH / 2 + 60,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: fontFor(lang),
                fontWeight: rtl ? 700 : 500,
                fontSize: rtl ? 40 : width < 1200 ? 24 : 30,
                letterSpacing: rtl ? undefined : `${interpolate(sp, [0, 1], [0.6, width < 1200 ? 0.16 : 0.28])}em`,
                textTransform: rtl ? undefined : 'uppercase',
                color: 'rgba(232,233,238,0.88)',
                opacity: sp,
              }}
            >
              {copy.services}
            </div>
            <AnimatedLine f={f} lang={lang} text={copy.tagline} highlight={copy.taglineHighlight} start={LOGO + 36} y={logoCy + logoH / 2 + 165} size={rtl ? 66 : 58} weight={900} />
          </>
        )}
        {f >= FREEZE && <Vignette />}
        {bars}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
