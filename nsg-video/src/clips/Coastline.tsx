import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Caption} from './Caption';
import {peninsulaPath, project} from './geo';
import {Chip, KenBurns} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// North → south along the Red Sea (approximate positions for the locator).
const SHOTS = [
  {from: 0, to: 78, src: 'space/apollo17-red-sea.jpg', ar: 'البحر الأحمر والجزيرة العربية', en: 'Apollo 17 · 1972', pos: null, zoom: [1.0, 1.12] as [number, number]},
  {from: 72, to: 150, src: 'space/strait-of-tiran.jpg', ar: 'مضيق تيران', en: 'ISS · Expedition 36', pos: [34.5, 28.0], zoom: [1.15, 1.0] as [number, number]},
  {from: 144, to: 222, src: 'space/nw-coast-reefs.jpg', ar: 'الساحل الشمالي الغربي', en: 'ISS · Expedition 66', pos: [35.6, 27.2], zoom: [1.0, 1.15] as [number, number]},
  {from: 216, to: 292, src: 'space/al-wajh-bank.jpg', ar: 'ضفّة الوجه', en: 'ISS · Expedition 16', pos: [36.5, 26.1], zoom: [1.12, 1.0] as [number, number]},
  {from: 286, to: 356, src: 'space/hejaz-coast.jpg', ar: 'ساحل الحجاز شمال غرب المدينة', en: 'ISS · Expedition 67', pos: [37.8, 25.0], zoom: [1.0, 1.12] as [number, number]},
  {from: 350, to: 450, src: 'space/jeddah.jpg', ar: 'جدة', en: 'ISS · Expedition 10', pos: [39.17, 21.54], zoom: [1.0, 1.18] as [number, number]},
];

const Locator: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 300;
  const H = 250;
  const located = SHOTS.filter((s) => s.pos);
  const i = located.findIndex((s) => frame < s.to);
  const cur = located[Math.max(0, i === -1 ? located.length - 1 : i)];
  const prev = located[Math.max(0, (i === -1 ? located.length - 1 : i) - 1)];
  const t = interpolate(frame, [cur.from, cur.from + 20], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const [ax, ay] = project(prev.pos![0], prev.pos![1], W, H);
  const [bx, by] = project(cur.pos![0], cur.pos![1], W, H);
  const op = interpolate(frame, [70, 85], [0, 1], clamp);
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 60, top: 60, opacity: op, background: 'rgba(13,15,34,0.6)', border: '1px solid rgba(255,255,255,0.3)'}}>
      <path d={peninsulaPath(W, H)} fill="rgba(255,255,255,0.1)" stroke="#fff" strokeWidth={1.5} />
      <circle cx={ax + (bx - ax) * t} cy={ay + (by - ay) * t} r={7} fill="#fff" />
      <circle cx={ax + (bx - ax) * t} cy={ay + (by - ay) * t} r={7 + (frame % 30)} fill="none" stroke="#fff" opacity={1 - (frame % 30) / 30} />
    </svg>
  );
};

export const Coastline: React.FC = () => (
  <AbsoluteFill style={{background: '#0D0F22'}}>
    {SHOTS.map((s) => (
      <KenBurns key={s.src} src={s.src} from={s.from} to={s.to} zoom={s.zoom} grade={0.12} fade={10} />
    ))}
    <Locator />
    {SHOTS.map((s) => (
      <Chip key={s.src} ar={s.ar} en={s.en} from={s.from + 4} to={s.to - 4} corner="tr" />
    ))}
    <Caption ar="البحر الأحمر كاملاً… في لقطة واحدة" en="The entire Red Sea in a single frame" from={6} to={74} pos="bottom" size={60} />
    <Caption ar="من مضيق تيران… نبدأ الرحلة جنوباً" en="From the Strait of Tiran, we head south" from={80} to={146} pos="bottom" size={58} />
    <Caption ar="شعاب بألوان لا تُرى إلا من الأعلى" en="Reefs in colours only seen from above" from={152} to={218} pos="bottom" size={58} />
    <Caption ar="ضفّة الوجه… قرابة 260 نوعاً من المرجان" en="Al Wajh Bank — about 260 coral species" from={222} to={288} pos="bottom" size={58} />
    <Caption ar="جبال تنحدر… حتى تلامس البحر" en="Mountains descending to meet the sea" from={292} to={352} pos="bottom" size={58} />
    <Caption ar="جدة… أهم موانئ المملكة على البحر الأحمر" en="Jeddah — the Kingdom's key Red Sea port" from={358} to={450} pos="bottom" size={56} />
  </AbsoluteFill>
);
