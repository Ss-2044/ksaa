import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Planet} from '../components/Graphics';
import {ArabicText, EnglishText, Divider} from '../components/Text';
import {colors, fonts} from '../theme';

export const Vision: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, duration], [1, 1.15]);
  const badge = interpolate(frame, [60, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
        <div style={{transform: `translateY(2780px) scale(${zoom})`}}>
          <Planet size={2600} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 120}}>
        <ArabicText text="نحو اقتصاد فضاء سعودي رائد عالمياً" delay={6} size={86} />
        <Divider delay={16} width={480} />
        <EnglishText text="Towards a world-class Saudi space economy" delay={20} />
        <div
          style={{
            marginTop: 50,
            opacity: badge,
            padding: '14px 44px',
            textAlign: 'center',
            border: '1.5px solid rgba(255,255,255,0.4)',
            borderRadius: 40,
            fontFamily: fonts.ar,
            fontSize: 34,
            color: colors.white,
          }}
        >
          <div dir="rtl">تماشياً مع رؤية المملكة 2030</div>
          <div style={{fontFamily: fonts.en, fontSize: 20, color: colors.muted, letterSpacing: '0.12em', textAlign: 'center'}}>
            IN LINE WITH SAUDI VISION 2030
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
