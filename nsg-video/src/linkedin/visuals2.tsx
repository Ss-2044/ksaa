import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {fonts} from '../theme';
import {clamp, NAVY} from './Shell';
import {Chips, Photo} from './visuals';

const AR = fonts.ar;
const EN = fonts.en;
const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div dir="rtl" style={{position: 'absolute', background: 'rgba(13,15,34,0.85)', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', fontFamily: AR, fontWeight: 700, fontSize: 28, padding: '6px 16px', borderRadius: 12, ...style}}>
    {children}
  </div>
);

// —— EP05 orbits ——
const ORBITS = [
  {r: 150, ar: 'منخفض LEO', alt: '160 – 2,000 كم', speed: 0.06},
  {r: 225, ar: 'متوسط MEO', alt: '≈ 20,200 كم (GPS)', speed: 0.025},
  {r: 290, ar: 'ثابت GEO', alt: '35,786 كم', speed: 0.01},
];
export const orbitVisual = (hi: number) => {
  const V: React.FC = () => {
    const frame = useCurrentFrame();
    return (
      <AbsoluteFill>
        <svg width={960} height={620} viewBox="-480 -310 960 620">
          <defs>
            <radialGradient id="eg" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#7FA6FF" />
              <stop offset="100%" stopColor="#1A2A6C" />
            </radialGradient>
          </defs>
          {ORBITS.map((o, i) => {
            const on = hi === -1 || i === hi;
            const a = frame * o.speed + i;
            return (
              <g key={i} opacity={on ? 1 : 0.25}>
                <ellipse rx={o.r * 1.3} ry={o.r * 0.9} fill="none" stroke="#fff" strokeWidth={on ? 3 : 1.5} strokeDasharray={i === 1 ? '6 8' : undefined} />
                <circle cx={Math.cos(a) * o.r * 1.3} cy={Math.sin(a) * o.r * 0.9} r={on ? 12 : 7} fill={on ? '#FFE9A8' : '#fff'} />
              </g>
            );
          })}
          <circle r={95} fill="url(#eg)" />
        </svg>
        {ORBITS.map((o, i) =>
          hi === -1 || i === hi ? (
            <Label key={i} style={{top: 30 + (hi === -1 ? i * 58 : 0), right: 30}}>
              {o.ar} · <span style={{fontFamily: EN, fontSize: 22}}>{o.alt}</span>
            </Label>
          ) : null,
        )}
      </AbsoluteFill>
    );
  };
  return V;
};

// —— EP06 GPS ——
export const V_Signal: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={960} height={620}>
        <g transform="translate(480 130)">
          <rect x={-22} y={-16} width={44} height={32} rx={6} fill="#fff" />
          <rect x={-90} y={-8} width={56} height={16} fill="#9DA2E6" />
          <rect x={34} y={-8} width={56} height={16} fill="#9DA2E6" />
          {[0, 1, 2, 3].map((k) => {
            const p = ((frame / 40 + k / 4) % 1);
            return <circle key={k} r={30 + p * 420} fill="none" stroke="#FFE9A8" strokeWidth={3} opacity={1 - p} />;
          })}
        </g>
      </svg>
      <Label style={{bottom: 40, left: '50%', transform: 'translateX(-50%)', fontSize: 32}}>
        «أنا القمر رقم… والوقت الآن…»
      </Label>
    </AbsoluteFill>
  );
};

export const V_Distance: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [10, 70], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <svg width={860} height={200}>
        <rect x={10} y={80} width={60} height={40} rx={6} fill="#fff" />
        <circle cx={800} cy={100} r={26} fill="#FFE9A8" />
        <line x1={70} y1={100} x2={70 + 704 * t} y2={100} stroke="#FFE9A8" strokeWidth={6} strokeDasharray="14 10" />
        <text x={430} y={60} textAnchor="middle" fill="#fff" fontFamily="Montserrat" fontWeight={700} fontSize={30}>
          Δt
        </text>
      </svg>
      <div style={{background: '#fff', borderRadius: 22, padding: '18px 34px', fontFamily: EN, fontWeight: 800, fontSize: 44, color: NAVY, direction: 'ltr'}}>
        distance = c × Δt
      </div>
      <div dir="rtl" style={{fontFamily: AR, fontSize: 30, color: 'rgba(255,255,255,0.85)'}}>
        c = سرعة الضوء ≈ 300,000 كم في الثانية
      </div>
    </AbsoluteFill>
  );
};

