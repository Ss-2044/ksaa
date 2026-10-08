import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { BEFORE_AFTER, BeforeAfterCopy, Lang } from './copy';
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

// Vertical 1080×1920. Cues mirrored in music/compose.py score_before_after.
export const BEFORE_AFTER_DURATION = 15 * FPS;
const SLIDE = 90;
const REVEALED = 200;
const EXIT = 300;
const LOGO = 322;

const CARD_W = 760;
const CARD_H = 1040;
const CARD_X = (1080 - CARD_W) / 2;
const CARD_Y = 470;
const IMG_H = 600;

/* --------------------------------------------------------------- post */

const Heart: React.FC<{ size: number; fill?: string; stroke?: string }> = ({ size, fill = 'none', stroke }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.2 0 3.6 1.3 5.4 3.3 1.8-2 3.2-3.3 5.4-3.3 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke ? 2 : 0}
    />
  </svg>
);

const Bottle: React.FC<{ fancy: boolean }> = ({ fancy }) => (
  <svg width={220} height={330} viewBox="0 0 220 330">
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.45" stopColor={BLUE_LIGHT} />
        <stop offset="1" stopColor={BLUE} />
      </linearGradient>
    </defs>
    <rect x={80} y={0} width={60} height={60} rx={8} fill={fancy ? WHITE : '#55565e'} />
    <rect x={20} y={56} width={180} height={270} rx={40} fill={fancy ? 'url(#glass)' : '#4a4b53'} />
    {fancy && <rect x={44} y={86} width={22} height={200} rx={11} fill="#fff" opacity={0.45} />}
    <rect x={60} y={170} width={100} height={60} rx={8} fill={fancy ? 'rgba(5,8,26,0.85)' : '#3d3e45'} />
    {fancy && <PersonMark />}
  </svg>
);

// Tiny runner mark printed on the bottle label.
const PersonMark: React.FC = () => (
  <foreignObject x={84} y={176} width={52} height={48}>
    <PersonSvg width={52} />
  </foreignObject>
);

