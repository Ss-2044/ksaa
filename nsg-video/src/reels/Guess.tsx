import {AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {fonts} from '../theme';
import {clamp, Countdown, countdownTicks, MiniMap, NAVY, Sfx} from './kit';

export type Round = {src: string; focus: string; hints: string[]; ar: string; en: string; sensor: string; lon: number; lat: number};
export const ROUND = 240;
const Q0 = 30; // countdown start
const SECS = 5;
const REVEAL = Q0 + SECS * 30; // 180

const RoundView: React.FC<{r: Round; i: number; n: number}> = ({r, i, n}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const reveal = interpolate(frame, [REVEAL, REVEAL + 20], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const zoom = interpolate(frame, [0, REVEAL], [5.5, 3.6], clamp) * (1 - reveal) + reveal * 1.0;
  const enter = spring({frame, fps, config: {damping: 14}});
  const ans = spring({frame: frame - REVEAL - 10, fps, config: {damping: 12}});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: enter}}>
        <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 24, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.65)'}}>
          ROUND {i + 1} / {n}
        </div>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 84, color: '#fff', marginTop: 6}}>
          {frame < REVEAL ? 'وش هذا المكان؟' : 'الجواب…'}
        </div>
      </div>
      <div style={{position: 'absolute', top: 520, left: 60, width: 960, height: 960, borderRadius: 48, overflow: 'hidden', border: '4px solid #fff', transform: `scale(${0.9 + 0.1 * enter})`, boxShadow: '0 30px 90px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile(r.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: r.focus, transform: `scale(${zoom})`, transformOrigin: r.focus}} />
        {frame < REVEAL ? <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 55%, rgba(13,15,34,0.55))'}} /> : null}
        <div style={{position: 'absolute', top: 24, left: 24, background: 'rgba(13,15,34,0.7)', color: '#fff', fontFamily: fonts.en, fontSize: 20, letterSpacing: '0.15em', padding: '6px 14px', borderRadius: 999}}>
          ZOOM ×{zoom.toFixed(1)}
        </div>
      </div>
      {/* hints */}
      <div style={{position: 'absolute', top: 1510, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        {frame < REVEAL
          ? r.hints.map((h, k) => {
              const at = 70 + k * 50;
              const p = spring({frame: frame - at, fps, config: {damping: 14}});
              return frame >= at ? (
                <div key={k} dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 600, fontSize: 40, color: NAVY, background: '#fff', padding: '10px 30px', borderRadius: 999, transform: `scale(${p})`}}>
                  تلميح {k + 1}: {h}
                </div>
              ) : null;
            })
          : null}
      </div>
      <Countdown from={Q0} seconds={SECS} size={170} style={{position: 'absolute', top: 1700, left: 455}} />
      {countdownTicks(Q0, SECS)}
      {r.hints.map((_, k) => (
        <Sfx key={k} at={70 + k * 50} src="whoosh" volume={0.4} />
      ))}
      <Sfx at={REVEAL - 2} src="whoosh" />
      <Sfx at={REVEAL + 10} src="correct" />
      {/* answer */}
      {frame >= REVEAL + 10 ? (
        <div style={{position: 'absolute', top: 1520, left: 60, right: 60, display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 30, transform: `scale(${ans})`}}>
          <div style={{flex: 1, textAlign: 'right'}}>
            <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 80, color: '#fff', lineHeight: 1.15}}>
              {r.ar}
            </div>
            <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 26, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase'}}>{r.en}</div>
            <div style={{fontFamily: fonts.en, fontSize: 20, color: 'rgba(255,255,255,0.55)', marginTop: 6}}>{r.sensor}</div>
          </div>
          <MiniMap lon={r.lon} lat={r.lat} size={280} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const makeGuess = (rounds: Round[]) => {
  const Body: React.FC = () => (
    <AbsoluteFill>
      {rounds.map((r, i) => (
        <Sequence key={i} from={i * ROUND} durationInFrames={ROUND}>
          <RoundView r={r} i={i} n={rounds.length} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
  return Body;
};

export const GUESS_1: Round[] = [
  {src: 'space/rub-al-khali.jpg', focus: '45% 40%', hints: ['تلال تمتد مئات الكيلومترات', 'جنوب الجزيرة العربية'], ar: 'الربع الخالي', en: "Rub' al Khali", sensor: 'NASA Terra', lon: 50, lat: 20},
  {src: 'space/al-jowf-pivots.jpg', focus: '40% 45%', hints: ['اللون الأحمر = نبات حي', 'شمال المملكة'], ar: 'حقول الجوف', en: 'Al Jowf farms', sensor: 'NASA · Landsat / ASTER', lon: 38.3, lat: 30.1},
  {src: 'space/riyadh-night.jpg', focus: '50% 50%', hints: ['صورة ليلية من محطة الفضاء', 'عاصمة'], ar: 'الرياض ليلاً', en: 'Riyadh at night', sensor: 'ISS · Expedition 33', lon: 46.7, lat: 24.7},
];
export const GUESS_2: Round[] = [
  {src: 'space/strait-of-tiran.jpg', focus: '45% 55%', hints: ['ممر مائي ضيّق', 'شمال البحر الأحمر'], ar: 'مضيق تيران', en: 'Strait of Tiran', sensor: 'ISS · Expedition 36', lon: 34.5, lat: 28.0},
  {src: 'space/al-wajh-bank.jpg', focus: '30% 40%', hints: ['شعاب مرجانية', 'الساحل الشمالي الغربي'], ar: 'ضفّة الوجه', en: 'Al Wajh Bank', sensor: 'ISS · Expedition 16', lon: 36.5, lat: 26.1},
  {src: 'space/jubail-night.jpg', focus: '55% 45%', hints: ['مدينة صناعية', 'على ساحل الخليج'], ar: 'الجبيل ليلاً', en: 'Al Jubail at night', sensor: 'ISS · Expedition 31', lon: 49.66, lat: 27.01},
];
