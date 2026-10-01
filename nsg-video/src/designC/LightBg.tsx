import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from './theme';

// Paper background with a fine dot grid and a slow drifting register mark.
export const LightBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.line} 1.2px, transparent 1.2px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: `${frame * 0.3}px ${frame * 0.15}px`,
          opacity: 0.8,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(22,24,47,0.06) 100%)'}} />
    </AbsoluteFill>
  );
};
