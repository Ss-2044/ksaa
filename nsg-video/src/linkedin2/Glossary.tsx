import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {InkLogo} from '../designC/InkLogo';
import {LightBg} from '../designC/LightBg';
import {C} from '../designC/theme';
import {useFonts} from '../Video';
import {AR, clamp, EN, MAC, Music} from './common';

export const GLOSS_FRAMES = 450; // 15 s

type Term = {abbr: string; full: string; ar: string; def: string; example: string; icon: 'radar' | 'terrain' | 'leaf' | 'gnss' | 'pixel' | 'lidar'};
export const TERMS: Record<string, Term> = {
  sar: {abbr: 'SAR', full: 'Synthetic Aperture Radar', ar: 'رادار الفتحة الاصطناعية', def: 'رادار يصنع صوراً للأرض بإرسال موجات واستقبال صداها، فيعمل ليلاً وعبر الغيوم.', example: 'مثال: رسم امتداد مياه السيول حتى تحت الغيوم.', icon: 'radar'},
  dem: {abbr: 'DEM', full: 'Digital Elevation Model', ar: 'نموذج الارتفاع الرقمي', def: 'شبكة من الخلايا، في كل خلية قيمة ارتفاع سطح الأرض عن مستوى البحر.', example: 'مثال: تحديد مسار طريق جبلي بأقل انحدار.', icon: 'terrain'},
  ndvi: {abbr: 'NDVI', full: 'Normalized Difference Vegetation Index', ar: 'مؤشر الغطاء النباتي', def: 'مؤشر من −1 إلى +1 يقارن الأشعة تحت الحمراء القريبة بالضوء الأحمر لقياس كثافة النبات وصحته.', example: 'مثال: كشف الحقول المتأثرة بالجفاف مبكراً.', icon: 'leaf'},
  gnss: {abbr: 'GNSS', full: 'Global Navigation Satellite Systems', ar: 'أنظمة الملاحة العالمية بالأقمار الصناعية', def: 'اسم جامع لأنظمة تحديد الموقع مثل GPS وGalileo وGLONASS وBeiDou.', example: 'مثال: الملاحة في جوالك تستقبل أكثر من نظام معاً.', icon: 'gnss'},
  gsd: {abbr: 'GSD', full: 'Ground Sample Distance', ar: 'المسافة الأرضية للبكسل', def: 'المسافة على الأرض بين مراكز بكسلين متجاورين في الصورة، وهي مقياس للدقة المكانية.', example: 'مثال: GSD نصف متر يعني أن كل بكسل يغطي نصف متر.', icon: 'pixel'},
  lidar: {abbr: 'LiDAR', full: 'Light Detection and Ranging', ar: 'الكشف وتحديد المدى بالضوء', def: 'نبضات ليزر تقيس المسافة إلى السطح، فتُنتج ملايين النقاط ثلاثية الأبعاد.', example: 'مثال: نماذج ثلاثية الأبعاد دقيقة للمدن والمباني.', icon: 'lidar'},
};

const Icon: React.FC<{kind: Term['icon']; t: number}> = ({kind, t}) => {
  const ink = C.ink;
  const acc = C.accent;
  if (kind === 'radar')
    return (
      <svg width={420} height={300} viewBox="0 0 420 300">
        <rect x={20} y={30} width={50} height={30} rx={6} fill={ink} />
        {[0, 1, 2].map((k) => {
          const p = (t / 40 + k / 3) % 1;
          return <path key={k} d={`M70,45 Q${120 + p * 200},${45 + p * 150} ${120 + p * 260},${260}`} fill="none" stroke={acc} strokeWidth={4} opacity={1 - p} />;
        })}
        <rect x={0} y={262} width={420} height={38} fill={ink} opacity={0.15} />
      </svg>
    );
  if (kind === 'terrain')
    return (
      <svg width={420} height={300} viewBox="0 0 420 300">
        {[0, 1, 2, 3, 4].map((r) => (
          <path key={r} d={`M0,${250 - r * 10} ${new Array(15).fill(0).map((_, i) => `L${i * 30},${250 - r * 10 - Math.max(0, Math.sin((i / 14) * Math.PI) * (160 - r * 30) * Math.min(1, t / 40))}`).join(' ')}`} fill="none" stroke={r === 0 ? ink : acc} strokeWidth={r === 0 ? 4 : 2} opacity={1 - r * 0.15} />
        ))}
      </svg>
    );
  if (kind === 'leaf')
    return (
      <svg width={420} height={300} viewBox="0 0 420 300">
        <path d="M90,250 C130,120 300,90 340,160 C290,240 170,280 90,250 Z" fill="#3FD27A" />
        <line x1={60} y1={20} x2={60 + 150 * Math.min(1, t / 30)} y2={20 + 200 * Math.min(1, t / 30)} stroke="#FF4D4D" strokeWidth={8} />
        <line x1={120} y1={10} x2={210} y2={180} stroke="#C77DFF" strokeWidth={8} opacity={Math.min(1, t / 30)} />
        <line x1={210} y1={180} x2={210 + 150 * Math.min(1, Math.max(0, (t - 30) / 30))} y2={180 - 170 * Math.min(1, Math.max(0, (t - 30) / 30))} stroke="#C77DFF" strokeWidth={8} />
      </svg>
    );
  if (kind === 'gnss')
    return (
      <svg width={420} height={300} viewBox="0 0 420 300">
        {[[60, 50], [200, 20], [350, 60], [300, 130]].map(([x, y], i) => (
          <g key={i} opacity={Math.min(1, Math.max(0, (t - i * 8) / 15))}>
            <rect x={x - 14} y={y - 10} width={28} height={20} rx={4} fill={ink} />
            <line x1={x} y1={y} x2={210} y2={260} stroke={acc} strokeWidth={3} strokeDasharray="8 6" />
          </g>
        ))}
        <circle cx={210} cy={260} r={14} fill={acc} />
      </svg>
    );
  if (kind === 'pixel')
    return (
      <svg width={420} height={300} viewBox="0 0 420 300">
        {new Array(6 * 4).fill(0).map((_, i) => {
          const x = (i % 6) * 60 + 30;
          const y = Math.floor(i / 6) * 60 + 30;
          return <rect key={i} x={x} y={y} width={56} height={56} fill={ink} opacity={0.15 + random(`px${i}`) * 0.6 * Math.min(1, t / 30)} />;
        })}
        <line x1={58} y1={290} x2={118} y2={290} stroke={acc} strokeWidth={4} />
        <text x={88} y={282} textAnchor="middle" fill={acc} fontFamily="Montserrat" fontWeight={700} fontSize={18}>
          GSD
        </text>
      </svg>
    );
  return (
    <svg width={420} height={300} viewBox="0 0 420 300">
      <rect x={190} y={10} width={40} height={24} rx={5} fill={ink} />
      {new Array(140).fill(0).map((_, i) => {
        const x = 20 + random(`lx${i}`) * 380;
        const base = x > 120 && x < 300 ? 140 + (x > 160 && x < 260 ? -60 : 0) : 250;
        const y = base + random(`ly${i}`) * 20;
        return <circle key={i} cx={x} cy={y} r={3} fill={acc} opacity={i / 140 < t / 60 ? 1 : 0} />;
      })}
      {t % 20 < 10 ? <line x1={210} y1={34} x2={20 + ((t * 7) % 380)} y2={240} stroke="#FF6B6B" strokeWidth={2} /> : null}
    </svg>
  );
};

