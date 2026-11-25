import React from 'react';
import { Easing, interpolate } from 'remotion';
import mahd from './mahd.json';
import { clamp } from './shared';

// Mahd («محض») — client brand, traced from their invitation designs (see mahd/assets.py).
export const MAHD = {
  green: mahd.colors.green, // #465140
  cream: mahd.colors.cream, // #F4EDDD
  tile: mahd.colors.tile, // #CC7865
  gold: '#C9A24A',
  paper: '#F3E7D7',
  outer: '#D8C7B9',
  date: '1 ديسمبر',
  city: 'الرياض',
  time: '6:00م',
};

export const LOGO_RATIO = mahd.logo.h / mahd.logo.w;
export const STORE_RATIO = mahd.storefront.h / mahd.storefront.w;
export const LOGO_DOTS = mahd.logoDots as [number, number][];

export const MahdLogo: React.FC<{ width: number; color?: string }> = ({ width, color = MAHD.cream }) => (
  <svg width={width} height={width * LOGO_RATIO} viewBox={`0 0 ${mahd.logo.w} ${mahd.logo.h}`}>
    <path d={mahd.logo.d} fill={color} fillRule="evenodd" />
  </svg>
);

/** Flat storefront line art: strokes draw in (0→1), then the fill arrives. */
export const MahdStorefront: React.FC<{ width: number; color: string; draw?: number; fill?: number }> = ({ width, color, draw = 1, fill = 1 }) => (
  <svg width={width} height={width * STORE_RATIO} viewBox={`0 0 ${mahd.storefront.w} ${mahd.storefront.h}`} style={{ overflow: 'visible' }}>
    <path d={mahd.storefront.d} fill={color} fillOpacity={fill} fillRule="evenodd" />
    {fill < 1 && (
      <path d={mahd.storefront.d} fill="none" stroke={color} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={1 - fill} />
    )}
  </svg>
);

/** Mahd logo assembling from dots, then resolving to the vector logo. */
export const MahdDots: React.FC<{ f: number; start: number; solidAt: number; cx: number; cy: number; width: number; color: string; seedW: number; seedH: number }> = ({
  f, start, solidAt, cx, cy, width, color, seedW, seedH,
}) => {
  if (f < start) return null;
  const s = width / mahd.logo.w;
  const h = width * LOGO_RATIO;
  const solid = interpolate(f, [solidAt, solidAt + 14], [0, 1], clamp);
  return (
    <>
      {solid < 1 && (
        <svg width={seedW} height={seedH} style={{ position: 'absolute', inset: 0, opacity: 1 - solid }}>
          {LOGO_DOTS.map(([x, y], i) => {
            const r1 = (Math.sin(i * 12.9898) * 43758.5453) % 1;
            const r2 = (Math.sin(i * 78.233) * 12345.678) % 1;
            const delay = Math.abs(r1) * 26;
            const p = interpolate(f, [start + delay, start + delay + 36], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
            const x0 = Math.abs(r1) * seedW;
            const y0 = Math.abs(r2) * seedH;
            const tx = cx - width / 2 + x * s;
            const ty = cy - h / 2 + y * s;
            return <circle key={i} cx={x0 + (tx - x0) * p} cy={y0 + (ty - y0) * p} r={Math.max(2.2, 7 * s * 1.4)} fill={color} opacity={0.3 + 0.7 * p} />;
          })}
        </svg>
      )}
      {solid > 0 && (
        <div style={{ position: 'absolute', left: cx - width / 2, top: cy - h / 2, opacity: solid }}>
          <MahdLogo width={width} color={color} />
        </div>
      )}
    </>
  );
};
