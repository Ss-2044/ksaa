import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import logo from './logo.json';
import { CafeMark, CLIENT } from './client';
import { Lang } from './copy';
import { CupDots } from './CupDots';
import { AnimatedLine, BLUE, BLUE_LIGHT, Backdrop, FPS, LH, LW, Vignette, WHITE, clamp, ease, fontFor } from './shared';

// «تخيّلناها قبل ما نلتقي» — a pitch video made for one prospective client.
// Arabic. Works at 16:9 and 9:16. Cues mirrored in music/compose.py score_pitch.
export const PITCH_DURATION = 20 * FPS;
const ASSEMBLE = 12;
const SOLID = 92;
const BEATS = [180, 260, 340];
const BEAT_LEN = 80;
const GRID = 420;
const DUO = 500;

const COPY = {
  before: 'قبل ما نلتقي…',
  imagined: 'جرّبنا نتخيّل علامتكم… بعيوننا.',
  imaginedHighlight: 'بعيوننا.',
  words: ['منشور.', 'حملة.', 'قصة.'],
  start: 'هذي مجرد البداية.',
  together: 'خلّنا نكمّلها مع بعض.',
  togetherHighlight: 'مع بعض.',
};

const Phone: React.FC<{ src: string; w: number; ratio: number }> = ({ src, w, ratio }) => {
  const pad = w * 0.045;
  const h = (w - pad * 2) * ratio + pad * 2;
  return (
    <div style={{ width: w, height: h, padding: pad, borderRadius: w * 0.14, background: '#0c0f22', border: '3px solid rgba(232,233,238,0.35)', boxShadow: '0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(59,76,192,0.3)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: w * 0.1, overflow: 'hidden' }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

const Poster: React.FC<{ src: string; w: number }> = ({ src, w }) => (
  <Img src={staticFile(src)} style={{ width: w, height: w * 1.25, borderRadius: 14, boxShadow: '0 30px 70px rgba(0,0,0,0.6)' }} />
);

const NeoLogo: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={(LH / LW) * width} viewBox={`0 0 ${LW} ${LH}`}>
    <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
    <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
    <path d={logo.person} fill={BLUE} fillRule="evenodd" />
  </svg>
);

export const Pitch: React.FC<{ lang: Lang }> = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lang: Lang = 'ar';
  const wide = width > height;
  const fadeOut = interpolate(f, [PITCH_DURATION - 12, PITCH_DURATION - 1], [1, 0], clamp);
  const unit = Math.min(width, height);

  // Cup mark: assembles centre stage, then moves aside for the mock-ups.
  const markOut = ease(f, BEATS[0] - 16, BEATS[0], [0, 1], Easing.in(Easing.cubic));
  const markSize = unit * (wide ? 0.42 : 0.5);
  const markCy = wide ? height * 0.42 : height * 0.42;
  const textY = wide ? height * 0.82 : height * 0.75;

  // Mock-up beats.
  const beat = BEATS.findIndex((b) => f >= b && f < b + BEAT_LEN);
  const visualCx = wide ? width * 0.36 : width / 2;
  const visualCy = wide ? height * 0.52 : height * 0.58;
  const wordX = wide ? width * 0.52 : 0;
  const wordW = wide ? width * 0.44 : width;
  const wordY = wide ? height * 0.5 : height * 0.17;

  const mockup = (k: number, t: number) => {
    const p = ease(t, 0, 16, [0, 1], Easing.out(Easing.cubic));
    const out = ease(t, BEAT_LEN - 10, BEAT_LEN, [0, 1], Easing.in(Easing.cubic));
    const style: React.CSSProperties = { position: 'absolute', opacity: p * (1 - out) };
    if (k === 0) {
      const w = unit * (wide ? 0.4 : 0.62);
      const h = w * 1.25 * 1.0 + w * 0.09;
      return (
        <div style={{ ...style, left: visualCx - w / 2, top: visualCy - h / 2, transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * -6}deg)` }}>
          <Phone src={CLIENT.designs.opening} w={w} ratio={1.25} />
        </div>
      );
    }
    if (k === 1) {
      const w = unit * (wide ? 0.3 : 0.42);
      const srcs = [CLIENT.designs.roasting, CLIENT.designs.threeDays, CLIENT.designs.oneDay];
      return (
        <div style={{ ...style, left: visualCx, top: visualCy }}>
          {srcs.map((src, i) => {
            const a = (i - 1) * 14 * p;
            const dx = (i - 1) * w * 0.62 * p;
            return (
              <div key={src} style={{ position: 'absolute', left: -w / 2 + dx, top: (-w * 1.25) / 2 + Math.abs(i - 1) * 30, transform: `rotate(${a}deg)`, zIndex: i === 1 ? 2 : 1 }}>
                <Poster src={src} w={w} />
              </div>
            );
          })}
        </div>
      );
    }
    const w = unit * (wide ? 0.3 : 0.44);
    const h = w * (16 / 9) + w * 0.09;
    return (
      <div style={{ ...style, left: visualCx - w / 2, top: visualCy - h / 2, transform: `scale(${0.85 + 0.15 * p})` }}>
        <Phone src={CLIENT.designs.story} w={w} ratio={16 / 9} />
      </div>
    );
  };

  // Grid of everything.
  const gridIn = ease(f, GRID, GRID + 20, [0, 1], Easing.out(Easing.cubic));
  const gridOut = ease(f, DUO - 10, DUO, [0, 1], Easing.in(Easing.cubic));
  const all = [CLIENT.designs.roasting, CLIENT.designs.threeDays, CLIENT.designs.oneDay, CLIENT.designs.opening, CLIENT.designs.story];

  // Duo: client × Neo Capta.
  const duo = ease(f, DUO, DUO + 22, [0, 1], Easing.out(Easing.cubic));
  const duoSize = unit * (wide ? 0.3 : 0.36);
  const duoGap = unit * (wide ? 0.28 : 0.24);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/pitch.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={PITCH_DURATION} reveal={interpolate(f, [0, 30], [0.3, 1], clamp)} dots={interpolate(f, [BEATS[0], BEATS[0] + 20], [0, 0.18], clamp)} />

        {f < BEATS[0] && (
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - markOut, transform: `scale(${1 - markOut * 0.2})` }}>
            <CupDots f={f} start={ASSEMBLE} cx={width / 2} cy={markCy} size={markSize} width={width} height={height} solidAt={SOLID} />
            <div
              style={{
                position: 'absolute', left: 0, right: 0, top: markCy + markSize / 2 + unit * 0.05, textAlign: 'center',
                fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: unit * 0.07, letterSpacing: '0.22em', color: CLIENT.colors.milk,
                opacity: ease(f, SOLID + 6, SOLID + 24),
              }}
            >
              {CLIENT.wordmark}
            </div>
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.before} start={36} end={SOLID + 4} y={textY} size={Math.min(84, width * 0.075)} weight={800} />
        <AnimatedLine f={f} lang={lang} text={COPY.imagined} highlight={COPY.imaginedHighlight} start={SOLID + 10} end={BEATS[0] - 4} y={textY} size={Math.min(76, width * 0.07)} weight={900} />

        {beat >= 0 && mockup(beat, f - BEATS[beat])}
        {beat >= 0 && (
          <div style={{ position: 'absolute', left: wordX, width: wordW, top: 0, bottom: 0 }}>
            {COPY.words.map((w, k) => (
              <AnimatedLine key={k} f={f} lang={lang} text={w} start={BEATS[k] + 6} end={BEATS[k] + BEAT_LEN - 2} y={wordY} size={Math.min(wide ? 190 : 170, wordW * 0.3)} weight={900} color={k === 2 ? BLUE_LIGHT : WHITE} />
            ))}
          </div>
        )}

        {f >= GRID && f < DUO + 2 && (
          <AbsoluteFill style={{ opacity: gridIn * (1 - gridOut) }}>
            {all.map((src, i) => {
              const n = all.length;
              const w = wide ? width * 0.15 : width * 0.17;
              const gap = w * 0.14;
              const total = n * w + (n - 1) * gap;
              const x = width / 2 + total / 2 - w - i * (w + gap);
              const isStory = src === CLIENT.designs.story;
              const h = isStory ? w * (16 / 9) : w * 1.25;
              return (
                <Img
                  key={src}
                  src={staticFile(src)}
                  style={{
                    position: 'absolute', left: x, top: visualCy - h / 2 + (1 - gridIn) * 80 * (i % 2 ? 1 : -1), width: w, height: h,
                    borderRadius: 10, objectFit: 'cover', boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  }}
                />
              );
            })}
          </AbsoluteFill>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.start} start={GRID + 14} end={DUO - 2} y={wide ? height * 0.16 : height * 0.25} size={Math.min(96, width * 0.08)} weight={900} />

        {f >= DUO && (
          <AbsoluteFill style={{ opacity: duo }}>
            <div style={{ position: 'absolute', left: width / 2 + duoGap / 2 + (1 - duo) * 120, top: height * 0.42 - duoSize / 2, width: duoSize, display: 'flex', justifyContent: 'center' }}>
              <div style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>
                <NeoLogo width={duoSize} />
              </div>
            </div>
            <div style={{ position: 'absolute', left: width / 2 - 30, width: 60, top: height * 0.42 - 60, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, fontSize: 90, color: BLUE_LIGHT }}>
              ×
            </div>
            <div style={{ position: 'absolute', left: width / 2 - duoGap / 2 - duoSize - (1 - duo) * 120, top: height * 0.42 - duoSize / 2 - duoSize * 0.1, width: duoSize, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <CafeMark size={duoSize * 0.78} />
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: duoSize * 0.14, letterSpacing: '0.22em', color: CLIENT.colors.milk }}>{CLIENT.wordmark}</div>
            </div>
          </AbsoluteFill>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.together} highlight={COPY.togetherHighlight} start={DUO + 24} y={wide ? height * 0.8 : height * 0.68} size={Math.min(92, width * 0.08)} weight={900} />
        <div
          dir="rtl"
          style={{
            position: 'absolute', left: 0, right: 0, top: wide ? height * 0.9 : height * 0.75, textAlign: 'center',
            fontFamily: fontFor(lang), fontWeight: 700, fontSize: Math.min(34, width * 0.035), color: 'rgba(232,233,238,0.7)',
            opacity: ease(f, DUO + 50, DUO + 70),
          }}
        >
          تسويق  •  إعلان  •  محتوى
        </div>
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
