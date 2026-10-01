import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {Caption} from './Caption';
import {Chip, KenBurns} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LAT = 24.71;
const mPerPx = (z: number) => (156543.03 * Math.cos((LAT * Math.PI) / 180)) / 2 ** z;
const BASE = 1.5; // 1280×768 mosaic covering 1920×1080
const NICE = [20000, 10000, 5000, 2000, 1000, 500, 200, 100];

const LEVELS = [
  {z: 11, src: 'maps/riyadh-lines-z11.png', from: 190, to: 285, ar: 'المدينة', en: 'City'},
  {z: 13, src: 'maps/riyadh-lines-z13.png', from: 272, to: 365, ar: 'الأحياء', en: 'Districts'},
  {z: 15, src: 'maps/riyadh-lines-z15.png', from: 352, to: 450, ar: 'الشوارع', en: 'Streets'},
];

const MapLevel: React.FC<{l: (typeof LEVELS)[number]}> = ({l}) => {
  const frame = useCurrentFrame();
  if (frame < l.from - 1 || frame > l.to + 1) return null;
  const last = l.z === 15;
  const k = interpolate(frame, [l.from, l.to], [1, last ? 1.6 : 4], {...clamp, easing: Easing.in(Easing.quad)});
  const op = interpolate(frame, [l.from, l.from + 12, l.to - 12, l.to], [0, 1, 1, last ? 1 : 0], clamp);
  // scale bar
  const m = mPerPx(l.z) / (BASE * k);
  const len = NICE.find((n) => n / m <= 320) ?? 100;
  const px = len / m;
  return (
    <AbsoluteFill style={{opacity: op}}>
      <Img src={staticFile(l.src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${k})`}} />
      <div style={{position: 'absolute', left: 70, top: 70, borderInlineStart: '3px solid #fff', padding: '4px 16px'}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 44, color: '#fff'}}>
          {l.ar}
        </div>
        <div style={{fontFamily: fonts.en, fontSize: 16, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase'}}>{l.en} · zoom {l.z}</div>
      </div>
      <div style={{position: 'absolute', left: 70, bottom: 230}}>
        <div style={{width: px, height: 10, border: '2px solid #fff', borderTop: 'none'}} />
        <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 20, color: '#fff', marginTop: 6}}>{len >= 1000 ? `${len / 1000} km` : `${len} m`}</div>
      </div>
    </AbsoluteFill>
  );
};

// ISS photo of Riyadh → scan beam converts it into map data → dive city → district → street.
export const ImageToMap: React.FC = () => {
  const frame = useCurrentFrame();
  const beam = interpolate(frame, [95, 185], [-5, 105], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{background: '#16182F'}}>
      <KenBurns src="space/riyadh-night.jpg" from={0} to={200} zoom={[1.0, 1.12]} grade={0.05} fade={1} />
      {frame >= 95 && frame < 200 ? (
        <>
          <AbsoluteFill style={{clipPath: `inset(0 ${100 - beam}% 0 0)`, background: '#16182F'}}>
            <Img src={staticFile('maps/riyadh-lines-z11.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </AbsoluteFill>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${beam}%`, width: 4, background: '#fff', boxShadow: '0 0 30px #fff, 0 0 80px #9DA2E6'}} />
        </>
      ) : null}
      {LEVELS.map((l) => (
        <MapLevel key={l.z} l={l} />
      ))}
      <Chip ar="الرياض ليلاً" en="ISS · Expedition 33" from={0} to={110} corner="tr" />
      <Chip ar="بيانات الخريطة" en="© OpenStreetMap contributors" from={110} to={450} corner="tr" />
      <Caption ar="هذه الرياض… كما تراها محطة الفضاء" en="This is Riyadh, as the ISS sees it" from={6} to={95} pos="bottom" size={66} />
      <Caption ar="الصورة ترى… والخريطة تفهم" en="An image sees. A map understands." from={100} to={190} pos="bottom" size={72} />
      <Caption ar="من المدينة… إلى الحي… إلى الشارع" en="From city, to district, to street" from={195} to={450} pos="bottom" size={64} />
    </AbsoluteFill>
  );
};
