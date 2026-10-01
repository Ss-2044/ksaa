import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useFrameSize} from '../frameSize';
import {colors} from '../theme';

// Two-tone hard diagonal split + technical grid + line-art orbit rings that pulse on the beat.
export const BackgroundB: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useFrameSize();
  const pulse = frame >= 90 ? Math.exp(-(frame % 15) / 4) : 0;
  const split = 58 + 6 * Math.sin(frame / 120);
  return (
    <AbsoluteFill style={{background: colors.bgBottom}}>
      <AbsoluteFill
        style={{
          background: colors.bgTop,
          clipPath: `polygon(${split}% 0, 100% 0, 100% 100%, ${split - 22}% 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          backgroundPosition: `${-frame * 0.5}px 0`,
        }}
      />
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <g transform={`translate(${width * 0.78} ${height * 0.5}) rotate(${frame * 0.15})`}>
          {[260, 380, 520, 680].map((r, i) => (
            <circle
              key={r}
              r={r + pulse * 8 * (i + 1)}
              fill="none"
              stroke="#fff"
              strokeOpacity={0.06 + pulse * 0.05}
              strokeWidth={1.5}
              strokeDasharray={i % 2 ? '2 14' : undefined}
            />
          ))}
          <circle cx={520} cy={0} r={6} fill="#fff" opacity={0.6} />
        </g>
      </svg>
      {/* editorial HUD frame */}
      <AbsoluteFill style={{border: '1px solid rgba(255,255,255,0.12)', margin: 40}} />
    </AbsoluteFill>
  );
};

export const Hud: React.FC<{index: string; label: string}> = ({index, label}) => (
  <>
    <div style={{position: 'absolute', top: 58, left: 70, fontFamily: '"Montserrat"', fontSize: 18, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.55)'}}>
      NSG / {index}
    </div>
    <div dir="rtl" style={{position: 'absolute', top: 52, right: 70, fontFamily: '"IBM Plex Sans Arabic"', fontSize: 22, color: 'rgba(255,255,255,0.55)'}}>
      {label}
    </div>
  </>
);
