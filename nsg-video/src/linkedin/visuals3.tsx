import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {fonts} from '../theme';
import {clamp, NAVY} from './Shell';
import {Photo} from './visuals';

const AR = fonts.ar;
const EN = fonts.en;
const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div dir="rtl" style={{position: 'absolute', background: 'rgba(13,15,34,0.85)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', fontFamily: AR, fontWeight: 700, fontSize: 28, padding: '6px 16px', borderRadius: 12, whiteSpace: 'nowrap', ...style}}>
    {children}
  </div>
);

// —— EP13 false colour ——
export const channelMap = (mode: 'natural' | 'false') => {
  const V: React.FC = () => {
    const frame = useCurrentFrame();
    const sensor: [string, string][] = mode === 'natural' ? [['أحمر', '#FF4D4D'], ['أخضر', '#3FD27A'], ['أزرق', '#4A6CFF']] : [['تحت الحمراء', '#C77DFF'], ['أحمر', '#FF4D4D'], ['أخضر', '#3FD27A']];
    const screen: [string, string][] = [['أحمر', '#FF4D4D'], ['أخضر', '#3FD27A'], ['أزرق', '#4A6CFF']];
    return (
      <AbsoluteFill style={{padding: 40}}>
        <div dir="rtl" style={{display: 'flex', justifyContent: 'space-between', fontFamily: AR, fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.7)', marginBottom: 20}}>
          <span>ما يلتقطه المستشعر</span>
          <span>ما تعرضه الشاشة</span>
        </div>
        {sensor.map(([s, c], i) => {
          const p = interpolate(frame, [10 + i * 15, 40 + i * 15], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div key={i} dir="rtl" style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 34}}>
              <div style={{width: 260, background: c, borderRadius: 18, padding: '16px 0', textAlign: 'center', fontFamily: AR, fontWeight: 800, fontSize: 34, color: '#fff'}}>{s}</div>
              <div style={{flex: 1, height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, position: 'relative'}}>
                <div style={{position: 'absolute', right: 0, width: `${p * 100}%`, height: '100%', background: '#fff', borderRadius: 4}} />
              </div>
              <div style={{width: 260, border: `4px solid ${screen[i][1]}`, borderRadius: 18, padding: '12px 0', textAlign: 'center', fontFamily: AR, fontWeight: 800, fontSize: 34, color: screen[i][1]}}>{screen[i][0]}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    );
  };
  return V;
};

// —— EP14 orthorectification ——
export const V_Ortho: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [30, 110], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const skew = (1 - t) * 14;
  const rot = (1 - t) * -6;
  const sc = 0.82 + 0.1 * t;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: '#0D0F22'}}>
      <Img src={staticFile('space/riyadh-1990.jpg')} style={{width: 900, transform: `perspective(1200px) rotateX(${(1 - t) * 18}deg) rotate(${rot}deg) skewX(${skew}deg) scale(${sc})`, opacity: 0.95}} />
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(255,233,168,0.55) 2px, transparent 2px), linear-gradient(90deg, rgba(255,233,168,0.55) 2px, transparent 2px)',
          backgroundSize: '96px 96px',
          backgroundPosition: '0 0',
          opacity: 0.8,
        }}
      />
      <Label style={{top: 16, right: 16}}>{t < 0.5 ? 'الصورة الخام: مائلة ومشوّهة' : 'بعد التصحيح: تطابق شبكة الخريطة'}</Label>
    </AbsoluteFill>
  );
};
export const V_Distort: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [10, 60], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={960} height={620}>
        <path d="M0,560 L200,560 L330,330 L460,250 L600,420 L760,560 L960,560 L960,620 L0,620 Z" fill="#4A4F87" />
        <g transform="translate(150 80)">
          <rect x={-22} y={-14} width={44} height={28} rx={5} fill="#fff" />
          <rect x={-80} y={-6} width={50} height={12} fill="#9DA2E6" />
          <rect x={30} y={-6} width={50} height={12} fill="#9DA2E6" />
        </g>
        <line x1={150} y1={95} x2={150 + (460 - 150) * p} y2={95 + (250 - 95) * p} stroke="#FFE9A8" strokeWidth={4} strokeDasharray="10 8" />
        <line x1={150} y1={95} x2={150 + (700 - 150) * p} y2={95 + (560 - 95) * p} stroke="#FFE9A8" strokeWidth={4} strokeDasharray="10 8" />
        <circle cx={460} cy={250} r={10} fill="#FF6B6B" opacity={p} />
        <circle cx={460} cy={560} r={10} fill="#7FD6C2" opacity={p} />
        <line x1={460} y1={250} x2={460} y2={560} stroke="#fff" strokeDasharray="6 6" opacity={p} />
      </svg>
      <Label style={{top: 20, right: 20}}>زاوية التصوير + ارتفاع الجبل = إزاحة</Label>
      <Label style={{bottom: 80, right: 20, fontSize: 22}}>القمة تظهر بعيدة عن موقعها الحقيقي</Label>
    </AbsoluteFill>
  );
};
export const V_GCP: React.FC = () => {
  const frame = useCurrentFrame();
  const pts = [[160, 140], [780, 120], [820, 470], [200, 500], [480, 300]];
  return (
    <AbsoluteFill>
      <Photo src="space/riyadh-2000.jpg" zoom={[1.1, 1.0]} />
      {pts.map(([x, y], i) => {
        const p = interpolate(frame, [10 + i * 10, 22 + i * 10], [0, 1], clamp);
        return (
          <svg key={i} width={80} height={80} style={{position: 'absolute', left: x - 40, top: y - 40, opacity: p, transform: `scale(${0.6 + 0.4 * p})`}}>
            <circle cx={40} cy={40} r={26} fill="none" stroke="#FFE9A8" strokeWidth={4} />
            <line x1={40} y1={4} x2={40} y2={76} stroke="#FFE9A8" strokeWidth={3} />
            <line x1={4} y1={40} x2={76} y2={40} stroke="#FFE9A8" strokeWidth={3} />
          </svg>
        );
      })}
      <Label style={{bottom: 16, right: 16}}>نقاط تحكم أرضية معروفة الإحداثيات</Label>
    </AbsoluteFill>
  );
};

