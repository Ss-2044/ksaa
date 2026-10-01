import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {fonts} from '../theme';
import {clamp, NAVY} from './Shell';

// —— shared pieces ——
export const Photo: React.FC<{src: string; zoom?: [number, number]; pos?: string; pixel?: boolean}> = ({src, zoom = [1.12, 1.0], pos = '50% 50%', pixel}) => {
  const frame = useCurrentFrame();
  return <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, imageRendering: pixel ? 'pixelated' : undefined, transform: `scale(${interpolate(frame, [0, 165], zoom, clamp)})`}} />;
};

export const Chips: React.FC<{items: [string, string][]; cols?: number}> = ({items, cols = 2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{padding: 40, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 22, direction: 'rtl', alignContent: 'center'}}>
      {items.map(([ar, en], i) => {
        const p = spring({frame: frame - 8 - i * 7, fps, config: {damping: 14}});
        return (
          <div key={i} style={{background: '#fff', borderRadius: 24, padding: '22px 26px', transform: `scale(${p})`, opacity: Math.min(1, p)}}>
            <div style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 40, color: NAVY}}>{ar}</div>
            <div style={{fontFamily: fonts.en, fontWeight: 600, fontSize: 18, letterSpacing: '0.12em', color: 'rgba(22,24,47,0.6)', textTransform: 'uppercase', direction: 'ltr', textAlign: 'right'}}>{en}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Tag: React.FC<{x: number; y: number; ar: string; en?: string; at?: number; dot?: boolean}> = ({x, y, ar, en, at = 10, dot = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 14}});
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${p})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {dot ? <div style={{width: 20, height: 20, borderRadius: '50%', background: '#FFE9A8', boxShadow: '0 0 0 6px rgba(255,233,168,0.3)'}} /> : null}
      <div dir="rtl" style={{marginTop: 8, background: 'rgba(13,15,34,0.85)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', fontFamily: fonts.ar, fontWeight: 700, fontSize: 28, padding: '4px 14px', borderRadius: 10, whiteSpace: 'nowrap'}}>
        {ar} {en ? <span style={{fontFamily: fonts.en, fontSize: 15, fontWeight: 500, opacity: 0.7}}>{en}</span> : null}
      </div>
    </div>
  );
};

// —— EP01: what is geospatial data ——
export const V_Globe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: '#05060F'}}>
      <Img src={staticFile('space/earth-arabia-galileo.jpg')} style={{height: 600, WebkitMaskImage: 'radial-gradient(circle, #000 52%, transparent 70%)', transform: `scale(${interpolate(frame, [0, 105], [0.9, 1.1])})`}} />
    </AbsoluteFill>
  );
};

export const V_Equation: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const parts: [string, string, string][] = [
    ['ماذا؟', 'مدرسة', 'WHAT'],
    ['أين؟', '24.71° N · 46.67° E', 'WHERE'],
    ['متى؟', '2026', 'WHEN'],
  ];
  const eq = spring({frame: frame - 70, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 22, padding: 40}}>
      <div dir="rtl" style={{display: 'flex', gap: 18, alignItems: 'center'}}>
        {parts.map(([q, a, en], i) => {
          const p = spring({frame: frame - 6 - i * 14, fps, config: {damping: 14}});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <div style={{width: 260, background: '#fff', borderRadius: 24, padding: '22px 10px', textAlign: 'center', transform: `scale(${p})`}}>
                <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 16, letterSpacing: '0.3em', color: 'rgba(22,24,47,0.5)'}}>{en}</div>
                <div style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 44, color: NAVY}}>{q}</div>
                <div style={{fontFamily: i === 0 ? fonts.ar : fonts.en, fontWeight: 600, fontSize: i === 1 ? 20 : 30, color: '#6E74B8', marginTop: 6, direction: 'ltr'}}>{a}</div>
              </div>
              {i < 2 ? <div style={{fontFamily: fonts.en, fontWeight: 800, fontSize: 56, color: '#fff', opacity: p}}>+</div> : null}
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: fonts.en, fontWeight: 800, fontSize: 56, color: '#fff', opacity: eq}}>=</div>
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 52, color: NAVY, background: '#FFE9A8', padding: '14px 36px', borderRadius: 20, transform: `scale(${eq})`}}>
        معلومة جيومكانية
      </div>
    </AbsoluteFill>
  );
};

