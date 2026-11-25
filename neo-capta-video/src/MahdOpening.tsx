import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedLine, FPS, clamp, ease, fontFor } from './shared';
import { MAHD, MahdLogo, MahdStorefront, STORE_RATIO } from './mahd';
import { Lang } from './copy';

// Opening ad for Mahd («محض»), in Mahd's own identity — no Neo Capta branding.
// Vertical 1080×1920. Cues mirrored in music/compose.py score_mahd_opening.
export const MAHD_OPENING_DURATION = 20 * FPS;
const LINE1 = [18, 80] as const;
const LINE2 = [84, 196] as const;
const STORE = [196, 330] as const;
const COUNTER = [330, 456] as const;
const INVITE = 456;

export const CARD = { x: 50, y: 100, w: 980, h: 1720 };
const ink = MAHD.green;

export const Card: React.FC<{ f: number; children: React.ReactNode }> = ({ f, children }) => {
  const enter = ease(f, 0, 18, [0, 1], Easing.out(Easing.cubic));
  const border = ease(f, 6, 46, [0, 1], Easing.inOut(Easing.quad));
  const inset = 22;
  return (
    <div
      style={{
        position: 'absolute', left: CARD.x, top: CARD.y + (1 - enter) * 80, width: CARD.w, height: CARD.h,
        borderRadius: 30, background: MAHD.paper, overflow: 'hidden', opacity: enter,
        boxShadow: '0 30px 80px rgba(70,50,40,0.25), inset 0 0 120px rgba(160,120,80,0.12)',
      }}
    >
      {children}
      <svg width={CARD.w} height={CARD.h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={inset} y={inset} width={CARD.w - inset * 2} height={CARD.h - inset * 2} rx={18} fill="none" stroke={ink} strokeWidth={2.2} strokeDasharray="10 8" pathLength={1000}
          strokeDashoffset={0} style={{ clipPath: `inset(0 ${(1 - border) * 100}% 0 0)` }} opacity={0.75} />
      </svg>
      {/* grommet */}
      <div style={{ position: 'absolute', left: CARD.w / 2 - 26, top: 34, width: 52, height: 52, borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, #f3d68a, ${MAHD.gold} 55%, #8a6a24)`, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        <div style={{ position: 'absolute', inset: 13, borderRadius: '50%', background: MAHD.outer, boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.35)' }} />
      </div>
    </div>
  );
};

/** Watercolour illustration with a brush-like reveal and a slow camera move. */
const Illustration: React.FC<{ src: string; f: number; range: readonly [number, number]; top: number; ratio: number; pan?: number; children?: React.ReactNode }> = ({ src, f, range, top, ratio, pan = 0, children }) => {
  const [a, b] = range;
  if (f < a - 1 || f > b + 1) return null;
  const reveal = ease(f, a, a + 22, [0, 1], Easing.out(Easing.cubic));
  const out = ease(f, b - 12, b, [0, 1], Easing.in(Easing.cubic));
  const t = (f - a) / (b - a);
  const w = CARD.w - 60;
  const h = w * ratio;
  const scale = 1.04 + t * 0.08 + (pan ? 0.08 : 0);
  const dx = pan * interpolate(t, [0, 1], [1, -1]) * 50;
  return (
    <div style={{ position: 'absolute', left: 30, top, width: w, height: h, overflow: 'hidden', opacity: 1 - out, clipPath: `inset(${(1 - reveal) * 100}% 0 0 0 round 6px)` }}>
      <Img src={staticFile(src)} style={{ width: w, height: h, objectFit: 'cover', transform: `translateX(${dx}px) scale(${scale})` }} />
      {children}
    </div>
  );
};

export const MahdOpening: React.FC<{ lang: Lang }> = () => {
  const f = useCurrentFrame();
  const { width } = useVideoConfig();
  const lang: Lang = 'ar';
  const fadeOut = interpolate(f, [MAHD_OPENING_DURATION - 12, MAHD_OPENING_DURATION - 1], [1, 0], clamp);
  const line = (text: string, start: number, end: number | undefined, y: number, size: number, color: string = ink, weight = 900) => (
    <AnimatedLine f={f} lang={lang} text={text} start={start} end={end} y={y - CARD.y} size={size} weight={weight} color={color} shadow={false} />
  );

  // Storefront line art builds while «بل عمل متكامل» is on screen.
  const drawP = ease(f, LINE2[0] + 2, LINE2[0] + 70, [0, 1], Easing.inOut(Easing.quad));
  const fillP = ease(f, LINE2[0] + 62, LINE2[0] + 86, [0, 1]);
  const artOut = ease(f, LINE2[1] - 12, LINE2[1], [0, 1], Easing.in(Easing.cubic));
  const artW = 860;

  // Steam over the pour-over in the counter scene.
  const steam = (k: number) => {
    const t = ((f - COUNTER[0] + k * 9) % 36) / 36;
    return (
      <path key={k} d={`M${0 + k * 14} 60 C ${-14 + k * 14} 40, ${14 + k * 14} 25, ${k * 14} 0`} stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round"
        opacity={Math.sin(Math.PI * t) * 0.7} transform={`translate(0 ${-t * 30})`} />
    );
  };

  // Invitation end card.
  const inv = (d: number) => ease(f, INVITE + d, INVITE + d + 16, [0, 1], Easing.out(Easing.cubic));
  const details = [MAHD.time, MAHD.city, MAHD.date];

  return (
    <AbsoluteFill style={{ backgroundColor: MAHD.outer }}>
      <Audio src={staticFile('audio/mahd-opening.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Card f={f}>
          {/* 1 — ليست محض صدفة.. */}
          {line('ليست محض صدفة..', LINE1[0], LINE1[1], 960, 100)}

          {/* 2 — بل عمل متكامل + storefront assembling */}
          {f >= LINE2[0] && f <= LINE2[1] + 1 && (
            <div style={{ position: 'absolute', left: (CARD.w - artW) / 2, top: 620 - CARD.y, opacity: 1 - artOut }}>
              <MahdStorefront width={artW} color={ink} draw={drawP} fill={fillP} />
            </div>
          )}
          {line('بل عمل متكامل', LINE2[0] + 6, LINE2[1], 1300, 104, MAHD.tile)}

          {/* 3 — storefront illustration */}
          <Illustration src="mahd/storefront.jpg" f={f} range={STORE} top={160} ratio={1524 / 1548} />
          {line('نفخر ونسعد بهذه المرحلة،', STORE[0] + 14, STORE[1], 1290, 62, ink, 700)}
          {line('وأنتم أهم جزء فيها', STORE[0] + 30, STORE[1], 1390, 74, MAHD.tile)}

          {/* 4 — counter illustration */}
          <Illustration src="mahd/counter.jpg" f={f} range={COUNTER} top={200} ratio={1380 / 1548} pan={1}>
            <svg width={80} height={100} style={{ position: 'absolute', left: (CARD.w - 60) * 0.765, top: (CARD.w - 60) * (1380 / 1548) * 0.52 }}>
              <g transform="translate(30 40)">{[0, 1, 2].map(steam)}</g>
            </svg>
          </Illustration>
          {line('بكل سرور ندعوكم', COUNTER[0] + 14, COUNTER[1], 1250, 74, ink)}
          {line('لحضور الافتتاح', COUNTER[0] + 26, COUNTER[1], 1360, 96, MAHD.tile)}

          {/* 5 — the invitation */}
          {f >= INVITE && (
            <>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 660, background: ink, clipPath: `inset(0 0 ${(1 - inv(0)) * 100}% 0)` }}>
                <div style={{ position: 'absolute', left: (CARD.w - 340) / 2, top: 140, opacity: inv(8) }}>
                  <MahdLogo width={340} />
                </div>
                <div style={{ position: 'absolute', left: (CARD.w - 840) / 2, top: 300 }}>
                  <MahdStorefront width={840} color={MAHD.cream} draw={inv(6)} fill={inv(22)} />
                </div>
              </div>
              <div dir="rtl" style={{ position: 'absolute', left: 60, right: 60, top: 730, textAlign: 'center', fontFamily: fontFor(lang), color: ink }}>
                <div style={{ fontWeight: 900, fontSize: 48, whiteSpace: 'nowrap', opacity: inv(16), transform: `translateY(${(1 - inv(16)) * 30}px)` }}>ليست محض صدفة .. بل عمل متكامل</div>
                <div style={{ fontWeight: 400, fontSize: 40, marginTop: 26, opacity: inv(26) }}>نفخر ونسعد بهذه المرحلة، وأنتم أهم جزء فيها</div>
                <div style={{ fontWeight: 700, fontSize: 48, marginTop: 34, opacity: inv(34) }}>بكل سرور ندعوكم لحضور الافتتاح</div>
              </div>
              <div style={{ position: 'absolute', left: 80, right: 80, top: 1170, height: 2, background: ink, opacity: 0.8, transform: `scaleX(${inv(40)})` }} />
              <div dir="rtl" style={{ position: 'absolute', left: 80, right: 80, top: 1205, height: 110, display: 'flex', alignItems: 'center' }}>
                {details.map((d, i) => (
                  <React.Fragment key={d}>
                    {i > 0 && <div style={{ width: 2, height: 80, background: ink, opacity: 0.7 * inv(44 + i * 6) }} />}
                    <div style={{ flex: 1, textAlign: 'center', fontFamily: fontFor(lang), fontWeight: 900, fontSize: 52, color: ink, opacity: inv(44 + i * 6), transform: `scale(${0.8 + 0.2 * inv(44 + i * 6)})` }}>{d}</div>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ position: 'absolute', left: 80, right: 80, top: 1355, height: 2, background: ink, opacity: 0.8, transform: `scaleX(${inv(40)})` }} />
              <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 1480, textAlign: 'center', fontFamily: fontFor(lang), color: ink, opacity: inv(64) }}>
                <div style={{ fontWeight: 900, fontSize: 60 }}>دعوة خاصة</div>
                <div style={{ fontWeight: 400, fontSize: 40, marginTop: 6, color: MAHD.tile }}>يشرفنا تلبيتكم الدعوة</div>
              </div>
            </>
          )}
        </Card>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
