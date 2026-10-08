import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { CAROUSEL, Lang } from './copy';
import { GlimpseIcon } from './icons';
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

// Square 1080×1080 — a swipeable services carousel. Cues mirrored in music/compose.py score_carousel.
export const CAROUSEL_DURATION = 17 * FPS;
const FIRST = 30;
const STEP = 70;
const SWIPE = 18;
const WRAP = 362;
const LOGO = 420;

const CARD_W = 640;
const CARD_H = 700;
const SPACING = 690;
const CY = 540;
const ICONS = [1, 2, 3, 4, 5];

const activeAt = (k: number) => FIRST + k * STEP;

const ServiceCard: React.FC<{ k: number; t: number; lang: Lang }> = ({ k, t, lang }) => {
  const copy = CAROUSEL[lang].cards[k];
  const rtl = lang === 'ar';
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 40,
        boxSizing: 'border-box',
        padding: '48px 52px',
        background: 'linear-gradient(165deg, #1b2a7c 0%, #0b1240 55%, #05081a 100%)',
        border: '2px solid rgba(116,134,242,0.6)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(59,76,192,0.35)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(116,134,242,0.35) 2px, transparent 3px)',
          backgroundSize: '22px 22px',
          WebkitMaskImage: 'linear-gradient(200deg, black 0%, transparent 45%)',
          maskImage: 'linear-gradient(200deg, black 0%, transparent 45%)',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 96, lineHeight: 1, color: 'transparent', WebkitTextStroke: `2.5px ${BLUE_LIGHT}` }}>0{k + 1}</div>
        <div dir="ltr" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', color: 'rgba(232,233,238,0.5)', unicodeBidi: 'isolate' }}>0{k + 1} / 05</div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: 'scale(2.3)', filter: `drop-shadow(0 0 12px ${BLUE})` }}>
          <GlimpseIcon index={ICONS[k]} t={t} />
        </div>
      </div>
      <div style={{ fontFamily: fontFor(lang), fontWeight: 900, fontSize: rtl ? 62 : 50, lineHeight: 1.2, color: WHITE }}>{copy.title}</div>
      <div style={{ height: 5, width: 90, borderRadius: 3, background: BLUE_LIGHT, margin: '18px 0' }} />
      <div style={{ fontFamily: fontFor(lang), fontWeight: rtl ? 600 : 500, fontSize: rtl ? 38 : 32, lineHeight: 1.35, color: 'rgba(232,233,238,0.75)' }}>{copy.line}</div>
    </div>
  );
};

const Finger: React.FC<{ f: number; dir: number }> = ({ f, dir }) => {
  const nodes = [1, 2, 3, 4].map((k) => {
    const at = activeAt(k);
    const t = f - (at - SWIPE - 12);
    if (t < 0 || t > SWIPE + 18) return null;
    const show = interpolate(t, [0, 6, SWIPE + 12, SWIPE + 18], [0, 1, 1, 0], clamp);
    const drag = ease(t, 10, 10 + SWIPE, [0, 1], Easing.inOut(Easing.cubic));
    const x = 540 + dir * interpolate(drag, [0, 1], [200, -220]);
    const press = interpolate(t, [6, 10], [1, 0.82], clamp);
    return (
      <div key={k} style={{ position: 'absolute', left: x - 44, top: CY + 120 - 44, opacity: show }}>
        {[0, 1, 2].map((g) => (
          <div
            key={g}
            style={{
              position: 'absolute',
              left: 44 - 22 + g * 34 * dir,
              top: 22,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: WHITE,
              opacity: drag > 0 && drag < 1 ? 0.12 * (3 - g) : 0,
            }}
          />
        ))}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.35)',
            border: `3px solid ${WHITE}`,
            transform: `scale(${press})`,
            boxShadow: '0 0 24px rgba(255,255,255,0.5)',
          }}
        />
      </div>
    );
  });
  return <>{nodes}</>;
};

export const Carousel: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = CAROUSEL[lang];
  const rtl = lang === 'ar';
  const dir = rtl ? -1 : 1; // next card sits on the reading-forward side
  const fadeOut = interpolate(f, [CAROUSEL_DURATION - 12, CAROUSEL_DURATION - 1], [1, 0], clamp);
  let idx = 0;
  for (let k = 1; k < 5; k++) idx += ease(f, activeAt(k) - SWIPE, activeAt(k), [0, 1], Easing.inOut(Easing.cubic));
  const enter = ease(f, 6, FIRST, [0, 1], Easing.out(Easing.cubic));
  const collapse = ease(f, WRAP, WRAP + 20, [0, 1], Easing.inOut(Easing.cubic));
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/carousel.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={CAROUSEL_DURATION} reveal={interpolate(f, [0, 20], [0.4, 1], clamp)} dots={0.18} />
        <AnimatedLine f={f} lang={lang} text={copy.heading} start={4} end={WRAP + 6} y={95} size={rtl ? 66 : 54} weight={900} color={WHITE} />
        {copy.cards.map((_, k) => {
          const rel = k - idx;
          const d = Math.min(Math.abs(rel), 1.6);
          if (Math.abs(rel) > 1.7) return null;
          const x = 540 + rel * SPACING * dir * (1 - collapse * 0.85);
          const scale = (1 - 0.16 * Math.min(d, 1)) * interpolate(enter, [0, 1], [0.85, 1]) * (1 - collapse * 0.35);
          const opacity = (1 - 0.55 * Math.min(d, 1)) * (k === 0 ? enter : 1) * (1 - collapse);
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: x - CARD_W / 2,
                top: CY - CARD_H / 2 + 30 + (1 - enter) * 80,
                transform: `scale(${scale}) rotate(${rel * dir * 3}deg)`,
                opacity,
                zIndex: 10 - Math.round(d * 4),
              }}
            >
              <ServiceCard k={k} t={f - (activeAt(k) - SWIPE)} lang={lang} />
            </div>
          );
        })}
        <Finger f={f} dir={dir} />
        <div style={{ position: 'absolute', top: 990, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, flexDirection: rtl ? 'row-reverse' : 'row', opacity: 1 - collapse }}>
          {copy.cards.map((_, k) => {
            const on = Math.max(0, 1 - Math.abs(k - idx));
            return <div key={k} style={{ height: 14, width: 14 + 30 * on, borderRadius: 7, background: on > 0.5 ? BLUE_LIGHT : 'rgba(232,233,238,0.3)' }} />;
          })}
        </div>
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.wrap}
          highlight={copy.wrapHighlight}
          start={WRAP + 10}
          end={LOGO - 4}
          y={540}
          size={rtl ? 76 : 62}
          weight={900}
        />
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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