export const V_Sources: React.FC = () => (
  <Chips
    cols={2}
    items={[
      ['الأقمار الصناعية', 'Satellite imagery'],
      ['أنظمة الملاحة GNSS', 'GNSS / GPS'],
      ['الطائرات بدون طيار', 'Drones'],
      ['المسح الأرضي', 'Ground survey'],
      ['الحساسات وإنترنت الأشياء', 'Sensors & IoT'],
      ['السجلات والعناوين', 'Records & addresses'],
    ]}
  />
);

export const V_Forms: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [20, 70], [0, 1], clamp);
  const poly = interpolate(frame, [60, 90], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#16182F'}}>
      <Img src={staticFile('maps/riyadh-lines-z13.png')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55}} />
      <svg width={960} height={620} style={{position: 'absolute'}}>
        <polyline points="80,520 260,420 420,380 600,260 880,120" fill="none" stroke="#9DA2E6" strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - line} />
        <polygon points="560,380 760,360 800,520 600,560" fill="rgba(255,233,168,0.35)" stroke="#FFE9A8" strokeWidth={4} opacity={poly} />
        {[[200, 160], [330, 250], [700, 190]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={interpolate(frame, [5 + i * 6, 15 + i * 6], [0, 16], clamp)} fill="#fff" stroke={NAVY} strokeWidth={4} />
        ))}
      </svg>
      <div dir="rtl" style={{position: 'absolute', top: 24, right: 24, background: 'rgba(13,15,34,0.85)', borderRadius: 18, padding: '14px 20px', fontFamily: fonts.ar, fontSize: 28, color: '#fff', lineHeight: 1.7}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 18, height: 18, borderRadius: '50%', background: '#fff', display: 'inline-block'}} /> نقطة: مدرسة، بئر
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, color: '#9DA2E6'}}>
          <span style={{width: 26, height: 6, borderRadius: 3, background: '#9DA2E6', display: 'inline-block'}} /> خط: طريق، وادٍ
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, color: '#FFE9A8'}}>
          <span style={{width: 22, height: 16, background: 'rgba(255,233,168,0.5)', border: '2px solid #FFE9A8', display: 'inline-block'}} /> مساحة: حي، مزرعة
        </div>
      </div>
      <div style={{position: 'absolute', left: 24, bottom: 24, width: 230, height: 150, borderRadius: 14, overflow: 'hidden', border: '3px solid #fff'}}>
        <Img src={staticFile('space/jeddah-px30.png')} style={{width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated'}} />
        <div dir="rtl" style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(13,15,34,0.8)', color: '#fff', fontFamily: fonts.ar, fontSize: 22, textAlign: 'center'}}>
          صورة شبكية (Raster)
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const V_Uses: React.FC = () => (
  <Chips
    cols={2}
    items={[
      ['التخطيط العمراني', 'Urban planning'],
      ['الزراعة والمياه', 'Agriculture & water'],
      ['النقل والطرق', 'Transport'],
      ['البيئة والسواحل', 'Environment & coasts'],
      ['الطوارئ والكوارث', 'Emergency response'],
      ['الاتصالات والطاقة', 'Telecom & energy'],
    ]}
  />
);

// —— EP02: four kinds of resolution ——
export const V_Question: React.FC = () => <Photo src="space/jeddah.jpg" zoom={[1.0, 1.35]} />;

export const V_Spatial: React.FC = () => {
  const tiles: [string, string][] = [
    ['space/jeddah-px30.png', '30 م'],
    ['space/jeddah-px10.png', '10 م'],
    ['space/jeddah.jpg', 'أقل من 1 م'],
  ];
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill dir="rtl" style={{flexDirection: 'row', gap: 16, padding: 24}}>
      {tiles.map(([src, l], i) => (
        <div key={i} style={{flex: 1, position: 'relative', borderRadius: 18, overflow: 'hidden', opacity: interpolate(frame, [i * 10, i * 10 + 12], [0, 1], clamp)}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 60%', imageRendering: 'pixelated', transform: 'scale(1.6)'}} />
          <div style={{position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center'}}>
            <span style={{background: '#fff', color: NAVY, fontFamily: fonts.ar, fontWeight: 800, fontSize: 34, padding: '6px 20px', borderRadius: 999}}>{l}</span>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const V_Spectral: React.FC = () => {
  const frame = useCurrentFrame();
  const bands: [string, number, string][] = [
    ['أزرق', 0.1, '#4A6CFF'],
    ['أخضر', 0.24, '#3FD27A'],
    ['أحمر', 0.38, '#FF4D4D'],
    ['تحت الحمراء القريبة', 0.6, '#B04A6E'],
    ['تحت الحمراء القصيرة', 0.84, '#6B3A55'],
  ];
  return (
    <AbsoluteFill style={{padding: 40, justifyContent: 'center'}}>
      <div style={{position: 'relative', height: 90, borderRadius: 18, background: 'linear-gradient(90deg, #4A6CFF 0%, #3FD27A 22%, #FFD84D 32%, #FF4D4D 42%, #3a1e33 52%, #1a1020 100%)'}}>
        <div style={{position: 'absolute', left: '50%', top: -36, fontFamily: fonts.en, fontSize: 18, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.2em'}}>← VISIBLE | INFRARED →</div>
      </div>
      {bands.map(([n, x, c], i) => {
        const p = interpolate(frame, [10 + i * 12, 22 + i * 12], [0, 1], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: 40 + x * 880, top: 210 + (i % 2) * 150, transform: 'translateX(-50%)', textAlign: 'center', opacity: p}}>
            <div style={{width: 4, height: 60, background: c, margin: '0 auto'}} />
            <div dir="rtl" style={{background: '#fff', color: NAVY, fontFamily: fonts.ar, fontWeight: 700, fontSize: 26, padding: '6px 14px', borderRadius: 12, whiteSpace: 'nowrap'}}>
              {n}
            </div>
          </div>
        );
      })}
      <div dir="rtl" style={{position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.ar, fontSize: 30, color: 'rgba(255,255,255,0.85)'}}>
        كل نطاق… يكشف معلومة مختلفة
      </div>
    </AbsoluteFill>
  );
};

export const V_Temporal: React.FC = () => {
  const frame = useCurrentFrame();
  const rows: [string, number][] = [
    ['Landsat (قمر واحد)', 16],
    ['Sentinel-2 (قمران)', 5],
  ];
  return (
    <AbsoluteFill style={{padding: 40, justifyContent: 'center', gap: 50}}>
      {rows.map(([name, every], r) => (
        <div key={r}>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 32, color: '#fff', marginBottom: 14}}>
            {name} · <span style={{color: '#FFE9A8'}}>يعود كل {every} {every > 10 ? 'يوماً' : 'أيام'}</span>
          </div>
          <div style={{display: 'flex', gap: 6, direction: 'ltr'}}>
            {new Array(32).fill(0).map((_, d) => {
              const pass = d % every === 0;
              const on = frame > 10 + d * 3;
              return <div key={d} style={{flex: 1, height: 54, borderRadius: 8, background: pass && on ? '#FFE9A8' : 'rgba(255,255,255,0.12)', transform: pass && on ? 'scaleY(1.15)' : 'none'}} />;
            })}
          </div>
        </div>
      ))}
      <div style={{fontFamily: fonts.en, fontSize: 18, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.55)', textAlign: 'center'}}>32 DAYS · ONE BOX = ONE DAY</div>
    </AbsoluteFill>
  );
};

export const V_Radiometric: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = (n: number) => new Array(n).fill(0).map((_, i) => `rgb(${Math.round((i / (n - 1)) * 255)},${Math.round((i / (n - 1)) * 255)},${Math.round(40 + (i / (n - 1)) * 215)})`);
  const rows: [string, string[]][] = [
    ['2 بت = 4 مستويات', steps(4)],
    ['4 بت = 16 مستوى', steps(16)],
    ['8 بت = 256 مستوى', steps(64)],
  ];
  return (
    <AbsoluteFill style={{padding: 40, justifyContent: 'center', gap: 34}}>
      {rows.map(([l, cs], r) => (
        <div key={r} style={{opacity: interpolate(frame, [r * 14, r * 14 + 12], [0, 1], clamp)}}>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 30, color: '#fff', marginBottom: 10}}>
            {l}
          </div>
          <div style={{display: 'flex', height: 70, borderRadius: 12, overflow: 'hidden'}}>
            {cs.map((c, i) => (
              <div key={i} style={{flex: 1, background: c}} />
            ))}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// —— EP03: NDVI ——
export const V_Farm: React.FC = () => <Photo src="space/sirhan-2.jpg" zoom={[1.6, 1.15]} pos="62% 55%" />;

export const V_Leaf: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [10, 50], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const b = interpolate(frame, [50, 90], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <svg width={960} height={620}>
        <defs>
          <marker id="ah" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#fff" />
          </marker>
        </defs>
        <circle cx={120} cy={110} r={60} fill="#F5D76E" />
        {/* leaf */}
        <path d="M300,520 C380,360 620,330 720,420 C620,520 420,560 300,520 Z" fill="#3FD27A" />
        <path d="M320,515 C450,470 580,440 700,425" stroke="#1d7a43" strokeWidth={6} fill="none" />
        {/* red: absorbed */}
        <line x1={170} y1={150} x2={170 + 290 * a} y2={150 + 300 * a} stroke="#FF4D4D" strokeWidth={10} strokeLinecap="round" />
        <text x={190} y={300} fill="#FF4D4D" fontFamily="IBM Plex Sans Arabic" fontWeight={800} fontSize={34}>
          الأحمر يُمتص
        </text>
        {/* NIR: reflected */}
        <line x1={230} y1={120} x2={230 + 330 * a} y2={120 + 300 * a} stroke="#C77DFF" strokeWidth={10} strokeLinecap="round" />
        <line x1={560} y1={420} x2={560 + 260 * b} y2={420 - 330 * b} stroke="#C77DFF" strokeWidth={10} strokeLinecap="round" markerEnd={b > 0.95 ? 'url(#ah)' : undefined} />
        <text x={930} y={70} textAnchor="end" fill="#C77DFF" fontFamily="IBM Plex Sans Arabic" fontWeight={800} fontSize={34} opacity={b}>
          تحت الحمراء القريبة تنعكس
        </text>
      </svg>
    </AbsoluteFill>
  );
};

export const V_Formula: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 4, fps, config: {damping: 14}});
  const bar = interpolate(frame, [40, 80], [0, 1], clamp);
  const marks: [number, string][] = [
    [-1, 'ماء'],
    [0.1, 'تربة جرداء'],
    [0.4, 'نبات قليل'],
    [0.8, 'نبات كثيف'],
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50}}>
      <div style={{background: '#fff', borderRadius: 24, padding: '24px 40px', transform: `scale(${p})`, fontFamily: fonts.en, fontWeight: 800, fontSize: 52, color: NAVY, direction: 'ltr'}}>
        NDVI = <span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', fontSize: 38}}>
          <span style={{borderBottom: `4px solid ${NAVY}`, padding: '0 10px'}}>NIR − Red</span>
          <span>NIR + Red</span>
        </span>
      </div>
      <div style={{width: 860, position: 'relative', opacity: bar}}>
        <div style={{height: 46, borderRadius: 12, background: 'linear-gradient(90deg, #2b4bff, #8a6a4a 50%, #c7d96a 70%, #1f9d4a)'}} />
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: fonts.en, fontWeight: 700, fontSize: 24, color: '#fff', marginTop: 8, direction: 'ltr'}}>
          <span>−1</span>
          <span>0</span>
          <span>+1</span>
        </div>
        {marks.map(([v, l], i) => (
          <div key={i} dir="rtl" style={{position: 'absolute', top: -54, left: `${((v + 1) / 2) * 100}%`, transform: 'translateX(-50%)', fontFamily: fonts.ar, fontWeight: 700, fontSize: 24, color: '#fff', whiteSpace: 'nowrap'}}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const V_Jowf: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Photo src="space/al-jowf-pivots.jpg" zoom={[1.3, 1.1]} />
      {[[300, 220], [520, 330], [700, 180], [420, 470]].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x - 55, top: y - 55, width: 110, height: 110, borderRadius: '50%', border: '4px solid #fff', opacity: interpolate(frame, [20 + i * 10, 30 + i * 10], [0, 1], clamp)}} />
      ))}
      <div dir="rtl" style={{position: 'absolute', top: 20, right: 20, background: 'rgba(13,15,34,0.85)', color: '#fff', fontFamily: fonts.ar, fontWeight: 700, fontSize: 28, padding: '8px 18px', borderRadius: 12}}>
        ألوان كاذبة: الأحمر = نبات حي
      </div>
    </AbsoluteFill>
  );
};

export const V_AgriUses: React.FC = () => (
  <Chips
    cols={2}
    items={[
      ['متابعة نمو المحاصيل', 'Crop monitoring'],
      ['رصد الجفاف مبكراً', 'Drought early warning'],
      ['ترشيد مياه الري', 'Irrigation efficiency'],
      ['تقدير الإنتاج', 'Yield estimation'],
    ]}
  />
);

// —— EP04: night lights ——
export const V_Night: React.FC = () => <Photo src="space/riyadh-night.jpg" zoom={[1.0, 1.25]} />;

const NIGHT = 'textures/arabia-night.jpg';
const toXY = (lon: number, lat: number): [number, number] => [((lon - 34) / 22) * 960, ((33 - lat) / 17) * 741 - 60];

export const V_Arabia: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile(NIGHT)} style={{position: 'absolute', width: 960, height: 741, top: -60}} />
    <div dir="rtl" style={{position: 'absolute', bottom: 18, right: 18, background: 'rgba(13,15,34,0.85)', color: '#fff', fontFamily: fonts.ar, fontSize: 24, padding: '6px 14px', borderRadius: 10}}>
      NASA Black Marble 2016
    </div>
  </AbsoluteFill>
);

