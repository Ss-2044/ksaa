import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {AR, clamp, DarkFrame, EN, MAC, Music, NAVY} from './common';

export const QA_FRAMES = 600; // 20 s

const Stamp: React.FC<{text: string; at: number}> = ({text, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 9, mass: 0.6}});
  const out = interpolate(frame, [at + 30, at + 45], [1, 0], clamp);
  return frame >= at && out > 0 ? (
    <div dir="rtl" style={{position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center', fontFamily: AR, fontWeight: 800, fontSize: 150, color: '#FFE9A8', transform: `scale(${2 - p})`, opacity: Math.min(1, p * 1.5) * out}}>
      {text}
    </div>
  ) : null;
};

const Question: React.FC<{q: string; en: string}> = ({q, en}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14}});
  const up = interpolate(frame, [130, 160], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: interpolate(up, [0, 1], [520, 180]), textAlign: 'right', opacity: p}}>
      <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: interpolate(up, [0, 1], [76, 52]), color: '#fff', lineHeight: 1.3}}>
        {q}
      </div>
      <div style={{fontFamily: EN, fontWeight: 600, fontSize: 22, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)', marginTop: 8, textTransform: 'uppercase'}}>{en}</div>
    </div>
  );
};

const Explain: React.FC<{lines: string[]; from: number; top: number}> = ({lines, from, top}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top}}>
      {lines.map((l, i) => {
        const p = interpolate(frame, [from + i * 60, from + i * 60 + 18], [0, 1], clamp);
        return (
          <div key={i} dir="rtl" style={{fontFamily: AR, fontWeight: 600, fontSize: 38, lineHeight: 1.5, color: '#fff', opacity: p, transform: `translateY(${(1 - p) * 16}px)`, borderRight: '4px solid #7C83FF', paddingRight: 18, marginBottom: 18}}>
            {l}
          </div>
        );
      })}
    </div>
  );
};

const Closing: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [510, 530], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'rgba(13,15,34,0.95)', opacity: p, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: EN, fontWeight: 700, fontSize: 22, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)'}}>الخلاصة · TAKEAWAY</div>
      <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 60, color: '#fff', textAlign: 'center', lineHeight: 1.4, padding: '20px 80px'}}>
        {text}
      </div>
      <Img src={staticFile('nsg-logo.png')} style={{width: 340, marginTop: 50}} />
    </AbsoluteFill>
  );
};

// Q1 — can a satellite read your licence plate?
const PlateVisual: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [200, 260], [0, 1], clamp);
  return (
    <div dir="rtl" style={{position: 'absolute', top: 470, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', opacity: interpolate(frame, [180, 200], [0, 1], clamp)}}>
      <div style={{textAlign: 'center'}}>
        <div style={{width: 420, height: 160, background: '#fff', borderRadius: 14, border: `6px solid ${NAVY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: EN, fontWeight: 800, fontSize: 70, color: NAVY, letterSpacing: '0.1em', direction: 'ltr'}}>1234 ABC</div>
        <div style={{fontFamily: AR, fontWeight: 700, fontSize: 28, color: '#fff', marginTop: 14}}>ما تراه العين</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <div style={{width: 420, height: 160, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', borderRadius: 14, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)'}}>
          <div style={{background: `rgb(${200 - 40 * p},${200 - 40 * p},${205 - 40 * p})`}} />
          <div style={{background: `rgb(${190 - 30 * p},${190 - 30 * p},${198 - 30 * p})`}} />
        </div>
        <div style={{fontFamily: AR, fontWeight: 700, fontSize: 28, color: '#fff', marginTop: 14}}>بكسلات بدقة 30 سم</div>
      </div>
    </div>
  );
};
export const QAPlate: React.FC = () => (
  <DarkFrame series="سؤال شائع" seriesEn="COMMON QUESTION" source={`Illustration · Figures are typical for today's sharpest commercial imagery · ${MAC} — "Hyperfun"`}>
    <Question q="هل يستطيع القمر الصناعي قراءة لوحة سيارتك؟" en="Can a satellite read your licence plate?" />
    <Stamp text="لا." at={140} />
    <PlateVisual />
    <Explain from={280} top={760} lines={['أدق الصور التجارية اليوم تقارب 30 سم للبكسل الواحد.', 'والحرف في اللوحة بضعة سنتيمترات فقط… أصغر بكثير من بكسل واحد.', 'لذلك قد تظهر السيارة نفسها… لكن لا تُقرأ لوحتها.']} />
    <Closing text="الدقة العالية… ليست عدسة مكبّرة بلا حدود" />
    <Music src="music/hyperfun.mp3" volume={0.25} trimBefore={10} />
  </DarkFrame>
);

// Q2 — are map satellite images live?
const Steps: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = ['الالتقاط عند مرور القمر', 'الإرسال لمحطة أرضية', 'المعالجة والتصحيح', 'النشر في الخرائط'];
  return (
    <div dir="rtl" style={{position: 'absolute', top: 440, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 18}}>
      {steps.map((s, i) => {
        const p = interpolate(frame, [180 + i * 22, 196 + i * 22], [0, 1], clamp);
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, opacity: p}}>
            <div style={{width: 64, height: 64, borderRadius: '50%', background: '#7C83FF', color: NAVY, fontFamily: EN, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{fontFamily: AR, fontWeight: 700, fontSize: 36, color: '#fff'}}>{s}</div>
          </div>
        );
      })}
    </div>
  );
};
export const QALive: React.FC = () => (
  <DarkFrame series="سؤال شائع" seriesEn="COMMON QUESTION" source={`General explanation · ${MAC} — "Hyperfun"`}>
    <Question q="هل صور الأقمار في تطبيقات الخرائط… بث مباشر؟" en="Are map satellite images live?" />
    <Stamp text="غالباً لا." at={140} />
    <Steps />
    <Explain from={300} top={820} lines={['القمر في المدار المنخفض يمر فوق المكان دقائق معدودة ثم يبتعد.', 'ثم تُرسل الصور وتُعالج وتُجمع قبل نشرها.', 'لذلك قد يكون عمر الصورة في تطبيقات الخرائط شهوراً أو سنوات.']} />
    <Closing text="الصورة الفضائية… لقطة من الماضي القريب" />
    <Music src="music/hyperfun.mp3" volume={0.25} trimBefore={60} />
  </DarkFrame>
);
