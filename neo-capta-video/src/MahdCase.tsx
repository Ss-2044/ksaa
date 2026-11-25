import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import logo from './logo.json';
import { Lang } from './copy';
import { MAHD, MahdDots, MahdLogo, MahdStorefront } from './mahd';
import { AnimatedLine, BLUE, BLUE_LIGHT, Backdrop, BrandEndCard, FPS, LH, LW, PersonSvg, Vignette, WHITE, clamp, ease, fontFor } from './shared';

// Case-study reel: Mahd's opening campaign, told the way a portfolio piece is.
// Arabic. Works at 16:9 and 9:16. Cues mirrored in music/compose.py score_mahd_case.
export const MAHD_CASE_DURATION = 30 * FPS;
const TITLE = [0, 90] as const;
const BRIEF = [90, 180] as const;
const IDEA = [180, 300] as const;
const INVITES = [300, 380] as const;
const AD = [380, 460] as const;
const STORIES = [460, 540] as const;
const PLAN = [540, 660] as const;
const IDENT = [660, 760] as const;
const DUO = [760, 820] as const;
const END = 820;

const scene = (f: number, [a, b]: readonly [number, number], fadeIn = 12, fadeOut = 10) =>
  f < a || f > b ? 0 : Math.min(ease(f, a, a + fadeIn), 1 - ease(f, b - fadeOut, b));

const NeoLogo: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={(LH / LW) * width} viewBox={`0 0 ${LW} ${LH}`}>
    <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
    <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
    <path d={logo.person} fill={BLUE} fillRule="evenodd" />
  </svg>
);

