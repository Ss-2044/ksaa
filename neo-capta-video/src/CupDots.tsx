import React, { useMemo } from 'react';
import { Easing, interpolate } from 'remotion';
import { CafeMark, cupDots } from './client';
import { clamp } from './shared';

/**
 * The client's cup mark assembling from scattered dots, then resolving into the vector mark.
 * `from` lets the dots start from a given point (e.g. where something else dissolved).
 */
export const CupDots: React.FC<{
  f: number;
  start: number;
  cx: number;
  cy: number;
  size: number;
  width: number;
  height: number;
  from?: [number, number];
  solidAt?: number;
}> = ({ f, start, cx, cy, size, width, height, from, solidAt }) => {
  const dots = useMemo(() => cupDots(7), []);
  if (f < start) return null;
  const s = size / 200;
  const solid = solidAt === undefined ? 0 : interpolate(f, [solidAt, solidAt + 14], [0, 1], clamp);
  return (
    <>
      {solid < 1 && (
        <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity: 1 - solid }}>
          {dots.map((d, i) => {
            const p = interpolate(f, [start + d.delay * 30, start + d.delay * 30 + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
            const x0 = from ? from[0] + (d.sx - 0.5) * 120 : d.sx * width;
            const y0 = from ? from[1] + (d.sy - 0.5) * 120 : d.sy * height;
            const x = x0 + (cx - size / 2 + d.x * s - x0) * p;
            const y = y0 + (cy - size / 2 + d.y * s - y0) * p;
            return <circle key={i} cx={x} cy={y} r={2.6 * s * 1.6} fill={d.color} opacity={0.35 + 0.65 * p} />;
          })}
        </svg>
      )}
      {solid > 0 && (
        <div style={{ position: 'absolute', left: cx - size / 2, top: cy - size / 2, opacity: solid, filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.55))' }}>
          <CafeMark size={size} />
        </div>
      )}
    </>
  );
};
