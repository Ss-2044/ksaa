import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {TitleC} from './TextC';
import {C} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const TILES: [string, string, string][] = [
  ['space/sirhan-1.jpg', 'وادي السرحان', 'Terra · ASTER'],
  ['space/rub-al-khali.jpg', 'الربع الخالي', 'Terra'],
  ['space/riyadh-1972.jpg', 'الرياض 1972', 'Landsat MSS'],
  ['space/apollo17-red-sea.jpg', 'البحر الأحمر', 'Apollo 17'],
  ['space/al-jowf-pivots.jpg', 'الجوف', 'ASTER'],
  ['space/jubail-night.jpg', 'الجبيل ليلاً', 'ISS'],
  ['space/strait-of-tiran.jpg', 'مضيق تيران', 'ISS'],
  ['space/sulayyil-pivots.jpg', 'السليّل', 'EarthKAM'],
  ['space/riyadh-1990.jpg', 'الرياض 1990', 'Landsat TM'],
  ['space/riyadh-night.jpg', 'الرياض ليلاً', 'ISS'],
  ['space/empty-quarter-sharurah.jpg', 'شرورة', 'Landsat 7'],
  ['space/al-wajh-bank.jpg', 'ضفة الوجه', 'ISS'],
  ['space/sirhan-3.jpg', 'وادي السرحان', 'Terra · ASTER'],
  ['space/hejaz-coast.jpg', 'ساحل الحجاز', 'ISS'],
  ['space/riyadh-2000.jpg', 'الرياض 2000', 'ASTER'],
  ['space/earth-arabia-galileo.jpg', 'الجزيرة العربية', 'Galileo'],
  ['space/sw-saudi-night.jpg', 'جنوب غرب المملكة', 'ISS'],
  ['space/nw-coast-reefs.jpg', 'شعاب الشمال الغربي', 'ISS'],
  ['space/rub-al-khali-iss.jpg', 'كثبان وسبخات', 'ISS'],
  ['space/jeddah.jpg', 'جدة', 'ISS'],
  ['space/cloud-shadows.jpg', 'غيوم وظلال', 'Landsat 7'],
  ['space/sirhan-2.jpg', 'وادي السرحان', 'Terra · ASTER'],
  ['space/riyadh-night.jpg', 'الرياض', 'ISS'],
  ['space/al-jowf-pivots.jpg', 'حقول الجوف', 'ASTER'],
];
const COLS = 6;
const TW = 300;
const TH = 200;
const GAP = 16;
const HERO = 9; // riyadh-night

export const Mosaic: React.FC = () => {
  const frame = useCurrentFrame();
  const gridW = COLS * TW + (COLS - 1) * GAP;
  const gridH = 4 * TH + 3 * GAP;
  const ox = (1920 - gridW) / 2;
  const oy = (1080 - gridH) / 2 + 40;
  const pan = interpolate(frame, [0, 240], [1.0, 1.08], clamp);
  const focus = interpolate(frame, [240, 330], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const lines = interpolate(frame, [360, 440], [0, 140], clamp);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${pan})`, perspective: 1600}}>
        {TILES.map(([src, ar, en], i) => {
          const c = i % COLS;
          const r = Math.floor(i / COLS);
          const d = (c + r) * 5;
          const flipIn = interpolate(frame, [d, d + 18], [90, 0], {...clamp, easing: Easing.out(Easing.cubic)});
          // a few tiles flip to their "metadata" side
          const meta = [2, 7, 10, 15, 19, 22].includes(i);
          const flipMeta = meta ? interpolate(frame, [120 + i * 3, 135 + i * 3, 200 + i * 2, 215 + i * 2], [0, 180, 180, 0], clamp) : 0;
          const isHero = i === HERO;
          const x0 = ox + c * (TW + GAP);
          const y0 = oy + r * (TH + GAP);
          const x = isHero ? x0 + (0 - x0) * focus : x0;
          const y = isHero ? y0 + (0 - y0) * focus : y0;
          const w = isHero ? TW + (1920 - TW) * focus : TW;
          const h = isHero ? TH + (1080 - TH) * focus : TH;
          const fade = isHero ? 1 : 1 - focus;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: fade, zIndex: isHero ? 5 : 1, transformStyle: 'preserve-3d', transform: `rotateY(${flipIn + flipMeta}deg) scale(${isHero ? 1 : 1 - focus * 0.2})`}}>
              <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', backfaceVisibility: 'hidden', boxShadow: '0 10px 30px rgba(22,24,47,0.18)'}} />
              <div style={{position: 'absolute', inset: 0, background: C.ink, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 34, color: '#fff'}}>
                  {ar}
                </div>
                <div style={{fontFamily: fonts.en, fontSize: 16, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)', marginTop: 4}}>{en.toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
      {frame >= 340 ? (
        <AbsoluteFill style={{background: 'rgba(13,15,34,0.35)'}}>
          <Img
            src={staticFile('maps/riyadh-lines-z11.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', WebkitMaskImage: `radial-gradient(circle at 50% 55%, #000 ${lines * 0.7}%, transparent ${lines}%)`, filter: 'drop-shadow(0 0 5px rgba(157,162,230,0.9))'}}
          />
        </AbsoluteFill>
      ) : null}
      {frame < 240 ? <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 150, background: `linear-gradient(${C.paper}, ${C.paper}ee 70%, transparent)`}} /> : null}
      <TitleC ar="كل صورة… قطعة من الأرض" en="Every image is a piece of Earth" from={8} to={118} size={64} align="center" style={{left: 0, right: 0, top: 30}} />
      <TitleC ar="ولكل قطعة… مكانٌ ومستشعر وتاريخ" en="Each piece has a place, a sensor, a date" from={122} to={238} size={64} align="center" style={{left: 0, right: 0, top: 30}} />
      <TitleC ar="وحين تجتمع… تصبح خريطة" en="Together, they become a map" from={345} to={450} size={84} color="#fff" align="center" style={{left: 0, right: 0, bottom: 90}} />
    </AbsoluteFill>
  );
};
