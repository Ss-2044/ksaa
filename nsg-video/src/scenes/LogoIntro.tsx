import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Sparkle} from '../components/Sparkle';

const LOGO_W = 760;
const LOGO_H = (LOGO_W * 336) / 732;
// Position of the star inside the logo, relative to the logo centre.
const STAR = {x: (0.365 - 0.5) * LOGO_W, y: (0.25 - 0.5) * LOGO_H};

export const LogoIntro: React.FC<{duration: number}> = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 1) the star is born in the centre
  const born = spring({frame, fps, config: {damping: 14, mass: 0.6}});
  // 2) it travels to its place in the logo
  const travel = interpolate(frame, [18, 38], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const starSize = interpolate(travel, [0, 1], [190, 70]) * born;
  const starX = STAR.x * travel;
  const starY = STAR.y * travel;
  const starOpacity = interpolate(frame, [40, 52], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // 3) flash + logo reveal
  const flash = interpolate(frame, [34, 40, 60], [0, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const reveal = spring({frame: frame - 36, fps, config: {damping: 200}});
  const logoScale = interpolate(reveal, [0, 1], [1.15, 1]);
  const logoBlur = interpolate(reveal, [0, 1], [24, 0]);

  // 4) light sweep across the logo
  const sweep = interpolate(frame, [52, 82], [-40, 140], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', width: LOGO_W, height: LOGO_H}}>
        <Img
          src={staticFile('nsg-logo.png')}
          style={{
            width: LOGO_W,
            height: LOGO_H,
            opacity: reveal,
            transform: `scale(${logoScale})`,
            filter: `blur(${logoBlur}px) drop-shadow(0 0 30px rgba(157,162,230,${0.45 * reveal}))`,
          }}
        />
        {/* sweep highlight clipped to the logo shape */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(110deg, transparent ${sweep - 18}%, rgba(255,255,255,0.95) ${sweep}%, transparent ${sweep + 18}%)`,
            WebkitMaskImage: `url(${staticFile('nsg-logo.png')})`,
            WebkitMaskSize: '100% 100%',
            maskImage: `url(${staticFile('nsg-logo.png')})`,
            maskSize: '100% 100%',
            opacity: reveal,
            mixBlendMode: 'screen',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: LOGO_W / 2 + starX - starSize / 2,
            top: LOGO_H / 2 + starY - starSize / 2,
            opacity: starOpacity,
            filter: 'drop-shadow(0 0 24px #fff) drop-shadow(0 0 60px #9DA2E6)',
          }}
        >
          <Sparkle size={starSize} style={{transform: `rotate(${(1 - travel) * 180}deg)`}} />
        </div>
      </div>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(157,162,230,0.4) 30%, transparent 60%)',
          opacity: flash,
        }}
      />
    </AbsoluteFill>
  );
};
