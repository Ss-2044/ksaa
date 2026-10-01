import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {Hud} from './BackgroundB';

// Calm breakdown (no drums for 4 s), then "2030" slams in when the beat returns.
export const VisionB: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const SLAM = Math.min(120, duration - 90);
  const line = interpolate(frame, [10, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const slam = spring({frame: frame - SLAM, fps, config: {damping: 11, mass: 0.7}});
  const flash = interpolate(frame, [SLAM, SLAM + 3, SLAM + 18], [0, 0.8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          position: 'absolute',
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 560,
          lineHeight: 1,
          color: frame >= SLAM ? 'rgba(255,255,255,0.08)' : 'transparent',
          WebkitTextStroke: '3px rgba(255,255,255,0.5)',
          transform: `scale(${frame >= SLAM ? 1.6 - 0.6 * slam : 0.001})`,
          opacity: frame >= SLAM ? 1 : 0,
        }}
      >
        2030
      </div>
      <div style={{opacity: line, transform: `translateY(${(1 - line) * 30}px)`, textAlign: 'center'}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 92, color: '#fff'}}>
          نحو اقتصاد فضاء سعودي رائد
        </div>
        <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 32, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.75)', marginTop: 12}}>
          TOWARDS A WORLD-CLASS SAUDI SPACE ECONOMY
        </div>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 40, color: '#fff', marginTop: 40, opacity: frame >= SLAM ? 1 : 0}}>
          تماشياً مع رؤية المملكة 2030
        </div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <Hud index="VISION" label="رؤية 2030" />
    </AbsoluteFill>
  );
};
