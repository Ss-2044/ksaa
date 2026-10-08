import React from 'react';
import { interpolate } from 'remotion';

const STROKE = '#E8E9EE';
const ACCENT = '#7486F2';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Simple line illustrations for the scene-3 glimpses; `t` is the card's local frame.
export const GlimpseIcon: React.FC<{ index: number; t: number }> = ({ index, t }) => {
  const draw = interpolate(t, [2, 16], [0, 1], clamp);
  const common = {
    fill: 'none',
    stroke: STROKE,
    strokeWidth: 3.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  let body: React.ReactNode;
  switch (index) {
    case 0: // Advertising: billboard
      body = (
        <>
          <rect x={14} y={8} width={112} height={58} rx={6} {...common} />
          <rect x={24} y={18} width={56 * draw} height={10} rx={3} fill={ACCENT} />
          <rect x={24} y={36} width={84 * draw} height={6} rx={3} fill={STROKE} opacity={0.6} />
          <rect x={24} y={48} width={60 * draw} height={6} rx={3} fill={STROKE} opacity={0.6} />
          <path d="M44 66 V90 M96 66 V90" {...common} />
        </>
      );
      break;
    case 1: // Mobile screen
      body = (
        <>
          <rect x={46} y={2} width={48} height={90} rx={9} {...common} />
          <rect x={53} y={14} width={34} height={46 * draw} rx={3} fill={ACCENT} opacity={0.85} />
          <rect x={53} y={64} width={34} height={5} rx={2} fill={STROKE} opacity={0.6 * draw} />
          <rect x={53} y={72} width={22} height={5} rx={2} fill={STROKE} opacity={0.6 * draw} />
          <circle cx={70} cy={84} r={2.5} fill={STROKE} />
        </>
      );
      break;
    case 2: // Campaign: megaphone with waves
      body = (
        <>
          <path d="M22 40 L22 58 L40 58 L82 78 L82 20 L40 40 Z" {...common} />
          <path d="M34 58 L40 82 L50 82 L46 60" {...common} />
          {[0, 1, 2].map((k) => (
            <path
              key={k}
              d={`M${94 + k * 12} ${34 - k * 6} Q${104 + k * 14} 49 ${94 + k * 12} ${64 + k * 6}`}
              {...common}
              stroke={ACCENT}
              opacity={interpolate(t, [4 + k * 4, 8 + k * 4], [0, 1], clamp)}
            />
          ))}
        </>
      );
      break;
    case 3: // Copywriting: pen + lines
      body = (
        <>
          {[18, 36, 54, 72].map((y, k) => (
            <path key={y} d={`M14 ${y} H${14 + (k === 3 ? 50 : 80) * interpolate(t, [2 + k * 3, 10 + k * 3], [0, 1], clamp)}`} {...common} strokeWidth={4} opacity={0.75} />
          ))}
          <g transform={`translate(${interpolate(t, [2, 20], [0, 18], clamp)} 0)`}>
            <path d="M104 10 L122 28 L94 76 L82 82 L84 68 Z" {...common} stroke={ACCENT} />
            <path d="M98 20 L116 38" {...common} stroke={ACCENT} />
          </g>
        </>
      );
      break;
    case 4: // Design: bezier pen tool
      body = (
        <>
          <path d={`M14 74 C ${40} ${74 - 70 * draw}, ${100} ${74 - 70 * draw}, 126 20`} {...common} stroke={ACCENT} strokeWidth={4} />
          <path d="M14 74 L46 30 M126 20 L96 6" {...common} strokeWidth={2} opacity={0.6} />
          {[
            [14, 74],
            [126, 20],
          ].map(([x, y]) => (
            <rect key={x} x={x - 6} y={y - 6} width={12} height={12} fill="#0a1033" stroke={STROKE} strokeWidth={3} />
          ))}
          <circle cx={46} cy={30} r={5} fill={STROKE} />
          <circle cx={96} cy={6} r={5} fill={STROKE} />
        </>
      );
      break;
    default: // Social media post
      body = (
        <>
          <rect x={24} y={4} width={92} height={86} rx={10} {...common} />
          <circle cx={40} cy={18} r={6} fill={ACCENT} />
          <rect x={52} y={15} width={36} height={6} rx={3} fill={STROKE} opacity={0.6} />
          <rect x={32} y={30} width={76} height={36} rx={4} fill={ACCENT} opacity={0.5} />
          <path
            d="M40 74 c-4 -5 -12 -1 -8 5 l8 8 l8 -8 c4 -6 -4 -10 -8 -5 z"
            fill="#ff5a7a"
            transform={`translate(40 80) scale(${interpolate(t, [6, 10, 14], [0.4, 1.3, 1], clamp)}) translate(-40 -80)`}
          />
          <path d="M62 78 h10 M80 78 h14" {...common} strokeWidth={3} opacity={0.6} />
        </>
      );
  }
  return (
    <svg width={140} height={96} viewBox="0 0 140 96" style={{ overflow: 'visible' }}>
      {body}
    </svg>
  );
};
