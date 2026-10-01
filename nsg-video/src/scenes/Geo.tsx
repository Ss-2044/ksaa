import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {GeoGrid, Orbit} from '../components/Graphics';
import {ArabicText, EnglishText, Divider} from '../components/Text';
import {colors, fonts} from '../theme';

const Chip: React.FC<{ar: string; en: string; delay: number}> = ({ar, en, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 16}});
  return (
    <div
      style={{
        opacity: Math.min(1, p),
        transform: `scale(${0.8 + 0.2 * p})`,
        padding: '16px 34px',
        borderRadius: 999,
        border: '1.5px solid rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.07)',
        textAlign: 'center',
      }}
    >
      <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 32, fontWeight: 600, color: colors.white}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontSize: 18, color: colors.muted, letterSpacing: '0.06em'}}>{en}</div>
    </div>
  );
};

export const Geo: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const step = Math.min(30, (duration - 100) / 3);
  const gridRise = interpolate(frame, [0, 40], [200, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end'}}>
        <div style={{transform: `translateY(${gridRise}px)`, opacity: 0.9}}>
          <GeoGrid width={2200} height={560} tilt={60} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: -260}}>
        <div style={{position: 'absolute', top: '50%', left: '50%'}}>
          <div style={{position: 'absolute', transform: 'translate(-50%,-50%)'}}>
            <Orbit rx={820} ry={120} tilt={-4} speed={0.02} />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 130}}>
        <ArabicText text="الشركة الوطنية للخدمات الجيومكانية" delay={6} size={84} />
        <EnglishText text="National Geospatial Services Company" delay={14} />
        <Divider delay={20} width={500} />
        <ArabicText
          text="نحوّل صور الأقمار الصناعية إلى معرفة تدعم التنمية والقرار"
          delay={28}
          size={40}
          weight={500}
          color={colors.muted}
          stagger={2}
        />
        <div dir="rtl" style={{display: 'flex', gap: 30, marginTop: 40}}>
          <Chip ar="صور الأقمار الصناعية" en="Satellite Imagery" delay={50} />
          <Chip ar="الخرائط والتحليلات" en="Mapping & Analytics" delay={50 + step} />
          <Chip ar="دعم اتخاذ القرار" en="Decision Support" delay={50 + step * 2} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
