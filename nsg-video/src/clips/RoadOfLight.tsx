import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {Caption} from './Caption';
import {peninsulaPath, project} from './geo';
import {Chip, KenBurns} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CITIES: {ar: string; lon: number; lat: number; dx: number; dy: number; anchor: 'start' | 'middle' | 'end'}[] = [
  {ar: 'الجبيل', lon: 49.66, lat: 27.01, dx: -22, dy: -12, anchor: 'end'},
  {ar: 'الدمام', lon: 50.1, lat: 26.43, dx: 22, dy: 30, anchor: 'start'},
  {ar: 'الرياض', lon: 46.72, lat: 24.69, dx: 0, dy: -26, anchor: 'middle'},
  {ar: 'الطائف', lon: 40.42, lat: 21.27, dx: 24, dy: 16, anchor: 'start'},
  {ar: 'مكة', lon: 39.83, lat: 21.42, dx: 4, dy: 52, anchor: 'middle'},
  {ar: 'جدة', lon: 39.17, lat: 21.54, dx: -22, dy: -14, anchor: 'end'},
];
const OTHERS = [
  [39.61, 24.47], [36.57, 28.38], [42.5, 18.22], [41.69, 27.52], [43.97, 26.33], [42.55, 16.89], [44.13, 17.49], [40.21, 29.97],
];

// Stylised night map: cities glow and a light travels across the peninsula (illustrative route).
const LightMap: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 180 || frame > 385) return null;
  const W = 1300;
  const H = 1070;
  const op = interpolate(frame, [180, 196, 372, 385], [0, 1, 1, 0], clamp);
  const pts = CITIES.map((c) => project(c.lon, c.lat, W, H));
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  const prog = interpolate(frame, [205, 360], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  // head position
  let left = prog * total;
  let head = pts[0];
  for (let i = 0; i < segs.length; i++) {
    if (left <= segs[i]) {
      const r = left / segs[i];
      head = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
      break;
    }
    left -= segs[i];
    head = pts[i + 1];
  }
  const reached = (i: number) => segs.slice(0, i).reduce((a, b) => a + b, 0) <= prog * total + 1;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op, background: '#05060F'}}>
      <svg width={W} height={H} style={{transform: `scale(${interpolate(frame, [180, 385], [0.95, 1.05])})`}}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d={peninsulaPath(W, H)} fill="rgba(44,45,67,0.6)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
        {OTHERS.map(([lo, la], i) => {
          const [x, y] = project(lo, la, W, H);
          return <circle key={i} cx={x} cy={y} r={5} fill="#F5D76E" opacity={0.45} />;
        })}
        <path d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={3} strokeDasharray="6 10" />
        <path d={d} fill="none" stroke="#F5D76E" strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} filter="url(#glow)" />
        {pts.map(([x, y], i) => {
          const on = reached(i);
          return (
            <g key={i} filter="url(#glow)">
              <circle cx={x} cy={y} r={on ? 12 : 6} fill={on ? '#FFE9A8' : '#F5D76E'} opacity={on ? 1 : 0.5} />
              <text x={x + CITIES[i].dx} y={y + CITIES[i].dy} textAnchor={CITIES[i].anchor} fill="#fff" fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={34} opacity={on ? 1 : 0.4}>
                {CITIES[i].ar}
              </text>
            </g>
          );
        })}
        <circle cx={head[0]} cy={head[1]} r={16} fill="#fff" filter="url(#glow)" />
      </svg>
      <div style={{position: 'absolute', left: 70, bottom: 230, fontFamily: fonts.ar, fontSize: 22, color: 'rgba(255,255,255,0.55)'}} dir="rtl">
        مسار توضيحي · Illustrative route
      </div>
    </AbsoluteFill>
  );
};

export const RoadOfLight: React.FC = () => (
  <AbsoluteFill style={{background: '#05060F'}}>
    <KenBurns src="space/riyadh-night.jpg" from={0} to={100} zoom={[1.25, 1.05]} grade={0.05} />
    <KenBurns src="space/jubail-night.jpg" from={92} to={192} zoom={[1.0, 1.3]} grade={0.0} />
    <LightMap />
    <KenBurns src="space/sw-saudi-night.jpg" from={376} to={450} zoom={[1.0, 1.1]} grade={0.05} />
    <Chip ar="الرياض ليلاً" en="ISS · Expedition 33" from={0} to={96} corner="tr" />
    <Chip ar="الجبيل ليلاً" en="ISS · Expedition 31" from={96} to={188} corner="tr" />
    <Chip ar="جدة · مكة · الطائف" en="ISS · Expedition 36" from={380} to={450} corner="tr" />
    <Caption ar="الرياض… شبكة من نور" en="Riyadh — a web of light" from={6} to={94} pos="bottom" size={66} />
    <Caption ar="الجبيل… الصناعة تضيء ساحل الخليج" en="Al Jubail — industry lighting up the Gulf coast" from={100} to={186} pos="bottom" size={58} />
    <Caption ar="الطرق تُرى من الفضاء… حين تضيء" en="Roads are seen from space when they light up" from={200} to={290} pos="bottom" size={60} />
    <Caption ar="من الخليج العربي… إلى البحر الأحمر" en="From the Arabian Gulf to the Red Sea" from={292} to={372} pos="bottom" size={60} />
    <Caption ar="وتصل الرحلة إلى جدة ومكة والطائف" en="Arriving at Jeddah, Makkah and Taif" from={380} to={450} pos="bottom" size={60} />
  </AbsoluteFill>
);