export const V_Trilat: React.FC = () => {
  const frame = useCurrentFrame();
  const P = [520, 330];
  const S: [number, number, string][] = [
    [300, 180, '#9DA2E6'],
    [700, 160, '#7FD6C2'],
    [560, 560, '#FFB86B'],
  ];
  return (
    <AbsoluteFill>
      <svg width={960} height={620}>
        {S.map(([x, y, c], i) => {
          const r = Math.hypot(P[0] - x, P[1] - y);
          const p = interpolate(frame, [i * 15, i * 15 + 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r * p} fill="none" stroke={c} strokeWidth={4} />
              <circle cx={x} cy={y} r={12} fill={c} />
            </g>
          );
        })}
        <circle cx={P[0]} cy={P[1]} r={interpolate(frame, [70, 85], [0, 16], clamp)} fill="#fff" stroke={NAVY} strokeWidth={4} />
      </svg>
      <Label style={{left: P[0] + 26, top: P[1] - 20, opacity: interpolate(frame, [80, 92], [0, 1], clamp)}}>أنت هنا</Label>
    </AbsoluteFill>
  );
};

export const V_Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items: [string, string][] = [
    ['ساعات ذرية', 'Atomic clocks · في القمر'],
    ['ساعة عادية', 'Quartz clock · في جوالك'],
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 30, flexDirection: 'row', direction: 'rtl'}}>
      {items.map(([a, e], i) => {
        const p = spring({frame: frame - 6 - i * 14, fps, config: {damping: 14}});
        const ang = frame * (i === 0 ? 6 : 6.4);
        return (
          <div key={i} style={{width: 380, textAlign: 'center', transform: `scale(${p})`}}>
            <svg width={220} height={220} viewBox="-110 -110 220 220">
              <circle r={100} fill="#fff" />
              <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * 80} y2={-Math.cos((ang * Math.PI) / 180) * 80} stroke={NAVY} strokeWidth={6} strokeLinecap="round" />
              <circle r={8} fill={NAVY} />
            </svg>
            <div style={{fontFamily: AR, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 12}}>{a}</div>
            <div style={{fontFamily: EN, fontSize: 20, color: 'rgba(255,255,255,0.65)'}}>{e}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// —— EP07 Riyadh archive ——
export const yearPhoto = (src: string, year: string, sensor: string) => {
  const V: React.FC = () => (
    <AbsoluteFill>
      <Photo src={src} zoom={[1.15, 1.0]} />
      <div style={{position: 'absolute', top: 18, left: 24, fontFamily: EN, fontWeight: 800, fontSize: 110, color: 'transparent', WebkitTextStroke: '3px #fff', lineHeight: 1}}>{year}</div>
      <Label style={{bottom: 20, right: 20, fontFamily: EN, fontSize: 22}}>{sensor}</Label>
    </AbsoluteFill>
  );
  return V;
};

// —— EP08 DEM ——
export const V_DemNumbers: React.FC = () => {
  const frame = useCurrentFrame();
  const vals = [
    [127, 449, 498, 565, 1098, 2179, 1962, 1939],
    [202, 274, 619, 825, 1738, 2294, 2027, 2018],
    [1, 123, 232, 315, 1303, 1712, 1647, 2174],
    [0, 26, 82, 115, 218, 688, 1645, 2023],
    [0, 0, 0, 33, 87, 152, 660, 649],
  ];
  return (
    <AbsoluteFill>
      <Img src={staticFile('space/asir-dem-gray.png')} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85}} />
      <div style={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', direction: 'ltr'}}>
        {vals.flat().map((v, i) => (
          <div key={i} style={{border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: EN, fontWeight: 700, fontSize: 24, color: v > 1500 ? NAVY : '#fff', opacity: interpolate(frame, [i * 1.5, i * 1.5 + 8], [0, 1], clamp)}}>
            {v}
          </div>
        ))}
      </div>
      <Label style={{bottom: 16, right: 16, fontSize: 22}}>قيم حقيقية بالمتر · عسير</Label>
    </AbsoluteFill>
  );
};
export const V_DemColor: React.FC = () => (
  <AbsoluteFill>
    <Photo src="space/asir-dem-color.png" zoom={[1.0, 1.1]} />
    <div style={{position: 'absolute', left: 20, bottom: 20, width: 300, height: 22, borderRadius: 6, background: 'linear-gradient(90deg, #171A33, #2C2E4D, #4A4F87, #8C94D6, #F8F8FF)'}} />
    <div style={{position: 'absolute', left: 20, bottom: 48, width: 300, display: 'flex', justifyContent: 'space-between', fontFamily: EN, fontWeight: 700, fontSize: 18, color: '#fff'}}>
      <span>0 m</span>
      <span>3,000 m</span>
    </div>
  </AbsoluteFill>
);
export const V_Dem3d: React.FC = () => <Photo src="space/asir-3d.jpg" zoom={[1.0, 1.12]} />;

// —— EP09 radar ——
export const V_Clouds: React.FC = () => <Photo src="space/cloud-shadows.jpg" zoom={[1.2, 1.0]} />;
export const V_Radar: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (frame % 60) / 60;
  return (
    <AbsoluteFill>
      <svg width={960} height={620}>
        <rect x={0} y={520} width={960} height={100} fill="#5a4a3a" />
        <g opacity={0.8}>
          {[200, 420, 650].map((x, i) => (
            <ellipse key={i} cx={x} cy={300} rx={110} ry={40} fill="#fff" opacity={0.85} />
          ))}
        </g>
        <g transform="translate(140 80)">
          <rect x={-20} y={-14} width={40} height={28} rx={5} fill="#fff" />
          <rect x={-80} y={-6} width={50} height={12} fill="#9DA2E6" />
          <rect x={30} y={-6} width={50} height={12} fill="#9DA2E6" />
        </g>
        <line x1={160} y1={100} x2={160 + 560 * Math.min(1, t * 2)} y2={100 + 420 * Math.min(1, t * 2)} stroke="#FFE9A8" strokeWidth={5} strokeDasharray="12 8" />
        {t > 0.5 ? <line x1={720} y1={520} x2={720 - 560 * (t - 0.5) * 2} y2={520 - 420 * (t - 0.5) * 2} stroke="#7FD6C2" strokeWidth={5} strokeDasharray="12 8" /> : null}
      </svg>
      <Label style={{top: 20, right: 20}}>نبضة تذهب… وصدى يعود</Label>
      <Label style={{bottom: 110, right: 20, fontSize: 24}}>يعمل ليلاً ونهاراً… وعبر الغيوم</Label>
    </AbsoluteFill>
  );
};
export const V_Ubar: React.FC = () => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [20, 90], [100, 50], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Img src={staticFile('space/ubar-optical.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover'}} />
      <Img src={staticFile('space/ubar-radar.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', clipPath: `inset(0 ${100 - split}% 0 0)`}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${split}%`, width: 4, background: '#fff'}} />
      <Label style={{top: 16, left: 16, fontSize: 24}}>رادار</Label>
      <Label style={{top: 16, right: 16, fontSize: 24}}>صورة بصرية</Label>
      <Label style={{bottom: 16, left: '50%', transform: 'translateX(-50%)', fontSize: 22, whiteSpace: 'nowrap'}}>منطقة «أوبار» · الربع الخالي · NASA SIR-C</Label>
    </AbsoluteFill>
  );
};

// —— EP10 projections ——
export const V_Peel: React.FC = () => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [15, 80], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const gores = 8;
  return (
    <AbsoluteFill>
      <svg width={960} height={620} viewBox="-480 -310 960 620">
        {new Array(gores).fill(0).map((_, i) => {
          const w = 860 / gores;
          const x = -430 + i * w + w / 2;
          const xr = Math.sin(((i + 0.5) / gores - 0.5) * Math.PI) * 220;
          const cx = xr + (x - xr) * open;
          const hw = (w / 2) * (0.3 + 0.7 * open);
          return <path key={i} d={`M${cx},-250 Q${cx + hw},0 ${cx},250 Q${cx - hw},0 ${cx},-250 Z`} fill={i % 2 ? '#4A6CC8' : '#5C7FDA'} stroke="#fff" strokeWidth={2} />;
        })}
      </svg>
      <Label style={{bottom: 16, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap'}}>تسطيح الكرة… يفتح فجوات أو يمطّ الأشكال</Label>
    </AbsoluteFill>
  );
};
export const V_Mercator: React.FC = () => {
  const frame = useCurrentFrame();
  const rows: [number, number][] = [
    [0, 1],
    [30, 1.33],
    [60, 4],
    [75, 14.9],
  ];
  return (
    <AbsoluteFill style={{padding: 40, justifyContent: 'center', gap: 26}}>
      {rows.map(([lat, f], i) => {
        const p = interpolate(frame, [10 + i * 12, 40 + i * 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, direction: 'rtl'}}>
            <div style={{width: 210, fontFamily: AR, fontWeight: 700, fontSize: 30, color: '#fff'}}>دائرة عرض {lat}°</div>
            <div style={{flex: 1, height: 54, position: 'relative'}}>
              <div style={{position: 'absolute', right: 0, height: '100%', width: `${(Math.log(f) / Math.log(15)) * 92 * p + 6}%`, background: i === 3 ? '#FFB86B' : '#9DA2E6', borderRadius: 10}} />
            </div>
            <div style={{width: 130, fontFamily: EN, fontWeight: 800, fontSize: 34, color: '#fff', direction: 'ltr', textAlign: 'left'}}>×{f}</div>
          </div>
        );
      })}
      <div dir="rtl" style={{fontFamily: AR, fontSize: 26, color: 'rgba(255,255,255,0.7)', textAlign: 'center'}}>
        تكبير المساحة في إسقاط مركاتور مقارنةً بخط الاستواء
      </div>
    </AbsoluteFill>
  );
};
export const V_Greenland: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: frame - 8, fps, config: {damping: 14}});
  const b = spring({frame: frame - 40, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', direction: 'rtl', padding: 30}}>
      <div style={{textAlign: 'center'}}>
        <div style={{width: 420, height: 420, borderRadius: '50%', background: '#C9A24A', transform: `scale(${a})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{fontFamily: AR, fontWeight: 800, fontSize: 44, color: NAVY}}>أفريقيا</div>
        </div>
        <div style={{fontFamily: EN, fontWeight: 700, fontSize: 24, color: '#fff', marginTop: 12, direction: 'ltr'}}>≈ 30.4 M km²</div>
      </div>
      <div style={{textAlign: 'center'}}>
        <div style={{width: 112, height: 112, borderRadius: '50%', background: '#fff', transform: `scale(${b})`, margin: '0 auto'}} />
        <div style={{fontFamily: AR, fontWeight: 800, fontSize: 36, color: '#fff', marginTop: 12}}>غرينلاند</div>
        <div style={{fontFamily: EN, fontWeight: 700, fontSize: 24, color: '#fff', direction: 'ltr'}}>≈ 2.2 M km²</div>
      </div>
    </AbsoluteFill>
  );
};

