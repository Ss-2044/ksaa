import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';

// Bilingual caption shown between [from, to) local frames.
export const Caption: React.FC<{
  ar: string;
  en: string;
  from: number;
  to: number;
  pos?: 'top' | 'bottom' | 'center';
  size?: number;
}> = ({ar, en, from, to, pos = 'bottom', size = 64}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const p = spring({frame: frame - from, fps, config: {damping: 200}});
  const out = interpolate(frame, [to - 10, to], [1, 0], {extrapolateLeft: 'clamp'});
  const words = ar.split(' ');
  const place: React.CSSProperties =
    pos === 'top' ? {top: 90} : pos === 'center' ? {top: '50%', transform: 'translateY(-50%)'} : {bottom: 90};
  return (
    <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', opacity: out, ...place}}>
      <div dir="rtl" style={{display: 'flex', justifyContent: 'center', gap: size * 0.28, fontFamily: fonts.ar, fontWeight: 700, fontSize: size, color: '#fff', textShadow: '0 6px 40px rgba(0,0,0,0.6)'}}>
        {words.map((w, i) => {
          const q = spring({frame: frame - from - i * 3, fps, config: {damping: 200}});
          return (
            <span key={i} style={{display: 'inline-block', opacity: q, transform: `translateY(${(1 - q) * 30}px)`, filter: `blur(${(1 - q) * 6}px)`}}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: size * 0.42, letterSpacing: `${0.12 + (1 - p) * 0.4}em`, color: 'rgba(255,255,255,0.75)', marginTop: 8, opacity: p, textTransform: 'uppercase'}}>
        {en}
      </div>
    </div>
  );
};

// Small HUD readout (label + value), used for altitude / resolution / coverage counters.
export const Readout: React.FC<{label: string; labelAr: string; value: string; style?: React.CSSProperties}> = ({label, labelAr, value, style}) => (
  <div style={{position: 'absolute', borderInlineStart: '3px solid #fff', padding: '6px 18px', ...style}}>
    <div style={{fontFamily: fonts.en, fontSize: 16, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.6)'}}>
      {label} · <span style={{fontFamily: fonts.ar, letterSpacing: 0}}>{labelAr}</span>
    </div>
    <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 48, color: '#fff', fontVariantNumeric: 'tabular-nums'}}>{value}</div>
  </div>
);