const GlossaryView: React.FC<{term: Term}> = ({term}) => {
  useFonts();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const big = spring({frame, fps, config: {damping: 12}});
  const shrink = interpolate(frame, [55, 80], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const def = interpolate(frame, [80, 100], [0, 1], clamp);
  const ex = interpolate(frame, [270, 290], [0, 1], clamp);
  const end = interpolate(frame, [380, 400], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <LightBg />
      <div style={{position: 'absolute', top: 60, left: 60, right: 60, display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 32, color: '#fff', background: C.ink, padding: '4px 18px', borderRadius: 10}}>
          مصطلح في 15 ثانية
        </div>
        <InkLogo width={150} />
      </div>
      {/* the term */}
      <div style={{position: 'absolute', left: 0, right: 0, top: interpolate(shrink, [0, 1], [420, 170]), textAlign: 'center', transform: `scale(${interpolate(shrink, [0, 1], [1, 0.55]) * big})`, transformOrigin: 'center top'}}>
        <div style={{fontFamily: EN, fontWeight: 800, fontSize: 260, color: C.ink, lineHeight: 1, letterSpacing: '-0.02em'}}>{term.abbr}</div>
        <div style={{fontFamily: EN, fontWeight: 600, fontSize: 34, letterSpacing: '0.12em', color: C.muted, marginTop: 10}}>{term.full}</div>
      </div>
      <div dir="rtl" style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: AR, fontWeight: 800, fontSize: 58, color: C.accent, opacity: def}}>
        {term.ar}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, display: 'flex', justifyContent: 'center', opacity: def}}>
        <Icon kind={term.icon} t={Math.max(0, frame - 90)} />
      </div>
      <div dir="rtl" style={{position: 'absolute', left: 80, right: 80, top: 850, fontFamily: AR, fontWeight: 600, fontSize: 44, lineHeight: 1.55, color: C.ink, textAlign: 'center', opacity: def, transform: `translateY(${(1 - def) * 20}px)`}}>
        {term.def}
      </div>
      <div dir="rtl" style={{position: 'absolute', left: 80, right: 80, top: 1090, textAlign: 'center', opacity: ex}}>
        <span style={{display: 'inline-block', background: C.ink, color: '#fff', fontFamily: AR, fontWeight: 600, fontSize: 36, padding: '14px 28px', borderRadius: 20, lineHeight: 1.5}}>{term.example}</span>
      </div>
      <AbsoluteFill style={{background: C.paper, opacity: end, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: EN, fontWeight: 800, fontSize: 120, color: C.ink}}>{term.abbr}</div>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 46, color: C.accent, marginBottom: 60}}>
          {term.ar}
        </div>
        <InkLogo width={340} />
        <div dir="rtl" style={{fontFamily: AR, fontSize: 30, color: C.muted, marginTop: 30}}>
          تابعونا لمصطلح جديد كل أسبوع
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', fontFamily: EN, fontSize: 14, color: C.muted}}>{MAC} — "Clean Soul"</div>
      <Music src="music/clean-soul.mp3" volume={0.35} trimBefore={90} />
    </AbsoluteFill>
  );
};

export const GlossaryById: React.FC<{id: string}> = ({id}) => <GlossaryView term={TERMS[id]} />;
