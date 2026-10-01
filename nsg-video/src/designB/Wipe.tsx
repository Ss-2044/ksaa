import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';

// Three white diagonal bars that sweep across at the start of a scene.
export const Wipe: React.FC<{color?: string}> = ({color = '#fff'}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {[0, 1, 2].map((i) => {
        const x = interpolate(frame, [i * 2, i * 2 + 14], [-60, 160], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.cubic),
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '-20%',
              height: '140%',
              left: `${x - 20}%`,
              width: `${18 - i * 5}%`,
              background: color,
              opacity: 1 - i * 0.3,
              transform: 'skewX(-18deg)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
