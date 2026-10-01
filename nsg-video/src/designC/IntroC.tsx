import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Sparkle} from '../components/Sparkle';
import {InkLogo} from './InkLogo';
import {C} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// A navy "planet" grows from a dot, an orbit is drawn around it, the logo sits inside,
// then the disc collapses back to a point and opens onto the paper page.
export const IntroC: React.FC<{duration: number}> = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grow = spring({frame: frame - 4, fps, config: {damping: 14, mass: 0.8}});
  const orbit = interpolate(frame, [18, 50], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const collapse = interpolate(frame, [72, 88], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const D = 640 * grow * (1 - collapse);
  const logo = interpolate(frame, [22, 36], [0, 1], clamp) * (1 - collapse);
  const satA = -Math.PI / 2 + orbit * Math.PI * 2;
  const R = 400;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: C.paper}}>
      <svg width={1000} height={1000} style={{position: 'absolute'}} viewBox="-500 -500 1000 1000">
        <circle r={R} fill="none" stroke={C.ink} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - orbit} transform="rotate(-90)" opacity={1 - collapse} />
        {orbit > 0 && collapse < 1 ? <circle cx={Math.cos(satA) * R} cy={Math.sin(satA) * R} r={10} fill={C.ink} /> : null}
      </svg>
      <div style={{width: D, height: D, borderRadius: '50%', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <InkLogo width={430} color="#fff" style={{opacity: logo, transform: `scale(${0.9 + 0.1 * logo})`}} />
      </div>
      <div style={{position: 'absolute', transform: `translate(${Math.cos(satA) * R}px, ${Math.sin(satA) * R}px) scale(${interpolate(frame, [48, 56, 66], [0, 1.4, 0], clamp)})`}}>
        <Sparkle size={70} color={C.ink} />
      </div>
    </AbsoluteFill>
  );
};
