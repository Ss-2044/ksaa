import {AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {colors, fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Row: React.FC<{n: string; ar: string; en: string; delay: number}> = ({n, ar, en, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'baseline', gap: 30, opacity: p, transform: `translateX(${(1 - p) * -80}px)`}}>
      <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 26, color: colors.bgTop, opacity: 0.5}}>{n}</div>
      <div style={{flex: 1, borderTop: `2px solid ${colors.bgBottom}`, paddingTop: 14}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 600, fontSize: 42, color: colors.bgBottom}}>
          {ar}
        </div>
        <div style={{fontFamily: fonts.en, fontSize: 22, color: colors.bgTop, textAlign: 'right'}}>{en}</div>
      </div>
    </div>
  );
};

// Inverted editorial page: white sheet slides in, navy type and a navy-tinted logo.
export const AboutB: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const sheet = interpolate(frame, [0, 14], [100, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const out = interpolate(frame, [duration - 12, duration], [0, 100], {...clamp, easing: Easing.in(Easing.cubic)});
  const step = Math.min(30, (duration - 60) / 3);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: '#F4F4F8',
          clipPath: `polygon(${sheet + out}% 0, 100% 0, 100% 100%, ${Math.max(0, sheet - 10) + out}% 100%)`,
          flexDirection: 'row-reverse',
          padding: '120px 140px',
          gap: 100,
        }}
      >
        <div style={{flex: 1.1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34}}>
          <div style={{fontFamily: fonts.en, fontSize: 20, letterSpacing: '0.35em', color: colors.bgTop, textAlign: 'right'}}>WHO WE ARE · من نحن</div>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 110, color: colors.bgBottom, lineHeight: 1.1}}>
            مجموعة نيو للفضاء
          </div>
          <Row n="01" ar="شركة سعودية مملوكة لصندوق الاستثمارات العامة" en="Owned by the Public Investment Fund (PIF)" delay={18} />
          <Row n="02" ar="تقود اقتصاد الفضاء في المملكة" en="Leading the Kingdom's space economy" delay={18 + step} />
          <Row n="03" ar="حلول متكاملة من المدار إلى الأرض" en="End-to-end, from orbit to ground" delay={18 + step * 2} />
        </div>
        <div style={{flex: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
          <div style={{width: 560, height: 560, borderRadius: '50%', background: colors.bgBottom, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${frame * 0.1}deg)`}}>
            <div
              style={{
                width: 420,
                height: (420 * 336) / 732,
                backgroundColor: '#fff',
                WebkitMaskImage: `url(${staticFile('nsg-logo.png')})`,
                WebkitMaskSize: '100% 100%',
                transform: `rotate(${-frame * 0.1}deg)`,
              }}
            />
          </div>
          <div style={{position: 'absolute', width: 700, height: 700, borderRadius: '50%', border: `2px dashed ${colors.bgTop}`, opacity: 0.35, transform: `rotate(${-frame * 0.3}deg)`}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
