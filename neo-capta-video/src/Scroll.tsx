import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Lang, SCROLL } from './copy';
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

// Works at 16:9, 9:16 and 1:1. Cues mirrored in music/compose.py score_scroll.
export const SCROLL_DURATION = 16 * FPS;
const SLOW_END = 80;
const STOP = 200;
const UNTIL = 214;
const WE_MAKE = 304;
const EXIT = 368;
const LOGO = 384;
const SPECIAL = 24;
const SCROLL_WORDS = [92, 118, 144];

const MUTED = ['#3a3d46', '#4a4440', '#3f4a48', '#4b4252', '#45474f', '#514a3e', '#3d4450'];

type Layout = { cardW: number; feedX: number; textX: number; textW: number; textY: number; overlay: boolean };

const layoutFor = (w: number, h: number, rtl: boolean): Layout => {
  if (w > h) return { cardW: 520, feedX: rtl ? w * 0.3 : w * 0.7, textX: rtl ? w * 0.52 : 0, textW: w * 0.48, textY: h / 2, overlay: false };
  if (w === h) return { cardW: 420, feedX: w / 2, textX: 0, textW: w, textY: 120, overlay: true };
  return { cardW: 760, feedX: w / 2, textX: 0, textW: w, textY: 250, overlay: true };
};

/* --------------------------------------------------------------- posts */

