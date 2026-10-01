import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Orbit, Planet} from '../components/Graphics';
import {ArabicText, EnglishText, Divider} from '../components/Text';
import {colors, fonts} from '../theme';

const Fact: React.FC<{ar: string; en: string; delay: number}> = ({ar, en, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${(1 - p) * 60}px)`,
        borderRight: `3px solid ${colors.white}`,
        padding: '10px 28px',
        marginBottom: 26,
        background: 'linear-gradient(270deg, rgba(255,255,255,0.08), transparent)',
      }}
    >
      <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 40, fontWeight: 600, color: colors.white}}>
        {ar}
      </div>
      <div dir="ltr" style={{fontFamily: fonts.en, fontSize: 24, color: colors.muted, textAlign: 'right'}}>
        {en}
      </div>
    </div>
  );
};

export const About: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const step = (duration - 70) / 3;
  const drift = interpolate(frame, [0, duration], [0, -40]);
  return (
    <AbsoluteFill style={{flexDirection: 'row-reverse', alignItems: 'center', padding: '0 140px'}}>
      <div style={{flex: 1.15, display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
        <div style={{alignSelf: 'stretch'}}>
          <ArabicText text="مجموعة نيو للفضاء" delay={4} size={92} />
          <EnglishText text="Neo Space Group · NSG" delay={12} />
          <Divider delay={18} width={420} />
        </div>
        <div style={{alignSelf: 'stretch', paddingTop: 10}}>
          <Fact ar="شركة سعودية مملوكة لصندوق الاستثمارات العامة" en="A Saudi company owned by the Public Investment Fund (PIF)" delay={30} />
          <Fact ar="تقود تطوير اقتصاد الفضاء في المملكة" en="Leading the growth of the Kingdom's space economy" delay={30 + step} />
          <Fact ar="حلول متكاملة من المدار إلى الأرض" en="End-to-end solutions, from orbit to ground" delay={30 + step * 2} />
        </div>
      </div>
      <div style={{flex: 0.85, position: 'relative', height: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${drift}px)`}}>
        <Planet size={420} style={{position: 'absolute'}} />
        <Orbit rx={330} ry={120} tilt={-20} speed={0.025} />
        <Orbit rx={280} ry={210} tilt={35} speed={-0.018} offset={2} />
        <Img src={staticFile('nsg-logo.png')} style={{position: 'absolute', bottom: 30, width: 200, opacity: 0.85}} />
      </div>
    </AbsoluteFill>
  );
};
