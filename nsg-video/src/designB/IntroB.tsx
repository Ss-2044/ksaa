import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Sparkle} from '../components/Sparkle';

const W = 780;
const H = (W * 336) / 732;
const STAR = {x: 0.365 * W, y: 0.25 * H};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Slit-scan reveal: a horizon line draws, splits open like an eclipse and unveils the logo.
export const IntroB: React.FC<{duration: number}> = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const line = interpolate(frame, [0, 22], [0, 1], {...clamp, easing: Easing.out(Easing.exp)});
  const open = interpolate(frame, [24, 44], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const flash = interpolate(frame, [36, 38, 54], [0, 1, 0], clamp);
  const pop = spring({frame: frame - 38, fps, config: {damping: 9, mass: 0.5}});
  const rings = interpolate(frame, [38, 90], [0, 1], clamp);
  const logoY = interpolate(open, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: '#0D0F22'}}>
      {/* expanding shockwave rings on the impact */}
      {[0, 1, 2].map((i) => {
        const p = Math.max(0, rings - i * 0.12);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 200 + p * 1800,
              height: 200 + p * 1800,
              borderRadius: '50%',
              border: '2px solid #fff',
              opacity: (1 - p) * 0.5 * (p > 0 ? 1 : 0),
            }}
          />
        );
      })}
      <div style={{position: 'relative', width: W, height: H, clipPath: `inset(${50 - open * 50}% 0 ${50 - open * 50}% 0)`}}>
        <Img src={staticFile('nsg-logo.png')} style={{width: W, height: H, transform: `translateY(${logoY}px)`}} />
        <div
          style={{
            position: 'absolute',
            left: STAR.x - 60,
            top: STAR.y - 60,
            transform: `scale(${pop * 1.4}) rotate(${(1 - pop) * 90}deg)`,
            opacity: interpolate(frame, [40, 70], [1, 0], clamp),
            filter: 'drop-shadow(0 0 20px #fff)',
          }}
        >
          <Sparkle size={120} />
        </div>
      </div>
      {/* the horizon line */}
      <div
        style={{
          position: 'absolute',
          width: `${line * 90}%`,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #fff 20%, #fff 80%, transparent)',
          boxShadow: '0 0 24px #fff, 0 0 60px #9DA2E6',
          transform: `translateY(${-open * H * 0.55}px)`,
          opacity: 1 - open * 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: `${line * 90}%`,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #fff 20%, #fff 80%, transparent)',
          transform: `translateY(${open * H * 0.55}px)`,
          opacity: open * 0.4,
        }}
      />
      <AbsoluteFill style={{background: '#fff', opacity: flash * 0.85}} />
    </AbsoluteFill>
  );
};
