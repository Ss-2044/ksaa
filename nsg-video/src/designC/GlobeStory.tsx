import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {faceAngles, Globe} from './Globe';
import {TitleC} from './TextC';
import {C} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CITIES = [
  [24.69, 46.72], [21.54, 39.17], [26.43, 50.1], [21.42, 39.83], [24.47, 39.61], [28.38, 36.57], [18.22, 42.5], [27.52, 41.69], [26.33, 43.97], [16.89, 42.55],
];

export const GlobeStory: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.inOut(Easing.cubic);
  const lon = interpolate(frame, [0, 170], [-35, 45], {...clamp, easing: ease}) + frame * 0.02;
  const lat = interpolate(frame, [0, 170], [8, 24], {...clamp, easing: ease});
  const f = faceAngles(lat, lon);
  const camZ = interpolate(frame, [0, 150, 300, 420], [7.5, 5.2, 5.2, 4.2], {...clamp, easing: ease});
  const night = interpolate(frame, [360, 420], [0, 1], {...clamp, easing: ease});
  const sun: [number, number, number] = [3 - 8 * night, 1.2, 4 - 7 * night];
  const orbitsOn = interpolate(frame, [150, 190, 300, 330], [0, 1, 1, 0], clamp);
  const shift = -330;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shift}px)`}}>
        <Globe
          width={1920}
          height={1080}
          rotX={f.rotX}
          rotY={f.rotY}
          camZ={camZ}
          sun={sun}
          nightBoost={1.4 + night * 1.2}
          cloudRot={frame * 0.0015}
          cloudOpacity={0.5 - night * 0.35}
          atmosphere="#7F9CFF"
          pins={CITIES.map(([la, lo], i) => ({lat: la, lon: lo, on: interpolate(frame, [330 + i * 4, 340 + i * 4], [0, 1], clamp)}))}
          orbits={[
            {radius: 1.18, tilt: 0.5, phase: frame * 0.035, opacity: 0.75 * orbitsOn, sats: 6},
            {radius: 1.45, tilt: -0.3, phase: frame * 0.02 + 1, opacity: 0.55 * orbitsOn, sats: 4},
            {radius: 2.3, tilt: 0.12, phase: frame * 0.004, opacity: 0.6 * orbitsOn, sats: 3},
          ]}
        />
      </div>
      <TitleC n="01" ar="كوكبٌ واحد" en="One planet" from={4} to={148} size={120} style={{right: 140, top: 330}} />
      {frame >= 30 && frame < 148 ? (
        <div dir="rtl" style={{position: 'absolute', right: 140, top: 560, fontFamily: fonts.ar, fontSize: 34, color: C.muted, opacity: interpolate(frame, [30, 45, 136, 148], [0, 1, 1, 0], clamp)}}>
          قطره نحو 12,742 كم
        </div>
      ) : null}
      <TitleC n="02" ar="وأقمارٌ لا تتوقف" en="And satellites that never stop" from={152} to={300} size={104} style={{right: 140, top: 300}} />
      {frame >= 175 && frame < 300 ? (
        <div style={{position: 'absolute', right: 140, top: 540, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end', opacity: interpolate(frame, [175, 190, 288, 300], [0, 1, 1, 0], clamp)}}>
          {[
            ['مدار منخفض', 'LEO · up to 2,000 km'],
            ['مدار ثابت', 'GEO · 35,786 km'],
          ].map(([a, e]) => (
            <div key={e} style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'baseline', gap: 18, borderTop: `2px solid ${C.ink}`, paddingTop: 10, minWidth: 460}}>
              <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 40, color: C.ink}}>
                {a}
              </div>
              <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 22, letterSpacing: '0.1em', color: C.muted}}>{e}</div>
            </div>
          ))}
        </div>
      ) : null}
      <TitleC n="03" ar="ومن المدار… تُرى المملكة كاملة" en="From orbit, the whole Kingdom" from={305} to={372} size={84} style={{right: 140, top: 360, width: 620}} />
      <TitleC n="04" ar="وفي الليل… تضيء مدنها" en="And at night, its cities light up" from={376} to={450} size={84} style={{right: 140, top: 360, width: 620}} />
    </AbsoluteFill>
  );
};
