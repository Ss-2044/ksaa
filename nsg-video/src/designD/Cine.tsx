import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const BAR = 135; // 1920×810 picture ≈ 2.37:1

// Anamorphic letterbox with tiny HUD text in the bars.
export const Letterbox: React.FC<{scene: string; coords?: string; open?: number}> = ({scene, coords, open = 1}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: BAR * open, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR * open, background: '#000'}} />
    <div style={{position: 'absolute', top: 54, left: 80, right: 80, display: 'flex', justifyContent: 'space-between', fontFamily: fonts.en, fontSize: 15, letterSpacing: '0.4em', color: 'rgba(255,255,255,0.55)', opacity: open}}>
      <span>NSG · SPACE &amp; GEOSPATIAL</span>
      <span>{scene}</span>
    </div>
    {coords ? (
      <div style={{position: 'absolute', bottom: 56, left: 80, fontFamily: fonts.en, fontSize: 15, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.55)', opacity: open}}>{coords}</div>
    ) : null}
  </>
);

// Film-title style caption: thin, wide-tracked, fades through blur.
export const CineLine: React.FC<{ar: string; en: string; from: number; to: number; y?: number}> = ({ar, en, from, to, y = 760}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  const op = interpolate(frame, [from, from + 18, to - 18, to], [0, 1, 1, 0], clamp);
  const blur = (1 - op) * 10;
  const track = interpolate(frame, [from, to], [0.5, 0.62]);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: op, filter: `blur(${blur}px)`}}>
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 500, fontSize: 54, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.8)'}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 400, fontSize: 18, letterSpacing: `${track}em`, color: 'rgba(255,255,255,0.75)', marginTop: 10, textTransform: 'uppercase'}}>{en}</div>
    </div>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: 0.07,
        backgroundImage: 'repeating-radial-gradient(circle at 17% 32%, #fff 0, transparent 1px, transparent 3px)',
        backgroundSize: '5px 5px',
        backgroundPosition: `${(frame * 37) % 5}px ${(frame * 53) % 5}px`,
        mixBlendMode: 'overlay',
      }}
    />
  );
};
