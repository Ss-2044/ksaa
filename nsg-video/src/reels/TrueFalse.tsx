import {AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {Countdown, countdownTicks, NAVY, Sfx} from './kit';

type Q = {img: string; q: string; qEn: string; answer: boolean; why: string};
export const QLEN = 165;
const ASK = 40;
const REVEAL = ASK + 90;

export const QUESTIONS: Q[] = [
  {img: 'space/earth-arabia-galileo.jpg', q: 'سور الصين العظيم يُرى بالعين المجردة من القمر', qEn: 'The Great Wall is visible from the Moon', answer: false, why: 'عرضه بضعة أمتار فقط… فلا يُرى من القمر'},
  {img: 'space/riyadh-night.jpg', q: 'يحتاج جهاز GPS إشارات 4 أقمار على الأقل ليحدد موقعك', qEn: 'GPS needs at least 4 satellites to fix your position', answer: true, why: '3 لتحديد الموقع… و1 لتصحيح الوقت'},
  {img: 'space/apollo17-red-sea.jpg', q: 'القمر الصناعي في المدار الثابت يبقى فوق النقطة نفسها من الأرض', qEn: 'A geostationary satellite stays over the same spot', answer: true, why: 'يدور فوق خط الاستواء بسرعة دوران الأرض نفسها'},
  {img: 'space/al-jowf-pivots.jpg', q: 'كل الصور الفضائية ملتقطة بالألوان الطبيعية', qEn: 'All satellite images are in natural colour', answer: false, why: 'كثير منها بالأشعة تحت الحمراء… لذلك يظهر النبات أحمر'},
];

const Btn: React.FC<{label: string; state: 'idle' | 'right' | 'dim'}> = ({label, state}) => (
  <div
    dir="rtl"
    style={{
      flex: 1,
      textAlign: 'center',
      fontFamily: fonts.ar,
      fontWeight: 800,
      fontSize: 64,
      padding: '26px 0',
      borderRadius: 36,
      border: '4px solid #fff',
      background: state === 'right' ? '#fff' : 'rgba(255,255,255,0.06)',
      color: state === 'right' ? NAVY : '#fff',
      opacity: state === 'dim' ? 0.3 : 1,
      transform: state === 'right' ? 'scale(1.06)' : 'none',
      boxShadow: state === 'right' ? '0 0 60px rgba(255,255,255,0.5)' : 'none',
    }}
  >
    {label}
  </div>
);

const QView: React.FC<{q: Q; i: number}> = ({q, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 14}});
  const done = frame >= REVEAL;
  const why = spring({frame: frame - REVEAL - 6, fps, config: {damping: 200}});
  const st = (b: boolean) => (!done ? 'idle' : b === q.answer ? 'right' : 'dim');
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 300, left: 60, width: 960, height: 620, borderRadius: 40, overflow: 'hidden', transform: `translateY(${(1 - enter) * 60}px)`, opacity: enter}}>
        <Img src={staticFile(q.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [0, QLEN], [1.15, 1.0])})`}} />
        <div style={{position: 'absolute', top: 24, right: 24, background: '#fff', color: NAVY, fontFamily: fonts.en, fontWeight: 800, fontSize: 30, padding: '6px 20px', borderRadius: 999}}>
          {i + 1}/{QUESTIONS.length}
        </div>
      </div>
      <div style={{position: 'absolute', top: 970, left: 60, right: 60, background: '#fff', borderRadius: 40, padding: '40px 46px', transform: `scale(${0.9 + 0.1 * enter})`, opacity: enter}}>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 56, color: NAVY, lineHeight: 1.4, textAlign: 'center'}}>
          {q.q}
        </div>
        <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 22, letterSpacing: '0.08em', color: 'rgba(22,24,47,0.6)', textAlign: 'center', marginTop: 12}}>{q.qEn}</div>
      </div>
      <div dir="rtl" style={{position: 'absolute', top: 1440, left: 60, right: 60, display: 'flex', gap: 40}}>
        <Btn label="صح" state={st(true)} />
        <Btn label="خطأ" state={st(false)} />
      </div>
      <Countdown from={ASK} seconds={3} size={150} style={{position: 'absolute', top: 1640, left: 465}} />
      {countdownTicks(ASK, 3)}
      <Sfx at={REVEAL} src={q.answer ? 'correct' : 'wrong'} />
      {done ? (
        <div dir="rtl" style={{position: 'absolute', top: 1650, left: 60, right: 60, textAlign: 'center', fontFamily: fonts.ar, fontWeight: 600, fontSize: 42, color: '#fff', lineHeight: 1.45, opacity: why, transform: `translateY(${(1 - why) * 30}px)`}}>
          {q.why}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const TrueFalse: React.FC = () => (
  <AbsoluteFill>
    {QUESTIONS.map((q, i) => (
      <Sequence key={i} from={i * QLEN} durationInFrames={QLEN}>
        <QView q={q} i={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
