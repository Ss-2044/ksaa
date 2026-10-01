import {AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {clamp, NAVY, Sfx} from './kit';

type Item = {rank: number; src: string; ar: string; en: string; fact: string; sensor: string; pan: [number, number]};
export const ITEM = 150;
export const ITEMS: Item[] = [
  {rank: 5, src: 'space/al-wajh-bank.jpg', ar: 'ضفّة الوجه', en: 'Al Wajh Bank', fact: 'قرابة 260 نوعاً من المرجان', sensor: 'ISS · Expedition 16', pan: [30, 50]},
  {rank: 4, src: 'space/al-jowf-pivots.jpg', ar: 'حقول الجوف', en: 'Al Jowf farms', fact: 'من 22 حقلاً… إلى الآلاف في 30 عاماً', sensor: 'NASA · Landsat / ASTER', pan: [50, 50]},
  {rank: 3, src: 'space/rub-al-khali.jpg', ar: 'الربع الخالي', en: "Rub' al Khali", fact: 'من أكبر الصحاري الرملية في العالم', sensor: 'NASA Terra', pan: [50, 40]},
  {rank: 2, src: 'space/riyadh-night.jpg', ar: 'الرياض ليلاً', en: 'Riyadh at night', fact: 'شبكة من نور تراها محطة الفضاء', sensor: 'ISS · Expedition 33', pan: [45, 50]},
  {rank: 1, src: 'space/apollo17-red-sea.jpg', ar: 'البحر الأحمر كاملاً', en: 'The whole Red Sea', fact: 'لقطة نادرة من Apollo 17 عام 1972', sensor: 'NASA · Apollo 17', pan: [35, 45]},
];

const ItemView: React.FC<{it: Item}> = ({it}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slam = spring({frame, fps, config: {damping: 9, mass: 0.7}});
  const card = spring({frame: frame - 14, fps, config: {damping: 14}});
  const fade = interpolate(frame, [0, 8, ITEM - 8, ITEM], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Img src={staticFile(it.src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${it.pan[0]}% ${it.pan[1]}%`, transform: `scale(${interpolate(frame, [0, ITEM], [1.25, 1.05])})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(13,15,34,0.75) 0%, rgba(13,15,34,0.1) 30%, rgba(13,15,34,0.1) 55%, rgba(13,15,34,0.92) 85%)'}} />
      <div style={{position: 'absolute', top: 280, right: 70, fontFamily: fonts.en, fontWeight: 800, fontSize: 420, lineHeight: 1, color: '#fff', textShadow: '0 20px 60px rgba(0,0,0,0.5)', transform: `scale(${2 - slam})`, opacity: Math.min(1, slam * 1.5), transformOrigin: 'right top'}}>
        #{it.rank}
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, bottom: 180, transform: `translateY(${(1 - card) * 120}px)`, opacity: card}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 104, color: '#fff', lineHeight: 1.15, textAlign: 'right'}}>
          {it.ar}
        </div>
        <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 28, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.75)', textAlign: 'right', textTransform: 'uppercase', marginTop: 6}}>{it.en}</div>
        <div dir="rtl" style={{display: 'inline-block', float: 'right', marginTop: 26, background: '#fff', color: NAVY, fontFamily: fonts.ar, fontWeight: 700, fontSize: 42, padding: '12px 30px', borderRadius: 26}}>
          {it.fact}
        </div>
        <div style={{clear: 'both', fontFamily: fonts.en, fontSize: 20, color: 'rgba(255,255,255,0.6)', textAlign: 'right', paddingTop: 16}}>{it.sensor}</div>
      </div>
      <Sfx at={0} src="hit" volume={0.8} />
      <Sfx at={12} src="whoosh" volume={0.5} />
    </AbsoluteFill>
  );
};

export const Top5: React.FC = () => (
  <AbsoluteFill>
    {ITEMS.map((it, i) => (
      <Sequence key={i} from={i * ITEM} durationInFrames={ITEM}>
        <ItemView it={it} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
