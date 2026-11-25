import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Lang } from './copy';
import { MAHD, MahdLogo, MahdStorefront, STORE_RATIO } from './mahd';
import { CARD, Card } from './MahdOpening';
import { AnimatedLine, FPS, clamp, ease, fontFor } from './shared';

// Short countdown stories for Mahd's opening, in Mahd's identity. Vertical 1080×1920, 8 s each.
export const MAHD_TEASER_DURATION = 8 * FPS;

const ink = MAHD.green;

const DAYS: Record<number, { big: string; line: string; sub: string }> = {
  3: { big: '3', line: 'باقي 3 أيام', sub: 'على افتتاح محض' },
  2: { big: '2', line: 'باقي يومين', sub: 'والتفاصيل تكتمل' },
  1: { big: '1', line: 'باقي يوم..', sub: 'ونلتقي' },
};

// Headline position per story, clear of its picture and of the footer.
const LINE_Y: Record<number, number> = { 3: 1000, 2: 1250, 1: 1290 };

const Footer: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = ease(f, at, at + 16, [0, 1], Easing.out(Easing.cubic));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: CARD.h - 230, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      <MahdLogo width={300} color={ink} />
      <div dir="rtl" style={{ fontFamily: fontFor('ar'), fontWeight: 700, fontSize: 40, color: MAHD.tile }}>
        {MAHD.date}  ·  {MAHD.city}  ·  {MAHD.time}
      </div>
    </div>
  );
};

