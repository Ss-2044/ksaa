import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import logo from './logo.json';
import { Lang } from './copy';
import { MAHD, MahdDots, MahdLogo, MahdStorefront } from './mahd';
import { AnimatedLine, BLUE, BLUE_LIGHT, Backdrop, BrandEndCard, FPS, LH, LW, Vignette, WHITE, clamp, ease } from './shared';

// Neo Capta's own video: we're running Mahd's opening campaign.
// Arabic. Vertical 1080×1920. Cues mirrored in music/compose.py score_mahd_campaign.
export const MAHD_CAMPAIGN_DURATION = 18 * FPS;
const NEW_CLIENT = [8, 44] as const;
const NEW_STORY = [46, 86] as const;
const ASSEMBLE = 90;
const SOLID = 152;
const BTS = [182, 242, 302];
const BTS_LEN = 60;
const DUO = 362;
const LOGO = 450;

const COPY = {
  client: 'عميل جديد.',
  story: 'وقصة جديدة.',
  storyHighlight: 'جديدة.',
  partner: 'فخورين نكون شركاء محض',
  partnerHighlight: 'محض',
  bts: ['الفكرة', 'الهوية', 'الحملة'],
  campaign: 'حملة افتتاح… من الفكرة إلى الدعوة.',
  campaignHighlight: 'الدعوة.',
  opening: `الافتتاح ${MAHD.date}  ·  ${MAHD.city}`,
  thanks: 'شكرًا لمحض على الثقة.',
  thanksHighlight: 'الثقة.',
  services: 'تسويق  •  إعلان  •  محتوى',
  next: 'قصتك الجاية؟ خلّها علينا.',
  nextHighlight: 'علينا.',
};

const NeoLogo: React.FC<{ width: number }> = ({ width }) => (
  <svg width={width} height={(LH / LW) * width} viewBox={`0 0 ${LW} ${LH}`}>
    <path d={logo.neo} fill={BLUE} fillRule="evenodd" />
    <path d={logo.capta} fill={WHITE} fillRule="evenodd" />
    <path d={logo.person} fill={BLUE} fillRule="evenodd" />
  </svg>
);

