import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {C} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CARDS = [
  {value: 420, prefix: '≈', unitAr: 'كم', unitEn: 'km', ar: 'ارتفاع محطة الفضاء الدولية', en: 'Altitude of the ISS', img: 'space/riyadh-night.jpg', note: 'الصورة: الرياض من المحطة'},
  {value: 27600, prefix: '≈', unitAr: 'كم/س', unitEn: 'km/h', ar: 'سرعتها حول الأرض', en: 'Its speed around Earth', img: 'space/jubail-night.jpg', note: 'الصورة: الجبيل ليلاً من المحطة'},
  {value: 16, prefix: '≈', unitAr: 'دورة', unitEn: 'orbits / day', ar: 'تدورها حول الأرض كل يوم', en: 'Laps around Earth every day', img: 'space/apollo17-red-sea.jpg', note: 'الصورة: Apollo 17'},
  {value: 35786, prefix: '', unitAr: 'كم', unitEn: 'km', ar: 'ارتفاع المدار الثابت', en: 'Geostationary orbit altitude', img: 'space/earth-arabia-galileo.jpg', note: 'الصورة: Galileo'},
  {value: 1972, prefix: '', unitAr: '', unitEn: '', ar: 'بدأ برنامج Landsat رصد الأرض', en: 'Landsat begins observing Earth', img: 'space/riyadh-1972.jpg', note: 'الصورة: الرياض 1972 · Landsat'},
];
const LEN = 90;

const Card: React.FC<{c: (typeof CARDS)[number]; i: number}> = ({c, i}) => {
  const frame = useCurrentFrame();
  const inX = interpolate(frame, [0, 14], [100, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const outX = interpolate(frame, [LEN - 8, LEN], [0, -100], {...clamp, easing: Easing.in(Easing.cubic)});
  const count = interpolate(frame, [6, 46], [0, c.value], {...clamp, easing: Easing.out(Easing.cubic)});
  const shown = c.value === 1972 ? Math.round(interpolate(frame, [6, 46], [1900, 1972], {...clamp, easing: Easing.out(Easing.cubic)})) : Math.round(count);
  const ring = interpolate(frame, [8, 60], [0, 1], clamp);
  const flip = i % 2 === 1;
  return (
    <AbsoluteFill style={{transform: `translateX(${inX + outX}%)`, flexDirection: flip ? 'row' : 'row-reverse', alignItems: 'center', padding: '0 150px', gap: 90}}>
      <div style={{flex: 1, textAlign: 'right'}}>
        <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 20, letterSpacing: '0.35em', color: C.muted}}>0{i + 1} / 05</div>
        <div style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'baseline', gap: 20, justifyContent: 'flex-start'}}>
          <div style={{fontFamily: fonts.en, fontWeight: 800, fontSize: 210, color: C.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05, direction: 'ltr'}}>
            {c.prefix}
            {c.value === 1972 ? shown : shown.toLocaleString('en-US')}
          </div>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 64, color: C.accent}}>
            {c.unitAr}
          </div>
        </div>
        <div style={{height: 3, width: 140, background: C.ink, marginLeft: 'auto', margin: '10px 0 20px auto'}} />
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 58, color: C.ink}}>
          {c.ar}
        </div>
        <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 24, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginTop: 6}}>
          {c.en}
          {c.unitEn ? ` · ${c.unitEn}` : ''}
        </div>
      </div>
      <div style={{position: 'relative', width: 560, height: 560}}>
        <svg width={700} height={700} viewBox="-350 -350 700 700" style={{position: 'absolute', left: -70, top: -70}}>
          <circle r={320} fill="none" stroke={C.ink} strokeWidth={2} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90)" />
          <circle cx={Math.cos(-Math.PI / 2 + ring * Math.PI * 2) * 320} cy={Math.sin(-Math.PI / 2 + ring * Math.PI * 2) * 320} r={9} fill={C.ink} />
        </svg>
        <div style={{width: 560, height: 560, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 30px 80px rgba(22,24,47,0.25)'}}>
          <Img src={staticFile(c.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [0, LEN], [1.25, 1.05])})`}} />
        </div>
        <div dir="rtl" style={{position: 'absolute', bottom: -60, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.ar, fontSize: 22, color: C.muted}}>
          {c.note}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Numbers: React.FC = () => (
  <AbsoluteFill>
    {CARDS.map((c, i) => (
      <Sequence key={i} from={i * LEN} durationInFrames={LEN}>
        <Card c={c} i={i} />
      </Sequence>
    ))}
    <div dir="rtl" style={{position: 'absolute', top: 50, right: 70, fontFamily: fonts.ar, fontWeight: 700, fontSize: 30, color: C.ink}}>
      أرقام من المدار <span style={{fontFamily: fonts.en, fontSize: 16, letterSpacing: '0.3em', color: C.muted, fontWeight: 600}}>NUMBERS FROM ORBIT</span>
    </div>
  </AbsoluteFill>
);