const Post: React.FC<{ fancy: boolean; t: number; copy: BeforeAfterCopy; lang: Lang }> = ({ fancy, t, copy, lang }) => {
  const rtl = lang === 'ar';
  const heartBeat = fancy ? 1 + Math.max(0, Math.sin(t / 5)) * 0.12 : 1;
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 34,
        overflow: 'hidden',
        background: fancy ? 'linear-gradient(170deg, #121a4d, #05081a)' : '#26272d',
        border: fancy ? '2px solid rgba(116,134,242,0.7)' : '2px solid #34353c',
        fontFamily: fontFor(lang),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '26px 30px' }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: fancy ? BLUE : '#44454c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: fancy ? `0 0 20px ${BLUE}` : 'none',
          }}
        >
          {fancy && <PersonSvg width={46} color={WHITE} />}
        </div>
        <div style={{ fontSize: 34, fontWeight: fancy ? 800 : 400, color: fancy ? WHITE : '#8a8b92' }}>{copy.brand}</div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 40, color: fancy ? WHITE : '#6a6b72', letterSpacing: 4 }}>···</div>
      </div>
      <div
        style={{
          position: 'relative',
          height: IMG_H,
          background: fancy
            ? `radial-gradient(circle at 50% 40%, ${BLUE_LIGHT} 0%, ${BLUE} 45%, #0a1033 100%)`
            : '#3a3b42',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {fancy && (
          <AbsoluteFill
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 2px, transparent 3px)',
              backgroundSize: '26px 26px',
              WebkitMaskImage: 'linear-gradient(135deg, transparent 20%, black 50%, transparent 80%)',
              maskImage: 'linear-gradient(135deg, transparent 20%, black 50%, transparent 80%)',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: fancy ? 40 : 30,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: fancy ? (rtl ? 92 : 76) : 34,
            fontWeight: fancy ? 900 : 400,
            color: fancy ? WHITE : '#9a9ba2',
            textShadow: fancy ? '0 8px 30px rgba(0,0,0,0.45)' : 'none',
            lineHeight: 1.15,
          }}
        >
          {copy.postHeadline}
        </div>
        <div
          style={{
            marginTop: 110,
            transform: fancy ? `translateY(${Math.sin(t / 12) * 10}px) rotate(${Math.sin(t / 20) * 3}deg)` : 'none',
            filter: fancy ? 'drop-shadow(0 30px 40px rgba(0,0,0,0.5))' : 'none',
          }}
        >
          <Bottle fancy={fancy} />
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 34,
            [rtl ? 'left' : 'right']: 34,
            padding: fancy ? '16px 34px' : '6px 0',
            borderRadius: 40,
            background: fancy ? WHITE : 'transparent',
            color: fancy ? BLUE : '#7d7e85',
            fontSize: fancy ? 34 : 26,
            fontWeight: fancy ? 900 : 400,
            textDecoration: fancy ? 'none' : 'underline',
            boxShadow: fancy ? '0 10px 30px rgba(0,0,0,0.35)' : 'none',
          }}
        >
          {copy.postCta}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '26px 30px' }}>
        <div style={{ transform: `scale(${heartBeat})` }}>
          <Heart size={58} fill={fancy ? '#ff5a7a' : 'none'} stroke={fancy ? undefined : '#6a6b72'} />
        </div>
        <svg width={54} height={54} viewBox="0 0 24 24">
          <path d="M4 5h16v11H9l-5 4z" fill="none" stroke={fancy ? WHITE : '#6a6b72'} strokeWidth={2} strokeLinejoin="round" />
        </svg>
        <svg width={54} height={54} viewBox="0 0 24 24">
          <path d="M3 11l18-7-7 18-3-8z" fill="none" stroke={fancy ? WHITE : '#6a6b72'} strokeWidth={2} strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ padding: '0 30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[0.92, 0.7].map((w, k) => (
          <div key={k} style={{ height: 18, width: `${w * 100}%`, borderRadius: 9, background: fancy ? (k ? 'rgba(232,233,238,0.45)' : 'rgba(232,233,238,0.8)') : '#3d3e45' }} />
        ))}
      </div>
    </div>
  );
};

/* --------------------------------------------------------- reactions */

