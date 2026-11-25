import React from 'react';
import { random } from 'remotion';

// Everything about the featured client lives here. It is a placeholder café
// (generic cup mark + "CAFÉ") until the real name and logo are swapped in.
export const CLIENT = {
  wordmark: 'CAFÉ',
  nameAr: 'الكافيه',
  colors: {
    espresso: '#1A0F0A',
    roast: '#3B2418',
    coffee: '#8A5530',
    crema: '#EAD9C2',
    milk: '#F7F0E6',
    caramel: '#C8884A',
    foam: '#FFF8EE',
  },
  // Campaign designs shown in the videos (copied from cafe-campaign/out).
  designs: {
    roasting: 'cafe/01-teaser-roasting.png',
    threeDays: 'cafe/02-teaser-3-days.png',
    oneDay: 'cafe/03-teaser-1-day.png',
    opening: 'cafe/04-opening.png',
    story: 'cafe/05-story-first-sip.png',
  },
};

const C = CLIENT.colors;

/** Top-down cup mark, drawn in a 200×200 box. */
export const CafeMark: React.FC<{ size: number; saucer?: boolean }> = ({ size, saucer = true }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
    {saucer && <circle cx={100} cy={100} r={98} fill={C.milk} />}
    {saucer && <circle cx={100} cy={100} r={92} fill="none" stroke={C.crema} strokeWidth={3} />}
    <rect x={148} y={90} width={44} height={20} rx={10} fill="#fff" stroke={C.crema} strokeWidth={2} />
    <circle cx={100} cy={100} r={70} fill="#fff" stroke={C.crema} strokeWidth={2} />
    <circle cx={100} cy={100} r={60} fill="#6B3E22" />
    <circle cx={100} cy={100} r={55} fill={C.coffee} />
    <path d="M100 132 C 70 112, 64 88, 80 78 C 90 72, 100 78, 100 88 C 100 78, 110 72, 120 78 C 136 88, 130 112, 100 132 Z" fill={C.foam} opacity={0.92} />
    <path d="M100 132 L100 150" stroke={C.foam} strokeWidth={4} strokeLinecap="round" opacity={0.9} />
  </svg>
);

export const CafeLockup: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.12 }}>
    <CafeMark size={size} />
    <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: size * 0.2, letterSpacing: '0.22em', color: C.milk, paddingLeft: '0.22em' }}>
      {CLIENT.wordmark}
    </div>
  </div>
);

/** Dot targets that rebuild the cup mark (coordinates in the 200×200 box). */
export type CupDot = { x: number; y: number; color: string; sx: number; sy: number; delay: number };

const inHeart = (x: number, y: number) => {
  // Classic implicit heart, scaled to the latte art (centre ≈ 100,105).
  const u = (x - 100) / 30;
  const v = -(y - 103) / 30;
  return Math.pow(u * u + v * v - 1, 3) - u * u * v * v * v < 0;
};

export const cupDots = (step = 7): CupDot[] => {
  const dots: CupDot[] = [];
  let i = 0;
  for (let y = 2; y < 200; y += step) {
    for (let x = 2 + ((y / step) % 2 ? step / 2 : 0); x < 200; x += step) {
      const r = Math.hypot(x - 100, y - 100);
      let color: string | null = null;
      if (r < 55) color = inHeart(x, y) ? C.foam : C.coffee;
      else if (r < 60) color = '#6B3E22';
      else if (r < 70) color = '#FFFFFF';
      else if (x > 148 && x < 192 && y > 90 && y < 110) color = '#FFFFFF';
      else if (r > 88 && r < 98) color = C.milk;
      if (!color) continue;
      dots.push({ x, y, color, sx: random(`cx-${i}`), sy: random(`cy-${i}`), delay: random(`cd-${i}`) });
      i++;
    }
  }
  return dots;
};