// —— EP11 reefs ——
export const V_Wajh: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Photo src="space/al-wajh-bank.jpg" zoom={[1.0, 1.2]} />
      {[[260, 210, 180, 110], [560, 320, 220, 120]].map(([x, y, w, h], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: h, border: '3px dashed #fff', borderRadius: 14, opacity: interpolate(frame, [30 + i * 15, 42 + i * 15], [0, 1], clamp)}} />
      ))}
      <Label style={{top: 16, right: 16}}>ضفّة الوجه · ISS</Label>
    </AbsoluteFill>
  );
};
export const V_Shallow: React.FC = () => {
  const frame = useCurrentFrame();
  const d = interpolate(frame, [10, 90], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <svg width={960} height={620}>
        <defs>
          <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5fd3e0" />
            <stop offset="100%" stopColor="#0a2a5a" />
          </linearGradient>
        </defs>
        <rect x={0} y={200} width={960} height={420} fill="url(#sea)" />
        <path d="M0,380 C200,330 300,300 480,320 C700,340 800,470 960,560 L960,620 L0,620 Z" fill="#C9A24A" opacity={0.8} />
        {[150, 300, 450].map((x, i) => (
          <line key={i} x1={x} y1={40} x2={x} y2={40 + (320 + i * 20) * d} stroke="#FFE9A8" strokeWidth={5} strokeDasharray="10 8" />
        ))}
        {[700, 820].map((x, i) => (
          <line key={i} x1={x} y1={40} x2={x} y2={40 + 260 * d} stroke="#FFE9A8" strokeWidth={5} strokeDasharray="10 8" opacity={0.5} />
        ))}
      </svg>
      <Label style={{top: 60, right: 20}}>مياه ضحلة صافية = قاع مرئي</Label>
      <Label style={{bottom: 20, left: 20, fontSize: 22}}>كلما زاد العمق… خفت الضوء</Label>
    </AbsoluteFill>
  );
};