/** A phone playing one of the delivered clips. */
const PhoneClip: React.FC<{ src: string; w: number; from: number; startFrom?: number }> = ({ src, w, from, startFrom = 0 }) => {
  const pad = w * 0.045;
  const h = (w - pad * 2) * (16 / 9) + pad * 2;
  return (
    <div style={{ width: w, height: h, padding: pad, borderRadius: w * 0.14, background: '#0c0f22', border: '3px solid rgba(232,233,238,0.35)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: w * 0.1, overflow: 'hidden', background: MAHD.outer }}>
        <Sequence from={from} layout="none">
          <OffthreadVideo src={staticFile(src)} muted startFrom={startFrom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Sequence>
      </div>
    </div>
  );
};

/** Section label in the corner: what part of the case this is. */
const Label: React.FC<{ f: number; range: readonly [number, number]; text: string; wide: boolean; height: number }> = ({ f, range, text, wide, height }) => {
  const o = scene(f, range, 10, 8);
  if (o <= 0) return null;
  return (
    <div dir="rtl" style={{ position: 'absolute', top: wide ? 70 : height * 0.08, right: wide ? 110 : 0, left: wide ? undefined : 0, textAlign: 'center', opacity: o, fontFamily: fontFor('ar'), fontWeight: 800, fontSize: wide ? 40 : 48, color: BLUE_LIGHT }}>
      {text}
    </div>
  );
};

export const MahdCase: React.FC<{ lang: Lang }> = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lang: Lang = 'ar';
  const wide = width > height;
  const unit = Math.min(width, height);
  const cx = width / 2;
  const cy = wide ? height * 0.48 : height * 0.44;
  const textY = wide ? height * 0.84 : height * 0.74;
  const fadeOut = interpolate(f, [MAHD_CASE_DURATION - 12, MAHD_CASE_DURATION - 1], [1, 0], clamp);
  const lineSize = (ar: number) => Math.min(ar, width * 0.075);

  // Invitations fan out.
  const inv = scene(f, INVITES);
  const invW = wide ? 300 : 320;
  // Ad and stories.
  const ad = scene(f, AD);
  const stories = scene(f, STORIES);
  const storyW = wide ? 250 : 230;
  // Schedule.
  const plan = scene(f, PLAN);
  const days = [
    { d: '28 نوفمبر', t: 'باقي 3 أيام' },
    { d: '29 نوفمبر', t: 'باقي يومين' },
    { d: '30 نوفمبر', t: 'باقي يوم' },
    { d: '1 ديسمبر', t: 'الافتتاح' },
  ];
  const trackW = wide ? 1400 : 880;
  const trackP = ease(f, PLAN[0] + 10, PLAN[0] + 80, [0, 1], Easing.inOut(Easing.cubic));
  // Identity.
  const ident = scene(f, IDENT);
  const sw = [
    { c: MAHD.green, n: 'زيتي' },
    { c: MAHD.cream, n: 'كريمي' },
    { c: MAHD.tile, n: 'تيراكوتا' },
    { c: MAHD.gold, n: 'نحاسي' },
  ];
  const duo = scene(f, DUO, 14, 8);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/mahd-case.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={MAHD_CASE_DURATION} reveal={interpolate(f, [0, 30], [0.35, 1], clamp)} dots={0.16} />

        {/* Title */}
        <AnimatedLine f={f} lang={lang} text="دراسة حالة" start={6} end={TITLE[1]} y={wide ? height * 0.22 : height * 0.26} size={wide ? 46 : 52} weight={800} color={BLUE_LIGHT} />
        {f < TITLE[1] + 2 && (
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - ease(f, TITLE[1] - 10, TITLE[1]) }}>
            <MahdDots f={f} start={8} solidAt={56} cx={cx} cy={cy} width={wide ? 760 : 820} color={MAHD.cream} seedW={width} seedH={height} />
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text="حملة افتتاح كافيه محض" start={30} end={TITLE[1]} y={textY} size={lineSize(84)} weight={900} />

        {/* Brief */}
        <Label f={f} range={BRIEF} text="المطلوب" wide={wide} height={height} />
        <AnimatedLine f={f} lang={lang} text="كافيه جديد في الرياض." start={BRIEF[0] + 6} end={BRIEF[1]} y={cy - 70} size={lineSize(96)} weight={900} />
        <AnimatedLine f={f} lang={lang} text="وافتتاح لازم يُتذكّر." highlight="يُتذكّر." start={BRIEF[0] + 26} end={BRIEF[1]} y={cy + 70} size={lineSize(96)} weight={900} />

        {/* Idea */}
        <Label f={f} range={IDEA} text="الفكرة" wide={wide} height={height} />
        {f >= IDEA[0] && f <= IDEA[1] && (
          <div style={{ position: 'absolute', left: cx - (wide ? 520 : 460), top: wide ? height * 0.2 : height * 0.2, opacity: scene(f, IDEA) }}>
            <MahdStorefront width={wide ? 1040 : 920} color={MAHD.cream} draw={ease(f, IDEA[0] + 4, IDEA[0] + 60, [0, 1], Easing.inOut(Easing.quad))} fill={ease(f, IDEA[0] + 56, IDEA[0] + 74)} />
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text="ليست محض صدفة.." start={IDEA[0] + 20} end={IDEA[1]} y={wide ? height * 0.66 : height * 0.5} size={lineSize(92)} weight={900} />
        <AnimatedLine f={f} lang={lang} text="بل عمل متكامل" start={IDEA[0] + 40} end={IDEA[1]} y={wide ? height * 0.78 : height * 0.58} size={lineSize(92)} weight={900} color={MAHD.tile} />
        <AnimatedLine f={f} lang={lang} text="قلبنا معنى الاسم… وصار هو الرسالة." start={IDEA[0] + 62} end={IDEA[1]} y={wide ? height * 0.9 : height * 0.68} size={lineSize(46)} weight={600} color="rgba(232,233,238,0.8)" />

        {/* Deliverables: invitations */}
        <Label f={f} range={[INVITES[0], STORIES[1]]} text="اللي سلّمناه" wide={wide} height={height} />
        {inv > 0 && (
          <div style={{ position: 'absolute', left: cx, top: cy - 20, opacity: inv }}>
            {['mahd/source-storefront.jpg', 'mahd/source-counter.jpg', 'mahd/source-flat.jpg'].map((src, i) => {
              const p = ease(f, INVITES[0] + i * 5, INVITES[0] + i * 5 + 18, [0, 1], Easing.out(Easing.cubic));
              return (
                <Img key={src} src={staticFile(src)} style={{
                  position: 'absolute', width: invW, height: (invW * 16) / 9, left: -invW / 2 + (i - 1) * invW * 0.95 * p, top: (-invW * 16) / 9 / 2 + Math.abs(i - 1) * 30,
                  transform: `rotate(${(i - 1) * 7 * p}deg)`, borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.6)', zIndex: i === 1 ? 2 : 1,
                }} />
              );
            })}
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text="3 دعوات مرسومة" start={INVITES[0] + 14} end={INVITES[1]} y={textY + (wide ? 40 : 60)} size={lineSize(72)} weight={900} />

        {/* Deliverables: the ad */}
        {ad > 0 && (
          <div style={{ position: 'absolute', left: cx - (wide ? 190 : 230), top: cy - (wide ? 190 : 230) * 2 * 0.95, opacity: ad, transform: `scale(${0.9 + 0.1 * ad})` }}>
            <PhoneClip src="mahd/clips/mahd-opening-ad.mp4" w={wide ? 380 : 460} from={AD[0]} startFrom={60} />
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text="إعلان افتتاح · 20 ثانية" start={AD[0] + 14} end={AD[1]} y={textY + (wide ? 40 : 120)} size={lineSize(64)} weight={900} />

        {/* Deliverables: stories */}
        {stories > 0 && (
          <div style={{ position: 'absolute', left: wide ? 0 : cx - 330, right: wide ? 0 : undefined, width: wide ? undefined : 660, top: wide ? cy - (storyW * 16) / 9 / 2 - 20 : cy - 560, display: 'flex', justifyContent: 'center', gap: wide ? 40 : 30, flexWrap: wide ? 'nowrap' : 'wrap', direction: 'rtl', opacity: stories }}>
            {['mahd-teaser-3-days', 'mahd-teaser-2-days', 'mahd-teaser-1-day', 'mahd-today'].map((n, i) => (
              <div key={n} style={{ transform: `translateY(${(1 - ease(f, STORIES[0] + i * 5, STORIES[0] + i * 5 + 16)) * 80}px)` }}>
                <PhoneClip src={`mahd/clips/${n}.mp4`} w={wide ? storyW : 300} from={STORIES[0]} startFrom={90} />
              </div>
            ))}
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text="4 ستوريات عدّ تنازلي" start={STORIES[0] + 14} end={STORIES[1]} y={wide ? height * 0.9 : height * 0.9} size={lineSize(64)} weight={900} />

        {/* Schedule */}
        <Label f={f} range={PLAN} text="جدول النشر" wide={wide} height={height} />
        {plan > 0 && (
          <div style={{ position: 'absolute', left: cx - trackW / 2, top: cy - 20, width: trackW, opacity: plan }}>
            <div style={{ position: 'absolute', right: 0, top: 0, width: trackW * trackP, height: 6, borderRadius: 3, background: `linear-gradient(270deg, ${BLUE}, ${BLUE_LIGHT})`, boxShadow: `0 0 16px ${BLUE_LIGHT}` }} />
            {days.map((d, i) => {
              const x = trackW - (i / 3) * trackW; // right-to-left
              const reached = trackP >= i / 3 - 0.001;
              const last = i === 3;
              return (
                <div key={d.d} dir="rtl" style={{ position: 'absolute', left: x, top: 3, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: last ? 44 : 30, height: last ? 44 : 30, borderRadius: '50%', background: reached ? (last ? MAHD.tile : BLUE_LIGHT) : '#0a1033', border: `4px solid ${reached ? WHITE : 'rgba(232,233,238,0.3)'}`, marginTop: last ? -7 : 0 }} />
                  <div style={{ position: 'absolute', top: 60, whiteSpace: 'nowrap', textAlign: 'center', fontFamily: fontFor('ar'), opacity: reached ? 1 : 0.35 }}>
                    <div style={{ fontWeight: 900, fontSize: wide ? 40 : 34, color: last ? MAHD.tile : WHITE }}>{d.d}</div>
                    <div style={{ fontWeight: 600, fontSize: wide ? 28 : 24, color: 'rgba(232,233,238,0.75)' }}>{d.t}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ position: 'absolute', left: trackW * (1 - trackP) - 45, top: -95, opacity: trackP < 1 ? 1 : 0, transform: 'scaleX(-1)', filter: 'drop-shadow(0 0 14px rgba(90,110,255,0.9))' }}>
              <PersonSvg width={90} />
            </div>
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text="أسبوع ينتهي بفتح الأبواب." start={PLAN[0] + 70} end={PLAN[1]} y={wide ? height * 0.8 : height * 0.68} size={lineSize(64)} weight={900} />

        {/* Identity */}
        <Label f={f} range={IDENT} text="الهوية" wide={wide} height={height} />
        {ident > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: cy - 170, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60, opacity: ident }}>
            <div dir="rtl" style={{ display: 'flex', gap: wide ? 40 : 24 }}>
              {sw.map((s, i) => {
                const p = ease(f, IDENT[0] + i * 4, IDENT[0] + i * 4 + 12, [0, 1], Easing.out(Easing.back(1.8)));
                return (
                  <div key={s.c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `scale(${p})` }}>
                    <div style={{ width: wide ? 150 : 170, height: wide ? 150 : 170, borderRadius: '50%', background: s.c, border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 16px 30px rgba(0,0,0,0.5)' }} />
                    <div style={{ fontFamily: fontFor('ar'), fontWeight: 700, fontSize: 30, color: WHITE }}>{s.n}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ opacity: ease(f, IDENT[0] + 24, IDENT[0] + 40) }}>
              <MahdLogo width={wide ? 520 : 620} />
            </div>
          </div>
        )}

        {/* Client × agency */}
        {duo > 0 && (
          <AbsoluteFill style={{ opacity: duo, display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: wide ? 90 : 60 }}>
            <MahdLogo width={wide ? 620 : 700} />
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 300, fontSize: 110, color: BLUE_LIGHT, lineHeight: 1 }}>×</div>
            <NeoLogo width={wide ? 460 : 560} />
          </AbsoluteFill>
        )}

        <BrandEndCard f={f} start={END} lang={lang} services="تسويق  •  إعلان  •  محتوى" tagline="قصتك الجاية؟ خلّها علينا." highlight="علينا." taglineAt={30} cy={wide ? 400 : 820} width={wide ? 680 : 840} />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
