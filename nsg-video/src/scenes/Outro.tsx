import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FloatingSparkles} from '../components/Graphics';
import {ArabicText, EnglishText} from '../components/Text';

export const Outro: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 4, fps, config: {damping: 200}});
  const breathe = 1 + 0.015 * Math.sin(frame / 12);
  const fadeOut = interpolate(frame, [duration - 20, duration], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: fadeOut}}>
      <FloatingSparkles />
      <Img
        src={staticFile('nsg-logo.png')}
        style={{
          width: 620,
          opacity: p,
          transform: `scale(${(0.9 + 0.1 * p) * breathe})`,
          filter: 'drop-shadow(0 0 40px rgba(157,162,230,0.45))',
        }}
      />
      <div style={{marginTop: 60}}>
        <ArabicText text="نربط · نرصد · نرشد" delay={22} size={64} stagger={8} />
        <EnglishText text="Connect · Observe · Navigate" delay={34} size={28} />
      </div>
    </AbsoluteFill>
  );
};
