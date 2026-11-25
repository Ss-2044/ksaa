import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import logo from './logo.json';
import { CafeMark, CLIENT } from './client';
import { Lang } from './copy';
import { CupDots } from './CupDots';
import { AnimatedLine, BLUE, BLUE_LIGHT, Backdrop, BrandEndCard, FPS, LH, LW, PersonSvg, Vignette, WHITE, clamp, ease } from './shared';

// «القصة رقم ٠١» — announcing Neo Capta's first client.
// Arabic. Works at 16:9 and 9:16. Cues mirrored in music/compose.py score_first_story.
export const FIRST_STORY_DURATION = 18 * FPS;
const NUMBER_OUT = 84;
const ASSEMBLE = 92;
const SOLID = 160;
const BTS = [176, 236, 296];
const BTS_LEN = 60;
const DUO = 360;
const LOGO = 450;

const COPY = {
  every: 'كل وكالة… لها أول قصة.',
  everyHighlight: 'قصة.',
  ours: 'وهذي قصتنا الأولى.',
  oursHighlight: 'الأولى.',
  bts: ['الفكرة', 'الألوان', 'الحملة'],
  firsts: 'أول عميل. أول حملة. أول رشفة.',
  thanks: 'شكرًا لأنكم وثقتم فينا من البداية.',
  thanksHighlight: 'البداية.',
  services: 'تسويق  •  إعلان  •  محتوى',
  next: 'قصتك الجاية؟ خلّها علينا.',
  nextHighlight: 'علينا.',
};

const C = CLIENT.colors;

const NeoLogo: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={(LH / LW) * width} viewBox={`0 0 ${LW} ${LH}`}>
    <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
    <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
    <path d={logo.person} fill={BLUE} fillRule="evenodd" />
  </svg>
);

/** Behind the scenes: sketch → palette → final designs. */
const Bts: React.FC<{ k: number; t: number; cx: number; cy: number; unit: number }> = ({ k, t, cx, cy, unit }) => {
  const p = ease(t, 0, 14, [0, 1], Easing.out(Easing.cubic));
  const out = ease(t, BTS_LEN - 10, BTS_LEN, [0, 1], Easing.in(Easing.cubic));
  const s = unit * 0.5;
  if (k === 0) {
    // Pencil sketch of the cup drawing itself on paper.
    const d = ease(t, 4, 44, [0, 1], Easing.inOut(Easing.quad));
    const stroke = { fill: 'none', stroke: '#3a2a20', strokeWidth: 2.2, strokeLinecap: 'round' as const, pathLength: 1, strokeDasharray: '1 1' };
    return (
      <div style={{ position: 'absolute', left: cx - s * 0.6, top: cy - s * 0.6, width: s * 1.2, height: s * 1.2, background: '#F4EFE6', borderRadius: 10, boxShadow: '0 30px 70px rgba(0,0,0,0.6)', opacity: p * (1 - out), transform: `rotate(${-3 + p * 3}deg)` }}>
        <svg width="100%" height="100%" viewBox="0 0 240 240">
          {[...Array(12)].map((_, i) => <line key={i} x1={0} x2={240} y1={20 + i * 20} y2={20 + i * 20} stroke="#d9cfc0" strokeWidth={0.8} />)}
          <g transform="translate(20 20)">
            <circle cx={100} cy={100} r={95} {...stroke} strokeDashoffset={1 - d} />
            <circle cx={100} cy={100} r={68} {...stroke} strokeDashoffset={1 - Math.max(0, d * 1.2 - 0.2)} />
            <circle cx={100} cy={100} r={55} {...stroke} strokeDashoffset={1 - Math.max(0, d * 1.4 - 0.4)} />
            <path d="M100 132 C 70 112, 64 88, 80 78 C 90 72, 100 78, 100 88 C 100 78, 110 72, 120 78 C 136 88, 130 112, 100 132 Z" {...stroke} strokeDashoffset={1 - Math.max(0, d * 1.6 - 0.6)} />
            <rect x={148} y={90} width={44} height={20} rx={10} {...stroke} strokeDashoffset={1 - Math.max(0, d * 1.6 - 0.6)} />
          </g>
        </svg>
      </div>
    );
  }
  if (k === 1) {
    const sw = [C.espresso, C.roast, C.coffee, C.caramel, C.crema, C.milk];
    const d = s * 0.2;
    return (
      <div style={{ position: 'absolute', left: cx - (sw.length * (d + 16)) / 2, top: cy - d / 2, display: 'flex', gap: 16, opacity: 1 - out }}>
        {sw.map((c, i) => {
          const pp = ease(t, i * 4, i * 4 + 12, [0, 1], Easing.out(Easing.back(1.8)));
          return <div key={c} style={{ width: d, height: d, borderRadius: '50%', background: c, border: '3px solid rgba(255,255,255,0.25)', transform: `scale(${pp}) translateY(${Math.sin((t + i * 6) / 8) * 6}px)`, boxShadow: '0 16px 30px rgba(0,0,0,0.5)' }} />;
        })}
      </div>
    );
  }
  const srcs = [CLIENT.designs.roasting, CLIENT.designs.opening, CLIENT.designs.oneDay];
  const w = s * 0.62;
  return (
    <div style={{ position: 'absolute', left: cx, top: cy, opacity: 1 - out }}>
      {srcs.map((src, i) => {
        const pp = ease(t, i * 6, i * 6 + 16, [0, 1], Easing.out(Easing.cubic));
        return (
          <Img
            key={src}
            src={staticFile(src)}
            style={{ position: 'absolute', left: -w / 2 + (i - 1) * w * 1.08 * pp, top: (-w * 1.25) / 2 + (1 - pp) * 160, width: w, height: w * 1.25, borderRadius: 10, opacity: pp, boxShadow: '0 24px 50px rgba(0,0,0,0.6)' }}
          />
        );
      })}
    </div>
  );
};

