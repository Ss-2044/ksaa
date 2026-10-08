import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BLANK_PAGE, Lang } from './copy';
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

// Works at 16:9, 9:16 and 1:1. Cues mirrored in music/compose.py score_blank_page.
export const BLANK_PAGE_DURATION = 16 * FPS;
const TYPE1 = [90, 112, 124, 138] as const; // type start, type end, delete start, delete end
const TYPE2 = [150, 168, 180, 194] as const;
const RUNNER_IN = 194;
const TAKEOVER = 208;
const PHONES = 290;
const EXIT = 368;
const LOGO = 384;

type Layout = { pageW: number; pageH: number; pageY: number; captionY: number; phoneW: number; phonesY: number };

const layoutFor = (w: number, h: number): Layout => {
  if (w > h) return { pageW: 1000, pageH: 620, pageY: 600, captionY: 130, phoneW: 330, phonesY: 610 };
  if (w === h) return { pageW: 780, pageH: 640, pageY: 610, captionY: 120, phoneW: 290, phonesY: 620 };
  return { pageW: 880, pageH: 1100, pageY: 1020, captionY: 300, phoneW: 320, phonesY: 1060 };
};

/* ---------------------------------------------------------- the design */

const VARIANTS = [
  { bg: 'linear-gradient(160deg, #17246b, #05081a)', fg: WHITE, img: `radial-gradient(circle at 50% 45%, ${BLUE_LIGHT}, ${BLUE} 55%, #0a1033)`, cta: WHITE, ctaFg: BLUE },
  { bg: '#f1f2f6', fg: BLUE, img: `linear-gradient(135deg, ${BLUE}, #0a1033)`, cta: BLUE, ctaFg: WHITE },
  { bg: `linear-gradient(160deg, ${BLUE_LIGHT}, ${BLUE})`, fg: WHITE, img: 'radial-gradient(circle at 50% 45%, #2a3dbb, #05081a)', cta: WHITE, ctaFg: BLUE },
];

