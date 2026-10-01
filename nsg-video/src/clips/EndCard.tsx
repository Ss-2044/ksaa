import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';

export const EndCard: React.FC<{ar: string; en: string; credit?: string}> = ({ar, en, credit}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14, mass: 0.6}});
  const flash = interpolate(frame, [0, 2, 14], [0.8, 0.8, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(13,15,34,0.92)'}}>
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 68, color: '#fff', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 26, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.7)', marginTop: 6, opacity: p, textTransform: 'uppercase'}}>
        {en}
      </div>
      <Img src={staticFile('nsg-logo.png')} style={{width: 340, marginTop: 60, opacity: p, transform: `scale(${0.85 + 0.15 * p})`}} />
      {credit ? (
        <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.en, fontSize: 15, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em'}}>{credit}</div>
      ) : null}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