// —— EP12 pixels ——
export const V_Area: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [5, 50], [0, 2.15], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: EN, fontWeight: 800, fontSize: 200, color: '#fff', lineHeight: 1}}>{v.toFixed(2)}</div>
      <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 52, color: '#FFE9A8'}}>
        مليون كم² تقريباً
      </div>
    </AbsoluteFill>
  );
};
export const pixelCount = (src: string, res: string, n: string, unit: string) => {
  const V: React.FC = () => (
    <AbsoluteFill>
      <Photo src={src} zoom={[1.3, 1.1]} pixel />
      <AbsoluteFill style={{background: 'rgba(13,15,34,0.55)', alignItems: 'center', justifyContent: 'center'}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 40, color: '#fff'}}>
          بدقة {res}
        </div>
        <div dir="rtl" style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
          <span style={{fontFamily: EN, fontWeight: 800, fontSize: 170, color: '#fff'}}>{n}</span>
          <span style={{fontFamily: AR, fontWeight: 800, fontSize: 64, color: '#FFE9A8'}}>{unit}</span>
        </div>
        <div dir="rtl" style={{fontFamily: AR, fontSize: 32, color: 'rgba(255,255,255,0.8)'}}>
          بكسل لصورة واحدة كاملة
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
  return V;
};
export {Chips};
