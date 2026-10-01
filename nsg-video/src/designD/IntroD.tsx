import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Sparkle} from '../components/Sparkle';
import {Letterbox} from './Cine';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Anamorphic lens streak sweeps across black; the logo is "lit" by it; bars close in.
export const IntroD: React.FC<{duration: number}> = () => {
  const frame = useCurrentFrame();
  const streak = interpolate(frame, [4, 40], [-0.3, 1.3], {...clamp, easing: Easing.inOut(Easing.quad)});
  const logo = interpolate(frame, [20, 50], [0, 1], clamp);
  const bars = interpolate(frame, [55, 85], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const flare = interpolate(frame, [30, 36, 60], [0, 1, 0], clamp);
  const x = streak * 1920;
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', width: 700}}>
        <Img src={staticFile('nsg-logo.png')} style={{width: 700, opacity: logo, filter: `brightness(${0.6 + logo * 0.4})`}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            WebkitMaskImage: `url(${staticFile('nsg-logo.png')})`,
            WebkitMaskSize: '100% 100%',
            background: `linear-gradient(90deg, transparent ${(streak * 100 - 15) * 1.4}%, #fff ${streak * 140}%, transparent ${(streak * 100 + 15) * 1.4}%)`,
          }}
        />
      </div>
      <div style={{position: 'absolute', top: '50%', left: x - 960, width: 1920, height: 3, marginTop: -1.5, background: 'linear-gradient(90deg, transparent, rgba(140,170,255,0.9) 40%, #fff 50%, rgba(140,170,255,0.9) 60%, transparent)', boxShadow: '0 0 30px rgba(140,170,255,0.9)', opacity: streak > -0.2 && streak < 1.2 ? 1 : 0}} />
      <div style={{position: 'absolute', left: x - 200, top: 540 - 200, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(140,170,255,0.2) 40%, transparent 70%)', opacity: streak > -0.2 && streak < 1.2 ? 0.8 : 0}} />
      <div style={{position: 'absolute', left: 960 - 103 - 40, top: 540 - 80 - 40, transform: `scale(${flare * 1.5})`, filter: 'drop-shadow(0 0 20px #fff)'}}>
        <Sparkle size={80} />
      </div>
      <Letterbox scene="" open={bars} />
    </AbsoluteFill>
  );
};
