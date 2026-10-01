import {Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {C} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Editorial title block: index number, Arabic headline revealed by a wipe, English kicker.
export const TitleC: React.FC<{
  n?: string;
  ar: string;
  en: string;
  from: number;
  to: number;
  size?: number;
  color?: string;
  align?: 'right' | 'center';
  style?: React.CSSProperties;
}> = ({n, ar, en, from, to, size = 92, color = C.ink, align = 'right', style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const p = spring({frame: frame - from, fps, config: {damping: 200}});
  const out = interpolate(frame, [to - 10, to], [1, 0], clamp);
  const wipe = interpolate(frame, [from + 2, from + 18], [0, 100], clamp);
  return (
    <div style={{position: 'absolute', textAlign: align, opacity: out, ...style}}>
      {n ? (
        <div style={{display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-end', alignItems: 'center', gap: 14, marginBottom: 14, opacity: p}}>
          <div style={{width: 60 * p, height: 2, background: color}} />
          <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 22, letterSpacing: '0.3em', color}}>{n}</div>
        </div>
      ) : null}
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: size, lineHeight: 1.2, color, clipPath: `inset(0 0 0 ${100 - wipe}%)`}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: size * 0.3, letterSpacing: '0.22em', color, opacity: 0.65 * p, marginTop: 10, textTransform: 'uppercase'}}>{en}</div>
    </div>
  );
};

// Circle-masked photo that irises open.
export const CirclePhoto: React.FC<{src: string; size: number; from: number; to?: number; x: number; y: number; zoom?: [number, number]}> = ({src, size, from, to = 1e9, x, y, zoom = [1.15, 1.0]}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const p = interpolate(frame, [from, from + 16], [0, 1], clamp);
  const out = interpolate(frame, [to - 10, to], [1, 0], clamp);
  const z = interpolate(frame, [from, Math.min(to, from + 300)], zoom, clamp);
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', overflow: 'hidden', clipPath: `circle(${p * 50 * out}% at 50% 50%)`, boxShadow: '0 30px 80px rgba(22,24,47,0.25)'}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
    </div>
  );
};
