import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Full-bleed photo with a slow Ken Burns move and a brand-coloured grade.
export const KenBurns: React.FC<{
  src: string;
  from: number;
  to: number;
  zoom?: [number, number];
  pan?: [[number, number], [number, number]]; // % offsets start → end
  fade?: number;
  grade?: number; // 0..1 navy overlay strength
  fit?: 'cover' | 'contain';
}> = ({src, from, to, zoom = [1.05, 1.18], pan = [[0, 0], [0, 0]], fade = 14, grade = 0.25, fit = 'cover'}) => {
  const frame = useCurrentFrame();
  if (frame < from - 1 || frame > to + 1) return null;
  const t = interpolate(frame, [from, to], [0, 1], clamp);
  const op = interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], clamp);
  const z = zoom[0] + (zoom[1] - zoom[0]) * t;
  const x = pan[0][0] + (pan[1][0] - pan[0][0]) * t;
  const y = pan[0][1] + (pan[1][1] - pan[0][1]) * t;
  return (
    <AbsoluteFill style={{opacity: op, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit, transform: `scale(${z}) translate(${x}%, ${y}%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(22,24,47,${grade + 0.25}) 0%, rgba(22,24,47,${grade}) 35%, rgba(22,24,47,${grade}) 65%, rgba(13,15,34,${grade + 0.45}) 100%)`}} />
    </AbsoluteFill>
  );
};

// Small source/location chip, e.g. "وادي السرحان · Terra / ASTER".
export const Chip: React.FC<{ar: string; en: string; from: number; to: number; corner?: 'tl' | 'tr' | 'bl' | 'br'}> = ({ar, en, from, to, corner = 'tr'}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const p = interpolate(frame, [from + 6, from + 18, to - 10, to], [0, 1, 1, 0], clamp);
  const pos: React.CSSProperties = {
    tl: {top: 70, left: 70},
    tr: {top: 70, right: 70},
    bl: {bottom: 70, left: 70},
    br: {bottom: 70, right: 70},
  }[corner];
  return (
    <div style={{position: 'absolute', ...pos, opacity: p, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', background: 'rgba(13,15,34,0.55)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(6px)'}}>
      <div style={{width: 8, height: 8, borderRadius: '50%', background: '#fff'}} />
      <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 26, fontWeight: 600, color: '#fff'}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontSize: 16, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase'}}>{en}</div>
    </div>
  );
};
