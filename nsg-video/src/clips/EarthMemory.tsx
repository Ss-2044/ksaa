import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {Caption} from './Caption';
import {Chip, KenBurns} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Swipe comparison of the three Wadi As-Sirhan acquisitions (NASA Terra / ASTER, PIA15849).
const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 100 || frame > 312) return null;
  const op = interpolate(frame, [100, 112, 298, 312], [0, 1, 1, 0], clamp);
  const s2 = interpolate(frame, [125, 185], [100, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const s3 = interpolate(frame, [215, 275], [100, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const zoom = interpolate(frame, [100, 312], [1.04, 1.14]);
  const img = (src: string, clip?: number) => (
    <Img
      src={staticFile(src)}
      style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, clipPath: clip === undefined ? undefined : `inset(0 0 0 ${clip}%)`}}
    />
  );
  const divider = (x: number, label: string) =>
    x > 0.5 && x < 99.5 ? (
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${x}%`, width: 3, background: '#fff', boxShadow: '0 0 20px #fff'}}>
        <div style={{position: 'absolute', top: '50%', left: -34, width: 70, height: 70, marginTop: -35, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.en, fontWeight: 800, fontSize: 26, color: '#16182F'}}>
          {label}
        </div>
      </div>
    ) : null;
  const stage = frame < 185 ? (frame < 125 ? 1 : 2) : frame < 275 ? (frame < 215 ? 2 : 3) : 3;
  return (
    <AbsoluteFill style={{opacity: op}}>
      {img('space/sirhan-1.jpg')}
      {img('space/sirhan-2.jpg', s2)}
      {img('space/sirhan-3.jpg', s3)}
      {divider(s2, '2')}
      {divider(s3, '3')}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(22,24,47,0.55), transparent 30%, transparent 65%, rgba(13,15,34,0.8))'}} />
      <div style={{position: 'absolute', left: 70, top: 70, display: 'flex', gap: 12}}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{width: 54, height: 54, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.en, fontWeight: 700, fontSize: 24, color: n === stage ? '#16182F' : '#fff', background: n === stage ? '#fff' : 'rgba(13,15,34,0.5)'}}>
            {n}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const EarthMemory: React.FC = () => (
  <AbsoluteFill>
    <KenBurns src="space/sirhan-1.jpg" from={0} to={112} zoom={[1.2, 1.04]} grade={0.3} />
    <Compare />
    <KenBurns src="space/al-jowf-pivots.jpg" from={300} to={450} zoom={[1.0, 1.35]} pan={[[0, 0], [-4, 3]]} grade={0.2} />
    <Chip ar="وادي السرحان" en="NASA Terra · ASTER" from={0} to={310} corner="tr" />
    <Chip ar="الجوف" en="NASA · Landsat / ASTER" from={300} to={450} corner="tr" />
    <Caption ar="الأقمار الصناعية لا تنسى" en="Satellites never forget" from={4} to={108} pos="bottom" size={78} />
    <Caption ar="الوادي نفسه… في ثلاث لقطات" en="The same valley, three moments" from={112} to={200} pos="bottom" />
    <Caption ar="حتى امتلأ الوادي بالحقول" en="Until the valley filled with fields" from={205} to={300} pos="bottom" />
    <Caption ar="الأحمر هنا = نبات حي، تكشفه الأشعة تحت الحمراء" en="Red = living plants, revealed by near-infrared" from={305} to={378} pos="bottom" size={56} />
    <Caption ar="في 30 عاماً: من 22 حقلاً… إلى الآلاف" en="In 30 years: from 22 fields to thousands" from={380} to={450} pos="bottom" size={60} />
  </AbsoluteFill>
);