export const V_Clusters: React.FC = () => {
  const c: [string, number, number][] = [
    ['الرياض', 46.72, 24.69],
    ['جدة · مكة', 39.5, 21.5],
    ['الدمام', 50.1, 26.43],
    ['المدينة المنورة', 39.61, 24.47],
  ];
  return (
    <AbsoluteFill>
      <Img src={staticFile(NIGHT)} style={{position: 'absolute', width: 960, height: 741, top: -60, opacity: 0.85}} />
      {c.map(([n, lo, la], i) => {
        const [x, y] = toXY(lo, la);
        return <Tag key={i} x={x} y={y} ar={n} at={10 + i * 12} />;
      })}
    </AbsoluteFill>
  );
};

export const V_Proxy: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items: [string, string][] = [
    ['شدة الضوء', 'Light'],
    ['السكان', 'Population'],
    ['النشاط الاقتصادي', 'Activity'],
  ];
  return (
    <AbsoluteFill dir="rtl" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30}}>
      {items.map(([a, e], i) => {
        const p = spring({frame: frame - 6 - i * 16, fps, config: {damping: 14}});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 230, height: 230, borderRadius: '50%', background: i === 0 ? '#FFE9A8' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
              <div style={{fontFamily: fonts.ar, fontWeight: 800, fontSize: 36, color: NAVY, textAlign: 'center'}}>{a}</div>
              <div style={{fontFamily: fonts.en, fontSize: 16, letterSpacing: '0.2em', color: 'rgba(22,24,47,0.6)', textTransform: 'uppercase'}}>{e}</div>
            </div>
            {i < 2 ? <div style={{fontFamily: fonts.en, fontWeight: 800, fontSize: 50, color: '#fff', opacity: p}}>↔</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const V_LightUses: React.FC = () => (
  <Chips
    cols={2}
    items={[
      ['رصد التوسع العمراني', 'Urban expansion'],
      ['تخطيط شبكات الكهرباء', 'Power planning'],
      ['تقدير السكان', 'Population estimates'],
      ['متابعة التعافي بعد الكوارث', 'Disaster recovery'],
    ]}
  />
);
