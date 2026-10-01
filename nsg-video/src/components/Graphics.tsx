import {interpolate, useCurrentFrame} from 'remotion';
import {colors} from '../theme';
import {Sparkle} from './Sparkle';

// Stylised planet: lit sphere, rotating meridians and an atmosphere halo.
export const Planet: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
  const frame = useCurrentFrame();
  const r = size / 2;
  const meridians = [0, 1, 2, 3, 4, 5];
  return (
    <svg width={size * 1.4} height={size * 1.4} viewBox={`${-r * 1.4} ${-r * 1.4} ${size * 1.4} ${size * 1.4}`} style={style}>
      <defs>
        <radialGradient id="planetFill" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#6E74B8" />
          <stop offset="45%" stopColor="#363A6B" />
          <stop offset="100%" stopColor="#0E1028" />
        </radialGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(157,162,230,0.35)" />
          <stop offset="100%" stopColor="rgba(157,162,230,0)" />
        </radialGradient>
        <clipPath id="planetClip">
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r * 1.35} fill="url(#halo)" />
      <circle r={r} fill="url(#planetFill)" />
      <g clipPath="url(#planetClip)" stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} fill="none">
        {[-0.66, -0.33, 0, 0.33, 0.66].map((k) => (
          <ellipse key={k} cx={0} cy={k * r} rx={r * Math.sqrt(1 - k * k)} ry={r * 0.12 * Math.sqrt(1 - k * k)} />
        ))}
        {meridians.map((m) => {
          const phase = ((frame * 0.006 + m / meridians.length) % 1) * Math.PI;
          const rx = Math.abs(Math.cos(phase)) * r;
          return <ellipse key={m} cx={0} cy={0} rx={rx} ry={r} opacity={0.4 + 0.6 * Math.sin(phase)} />;
        })}
      </g>
      <circle r={r} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
    </svg>
  );
};

// Elliptical orbit with a satellite travelling along it.
export const Orbit: React.FC<{rx: number; ry: number; tilt?: number; speed?: number; offset?: number}> = ({
  rx,
  ry,
  tilt = -18,
  speed = 0.012,
  offset = 0,
}) => {
  const frame = useCurrentFrame();
  const a = frame * speed + offset;
  const x = Math.cos(a) * rx;
  const y = Math.sin(a) * ry;
  const w = rx * 2 + 80;
  const h = ry * 2 + 80;
  return (
    <svg width={w} height={h} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} style={{position: 'absolute', transform: `rotate(${tilt}deg)`}}>
      <ellipse rx={rx} ry={ry} fill="none" stroke="rgba(255,255,255,0.22)" strokeDasharray="6 10" strokeWidth={1.5} />
      <g transform={`translate(${x} ${y})`}>
        <circle r={14} fill="rgba(255,255,255,0.15)" />
        <rect x={-5} y={-5} width={10} height={10} fill="#fff" rx={2} />
        <rect x={-22} y={-3} width={14} height={6} fill="rgba(255,255,255,0.8)" />
        <rect x={8} y={-3} width={14} height={6} fill="rgba(255,255,255,0.8)" />
      </g>
    </svg>
  );
};

// Expanding broadcast rings (satellite communications).
export const SignalRings: React.FC<{size: number; delay?: number}> = ({size, delay = 0}) => {
  const frame = useCurrentFrame() - delay;
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`}>
      {[0, 1, 2].map((i) => {
        const p = (((frame / 45 + i / 3) % 1) + 1) % 1;
        return <circle key={i} r={8 + p * (r - 10)} fill="none" stroke="#fff" strokeWidth={2} opacity={(1 - p) * 0.8} />;
      })}
      <circle r={9} fill="#fff" />
    </svg>
  );
};

// Map grid with a scanning beam and pins (geospatial).
export const GeoGrid: React.FC<{width: number; height: number; tilt?: number}> = ({width, height, tilt = 52}) => {
  const frame = useCurrentFrame();
  const scan = interpolate((frame % 120) / 120, [0, 1], [0, width]);
  const cols = 16;
  const rows = 8;
  const pins = [
    [0.22, 0.4],
    [0.48, 0.62],
    [0.7, 0.3],
    [0.83, 0.68],
    [0.35, 0.75],
  ];
  return (
    <svg width={width} height={height} style={{transform: tilt ? `perspective(1400px) rotateX(${tilt}deg)` : undefined, transformOrigin: '50% 100%'}}>
      <defs>
        <linearGradient id="beam" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.45)" />
        </linearGradient>
      </defs>
      {new Array(cols + 1).fill(0).map((_, i) => (
        <line key={`c${i}`} x1={(i / cols) * width} y1={0} x2={(i / cols) * width} y2={height} stroke="rgba(255,255,255,0.22)" />
      ))}
      {new Array(rows + 1).fill(0).map((_, i) => (
        <line key={`r${i}`} x1={0} y1={(i / rows) * height} x2={width} y2={(i / rows) * height} stroke="rgba(255,255,255,0.22)" />
      ))}
      <rect x={scan - 140} y={0} width={140} height={height} fill="url(#beam)" />
      <line x1={scan} y1={0} x2={scan} y2={height} stroke="#fff" strokeWidth={2} />
      {pins.map(([px, py], i) => {
        const lit = scan > px * width;
        return (
          <g key={i} transform={`translate(${px * width} ${py * height})`} opacity={lit ? 1 : 0.25}>
            <circle r={lit ? 16 : 8} fill="none" stroke="#fff" strokeWidth={2} opacity={0.6} />
            <circle r={6} fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
};

// Crosshair + constellation (positioning, navigation & timing).
export const NavTarget: React.FC<{size: number}> = ({size}) => {
  const frame = useCurrentFrame();
  const r = size / 2;
  const rot = frame * 0.6;
  const sats = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + frame * 0.01;
    return [Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82];
  });
  return (
    <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`}>
      <g transform={`rotate(${rot})`} stroke="rgba(255,255,255,0.5)" strokeWidth={2} fill="none">
        <circle r={r * 0.55} strokeDasharray="14 10" />
      </g>
      <circle r={r * 0.3} stroke="#fff" strokeWidth={2} fill="none" />
      <line x1={-r * 0.45} x2={r * 0.45} y1={0} y2={0} stroke="#fff" strokeWidth={2} />
      <line y1={-r * 0.45} y2={r * 0.45} x1={0} x2={0} stroke="#fff" strokeWidth={2} />
      {sats.map(([x, y], i) => (
        <g key={i}>
          <line x1={0} y1={0} x2={x} y2={y} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 6" />
          <circle cx={x} cy={y} r={6} fill="#fff" />
        </g>
      ))}
    </svg>
  );
};

export const FloatingSparkles: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [
    [12, 18, 26],
    [86, 24, 18],
    [78, 82, 30],
    [18, 78, 16],
  ];
  return (
    <>
      {items.map(([x, y, s], i) => (
        <Sparkle
          key={i}
          size={s}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            opacity: 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(frame / 20 + i)),
            transform: `rotate(${frame * 0.5 + i * 20}deg)`,
          }}
        />
      ))}
    </>
  );
};
