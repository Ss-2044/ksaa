import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { BRIEF, Lang } from './copy';
import { GlimpseIcon } from './icons';
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

// Vertical 1080×1920. Cues mirrored in music/compose.py score_brief.
export const BRIEF_DURATION = 15 * FPS;
const TYPE_START = 26;
const TYPE_END = 78;
const SENT = 84;
const TYPING = 98;
const REPLY = 130;
const ZOOM = 160;
const BURST = 196;
const EXIT = 318;
const LOGO = 336;

const PHONE_W = 860;
const PHONE_H = 1560;
const ICON_FOR_OUTPUT = [2, 5, 3, 4, 0, 1];

const Avatar: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: BLUE,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 16px ${BLUE}`,
      flexShrink: 0,
    }}
  >
    <PersonSvg width={size * 0.66} color={WHITE} />
  </div>
);

const Ticks: React.FC<{ read: boolean }> = ({ read }) => (
  <svg width={34} height={20} viewBox="0 0 34 20">
    <path d="M2 10 L8 16 L20 3 M14 14 L16 16 L30 3" fill="none" stroke={read ? '#6fb7ff' : 'rgba(232,233,238,0.55)'} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ------------------------------------------------------------- the phone */

const Phone: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const copy = BRIEF[lang];
  const rtl = lang === 'ar';
  const font = fontFor(lang);
  const chars = Array.from(copy.clientMsg);
  const typed = Math.round(interpolate(f, [TYPE_START, TYPE_END], [0, chars.length], clamp));
  const draft = f < SENT ? chars.slice(0, typed).join('') : '';
  const sentP = ease(f, SENT, SENT + 10, [0, 1], Easing.out(Easing.back(1.6)));
  const typingP = interpolate(f, [TYPING, TYPING + 6, REPLY - 2, REPLY], [0, 1, 1, 0], clamp);
  const replyP = ease(f, REPLY, REPLY + 10, [0, 1], Easing.out(Easing.back(1.6)));
  const replyGlow = interpolate(f, [REPLY + 10, REPLY + 20, ZOOM + 20], [0, 1, 0.4], clamp);
  const caret = Math.floor(f / 8) % 2 === 0 && f < SENT;
  const bubble = (mine: boolean): React.CSSProperties => ({
    alignSelf: mine ? 'flex-end' : 'flex-start',
    maxWidth: '78%',
    padding: '22px 30px',
    borderRadius: 34,
    [mine ? (rtl ? 'borderBottomLeftRadius' : 'borderBottomRightRadius') : rtl ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 8,
    fontFamily: font,
    fontSize: rtl ? 46 : 40,
    fontWeight: 600,
    lineHeight: 1.35,
    color: WHITE,
  });
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: 90,
        padding: 22,
        background: '#0c0f22',
        border: '3px solid rgba(232,233,238,0.35)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.7), 0 0 80px rgba(59,76,192,0.35)',
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: 70, overflow: 'hidden', background: 'linear-gradient(180deg, #070a1c, #0b1236)', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '70px 40px 30px', background: 'rgba(23,36,107,0.55)', borderBottom: '1px solid rgba(116,134,242,0.3)' }}>
          <svg width={30} height={44} viewBox="0 0 30 44" style={{ transform: rtl ? 'scaleX(-1)' : undefined }}>
            <path d="M24 4 L6 22 L24 40" fill="none" stroke={WHITE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Avatar size={96} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 42, color: WHITE }}>{copy.contact}</div>
            <div style={{ fontFamily: font, fontSize: 30, color: f >= TYPING && f < REPLY ? BLUE_LIGHT : 'rgba(232,233,238,0.6)' }}>
              {f >= TYPING && f < REPLY ? (rtl ? 'يكتب الآن…' : 'typing…') : copy.status}
            </div>
          </div>
        </div>
        {/* messages */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 26,
            padding: '30px 34px',
            backgroundImage: 'radial-gradient(circle, rgba(116,134,242,0.12) 2px, transparent 3px)',
            backgroundSize: '34px 34px',
          }}
        >
          {f >= SENT && (
            <div
              style={{
                ...bubble(true),
                background: 'linear-gradient(135deg, #2b3260, #1d2347)',
                transform: `scale(${sentP})`,
                transformOrigin: rtl ? 'bottom left' : 'bottom right',
              }}
            >
              {copy.clientMsg}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <Ticks read={f > TYPING} />
              </div>
            </div>
          )}
          {typingP > 0 && (
            <div style={{ ...bubble(false), background: BLUE, opacity: typingP, display: 'flex', gap: 12, padding: '30px 34px' }}>
              {[0, 1, 2].map((d) => (
                <div key={d} style={{ width: 16, height: 16, borderRadius: '50%', background: WHITE, transform: `translateY(${Math.sin((f - d * 4) / 3) * 7}px)` }} />
              ))}
            </div>
          )}
          {f >= REPLY && (
            <div
              style={{
                ...bubble(false),
                fontSize: rtl ? 62 : 52,
                fontWeight: 900,
                background: `linear-gradient(135deg, ${BLUE_LIGHT}, ${BLUE})`,
                transform: `scale(${replyP})`,
                transformOrigin: rtl ? 'bottom right' : 'bottom left',
                boxShadow: `0 0 ${60 * replyGlow}px ${BLUE_LIGHT}`,
              }}
            >
              {copy.replyMsg}
            </div>
          )}
        </div>
        {/* input bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px 30px 50px' }}>
          <div
            style={{
              flex: 1,
              minHeight: 88,
              borderRadius: 44,
              background: 'rgba(232,233,238,0.08)',
              border: '1px solid rgba(232,233,238,0.15)',
              padding: '18px 32px',
              fontFamily: font,
              fontSize: rtl ? 36 : 32,
              color: WHITE,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {draft}
            <span style={{ display: 'inline-block', width: 3, height: 44, background: BLUE_LIGHT, marginInlineStart: 4, opacity: caret ? 1 : 0 }} />
          </div>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: BLUE_LIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${interpolate(f, [SENT - 4, SENT, SENT + 6], [1, 0.82, 1], clamp)})`,
            }}
          >
            <svg width={40} height={40} viewBox="0 0 24 24" style={{ transform: rtl ? 'scaleX(-1)' : undefined }}>
              <path d="M3 11l18-8-8 18-2-8z" fill={WHITE} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------- campaign burst */

