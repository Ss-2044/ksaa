import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {BEAT} from './beat';
import {Hud} from './BackgroundB';
import {Wipe} from './Wipe';

const ITEMS = [
  {ar: 'NSG Skywaves® (IFC)', en: 'In-flight connectivity', desc: 'اتصال الطائرات أثناء الرحلة'},
  {ar: 'خدمات NSG الجغرافية المكانية', en: 'NSG Geospatial', desc: 'بيانات وتحليلات مكانية'},
  {ar: 'NSG UP42', en: 'Earth-observation platform', desc: 'منصة بيانات رصد الأرض'},
  {ar: 'تأجير سعة الأقمار الصناعية', en: 'Satellite capacity leasing', desc: 'سعة مدارية مرنة'},
];
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Editorial index list: one row lands on each bar-beat, the active row is highlighted.
export const ServicesB: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const gap = Math.floor((duration - 60) / ITEMS.length / BEAT) * BEAT;
  const active = Math.min(ITEMS.length - 1, Math.floor(Math.max(0, frame - 20) / gap));
  return (
    <AbsoluteFill style={{padding: '150px 160px', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'baseline', gap: 30, marginBottom: 40}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 90, color: '#fff'}}>
          خدماتنا
        </div>
        <div style={{fontFamily: fonts.en, fontSize: 28, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)'}}>OUR SERVICES</div>
      </div>
      {ITEMS.map((it, i) => {
        const d = 20 + i * gap;
        const p = interpolate(frame, [d, d + 10], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        const on = i === active;
        return (
          <div
            key={it.en}
            style={{
              display: 'flex',
              flexDirection: 'row-reverse',
              alignItems: 'center',
              gap: 40,
              padding: '22px 30px',
              borderTop: '1.5px solid rgba(255,255,255,0.25)',
              background: on ? '#fff' : 'transparent',
              opacity: p,
              transform: `translateX(${(1 - p) * -120}px)`,
            }}
          >
            <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 30, color: on ? '#16182F' : 'rgba(255,255,255,0.5)', width: 60}}>0{i + 1}</div>
            <div dir="rtl" style={{flex: 1, fontFamily: fonts.ar, fontWeight: 700, fontSize: 50, color: on ? '#16182F' : '#fff'}}>
              {it.ar}
            </div>
            <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 30, color: on ? '#2C2D43' : 'rgba(255,255,255,0.65)', width: 420}}>
              {it.desc}
            </div>
            <div style={{fontFamily: fonts.en, fontSize: 22, letterSpacing: '0.08em', color: on ? '#2C2D43' : 'rgba(255,255,255,0.55)', width: 380, textTransform: 'uppercase'}}>
              {it.en}
            </div>
          </div>
        );
      })}
      <Hud index="SERVICES" label="خدمات المجموعة" />
      {frame < 16 ? <Wipe /> : null}
    </AbsoluteFill>
  );
};
