import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import logo from './logo.json';
import { AnimatedLine, BLUE, BLUE_LIGHT, Backdrop, FPS, LH, LW, Vignette, WHITE, clamp, ease, fontFor } from './shared';

// Reusable vertical (1080×1920) templates for Neo Capta's own channels.
// Each takes its content as props: render with --props=templates/<file>.json (see render-templates.mjs).

const NeoMark: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={(LH / LW) * width} viewBox={`0 0 ${LW} ${LH}`}>
    <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
    <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
    <path d={logo.person} fill={BLUE} fillRule="evenodd" />
  </svg>
);

/** Small sign-off in the lower part of the frame. */
const SignOff: React.FC<{ f: number; at: number; line?: string }> = ({ f, at, line = 'تابع Neo Capta للمزيد' }) => {
  const p = ease(f, at, at + 18, [0, 1], Easing.out(Easing.cubic));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
      <NeoMark width={260} />
      <div dir="rtl" style={{ fontFamily: fontFor('ar'), fontWeight: 700, fontSize: 36, color: 'rgba(232,233,238,0.8)' }}>{line}</div>
    </div>
  );
};

const Media: React.FC<{ src: string; from: number; style: React.CSSProperties }> = ({ src, from, style }) =>
  /\.(mp4|webm|mov)$/i.test(src) ? (
    <Sequence from={from} layout="none">
      <OffthreadVideo src={staticFile(src)} muted style={style} />
    </Sequence>
  ) : (
    <Img src={staticFile(src)} style={style} />
  );

