import {AbsoluteFill, interpolate, Sequence, useCurrentFrame, Easing} from 'remotion';
import {GeoGrid, NavTarget, SignalRings} from '../components/Graphics';
import {fonts} from '../theme';
import {useBeatPulse} from './beat';
import {Hud} from './BackgroundB';

const PILLARS = [
  {n: '01', ar: 'الاتصالات عبر الأقمار الصناعية', en: 'Satellite Communications', desc: 'اتصال موثوق يصل إلى كل مكان', icon: 'rings'},
  {n: '02', ar: 'البيانات الجغرافية المكانية', en: 'Geospatial Data', desc: 'رؤية أدق للأرض من المدار', icon: 'grid'},
  {n: '03', ar: 'تحديد المواقع والملاحة والتوقيت', en: 'Positioning · Navigation · Timing', desc: 'دقة تقود الحركة والقرار', icon: 'nav'},
] as const;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Slide: React.FC<{p: (typeof PILLARS)[number]; duration: number}> = ({p, duration}) => {
  const frame = useCurrentFrame();
  const pulse = useBeatPulse(4);
  const inX = interpolate(frame, [0, 12], [100, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const outX = interpolate(frame, [duration - 8, duration], [0, -100], {...clamp, easing: Easing.in(Easing.cubic)});
  const textIn = interpolate(frame, [6, 20], [0, 1], clamp);
  const icon =
    p.icon === 'rings' ? <SignalRings size={460} /> : p.icon === 'nav' ? <NavTarget size={460} /> : (
      <div style={{width: 520, height: 340, overflow: 'hidden'}}>
        <GeoGrid width={520} height={340} tilt={0} />
      </div>
    );
  return (
    <AbsoluteFill style={{transform: `translateX(${inX + outX}%)`}}>
      {/* giant outlined index */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          bottom: -80,
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 620,
          color: 'transparent',
          WebkitTextStroke: '3px rgba(255,255,255,0.16)',
          lineHeight: 1,
        }}
      >
        {p.n}
      </div>
      <AbsoluteFill style={{flexDirection: 'row-reverse', alignItems: 'center', padding: '0 160px', gap: 80}}>
        <div style={{flex: 1, opacity: textIn, transform: `translateY(${(1 - textIn) * 40}px)`}}>
          <div style={{fontFamily: fonts.en, fontSize: 24, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)', textAlign: 'right'}}>PILLAR {p.n}</div>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 96, color: '#fff', lineHeight: 1.2, margin: '16px 0'}}>
            {p.ar}
          </div>
          <div style={{height: 4, width: 160, background: '#fff', marginRight: 0, marginLeft: 'auto'}} />
          <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 36, color: '#fff', textAlign: 'right', marginTop: 24, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
            {p.en}
          </div>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 38, color: 'rgba(255,255,255,0.72)', marginTop: 14}}>
            {p.desc}
          </div>
        </div>
        <div style={{flex: 0.8, display: 'flex', justifyContent: 'center', transform: `scale(${1 + pulse * 0.03})`}}>{icon}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PillarsB: React.FC<{duration: number}> = ({duration}) => {
  // e.g. 240 → 75/75/90, 330 → 105/105/120 (all on the beat)
  const base = Math.floor((duration - 15) / 3 / 15) * 15;
  const durs = [base, base, duration - base * 2];
  let from = 0;
  return (
    <AbsoluteFill>
      {PILLARS.map((p, i) => {
        const f = from;
        from += durs[i];
        return (
          <Sequence key={p.n} from={f} durationInFrames={durs[i]}>
            <Slide p={p} duration={durs[i]} />
          </Sequence>
        );
      })}
      <Hud index="PILLARS" label="ركائز المجموعة" />
    </AbsoluteFill>
  );
};