const Bts: React.FC<{ k: number; t: number; cx: number; cy: number }> = ({ k, t, cx, cy }) => {
  const p = ease(t, 0, 14, [0, 1], Easing.out(Easing.cubic));
  const out = ease(t, BTS_LEN - 10, BTS_LEN, [0, 1], Easing.in(Easing.cubic));
  if (k === 0) {
    const w = 900;
    return (
      <div style={{ position: 'absolute', left: cx - w / 2, top: cy - 160, opacity: 1 - out }}>
        <MahdStorefront width={w} color={MAHD.cream} draw={ease(t, 0, 44, [0, 1], Easing.inOut(Easing.quad))} fill={ease(t, 40, 56)} />
      </div>
    );
  }
  if (k === 1) {
    const sw = [MAHD.green, MAHD.cream, MAHD.tile, MAHD.gold];
    const d = 150;
    return (
      <div style={{ position: 'absolute', left: cx - (sw.length * (d + 24) - 24) / 2, top: cy - d / 2 - 60, opacity: 1 - out }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {sw.map((c, i) => {
            const pp = ease(t, i * 4, i * 4 + 12, [0, 1], Easing.out(Easing.back(1.8)));
            return <div key={c} style={{ width: d, height: d, borderRadius: '50%', background: c, border: '3px solid rgba(255,255,255,0.25)', transform: `scale(${pp})`, boxShadow: '0 16px 30px rgba(0,0,0,0.5)' }} />;
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60, opacity: ease(t, 18, 30) }}>
          <MahdLogo width={420} />
        </div>
      </div>
    );
  }
  const srcs = ['mahd/source-storefront.jpg', 'mahd/source-counter.jpg', 'mahd/source-flat.jpg'];
  const w = 330;
  return (
    <div style={{ position: 'absolute', left: cx, top: cy - 40, opacity: 1 - out }}>
      {srcs.map((src, i) => {
        const pp = ease(t, i * 6, i * 6 + 16, [0, 1], Easing.out(Easing.cubic));
        const a = (i - 1) * 9 * pp;
        return (
          <Img
            key={src}
            src={staticFile(src)}
            style={{
              position: 'absolute', left: -w / 2 + (i - 1) * w * 0.78 * pp, top: (-w * 16) / 9 / 2 + Math.abs(i - 1) * 40 + (1 - pp) * 200,
              width: w, height: (w * 16) / 9, borderRadius: 14, opacity: pp, transform: `rotate(${a}deg)`, zIndex: i === 1 ? 2 : 1,
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            }}
          />
        );
      })}
    </div>
  );
};

export const MahdCampaign: React.FC<{ lang: Lang }> = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lang: Lang = 'ar';
  const fadeOut = interpolate(f, [MAHD_CAMPAIGN_DURATION - 12, MAHD_CAMPAIGN_DURATION - 1], [1, 0], clamp);
  const cx = width / 2;
  const cy = height * 0.45;

  const logoOut = ease(f, BTS[0] - 12, BTS[0], [0, 1], Easing.in(Easing.cubic));
  const bts = BTS.findIndex((b) => f >= b && f < b + BTS_LEN);

  const duo = ease(f, DUO, DUO + 20, [0, 1], Easing.out(Easing.cubic));
  const duoOut = ease(f, LOGO - 10, LOGO, [0, 1], Easing.in(Easing.cubic));

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/mahd-campaign.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop f={f} duration={MAHD_CAMPAIGN_DURATION} reveal={interpolate(f, [0, 30], [0.35, 1], clamp)} dots={interpolate(f, [DUO, DUO + 20], [0, 0.2], clamp)} />

        <AnimatedLine f={f} lang={lang} text={COPY.client} start={NEW_CLIENT[0]} end={NEW_CLIENT[1]} y={cy} size={120} weight={900} />
        <AnimatedLine f={f} lang={lang} text={COPY.story} highlight={COPY.storyHighlight} start={NEW_STORY[0]} end={NEW_STORY[1]} y={cy} size={120} weight={900} />

        {f < BTS[0] && (
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - logoOut }}>
            <MahdDots f={f} start={ASSEMBLE} solidAt={SOLID} cx={cx} cy={cy} width={820} color={MAHD.cream} seedW={width} seedH={height} />
          </div>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.partner} highlight={COPY.partnerHighlight} start={ASSEMBLE + 16} end={BTS[0] - 4} y={height * 0.66} size={68} weight={900} />

        {bts >= 0 && <Bts k={bts} t={f - BTS[bts]} cx={cx} cy={cy} />}
        {BTS.map((b, k) => (
          <AnimatedLine key={k} f={f} lang={lang} text={COPY.bts[k]} start={b + 4} end={b + BTS_LEN - 2} y={height * 0.2} size={70} weight={800} color={BLUE_LIGHT} />
        ))}
        <AnimatedLine f={f} lang={lang} text={COPY.campaign} highlight={COPY.campaignHighlight} start={BTS[2] + 18} end={DUO - 2} y={height * 0.8} size={62} weight={900} />

        {f >= DUO && f < LOGO + 2 && (
          <AbsoluteFill style={{ opacity: duo * (1 - duoOut) }}>
            <div style={{ position: 'absolute', left: cx - 360, top: height * 0.24 - (1 - duo) * 60 }}>
              <MahdLogo width={720} />
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: height * 0.24 + 190, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', fontWeight: 300, fontSize: 110, color: BLUE_LIGHT }}>×</div>
            <div style={{ position: 'absolute', left: cx - 300, top: height * 0.24 + 360 + (1 - duo) * 60 }}>
              <NeoLogo width={600} />
            </div>
          </AbsoluteFill>
        )}
        <AnimatedLine f={f} lang={lang} text={COPY.thanks} highlight={COPY.thanksHighlight} start={DUO + 22} end={LOGO - 2} y={height * 0.72} size={74} weight={900} />
        <AnimatedLine f={f} lang={lang} text={COPY.opening} start={DUO + 34} end={LOGO - 2} y={height * 0.79} size={46} weight={700} color="rgba(232,233,238,0.8)" />

        <BrandEndCard f={f} start={LOGO} lang={lang} services={COPY.services} tagline={COPY.next} highlight={COPY.nextHighlight} taglineAt={40} cy={820} width={840} />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