export const MahdCountdown: React.FC<{ lang: Lang; days?: number }> = ({ days = 3 }) => {
  const f = useCurrentFrame();
  const d = DAYS[days];
  const fadeOut = interpolate(f, [MAHD_TEASER_DURATION - 10, MAHD_TEASER_DURATION - 1], [1, 0], clamp);
  const num = ease(f, 8, 22, [0, 1], Easing.out(Easing.back(1.6)));
  const numShrink = ease(f, 40, 62, [0, 1], Easing.inOut(Easing.cubic));
  const visual = ease(f, 50, 74, [0, 1], Easing.out(Easing.cubic));

  // Number: huge, then settles into a badge at the top.
  const numSize = interpolate(numShrink, [0, 1], [700, 220]);
  const numTop = interpolate(numShrink, [0, 1], [CARD.h * 0.42, 210]);

  let art: React.ReactNode = null;
  if (days === 3) {
    art = (
      <div style={{ position: 'absolute', left: 60, top: 520, opacity: visual }}>
        <MahdStorefront width={CARD.w - 120} color={ink} draw={ease(f, 50, 130, [0, 1], Easing.inOut(Easing.quad))} fill={ease(f, 124, 150)} />
      </div>
    );
  } else if (days === 2) {
    const r = interpolate(visual, [0, 1], [0, 330]);
    art = (
      <div style={{ position: 'absolute', left: CARD.w / 2 - 340, top: 470, width: 680, height: 680, borderRadius: '50%', overflow: 'hidden', clipPath: `circle(${r}px at 50% 50%)`, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)' }}>
        <Img src={staticFile('mahd/counter.jpg')} style={{ position: 'absolute', width: 1500, height: 1500 * (1380 / 1548), left: interpolate(f, [50, 240], [-560, -700]), top: -380 }} />
      </div>
    );
  } else {
    art = (
      <div style={{ position: 'absolute', left: 60, top: 450, width: CARD.w - 120, height: 760, borderRadius: 8, overflow: 'hidden', clipPath: `inset(${(1 - visual) * 100}% 0 0 0)` }}>
        <Img src={staticFile('mahd/storefront.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + (f / MAHD_TEASER_DURATION) * 0.1})` }} />
      </div>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: MAHD.outer }}>
      <Audio src={staticFile(`audio/mahd-teaser-${days}.wav`)} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Card f={f}>
          <div
            style={{
              position: 'absolute', left: 0, right: 0, top: numTop, transform: `translateY(-50%) scale(${num})`, textAlign: 'center',
              fontFamily: fontFor('ar'), fontWeight: 900, fontSize: numSize, lineHeight: 1, color: MAHD.tile,
            }}
          >
            {d.big}
          </div>
          {art}
          <AnimatedLine f={f} lang="ar" text={d.line} start={62} y={LINE_Y[days]} size={92} weight={900} color={ink} shadow={false} />
          <AnimatedLine f={f} lang="ar" text={d.sub} start={78} y={LINE_Y[days] + 110} size={60} weight={700} color={MAHD.tile} shadow={false} />
          <Footer f={f} at={110} />
        </Card>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Opening day: the storefront's doors open onto warm light. */
export const MahdToday: React.FC<{ lang: Lang }> = () => {
  const f = useCurrentFrame();
  const fadeOut = interpolate(f, [MAHD_TEASER_DURATION - 10, MAHD_TEASER_DURATION - 1], [1, 0], clamp);
  const panel = ease(f, 0, 20, [0, 1], Easing.out(Easing.cubic));
  const draw = ease(f, 6, 50, [0, 1], Easing.inOut(Easing.quad));
  const fill = ease(f, 44, 62);
  const open = ease(f, 70, 110, [0, 1], Easing.inOut(Easing.cubic));
  const glow = ease(f, 74, 120);
  const w = CARD.w - 100;
  const h = w * STORE_RATIO;
  const top = 380;
  // Double door, measured on the traced storefront (fractions of its box).
  const door = { x: 0.451, y: 0.255, w: 0.106, h: 0.69 };
  const dx = 50 + door.x * w;
  const dy = top + door.y * h;
  const dw = door.w * w;
  const dh = door.h * h;

  return (
    <AbsoluteFill style={{ backgroundColor: MAHD.outer }}>
      <Audio src={staticFile('audio/mahd-today.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Card f={f}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1000, background: ink, clipPath: `inset(0 0 ${(1 - panel) * 100}% 0)` }}>
            <div style={{ position: 'absolute', left: (CARD.w - 300) / 2, top: 150, opacity: ease(f, 10, 26) }}>
              <MahdLogo width={300} />
            </div>
            {/* light spilling out of the doorway */}
            <div style={{ position: 'absolute', left: dx - dw * 1.5, top: dy - dh * 0.2, width: dw * 4, height: dh * 1.6, borderRadius: '50%', background: `radial-gradient(ellipse at 50% 60%, rgba(255,214,140,${0.75 * glow}), rgba(255,214,140,0) 65%)` }} />
            <div style={{ position: 'absolute', left: dx, top: dy, width: dw, height: dh, background: `linear-gradient(180deg, #ffe7b0, ${MAHD.gold})`, opacity: glow }} />
            <div style={{ position: 'absolute', left: 50, top }}>
              <MahdStorefront width={w} color={MAHD.cream} draw={draw} fill={fill} />
            </div>
            {/* the two door leaves swing open */}
            {fill > 0.9 && (
              <>
                <div style={{ position: 'absolute', left: dx, top: dy, width: dw / 2, height: dh, background: ink, border: `3px solid ${MAHD.cream}`, transformOrigin: 'left center', transform: `perspective(600px) rotateY(${-open * 80}deg)` }} />
                <div style={{ position: 'absolute', left: dx + dw / 2, top: dy, width: dw / 2, height: dh, background: ink, border: `3px solid ${MAHD.cream}`, transformOrigin: 'right center', transform: `perspective(600px) rotateY(${open * 80}deg)` }} />
              </>
            )}
          </div>
          <AnimatedLine f={f} lang="ar" text="اليوم.." start={96} y={1150} size={88} weight={900} color={MAHD.tile} shadow={false} />
          <AnimatedLine f={f} lang="ar" text="نفتح أبوابنا" start={108} y={1270} size={110} weight={900} color={ink} shadow={false} />
          <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', fontFamily: fontFor('ar'), fontWeight: 700, fontSize: 46, color: ink, opacity: ease(f, 130, 146) }}>
            الساعة {MAHD.time}  ·  {MAHD.city}
          </div>
          <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 1520, textAlign: 'center', fontFamily: fontFor('ar'), fontWeight: 400, fontSize: 40, color: MAHD.tile, opacity: ease(f, 146, 162) }}>
            يشرفنا تلبيتكم الدعوة
          </div>
        </Card>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