const Design: React.FC<{ w: number; h: number; t: number; lang: Lang; variant?: number }> = ({ w, h, t, lang, variant = 0 }) => {
  const copy = BLANK_PAGE[lang];
  const rtl = lang === 'ar';
  const v = VARIANTS[variant];
  const landscape = w > h * 1.2;
  const pop = (a: number) => ease(t, a, a + 10, [0, 1], Easing.out(Easing.back(1.6)));
  const unit = Math.min(w, h);
  const image = (
    <div
      style={{
        position: 'relative',
        flex: landscape ? '0 0 46%' : '0 0 52%',
        borderRadius: unit * 0.04,
        overflow: 'hidden',
        background: v.img,
        transform: `scale(${pop(0)})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 2px, transparent 3px)',
          backgroundSize: '20px 20px',
          WebkitMaskImage: 'linear-gradient(135deg, transparent 15%, black 50%, transparent 85%)',
          maskImage: 'linear-gradient(135deg, transparent 15%, black 50%, transparent 85%)',
        }}
      />
      <div style={{ transform: `translateX(${Math.sin(t / 8) * 6}px)`, filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.55))' }}>
        <PersonSvg width={unit * 0.34} color={WHITE} />
      </div>
    </div>
  );
  const text = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: unit * 0.035 }}>
      <div style={{ fontFamily: fontFor(lang), fontWeight: 900, fontSize: unit * (rtl ? 0.11 : 0.09), lineHeight: 1.15, color: v.fg, opacity: pop(8), transform: `translateY(${(1 - pop(8)) * 30}px)` }}>
        {copy.headline}
      </div>
      {[0.9, 0.7].map((wd, i) => (
        <div key={i} style={{ height: unit * 0.022, width: `${wd * 100 * pop(16 + i * 3)}%`, borderRadius: 99, background: v.fg, opacity: 0.45 }} />
      ))}
      <div
        style={{
          alignSelf: 'flex-start',
          padding: `${unit * 0.025}px ${unit * 0.06}px`,
          borderRadius: 99,
          background: v.cta,
          color: v.ctaFg,
          fontFamily: fontFor(lang),
          fontWeight: 800,
          fontSize: unit * (rtl ? 0.05 : 0.042),
          transform: `scale(${pop(26)})`,
          transformOrigin: rtl ? 'right center' : 'left center',
        }}
      >
        {copy.cta}
      </div>
    </div>
  );
  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        width: w,
        height: h,
        boxSizing: 'border-box',
        padding: unit * 0.06,
        background: v.bg,
        display: 'flex',
        flexDirection: landscape ? 'row' : 'column',
        gap: unit * 0.05,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {image}
      {text}
      <div style={{ position: 'absolute', bottom: unit * 0.04, [rtl ? 'left' : 'right']: unit * 0.04, opacity: pop(34), width: unit * 0.09, height: unit * 0.09, borderRadius: '50%', background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${BLUE}` }}>
        <PersonSvg width={unit * 0.06} color={WHITE} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- typing */

const typed = (f: number, text: string, [s, e, ds, de]: readonly [number, number, number, number]) => {
  const chars = Array.from(text);
  if (f < s || f > de) return '';
  if (f <= ds) return chars.slice(0, Math.round(interpolate(f, [s, e], [0, chars.length], clamp))).join('');
  return chars.slice(0, Math.round(interpolate(f, [ds, de], [chars.length, 0], clamp))).join('');
};

/* -------------------------------------------------------------- phones */

const Phone: React.FC<{ w: number; t: number; lang: Lang; variant: number }> = ({ w, t, lang, variant }) => {
  const h = w * 2;
  const pad = w * 0.05;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.16, padding: pad, boxSizing: 'border-box', background: '#0c0f22', border: '3px solid rgba(232,233,238,0.4)', boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 50px rgba(59,76,192,0.35)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: w * 0.12, overflow: 'hidden' }}>
        <Design w={w - pad * 2} h={h - pad * 2} t={t} lang={lang} variant={variant} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------- composition */

export const BlankPage: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const copy = BLANK_PAGE[lang];
  const rtl = lang === 'ar';
  const L = layoutFor(width, height);
  const cx = width / 2;
  const fadeOut = interpolate(f, [BLANK_PAGE_DURATION - 12, BLANK_PAGE_DURATION - 1], [1, 0], clamp);
  const pageIn = ease(f, 0, 20, [0, 1], Easing.out(Easing.cubic));
  const wipe = ease(f, TAKEOVER, TAKEOVER + 14, [0, 1], Easing.in(Easing.quad));
  const toPhone = ease(f, PHONES, PHONES + 22, [0, 1], Easing.inOut(Easing.cubic));
  const sides = ease(f, PHONES + 12, PHONES + 36, [0, 1], Easing.out(Easing.cubic));
  const exit = ease(f, EXIT, EXIT + 16, [0, 1], Easing.in(Easing.cubic));
  const caret = Math.floor(f / 9) % 2 === 0;
  const draft = f < TYPE2[0] ? typed(f, copy.attempts[0], TYPE1) : typed(f, copy.attempts[1], TYPE2);
  const deleting = (f > TYPE1[2] && f < TYPE1[3]) || (f > TYPE2[2] && f < TYPE2[3]);
  const runner = ease(f, RUNNER_IN, TAKEOVER, [0, 1], Easing.in(Easing.cubic));
  const runnerX = interpolate(runner, [0, 1], [-200, cx]);
  const runnerY = interpolate(runner, [0, 1], [L.pageY + 200, L.pageY]) - Math.sin(runner * Math.PI) * 160;
  const phoneH = L.phoneW * 2;
  const unit = Math.min(L.pageW, L.pageH);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/blank-page.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={BLANK_PAGE_DURATION} reveal={interpolate(f, [0, 30, TAKEOVER, TAKEOVER + 20], [0.3, 0.45, 0.45, 1], clamp)} dots={interpolate(f, [TAKEOVER, TAKEOVER + 20], [0, 0.22], clamp)} />

        <AnimatedLine f={f} lang={lang} text={copy.starts} highlight={copy.startsHighlight} start={20} end={96} y={L.captionY} size={Math.min(rtl ? 70 : 58, width * 0.065)} weight={800} />
        <AnimatedLine f={f} lang={lang} text={copy.hardest} start={102} end={RUNNER_IN} y={L.captionY} size={Math.min(rtl ? 70 : 56, width * 0.062)} weight={800} color="rgba(232,233,238,0.85)" />

        {/* The page: blank → typed attempts → takeover */}
        <div
          style={{
            position: 'absolute',
            left: cx - L.pageW / 2,
            top: L.pageY - L.pageH / 2 + (1 - pageIn) * 60,
            width: L.pageW,
            height: L.pageH,
            borderRadius: 26,
            overflow: 'hidden',
            opacity: pageIn * (1 - toPhone),
            transform: `scale(${interpolate(toPhone, [0, 1], [1, (L.phoneW * 0.9) / L.pageW])})`,
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          }}
        >
          <div
            dir={rtl ? 'rtl' : 'ltr'}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#f4f4f6',
              padding: unit * 0.08,
              fontFamily: fontFor(lang),
              fontWeight: 600,
              fontSize: unit * (rtl ? 0.085 : 0.075),
              color: '#3a3b42',
            }}
          >
            {draft}
            <span style={{ display: 'inline-block', width: 4, height: unit * 0.09, verticalAlign: 'middle', background: deleting ? '#d64a5a' : BLUE, marginInlineStart: 6, opacity: caret || deleting ? 1 : 0 }} />
          </div>
          {f >= TAKEOVER && (
            <div style={{ position: 'absolute', inset: 0, clipPath: `circle(${wipe * 140}% at 50% 50%)` }}>
              <Design w={L.pageW} h={L.pageH} t={f - TAKEOVER - 4} lang={lang} />
            </div>
          )}
        </div>

        {/* Runner dives into the page */}
        {f >= RUNNER_IN && f <= TAKEOVER + 4 && (
          <>
            {[3, 2, 1].map((k) => {
              const p2 = ease(f - k * 2, RUNNER_IN, TAKEOVER, [0, 1], Easing.in(Easing.cubic));
              const gx = interpolate(p2, [0, 1], [-200, cx]);
              const gy = interpolate(p2, [0, 1], [L.pageY + 200, L.pageY]) - Math.sin(p2 * Math.PI) * 160;
              return (
                <div key={k} style={{ position: 'absolute', left: gx - 110, top: gy - 90, opacity: 0.15 * (4 - k) }}>
                  <PersonSvg width={220} color={BLUE} />
                </div>
              );
            })}
            <div style={{ position: 'absolute', left: runnerX - 110, top: runnerY - 90, transform: `scale(${1 - runner * 0.5})`, filter: 'drop-shadow(0 0 24px rgba(90,110,255,0.95))' }}>
              <PersonSvg width={220} />
            </div>
          </>
        )}

        {/* One idea, every screen */}
        {f >= PHONES && (
          <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 - exit * 0.2})` }}>
            {[-1, 1, 0].map((side) => {
              const isCenter = side === 0;
              const p2 = isCenter ? toPhone : sides;
              const gap = L.phoneW * 1.12;
              const x = cx + side * gap * p2;
              const y = L.phonesY + (isCenter ? 0 : (1 - p2) * 300);
              const scale = isCenter ? 1 : 0.88;
              return (
                <div
                  key={side}
                  style={{
                    position: 'absolute',
                    left: x - L.phoneW / 2,
                    top: y - phoneH / 2,
                    opacity: isCenter ? toPhone : sides,
                    transform: `scale(${scale}) rotate(${side * 4 * p2}deg)`,
                    zIndex: isCenter ? 2 : 1,
                  }}
                >
                  <Phone w={L.phoneW} t={f - PHONES + (isCenter ? 40 : 0)} lang={lang} variant={isCenter ? 0 : side < 0 ? 1 : 2} />
                </div>
              );
            })}
          </AbsoluteFill>
        )}
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.everywhere}
          highlight={copy.everywhereHighlight}
          start={PHONES + 14}
          end={EXIT + 4}
          y={width > height ? 1010 : width === height ? 1010 : L.captionY}
          size={Math.min(rtl ? 62 : 50, width * 0.055)}
          weight={900}
        />

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
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
