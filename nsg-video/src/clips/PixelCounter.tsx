import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {Caption} from './Caption';
import {Chip} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// Kingdom area ≈ 2.15 million km² = 2.15e12 m². Pixels for ONE full coverage at a given ground resolution:
// 30 m → 2.15e12/900 ≈ 2.4 billion · 10 m → 2.15e12/100 = 21.5 billion · 0.5 m → 2.15e12/0.25 = 8.6 trillion
const STEPS = [
  {from: 110, to: 215, res: '30 m', resAr: '30 متراً', value: 2.4, unitAr: 'مليار', unitEn: 'billion', img: 'space/jeddah-px30.png'},
  {from: 215, to: 320, res: '10 m', resAr: '10 أمتار', value: 21.5, unitAr: 'مليار', unitEn: 'billion', img: 'space/jeddah-px10.png'},
  {from: 320, to: 450, res: '0.5 m', resAr: 'نصف متر', value: 8.6, unitAr: 'تريليون', unitEn: 'trillion', img: 'space/jeddah.jpg'},
];

export const PixelCounter: React.FC = () => {
  const frame = useCurrentFrame();
  const step = STEPS.find((s) => frame >= s.from && frame < s.to);
  const zoom = interpolate(frame, [0, 450], [1.0, 1.2]);
  return (
    <AbsoluteFill style={{background: '#0D0F22'}}>
      <AbsoluteFill style={{opacity: interpolate(frame, [0, 12], [0, 1], clamp)}}>
        <Img src={staticFile(step ? step.img : 'space/jeddah.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated', transform: `scale(${zoom})`}} />
        <AbsoluteFill style={{background: step ? 'rgba(13,15,34,0.55)' : 'rgba(13,15,34,0.25)'}} />
      </AbsoluteFill>
      {step ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 140}}>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 600, fontSize: 44, color: 'rgba(255,255,255,0.85)'}}>
            بدقة {step.resAr}
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 26, flexDirection: 'row-reverse'}}>
            <div style={{fontFamily: fonts.en, fontWeight: 800, fontSize: 230, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1.05}}>
              {interpolate(frame, [step.from, step.from + 40], [0, step.value], {...clamp, easing: Easing.out(Easing.cubic)}).toFixed(1)}
            </div>
            <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 90, color: '#fff'}}>
              {step.unitAr}
            </div>
          </div>
          <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 26, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.75)'}}>
            {step.value} {step.unitEn.toUpperCase()} PIXELS · {step.res}
          </div>
        </AbsoluteFill>
      ) : null}
      <Chip ar="جدة" en="ISS · Expedition 10" from={0} to={110} corner="tr" />
      <Chip ar="مساحة المملكة ≈ 2.15 مليون كم²" en="≈ 2.15 million km²" from={110} to={450} corner="tl" />
      <Caption ar="كم بكسلاً تحتاج لتصوير المملكة كاملة؟" en="How many pixels to capture the whole Kingdom?" from={6} to={106} pos="bottom" size={60} />
      <Caption ar="كلما زادت الدقة… تضاعفت البيانات" en="Sharper resolution, exponentially more data" from={112} to={318} pos="bottom" size={52} />
      <Caption ar="لصورة واحدة فقط!" en="For a single snapshot!" from={340} to={450} pos="bottom" size={64} />
    </AbsoluteFill>
  );
};