const Phone: React.FC<{ src: string; w: number; from: number }> = ({ src, w, from }) => {
  const pad = w * 0.045;
  return (
    <div style={{ width: w, height: (w - pad * 2) * (16 / 9) + pad * 2, padding: pad, borderRadius: w * 0.14, background: '#0c0f22', border: '3px solid rgba(232,233,238,0.35)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: w * 0.1, overflow: 'hidden', background: '#000' }}>
        <Media src={src} from={from} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------- marketing tip */

export const TIP_DURATION = 10 * FPS;
export type TipProps = { n: number; title: string; lines: string[] };

export const Tip: React.FC<TipProps> = ({ n, title, lines }) => {
  const f = useCurrentFrame();
  const fadeOut = interpolate(f, [TIP_DURATION - 10, TIP_DURATION - 1], [1, 0], clamp);
  const badge = ease(f, 6, 20, [0, 1], Easing.out(Easing.back(1.6)));
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/tpl-tip.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={TIP_DURATION} reveal={1} dots={0.18} />
        <div dir="rtl" style={{ position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: '10px 34px', borderRadius: 99, background: BLUE, color: WHITE, fontFamily: fontFor('ar'), fontWeight: 800, fontSize: 40, transform: `scale(${badge})` }}>
            نصيحة #{n}
          </div>
        </div>
        <AnimatedLine f={f} lang="ar" text={title} start={18} y={560} size={98} weight={900} />
        <div dir="rtl" style={{ position: 'absolute', top: 820, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 46 }}>
          {lines.map((l, i) => {
            const p = ease(f, 80 + i * 32, 98 + i * 32, [0, 1], Easing.out(Easing.cubic));
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 26, opacity: p, transform: `translateX(${(1 - p) * -60}px)` }}>
                <div style={{ flex: 'none', width: 64, height: 64, borderRadius: '50%', background: BLUE_LIGHT, display: 'grid', placeItems: 'center', marginTop: 6 }}>
                  <svg width={34} height={34} viewBox="0 0 24 24"><path d="M5 12l5 5L19 7" fill="none" stroke={WHITE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div style={{ fontFamily: fontFor('ar'), fontWeight: 700, fontSize: 56, lineHeight: 1.35, color: WHITE }}>{l}</div>
              </div>
            );
          })}
        </div>
        <SignOff f={f} at={200} />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- before / after */

export const BA_DURATION = 12 * FPS;
export type BeforeAfterProps = { title: string; before: string; after: string; caption: string; captionHighlight?: string };

export const BeforeAfterTpl: React.FC<BeforeAfterProps> = ({ title, before, after, caption, captionHighlight }) => {
  const f = useCurrentFrame();
  const fadeOut = interpolate(f, [BA_DURATION - 10, BA_DURATION - 1], [1, 0], clamp);
  const cardIn = ease(f, 4, 24, [0, 1], Easing.out(Easing.cubic));
  const p = interpolate(f, [70, 100, 116, 150], [0, 0.55, 0.42, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const w = 720;
  const h = w * (16 / 9);
  const top = 280;
  const pill = (label: string, on: boolean, y: number, show: number) => (
    <div dir="rtl" style={{ position: 'absolute', top: y, right: 24, padding: '8px 26px', borderRadius: 30, background: on ? BLUE_LIGHT : 'rgba(0,0,0,0.6)', color: WHITE, fontFamily: fontFor('ar'), fontWeight: 800, fontSize: 34, opacity: show }}>{label}</div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/tpl-before-after.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={BA_DURATION} reveal={1} dots={0.15} />
        <AnimatedLine f={f} lang="ar" text={title} start={6} y={190} size={76} weight={900} />
        <div style={{ position: 'absolute', left: (1080 - w) / 2, top: top + (1 - cardIn) * 80, width: w, height: h, borderRadius: 26, overflow: 'hidden', opacity: cardIn, boxShadow: `0 0 ${60 * p}px rgba(90,110,255,${0.6 * p})` }}>
          <Img src={staticFile(before)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.4)' }} />
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 ${(1 - p) * 100}% 0)` }}>
            <Img src={staticFile(after)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {pill('قبل', false, h - 80, p < 0.98 ? 1 : 0)}
          {pill('بعد', true, 24, p > 0.05 ? 1 : 0)}
          {p > 0.001 && p < 0.999 && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, top: h * p - 3, height: 6, background: WHITE, boxShadow: `0 0 24px ${BLUE_LIGHT}` }} />
              <div style={{ position: 'absolute', left: w / 2 - 40, top: h * p - 40, width: 80, height: 80, borderRadius: '50%', background: WHITE, display: 'grid', placeItems: 'center' }}>
                <svg width={36} height={46} viewBox="0 0 44 56"><path d="M22 4 L36 20 H8 Z M22 52 L36 36 H8 Z" fill={BLUE} /></svg>
              </div>
            </>
          )}
        </div>
        <AnimatedLine f={f} lang="ar" text={caption} highlight={captionHighlight} start={156} y={top + h + 80} size={64} weight={900} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 36, display: 'flex', justifyContent: 'center', opacity: ease(f, 200, 220) }}>
          <NeoMark width={150} />
        </div>
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- ad breakdown */

export const BREAKDOWN_DURATION = 15 * FPS;
export type BreakdownProps = { title: string; media: string; points: string[]; verdict: string; verdictHighlight?: string };

export const AdBreakdown: React.FC<BreakdownProps> = ({ title, media, points, verdict, verdictHighlight }) => {
  const f = useCurrentFrame();
  const fadeOut = interpolate(f, [BREAKDOWN_DURATION - 10, BREAKDOWN_DURATION - 1], [1, 0], clamp);
  const phone = ease(f, 10, 34, [0, 1], Easing.out(Easing.cubic));
  const phoneW = 430;
  const at = [90, 160, 230];
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/tpl-breakdown.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={BREAKDOWN_DURATION} reveal={1} dots={0.15} />
        <AnimatedLine f={f} lang="ar" text="تشريح إعلان" start={2} y={150} size={44} weight={800} color={BLUE_LIGHT} />
        <AnimatedLine f={f} lang="ar" text={title} start={10} y={250} size={70} weight={900} />
        <div style={{ position: 'absolute', left: 70, top: 380 + (1 - phone) * 100, opacity: phone }}>
          <Phone src={media} w={phoneW} from={10} />
        </div>
        <div dir="rtl" style={{ position: 'absolute', right: 60, width: 1080 - 70 - phoneW - 60 - 40, top: 420, display: 'flex', flexDirection: 'column', gap: 54 }}>
          {points.map((pt, i) => {
            const p = ease(f, at[i], at[i] + 18, [0, 1], Easing.out(Easing.cubic));
            return (
              <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 74, lineHeight: 1, color: 'transparent', WebkitTextStroke: `2.5px ${BLUE_LIGHT}` }}>0{i + 1}</div>
                <div style={{ fontFamily: fontFor('ar'), fontWeight: 700, fontSize: 40, lineHeight: 1.4, color: WHITE, marginTop: 8 }}>{pt}</div>
              </div>
            );
          })}
        </div>
        {f >= 300 && (
          <div dir="rtl" style={{ position: 'absolute', left: 70, right: 70, top: 1250, padding: '34px 40px', borderRadius: 26, background: 'rgba(59,76,192,0.22)', border: `2px solid ${BLUE_LIGHT}`, opacity: ease(f, 300, 318) }}>
            <div style={{ fontFamily: fontFor('ar'), fontWeight: 800, fontSize: 36, color: BLUE_LIGHT, marginBottom: 6 }}>الخلاصة</div>
            <div style={{ fontFamily: fontFor('ar'), fontWeight: 900, fontSize: 60, lineHeight: 1.3, color: WHITE }}>
              {verdictHighlight && verdict.includes(verdictHighlight) ? (
                <>
                  {verdict.split(verdictHighlight)[0]}
                  <span style={{ color: BLUE_LIGHT }}>{verdictHighlight}</span>
                  {verdict.split(verdictHighlight)[1]}
                </>
              ) : verdict}
            </div>
          </div>
        )}
        <SignOff f={f} at={360} />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- client pitch */
// Same timing as Pitch.tsx, so it shares audio/pitch.wav.

export const PITCH_TPL_DURATION = 20 * FPS;
export type PitchTplProps = { clientName: string; logo: string; designs: string[] };

export const PitchTemplate: React.FC<PitchTplProps> = ({ clientName, logo: clientLogo, designs }) => {
  const f = useCurrentFrame();
  const fadeOut = interpolate(f, [PITCH_TPL_DURATION - 12, PITCH_TPL_DURATION - 1], [1, 0], clamp);
  const beats = [180, 260, 340];
  const beat = beats.findIndex((b) => f >= b && f < b + 80);
  // Logo arrives through a halftone screen: dots grow until they merge.
  const dot = interpolate(f, [12, 88], [0, 26], { ...clamp, easing: Easing.in(Easing.quad) });
  const logoOut = ease(f, 164, 180, [0, 1], Easing.in(Easing.cubic));
  const mask = `radial-gradient(circle, #000 ${dot}px, transparent ${dot + 1}px)`;
  const d = (i: number) => designs[i % designs.length];
  const scene = (t: number) => Math.min(ease(t, 0, 14), 1 - ease(t, 70, 80));
  const duo = ease(f, 500, 522, [0, 1], Easing.out(Easing.cubic));

  let mock: React.ReactNode = null;
  if (beat === 0) {
    mock = <div style={{ position: 'absolute', left: 540 - 270, top: 560, opacity: scene(f - 180) }}><Phone src={d(0)} w={540} from={180} /></div>;
  } else if (beat === 1) {
    const t = f - 260;
    mock = (
      <div style={{ position: 'absolute', left: 540, top: 1000, opacity: scene(t) }}>
        {[0, 1, 2].map((i) => {
          const p = ease(t, i * 4, i * 4 + 16, [0, 1], Easing.out(Easing.cubic));
          const w = 380;
          return <Media key={i} src={d(i)} from={260} style={{ position: 'absolute', objectFit: 'cover', width: w, height: (w * 16) / 9, left: -w / 2 + (i - 1) * w * 0.7 * p, top: (-w * 16) / 9 / 2 + Math.abs(i - 1) * 40, transform: `rotate(${(i - 1) * 10 * p}deg)`, borderRadius: 16, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', zIndex: i === 1 ? 2 : 1 }} />;
        })}
      </div>
    );
  } else if (beat === 2) {
    mock = <div style={{ position: 'absolute', left: 540 - 270, top: 560, opacity: scene(f - 340) }}><Phone src={d(designs.length - 1)} w={540} from={340} /></div>;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/pitch.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={PITCH_TPL_DURATION} reveal={interpolate(f, [0, 30], [0.3, 1], clamp)} dots={0.15} />
        {f < 182 && (
          <div style={{ position: 'absolute', left: 140, right: 140, top: 560, height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - logoOut, WebkitMaskImage: f < 92 ? mask : undefined, maskImage: f < 92 ? mask : undefined, WebkitMaskSize: '30px 30px', maskSize: '30px 30px' }}>
            <Img src={staticFile(clientLogo)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
        )}
        <AnimatedLine f={f} lang="ar" text="قبل ما نلتقي…" start={36} end={96} y={1360} size={84} weight={800} />
        <AnimatedLine f={f} lang="ar" text={`جرّبنا نتخيّل ${clientName}… بعيوننا.`} highlight="بعيوننا." start={102} end={176} y={1360} size={72} weight={900} />
        {mock}
        {['منشور.', 'حملة.', 'قصة.'].map((w, k) => (
          <AnimatedLine key={w} f={f} lang="ar" text={w} start={beats[k] + 6} end={beats[k] + 78} y={330} size={170} weight={900} color={k === 2 ? BLUE_LIGHT : WHITE} />
        ))}
        {f >= 420 && f < 502 && (
          <AbsoluteFill style={{ opacity: Math.min(ease(f, 420, 440), 1 - ease(f, 490, 500)) }}>
            {designs.slice(0, 4).map((src, i, arr) => {
              const w = 220;
              const total = arr.length * w + (arr.length - 1) * 24;
              return <Media key={src + i} src={src} from={420} style={{ position: 'absolute', objectFit: 'cover', width: w, height: (w * 16) / 9, left: 540 + total / 2 - w - i * (w + 24), top: 760, borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }} />;
            })}
          </AbsoluteFill>
        )}
        <AnimatedLine f={f} lang="ar" text="هذي مجرد البداية." start={428} end={498} y={520} size={92} weight={900} />
        {f >= 500 && (
          <AbsoluteFill style={{ opacity: duo, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50, paddingBottom: 300 }}>
            <Img src={staticFile(clientLogo)} style={{ maxWidth: 640, maxHeight: 300, objectFit: 'contain' }} />
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, fontSize: 110, color: BLUE_LIGHT, lineHeight: 1 }}>×</div>
            <NeoMark width={520} />
          </AbsoluteFill>
        )}
        <AnimatedLine f={f} lang="ar" text="خلّنا نكمّلها مع بعض." highlight="مع بعض." start={524} y={1560} size={84} weight={900} />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
