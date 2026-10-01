import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';
import {useFrameSize} from '../frameSize';

const STARS = new Array(260).fill(0).map((_, i) => ({
  x: random(`x${i}`) * 100,
  y: random(`y${i}`) * 100,
  r: 0.6 + random(`r${i}`) * 1.9,
  depth: 0.2 + random(`d${i}`) * 0.8,
  phase: random(`p${i}`) * Math.PI * 2,
  speed: 0.04 + random(`s${i}`) * 0.08,
}));

// Persistent backdrop: brand gradient, drifting nebula glow and a parallax starfield.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {width, height} = useFrameSize();
  const t = frame / durationInFrames;
  const angle = interpolate(t, [0, 1], [135, 165]);
  const glowX = interpolate(t, [0, 1], [70, 30]);
  const glowY = interpolate(Math.sin(frame / 90), [-1, 1], [30, 55]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${colors.bgTop} 0%, ${colors.bgMid} 45%, ${colors.bgBottom} 80%, ${colors.deep} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(157,162,230,0.20) 0%, rgba(157,162,230,0.06) 25%, transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${100 - glowX}% ${100 - glowY}%, rgba(255,255,255,0.07) 0%, transparent 40%)`,
        }}
      />
      <svg width={width} height={height} style={{position: 'absolute'}}>
        {STARS.map((s, i) => {
          const drift = frame * s.depth * 0.35;
          const x = (((s.x / 100) * width - drift) % width + width) % width;
          const y = (s.y / 100) * height;
          const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame * s.speed + s.phase));
          return <circle key={i} cx={x} cy={y} r={s.r * s.depth} fill="#fff" opacity={twinkle * s.depth} />;
        })}
      </svg>
      {/* vignette */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(5,6,18,0.55) 100%)'}}
      />
    </AbsoluteFill>
  );
};
