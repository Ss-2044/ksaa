import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {fonts} from '../theme';
import {clamp, NAVY, Sfx} from './kit';

export const STEP = 120;
const STEPS = [
  {ar: 'الالتقاط', en: 'Capture', sub: 'المستشعر يلتقط الضوء المنعكس عن الأرض', bg: 'space/cloud-shadows.jpg', icon: 'eye'},
  {ar: 'الإرسال', en: 'Downlink', sub: 'تُرسل البيانات إلى محطة أرضية عند مرور القمر فوقها', bg: 'space/jubail-night.jpg', icon: 'dish'},
  {ar: 'المعالجة', en: 'Processing', sub: 'تصحيح هندسي وإشعاعي لتطابق الصورة الخريطة', bg: 'space/riyadh-1990.jpg', icon: 'gear'},
  {ar: 'التحليل', en: 'Analysis', sub: 'رصد التغيّر واستخراج المعلومات من كل بكسل', bg: 'space/al-jowf-pivots.jpg', icon: 'lens'},
  {ar: 'القرار', en: 'Decision', sub: 'خرائط ومعلومات تدعم التخطيط والتنمية', bg: 'maps/riyadh-lines-z13.png', icon: 'pin'},
];
const TOP = 420;
const GAP = 270;

const Icon: React.FC<{kind: string; color: string}> = ({kind, color}) => (
  <svg width={70} height={70} viewBox="-35 -35 70 70" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round">
    {kind === 'eye' ? (
      <>
        <path d="M-28,0 Q0,-24 28,0 Q0,24 -28,0 Z" />
        <circle r={9} fill={color} />
      </>
    ) : kind === 'dish' ? (
      <>
        <path d="M-22,10 A26,26 0 0,1 10,-22" />
        <line x1={-6} y1={-6} x2={14} y2={-26} />
        <line x1={-10} y1={10} x2={-22} y2={28} />
        <line x1={-10} y1={10} x2={4} y2={28} />
        <path d="M14,-14 A10,10 0 0,1 22,-6" />
      </>
    ) : kind === 'gear' ? (
      <>
        <circle r={12} />
        {new Array(8).fill(0).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={Math.cos(a) * 18} y1={Math.sin(a) * 18} x2={Math.cos(a) * 28} y2={Math.sin(a) * 28} />;
        })}
      </>
    ) : kind === 'lens' ? (
      <>
        <circle cx={-6} cy={-6} r={18} />
        <line x1={8} y1={8} x2={26} y2={26} />
      </>
    ) : (
      <>
        <path d="M0,28 C-20,4 -20,-6 -20,-8 A20,20 0 0,1 20,-8 C20,-6 20,4 0,28 Z" />
        <circle cy={-8} r={7} fill={color} />
      </>
    )}
  </svg>
);

export const Pipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const active = Math.min(STEPS.length - 1, Math.floor(frame / STEP));
  const local = frame - active * STEP;
  // packet travels down the line to the next node
  const py = TOP + 60 + (active + interpolate(local, [80, 115], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}) * (active < STEPS.length - 1 ? 1 : 0)) * GAP;
  const line = interpolate(frame, [0, STEPS.length * STEP - 40], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {STEPS.map((s, i) => {
        const op = interpolate(frame, [i * STEP - 15, i * STEP + 10, (i + 1) * STEP - 5, (i + 1) * STEP + 15], [0, 0.45, 0.45, i === STEPS.length - 1 ? 0.45 : 0], clamp);
        return <Img key={i} src={staticFile(s.bg)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: op, background: '#16182F'}} />;
      })}
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(13,15,34,0.85) 0%, rgba(13,15,34,0.55) 60%, rgba(13,15,34,0.85))'}} />
      <div dir="rtl" style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.ar, fontWeight: 800, fontSize: 64, color: '#fff'}}>
        رحلة الصورة الفضائية
      </div>
      {/* vertical rail */}
      <div style={{position: 'absolute', right: 180, top: TOP + 60, width: 6, height: GAP * (STEPS.length - 1) * line, background: '#fff', borderRadius: 3, opacity: 0.6}} />
      <div style={{position: 'absolute', right: 165, top: py - 18, width: 36, height: 36, borderRadius: '50%', background: '#FFE9A8', boxShadow: '0 0 30px #FFE9A8'}} />
      {STEPS.map((s, i) => {
        const on = frame >= i * STEP;
        const isAct = i === active;
        const p = spring({frame: frame - i * STEP, fps, config: {damping: 12}});
        return (
          <div key={i} style={{position: 'absolute', top: TOP + i * GAP, right: 60, left: 60, display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 34, opacity: on ? (isAct ? 1 : 0.55) : 0.15}}>
            <div style={{width: 130, height: 130, borderRadius: '50%', background: isAct ? '#fff' : 'rgba(255,255,255,0.08)', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${on ? 0.8 + 0.2 * p : 0.8})`, flexShrink: 0}}>
              <Icon kind={s.icon} color={isAct ? NAVY : '#fff'} />
            </div>
            <div style={{flex: 1, textAlign: 'right'}}>
              <div style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'baseline', gap: 16}}>
                <div style={{fontFamily: fonts.en, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.6)'}}>0{i + 1}</div>
                <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 62, color: '#fff'}}>
                  {s.ar}
                </div>
                <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase'}}>{s.en}</div>
              </div>
              {isAct ? (
                <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 36, color: 'rgba(255,255,255,0.9)', marginTop: 4, opacity: p}}>
                  {s.sub}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      {STEPS.map((_, i) => (
        <Sfx key={i} at={i * STEP} src={i === 0 ? 'hit' : 'whoosh'} volume={0.6} />
      ))}
    </AbsoluteFill>
  );
};