const OrdinaryPost: React.FC<{ i: number; w: number; h: number }> = ({ i, w, h }) => {
  const base = MUTED[Math.floor(random(`pc-${i}`) * MUTED.length)];
  const shape = Math.floor(random(`ps-${i}`) * 3);
  const imgH = h * 0.6;
  return (
    <div style={{ width: w, height: h, borderRadius: 26, overflow: 'hidden', background: '#202127', border: '1px solid #2e2f36' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4a4b53' }} />
        <div style={{ width: w * 0.3, height: 14, borderRadius: 7, background: '#4a4b53' }} />
      </div>
      <div style={{ height: imgH, background: base, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {shape === 0 && <div style={{ width: w * 0.3, height: w * 0.3, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />}
        {shape === 1 && <div style={{ width: w * 0.5, height: w * 0.2, borderRadius: 10, background: 'rgba(255,255,255,0.08)' }} />}
        {shape === 2 && (
          <svg width={w * 0.4} height={w * 0.3} viewBox="0 0 40 30">
            <path d="M0 30 L14 10 L22 20 L28 13 L40 30 Z" fill="rgba(255,255,255,0.08)" />
          </svg>
        )}
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: '85%', height: 12, borderRadius: 6, background: '#3a3b42' }} />
        <div style={{ width: '60%', height: 12, borderRadius: 6, background: '#3a3b42' }} />
      </div>
    </div>
  );
};

const SpecialPost: React.FC<{ w: number; h: number; t: number; lang: Lang }> = ({ w, h, t, lang }) => {
  const copy = SCROLL[lang];
  const rtl = lang === 'ar';
  const imgH = h * 0.66;
  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ width: w, height: h, borderRadius: 26, overflow: 'hidden', background: 'linear-gradient(170deg, #121a4d, #05081a)', border: `2px solid ${BLUE_LIGHT}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PersonSvg width={32} color={WHITE} />
        </div>
        <div style={{ fontFamily: fontFor(lang), fontWeight: 800, fontSize: 26, color: WHITE }}>{copy.brand}</div>
      </div>
      <div style={{ position: 'relative', height: imgH, background: `radial-gradient(circle at 50% 45%, ${BLUE_LIGHT}, ${BLUE} 50%, #0a1033)`, overflow: 'hidden' }}>
        <AbsoluteFill
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 2px, transparent 3px)',
            backgroundSize: '22px 22px',
            WebkitMaskImage: 'linear-gradient(135deg, transparent 15%, black 50%, transparent 85%)',
            maskImage: 'linear-gradient(135deg, transparent 15%, black 50%, transparent 85%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 26,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: fontFor(lang),
            fontWeight: 900,
            fontSize: w * (rtl ? 0.13 : 0.11),
            lineHeight: 1.1,
            color: WHITE,
            textShadow: '0 8px 30px rgba(0,0,0,0.4)',
          }}
        >
          {copy.postHeadline}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center', transform: `translateX(${Math.sin(t / 7) * 10}px)`, filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.6))' }}>
          <PersonSvg width={w * 0.5} color={WHITE} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
        <svg width={40} height={40} viewBox="0 0 24 24" style={{ transform: `scale(${1 + Math.max(0, Math.sin(t / 5)) * 0.15})` }}>
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.2 0 3.6 1.3 5.4 3.3 1.8-2 3.2-3.3 5.4-3.3 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" fill="#ff5a7a" />
        </svg>
        <div style={{ flex: 1, height: 12, borderRadius: 6, background: 'rgba(232,233,238,0.5)' }} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- composition */

export const Scroll: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const copy = SCROLL[lang];
  const rtl = lang === 'ar';
  const L = layoutFor(width, height, rtl);
  const cardH = L.cardW * 1.3;
  const step = cardH + 36;
  const stopPos = SPECIAL * step;
  const fadeOut = interpolate(f, [SCROLL_DURATION - 12, SCROLL_DURATION - 1], [1, 0], clamp);

  const pos = (ff: number) => {
    if (ff <= SLOW_END) return ff * 5;
    if (ff <= STOP) return 5 * SLOW_END + (stopPos - 5 * SLOW_END) * Easing.in(Easing.quad)((ff - SLOW_END) / (STOP - SLOW_END));
    const t = ff - STOP;
    return stopPos + 70 * Math.exp(-t / 5) * Math.sin(t / 2.2);
  };
  const p = pos(f);
  const speed = Math.abs(p - pos(f - 1));
  const blur = Math.min(speed / 22, 14);
  const stopped = f >= STOP;
  const focus = ease(f, STOP, STOP + 24, [0, 1], Easing.out(Easing.cubic));
  const exit = ease(f, EXIT, EXIT + 16, [0, 1], Easing.in(Easing.cubic));
  const flash = interpolate(f, [STOP - 1, STOP, STOP + 6], [0, 0.55, 0], clamp);
  const shake = f >= STOP && f < STOP + 8 ? Math.sin(f * 3) * (8 - (f - STOP)) * 1.5 : 0;

  const first = Math.max(0, Math.floor((p - height) / step) - 1);
  const last = Math.ceil((p + height) / step) + 1;
  const cards: React.ReactNode[] = [];
  for (let i = first; i <= last; i++) {
    const top = height / 2 - cardH / 2 + i * step - p;
    const special = i === SPECIAL;
    cards.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: L.feedX - L.cardW / 2,
          top,
          opacity: special ? 1 : 1 - focus * 0.75,
          filter: special ? `drop-shadow(0 0 ${50 * focus}px rgba(90,110,255,${0.8 * focus}))` : `blur(${focus * 4}px)`,
          transform: special ? `scale(${1 + focus * 0.08})` : undefined,
          zIndex: special ? 2 : 1,
        }}
      >
        {special ? <SpecialPost w={L.cardW} h={cardH} t={f} lang={lang} /> : <OrdinaryPost i={i} w={L.cardW} h={cardH} />}
      </div>,
    );
  }

  const textSize = (ar: number, en: number) => Math.min(rtl ? ar : en, L.textW * (rtl ? 0.09 : 0.07));
  const scrollWordsOut = interpolate(f, [STOP - 4, STOP], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/scroll.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut, transform: `translate(${shake}px, 0)` }}>
        <Backdrop f={f} duration={SCROLL_DURATION} reveal={interpolate(f, [0, 20, STOP, STOP + 10], [0.35, 0.55, 0.55, 1], clamp)} dots={interpolate(f, [STOP, STOP + 20], [0, 0.22], clamp)} />
        <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.2})`, filter: stopped ? undefined : `blur(${blur}px)` }}>{cards}</AbsoluteFill>
        {L.overlay && (
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) ${((L.textY + 120) / height) * 100}%, rgba(0,0,0,0) ${((L.textY + 260) / height) * 100}%)`,
              opacity: 1 - exit,
            }}
          />
        )}
        <div style={{ position: 'absolute', left: L.textX, width: L.textW, top: 0, bottom: 0 }}>
          <AnimatedLine f={f} lang={lang} text={copy.everyDay} start={8} end={SLOW_END + 6} y={L.textY} size={textSize(72, 60)} weight={800} />
          <div
            dir={rtl ? 'rtl' : 'ltr'}
            style={{ position: 'absolute', left: 0, right: 0, top: L.textY, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', columnGap: 24, padding: '0 40px', opacity: scrollWordsOut }}
          >
            {copy.scroll.map((w, k) => {
              const s = SCROLL_WORDS[k];
              const pin = ease(f, s, s + 8, [0, 1], Easing.out(Easing.cubic));
              return (
                <span
                  key={k}
                  style={{
                    display: 'inline-block',
                    fontFamily: fontFor(lang),
                    fontWeight: 900,
                    fontSize: textSize(78, 62) * (1 + k * 0.12),
                    color: k === 2 ? BLUE_LIGHT : WHITE,
                    opacity: pin * (k === 2 ? 1 : 0.55 + k * 0.2),
                    transform: `translateY(${(1 - pin) * -50}px) skewX(${rtl ? 8 : -8}deg)`,
                    filter: `blur(${(1 - pin) * 10 + k * 0.6}px)`,
                    lineHeight: 1.3,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
          <AnimatedLine f={f} lang={lang} text={copy.until} highlight={copy.untilHighlight} start={UNTIL} end={WE_MAKE - 4} y={L.textY} size={textSize(80, 64)} weight={900} />
          <AnimatedLine f={f} lang={lang} text={copy.weMake} highlight={copy.weMakeHighlight} start={WE_MAKE} end={EXIT + 4} y={L.textY} size={textSize(76, 60)} weight={900} />
        </div>
        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
          taglineAt={56}
          cy={width > height ? 400 : width === height ? 420 : 820}
          width={width > height ? 700 : width === height ? 640 : 840}
        />
        <Vignette />
        <AbsoluteFill style={{ background: WHITE, opacity: flash }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