// —— EP15 coordinates ——
export const V_Graticule: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [10, 60], [0, 1], clamp);
  const R = 260;
  return (
    <AbsoluteFill>
      <svg width={960} height={620} viewBox="-480 -310 960 620">
        <circle r={R} fill="#1A2A6C" stroke="#fff" strokeWidth={2} />
        {[-60, -30, 0, 30, 60].map((lat) => {
          const y = -Math.sin((lat * Math.PI) / 180) * R;
          const rx = Math.cos((lat * Math.PI) / 180) * R;
          return <ellipse key={lat} cx={0} cy={y} rx={rx} ry={rx * 0.12} fill="none" stroke={lat === 0 ? '#FFE9A8' : 'rgba(255,255,255,0.45)'} strokeWidth={lat === 0 ? 3 : 1.5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />;
        })}
        {[-60, -30, 0, 30, 60].map((lon) => (
          <ellipse key={`m${lon}`} cx={0} cy={0} rx={Math.abs(Math.sin((lon * Math.PI) / 180)) * R} ry={R} fill="none" stroke={lon === 0 ? '#7FD6C2' : 'rgba(255,255,255,0.35)'} strokeWidth={lon === 0 ? 3 : 1.5} opacity={p} />
        ))}
        <circle cx={Math.sin((46.7 - 20) * Math.PI / 180) * R * Math.cos((24.7 * Math.PI) / 180)} cy={-Math.sin((24.7 * Math.PI) / 180) * R} r={interpolate(frame, [60, 75], [0, 14], clamp)} fill="#FFE9A8" />
      </svg>
      <Label style={{top: 20, right: 20, color: '#FFE9A8'}}>دوائر العرض: شمال وجنوب خط الاستواء</Label>
      <Label style={{top: 74, right: 20, color: '#7FD6C2'}}>خطوط الطول: شرق وغرب غرينتش</Label>
    </AbsoluteFill>
  );
};
export const V_Riyadh: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - 6, fps, config: {damping: 14}});
  return (
    <AbsoluteFill>
      <Photo src="space/riyadh-night.jpg" zoom={[1.0, 1.2]} />
      <AbsoluteFill style={{background: 'rgba(13,15,34,0.45)', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{background: '#fff', borderRadius: 26, padding: '22px 40px', transform: `scale(${p})`, textAlign: 'center'}}>
          <div style={{fontFamily: AR, fontWeight: 800, fontSize: 44, color: NAVY}}>الرياض</div>
          <div style={{fontFamily: EN, fontWeight: 800, fontSize: 56, color: NAVY, direction: 'ltr'}}>24.71° N · 46.67° E</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const V_Decimals: React.FC = () => {
  const frame = useCurrentFrame();
  const rows: [string, string][] = [
    ['24.7', '≈ 11 كم'],
    ['24.71', '≈ 1.1 كم'],
    ['24.713', '≈ 110 م'],
    ['24.71368', '≈ 1 م'],
  ];
  return (
    <AbsoluteFill style={{padding: 50, justifyContent: 'center', gap: 22}}>
      {rows.map(([v, d], i) => (
        <div key={i} dir="rtl" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i === rows.length - 1 ? '#FFE9A8' : '#fff', borderRadius: 18, padding: '14px 30px', opacity: interpolate(frame, [8 + i * 14, 20 + i * 14], [0, 1], clamp)}}>
          <span style={{fontFamily: AR, fontWeight: 800, fontSize: 38, color: NAVY}}>دقة {d}</span>
          <span style={{fontFamily: EN, fontWeight: 800, fontSize: 40, color: NAVY, direction: 'ltr'}}>{v}°</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// —— EP16 dust ——
export const V_DustCompare: React.FC = () => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [20, 100], [100, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Img src={staticFile('space/dust-storm.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img src={staticFile('space/dust-clear.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', clipPath: `inset(0 0 0 ${100 - s}%)`}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${100 - s}%`, width: 4, background: '#fff'}} />
      <Label style={{top: 16, right: 16}}>11 أبريل 2004 · صافٍ</Label>
      <Label style={{top: 16, left: 16}}>13 مايو 2004 · عاصفة</Label>
      <Label style={{bottom: 16, right: 16, fontSize: 20}}>NASA Terra · MISR</Label>
    </AbsoluteFill>
  );
};
export const V_DustDepth: React.FC = () => (
  <AbsoluteFill>
    <Photo src="space/dust-depth.jpg" zoom={[1.05, 1.0]} />
    <div style={{position: 'absolute', left: 20, bottom: 20, width: 320, height: 22, borderRadius: 6, background: 'linear-gradient(90deg, #1a1aff, #00e5ff, #3dff3d, #ffff00, #ff2a00)'}} />
    <div style={{position: 'absolute', left: 20, bottom: 48, width: 320, display: 'flex', justifyContent: 'space-between', fontFamily: AR, fontWeight: 700, fontSize: 20, color: '#fff'}}>
      <span>خفيف</span>
      <span>كثيف</span>
    </div>
    <Label style={{top: 16, right: 16}}>العمق البصري للغبار</Label>
  </AbsoluteFill>
);

// —— EP17 suitability (map algebra) ——
const layerFill = (seed: string, hue: string) => {
  const cells = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) cells.push(random(`${seed}${x}-${y}`));
  return {cells, hue};
};
const LAYERS = [
  {name: 'الإشعاع الشمسي', ...layerFill('sun', '255,200,80')},
  {name: 'انحدار الأرض', ...layerFill('slope', '157,162,230')},
  {name: 'القرب من الشبكة', ...layerFill('grid', '127,214,194')},
];
export const V_Layers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill dir="rtl" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 26}}>
      {LAYERS.map((l, i) => {
        const p = interpolate(frame, [i * 14, i * 14 + 16], [0, 1], clamp);
        return (
          <div key={i} style={{textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
            <div style={{width: 260, height: 260, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', borderRadius: 16, overflow: 'hidden', border: '2px solid #fff'}}>
              {l.cells.map((v, k) => (
                <div key={k} style={{background: `rgba(${l.hue},${0.15 + v * 0.85})`}} />
              ))}
            </div>
            <div style={{fontFamily: AR, fontWeight: 800, fontSize: 30, color: '#fff', marginTop: 12}}>{l.name}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const V_Suitability: React.FC = () => {
  const frame = useCurrentFrame();
  const scores = LAYERS[0].cells.map((_, k) => LAYERS[0].cells[k] * 0.5 + LAYERS[1].cells[k] * 0.3 + LAYERS[2].cells[k] * 0.2);
  const best = scores.map((v, k) => [v, k]).sort((a, b) => b[0] - a[0]).slice(0, 5).map((x) => x[1]);
  const show = interpolate(frame, [50, 70], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 40}}>
      <div style={{width: 420, height: 420, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', borderRadius: 20, overflow: 'hidden', border: '3px solid #fff'}}>
        {scores.map((v, k) => {
          const on = best.includes(k) && show > 0.5;
          return <div key={k} style={{background: `rgb(${Math.round(30 + v * 200)},${Math.round(40 + v * 180)},${Math.round(90 + v * 60)})`, outline: on ? '4px solid #FFE9A8' : 'none', outlineOffset: -4, opacity: interpolate(frame, [k * 0.6, k * 0.6 + 10], [0, 1], clamp)}} />;
        })}
      </div>
      <div dir="rtl" style={{fontFamily: EN, fontWeight: 700, fontSize: 30, color: '#fff', lineHeight: 1.8}}>
        <div style={{fontFamily: AR}}>الملاءمة =</div>
        <div>0.5 × ☀</div>
        <div>+ 0.3 × ⛰</div>
        <div>+ 0.2 × ⚡</div>
        <div style={{fontFamily: AR, fontSize: 24, color: '#FFE9A8', opacity: show}}>■ أفضل المواقع</div>
      </div>
    </AbsoluteFill>
  );
};

// —— EP18 AI detection ——
export const V_Detect: React.FC = () => {
  const frame = useCurrentFrame();
  const boxes = new Array(26).fill(0).map((_, i) => [40 + random(`bx${i}`) * 820, 40 + random(`by${i}`) * 500, 50 + random(`bs${i}`) * 30]);
  const n = Math.floor(interpolate(frame, [15, 120], [0, boxes.length], clamp));
  return (
    <AbsoluteFill>
      <Photo src="space/al-jowf-pivots.jpg" zoom={[1.2, 1.2]} />
      {boxes.slice(0, n).map(([x, y, s], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, border: '3px solid #FFE9A8', borderRadius: 4}}>
          <div style={{position: 'absolute', top: -20, left: -3, background: '#FFE9A8', color: NAVY, fontFamily: EN, fontWeight: 700, fontSize: 12, padding: '0 4px'}}>field {(0.8 + random(`c${i}`) * 0.19).toFixed(2)}</div>
        </div>
      ))}
      <Label style={{bottom: 16, right: 16}}>
        حقول مكتشفة: <span style={{fontFamily: EN}}>{n}</span>
      </Label>
      <Label style={{bottom: 16, left: 16, fontSize: 20}}>عرض توضيحي</Label>
    </AbsoluteFill>
  );
};
export const V_Train: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const steps: [string, string][] = [
    ['أمثلة معلَّمة', 'Labelled examples'],
    ['تدريب النموذج', 'Training'],
    ['اكتشاف تلقائي', 'Detection'],
    ['مراجعة بشرية', 'Human review'],
  ];
  return (
    <AbsoluteFill dir="rtl" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20}}>
      {steps.map(([a, e], i) => {
        const p = spring({frame: frame - 6 - i * 14, fps, config: {damping: 14}});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div style={{width: 190, height: 190, borderRadius: 24, background: i === 3 ? '#FFE9A8' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, padding: 10}}>
              <div style={{fontFamily: EN, fontWeight: 800, fontSize: 30, color: 'rgba(22,24,47,0.4)'}}>0{i + 1}</div>
              <div style={{fontFamily: AR, fontWeight: 800, fontSize: 30, color: NAVY, textAlign: 'center'}}>{a}</div>
              <div style={{fontFamily: EN, fontSize: 14, color: 'rgba(22,24,47,0.6)'}}>{e}</div>
            </div>
            {i < 3 ? <div style={{fontFamily: EN, fontWeight: 800, fontSize: 40, color: '#fff', opacity: p}}>←</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// —— EP19 swath ——
export const V_Swath: React.FC = () => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [10, 150], [0, 620], clamp);
  return (
    <AbsoluteFill style={{background: '#0D0F22'}}>
      <div style={{position: 'absolute', left: 300, width: 360, top: 0, height: y, overflow: 'hidden'}}>
        <Img src={staticFile('space/rub-al-khali.jpg')} style={{width: 960, height: 620, objectFit: 'cover', marginLeft: -300}} />
      </div>
      <div style={{position: 'absolute', left: 300, width: 360, top: y - 3, height: 6, background: '#FFE9A8', boxShadow: '0 0 20px #FFE9A8'}} />
      <svg width={960} height={620} style={{position: 'absolute'}}>
        <g transform={`translate(480 ${Math.max(40, y - 90)})`}>
          <rect x={-18} y={-12} width={36} height={24} rx={5} fill="#fff" />
          <rect x={-70} y={-5} width={46} height={10} fill="#9DA2E6" />
          <rect x={24} y={-5} width={46} height={10} fill="#9DA2E6" />
        </g>
        <line x1={300} y1={600} x2={660} y2={600} stroke="#fff" strokeWidth={3} />
      </svg>
      <Label style={{bottom: 34, left: '50%', transform: 'translateX(-50%)'}}>عرض الشريط (Swath)</Label>
      <Label style={{top: 16, right: 16, fontSize: 22}}>المستشعر يمسح خطاً بعد خط</Label>
    </AbsoluteFill>
  );
};
export const V_SwathWidths: React.FC = () => {
  const frame = useCurrentFrame();
  const rows: [string, number][] = [
    ['Landsat 8/9', 185],
    ['Sentinel-2', 290],
  ];
  return (
    <AbsoluteFill style={{padding: 50, justifyContent: 'center', gap: 50}}>
      {rows.map(([n, km], i) => {
        const p = interpolate(frame, [10 + i * 20, 50 + i * 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <div key={i}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: EN, fontWeight: 700, fontSize: 32, color: '#fff', marginBottom: 10}}>
              <span>{n}</span>
              <span>{Math.round(km * p)} km</span>
            </div>
            <div style={{height: 60, width: `${(km / 300) * 100 * p}%`, background: i ? '#7FD6C2' : '#9DA2E6', borderRadius: 12}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// —— EP20 cloud-free composite ——
export const cloudyTile = (k: number) => {
  const V: React.FC = () => (
    <AbsoluteFill>
      <Img src={staticFile('textures/arabia-day.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img src={staticFile(`textures/clouds-${k}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: 0.95}} />
      <Label style={{top: 16, right: 16}}>اليوم {k + 1}</Label>
    </AbsoluteFill>
  );
  return V;
};
export const V_Composite: React.FC = () => {
  const frame = useCurrentFrame();
  const merge = interpolate(frame, [40, 110], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Img src={staticFile('textures/arabia-day.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      {[0, 1, 2].map((k) => (
        <Img key={k} src={staticFile(`textures/clouds-${k}.jpg`)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen', opacity: (1 - merge) * 0.5}} />
      ))}
      <Label style={{top: 16, right: 16}}>{merge < 0.5 ? 'نجمع أصفى بكسل من كل يوم…' : 'صورة مركّبة بلا غيوم'}</Label>
      <Label style={{bottom: 16, right: 16, fontSize: 20}}>NASA Blue Marble · صورة مركّبة</Label>
    </AbsoluteFill>
  );
};
