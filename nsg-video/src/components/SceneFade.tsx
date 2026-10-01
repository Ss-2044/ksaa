import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

// Cross-fade wrapper: every scene eases in and out with a slight zoom + blur.
export const SceneFade: React.FC<{duration: number; fadeIn?: number; fadeOut?: number; children: React.ReactNode}> = ({
  duration,
  fadeIn = 14,
  fadeOut = 14,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, fadeIn, duration - fadeOut, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, duration], [1.02, 1.0]);
  const blur = interpolate(opacity, [0, 1], [10, 0]);
  return (
    <AbsoluteFill style={{opacity, transform: `scale(${scale})`, filter: blur > 0.1 ? `blur(${blur}px)` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};