const Reactions: React.FC<{ f: number; rtl: boolean }> = ({ f, rtl }) => {
  if (f < REVEALED - 10 || f > EXIT + 20) return null;
  const baseX = CARD_X + (rtl ? CARD_W - 80 : 80);
  const baseY = CARD_Y + 120 + IMG_H + 60;
  return (
    <>
      {Array.from({ length: 22 }, (_, k) => {
        const born = REVEALED - 6 + k * 4.2;
        const age = (f - born) / 46;
        if (age < 0 || age > 1) return null;
        const x = baseX + (random(`rx-${k}`) - 0.5) * 220 + Math.sin(age * 6 + k) * 40;
        const y = baseY - age * (520 + random(`ry-${k}`) * 300);
        const size = 40 + random(`rs-${k}`) * 50;
        const kind = random(`rk-${k}`);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              opacity: Math.sin(Math.PI * age),
              transform: `scale(${interpolate(age, [0, 0.15], [0.3, 1], clamp)})`,
            }}
          >
            {kind < 0.65 ? (
              <Heart size={size} fill={kind < 0.4 ? '#ff5a7a' : BLUE_LIGHT} />
            ) : (
              <div
                style={{
                  width: size * 1.4,
                  height: size,
                  borderRadius: size / 2,
                  background: WHITE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div key={d} style={{ width: size / 7, height: size / 7, borderRadius: '50%', background: BLUE }} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

/* --------------------------------------------------------- composition */

export const BeforeAfter: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = BEFORE_AFTER[lang];
  const rtl = lang === 'ar';
  const fadeOut = interpolate(f, [BEFORE_AFTER_DURATION - 12, BEFORE_AFTER_DURATION - 1], [1, 0], clamp);

  // Slider: teases half-way, pulls back, then wipes all the way.
  const p = interpolate(
    f,
    [SLIDE, SLIDE + 36, SLIDE + 64, REVEALED],
    [0, 0.55, 0.38, 1],
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );
  const cardIn = ease(f, 0, 22, [0, 1], Easing.out(Easing.cubic));
  const exit = ease(f, EXIT, EXIT + 26, [0, 1], Easing.in(Easing.cubic));
  const tilt = f > REVEALED ? Math.sin((f - REVEALED) / 16) * 6 : 0;
  const glow = ease(f, REVEALED - 20, REVEALED + 10);
  const dividerY = CARD_H * p;
  const pill = (label: string, active: boolean, top: number) => (
    <div
      style={{
        position: 'absolute',
        top,
        [rtl ? 'left' : 'right']: 24,
        padding: '10px 26px',
        borderRadius: 30,
        background: active ? BLUE_LIGHT : 'rgba(0,0,0,0.55)',
        color: WHITE,
        fontFamily: fontFor(lang),
        fontWeight: 800,
        fontSize: rtl ? 34 : 26,
        letterSpacing: rtl ? undefined : '0.2em',
      }}
    >
      {label}
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/before-after.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop
          f={f}
          duration={BEFORE_AFTER_DURATION}
          reveal={interpolate(f, [0, 30, REVEALED - 30, REVEALED], [0.25, 0.35, 0.35, 1], clamp)}
          dots={interpolate(f, [REVEALED - 10, REVEALED + 20], [0, 0.25], clamp)}
        />

        <AnimatedLine f={f} lang={lang} text={copy.intro} start={8} end={SLIDE + 8} y={250} size={rtl ? 96 : 80} weight={rtl ? 700 : 600} color="rgba(232,233,238,0.75)" />
        <AnimatedLine f={f} lang={lang} text={copy.same} start={REVEALED + 4} end={EXIT + 6} y={210} size={rtl ? 84 : 70} weight={rtl ? 700 : 600} color="rgba(232,233,238,0.85)" />
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.different}
          highlight={copy.differentHighlight}
          start={REVEALED + 26}
          end={EXIT + 6}
          y={330}
          size={rtl ? 110 : 92}
          weight={900}
        />

        <div
          style={{
            position: 'absolute',
            left: CARD_X,
            top: CARD_Y,
            width: CARD_W,
            height: CARD_H,
            opacity: cardIn * (1 - exit),
            transform: `perspective(1600px) translateY(${(1 - cardIn) * 120 - exit * 300}px) scale(${1 - exit * 0.5}) rotateY(${tilt}deg)`,
            filter: `drop-shadow(0 0 ${50 * glow}px rgba(90,110,255,${0.6 * glow}))`,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, filter: 'saturate(0.2)' }}>
            <Post fancy={false} t={f} copy={copy} lang={lang} />
          </div>
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)` }}>
            <Post fancy t={f} copy={copy} lang={lang} />
          </div>
          {p < 0.995 && (
            <>
              {pill(copy.before, false, CARD_H - 90)}
              {p > 0.05 && (
                <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)` }}>{pill(copy.after, true, 24)}</div>
              )}
            </>
          )}
          {p > 0.001 && p < 0.995 && (
            <>
              <div style={{ position: 'absolute', left: -30, right: -30, top: dividerY - 3, height: 6, background: WHITE, boxShadow: `0 0 24px ${BLUE_LIGHT}` }} />
              <div
                style={{
                  position: 'absolute',
                  left: CARD_W / 2 - 46,
                  top: dividerY - 46,
                  width: 92,
                  height: 92,
                  borderRadius: '50%',
                  background: WHITE,
                  boxShadow: `0 0 30px ${BLUE_LIGHT}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width={44} height={56} viewBox="0 0 44 56">
                  <path d="M22 4 L36 20 H8 Z M22 52 L36 36 H8 Z" fill={BLUE} />
                </svg>
              </div>
            </>
          )}
        </div>

        <Reactions f={f} rtl={rtl} />

        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
          taglineAt={64}
          cy={820}
          width={840}
        />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
