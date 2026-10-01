import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Planet} from '../components/Graphics';
import {ArabicText, EnglishText, Divider} from '../components/Text';

export const Hook: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, duration], [0, 1], {easing: Easing.out(Easing.cubic)});
  const half = Math.round(duration * 0.48);
  const firstOut = interpolate(frame, [half - 12, half], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
        <div style={{transform: `translateY(${interpolate(rise, [0, 1], [900, 560])}px) scale(${interpolate(rise, [0, 1], [1, 1.12])})`}}>
          <Planet size={1300} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 220}}>
        {frame < half ? (
          <div style={{opacity: firstOut}}>
            <ArabicText text="الفضاء… آفاق بلا حدود" delay={6} size={96} />
            <Divider delay={14} />
            <EnglishText text="Space · Limitless Horizons" delay={18} />
          </div>
        ) : (
          <div>
            <ArabicText text="ومن المملكة يبدأ المستقبل" delay={half + 2} size={96} />
            <Divider delay={half + 10} />
            <EnglishText text="The future launches from the Kingdom" delay={half + 14} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
