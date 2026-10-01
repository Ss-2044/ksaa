import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {InkLogo} from './InkLogo';
import {C} from './theme';

export const EndCardC: React.FC<{ar: string; en: string; credit?: string}> = ({ar, en, credit}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 200}});
  const wipe = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.paper, clipPath: `circle(${wipe * 120}% at 50% 50%)`, alignItems: 'center', justifyContent: 'center'}}>
      <InkLogo width={380} style={{opacity: p}} />
      <div style={{width: 120 * p, height: 2, background: C.ink, margin: '44px 0 34px'}} />
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 64, color: C.ink, opacity: p}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 24, letterSpacing: '0.3em', color: C.muted, marginTop: 6, textTransform: 'uppercase', opacity: p}}>{en}</div>
      {credit ? <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.en, fontSize: 15, color: C.muted}}>{credit}</div> : null}
    </AbsoluteFill>
  );
};