const SLOTS: [number, number][] = [
  [200, 520],
  [880, 520],
  [200, 900],
  [880, 900],
  [200, 1280],
  [880, 1280],
];

const Outputs: React.FC<{ f: number; lang: Lang; cx: number; cy: number }> = ({ f, lang, cx, cy }) => {
  if (f < BURST - 2) return null;
  const copy = BRIEF[lang];
  const exit = ease(f, EXIT, EXIT + 18, [0, 1], Easing.in(Easing.cubic));
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {SLOTS.map(([x, y], k) => {
          const p = ease(f, BURST + k * 7, BURST + k * 7 + 22, [0, 1], Easing.out(Easing.cubic));
          return (
            <line
              key={k}
              x1={cx}
              y1={cy}
              x2={cx + (x - cx) * p}
              y2={cy + (y - cy) * p}
              stroke={BLUE_LIGHT}
              strokeWidth={3}
              strokeDasharray="10 10"
              strokeDashoffset={-f * 2}
              opacity={0.6 * (1 - exit)}
            />
          );
        })}
      </svg>
      {SLOTS.map(([x, y], k) => {
        const start = BURST + k * 7;
        const p = ease(f, start, start + 22, [0, 1], Easing.out(Easing.back(1.5)));
        const px = cx + (x - cx) * p;
        const py = cy + (y - cy) * p + Math.sin((f + k * 9) / 14) * 8;
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: px - 170,
              top: py - 120,
              width: 340,
              height: 240,
              borderRadius: 28,
              background: 'linear-gradient(160deg, rgba(23,36,107,0.95), rgba(5,8,26,0.95))',
              border: '1.5px solid rgba(116,134,242,0.7)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59,76,192,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              opacity: Math.min(p * 1.5, 1) * (1 - exit),
              transform: `scale(${Math.max(p, 0) * (1 - exit * 0.4)})`,
            }}
          >
            <GlimpseIcon index={ICON_FOR_OUTPUT[k]} t={f - start} />
            <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: fontFor(lang), fontWeight: 800, fontSize: lang === 'ar' ? 38 : 30, color: WHITE }}>
              {copy.outputs[k]}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------- composition */

export const Brief: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = BRIEF[lang];
  const rtl = lang === 'ar';
  const fadeOut = interpolate(f, [BRIEF_DURATION - 12, BRIEF_DURATION - 1], [1, 0], clamp);
  const enter = ease(f, 0, 22, [0, 1], Easing.out(Easing.cubic));
  const zoom = ease(f, ZOOM, BURST, [0, 1], Easing.inOut(Easing.cubic));
  const exit = ease(f, EXIT, EXIT + 18, [0, 1], Easing.in(Easing.cubic));
  const scale = interpolate(zoom, [0, 1], [1, 0.36]) * (1 - exit * 0.5);
  const cx = 540;
  const cy = interpolate(zoom, [0, 1], [960, 900]);
  const shake = f >= REPLY && f < REPLY + 8 ? Math.sin(f * 3) * 6 : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/brief.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop
          f={f}
          duration={BRIEF_DURATION}
          reveal={interpolate(f, [0, 30], [0.4, 0.8], clamp)}
          dots={interpolate(f, [ZOOM, BURST], [0, 0.28], clamp)}
        />
        <Outputs f={f} lang={lang} cx={cx} cy={cy} />
        <div
          style={{
            position: 'absolute',
            left: cx - PHONE_W / 2 + shake,
            top: cy - PHONE_H / 2 + (1 - enter) * 200,
            opacity: enter * (1 - exit),
            transform: `scale(${scale})`,
          }}
        >
          <Phone f={f} lang={lang} />
        </div>
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.fromTo}
          highlight={copy.fromToHighlight}
          start={BURST + 40}
          end={EXIT + 10}
          y={1620}
          size={rtl ? 80 : 60}
          weight={900}
        />
        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
          taglineAt={60}
          cy={820}
          width={840}
        />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