export const FirstStory: React.FC<{ lang: Lang }> = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lang: Lang = 'ar';
  const wide = width > height;
  const unit = Math.min(width, height);
  const fadeOut = interpolate(f, [FIRST_STORY_DURATION - 12, FIRST_STORY_DURATION - 1], [1, 0], clamp);
  const cx = width / 2;
  const cy = wide ? height * 0.44 : height * 0.42;
  const textY = wide ? height * 0.84 : height * 0.72;

  // "01" in halftone dots.
  const numIn = ease(f, 4, 20, [0, 1], Easing.out(Easing.cubic));
  const numOut = ease(f, NUMBER_OUT - 8, NUMBER_OUT + 6, [0, 1], Easing.in(Easing.cubic));
  const dot = interpolate(f, [4, 40], [2, 8], clamp);

  const markOut = ease(f, BTS[0] - 12, BTS[0], [0, 1], Easing.in(Easing.cubic));
  const markSize = unit * (wide ? 0.42 : 0.5);
  const bts = BTS.findIndex((b) => f >= b && f < b + BTS_LEN);

  // Duo with the runner crossing between the two marks.
  const duo = ease(f, DUO, DUO + 20, [0, 1], Easing.out(Easing.cubic));
  const duoOut = ease(f, LOGO - 10, LOGO, [0, 1], Easing.in(Easing.cubic));
  const duoSize = unit * (wide ? 0.28 : 0.32);
  const gap = unit * (wide ? 0.3 : 0.26);
  const run = ease(f, DUO + 20, DUO + 64, [0, 1], Easing.inOut(Easing.cubic));
  const runX = interpolate(run, [0, 1], [cx + gap / 2 + duoSize / 2, cx - gap / 2 - duoSize / 2]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/first-story.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={FIRST_STORY_DURATION} reveal={interpolate(f, [0, 30], [0.35, 1], clamp)} dots={interpolate(f, [DUO, DUO + 20], [0, 0.2], clamp)} />

        {f < NUMBER_OUT + 8 && (
          <div
            style={{
              position: 'absolute', left: 0, right: 0, top: cy, transform: `translateY(-52%) scale(${interpolate(numIn, [0, 1], [1.3, 1]) * (1 + numOut * 0.4)})`,
              textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: unit * 0.62, lineHeight: 1,
              color: 'transparent', backgroundImage: `radial-gradient(circle, ${C.caramel} ${dot}px, transparent ${dot + 1}px)`, backgroundSize: '22px 22px',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextStroke: `3px ${BLUE_LIGHT}`,
              opacity: numIn * (1 - numOut), filter: `blur(${numOut * 16}px)`,
            }}
          >
            01
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.every} highlight={COPY.everyHighlight} start={14} end={NUMBER_OUT} y={textY} size={Math.min(84, width * 0.075)} weight={900} />

        {f < BTS[0] && (
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - markOut }}>
            <CupDots f={f} start={ASSEMBLE} cx={cx} cy={cy} size={markSize} width={width} height={height} from={[cx, cy]} solidAt={SOLID} />
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.ours} highlight={COPY.oursHighlight} start={ASSEMBLE + 10} end={BTS[0] - 4} y={textY} size={Math.min(84, width * 0.075)} weight={900} />

        {bts >= 0 && <Bts k={bts} t={f - BTS[bts]} cx={cx} cy={cy} unit={unit} />}
        {BTS.map((b, k) => (
          <AnimatedLine key={k} f={f} lang={lang} text={COPY.bts[k]} start={b + 4} end={b + BTS_LEN - 2} y={wide ? height * 0.12 : height * 0.2} size={Math.min(64, width * 0.06)} weight={800} color={BLUE_LIGHT} />
        ))}
        <AnimatedLine f={f} lang={lang} text={COPY.firsts} start={BTS[2] + 18} end={DUO - 2} y={textY} size={Math.min(64, width * 0.06)} weight={900} />

        {f >= DUO && f < LOGO + 2 && (
          <AbsoluteFill style={{ opacity: duo * (1 - duoOut) }}>
            <div style={{ position: 'absolute', left: cx + gap / 2, top: cy - (duoSize * LH) / LW / 2 }}>
              <NeoLogo width={duoSize} />
            </div>
            <div style={{ position: 'absolute', left: cx - gap / 2 - duoSize, top: cy - duoSize / 2 - duoSize * 0.08, width: duoSize, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <CafeMark size={duoSize * 0.8} />
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: duoSize * 0.13, letterSpacing: '0.22em', color: C.milk }}>{CLIENT.wordmark}</div>
            </div>
            {run > 0 && run < 1 && [3, 2, 1].map((g) => (
              <div key={g} style={{ position: 'absolute', left: runX - 60 + g * 26, top: cy - 50, opacity: 0.15 * (4 - g) }}>
                <PersonSvg width={120} color={BLUE} />
              </div>
            ))}
            <div style={{ position: 'absolute', left: runX - 60, top: cy - 50 - Math.sin(run * Math.PI) * 60, opacity: run > 0 && run < 1 ? 1 : 0, transform: 'scaleX(-1)', filter: 'drop-shadow(0 0 18px rgba(90,110,255,0.95))' }}>
              <PersonSvg width={120} />
            </div>
          </AbsoluteFill>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.thanks} highlight={COPY.thanksHighlight} start={DUO + 28} end={LOGO - 2} y={textY} size={Math.min(72, width * 0.065)} weight={900} />

        <BrandEndCard
          f={f}
          start={LOGO}
          lang={lang}
          services={COPY.services}
          tagline={COPY.next}
          highlight={COPY.nextHighlight}
          taglineAt={40}
          cy={wide ? 400 : 820}
          width={wide ? 680 : 840}
        />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
