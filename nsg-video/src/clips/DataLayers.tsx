import {AbsoluteFill, interpolate, random, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {Caption} from './Caption';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const S = 820;
const DROP_AT = (i: number) => 30 + i * 60; // one layer per bar
const COLLAPSE = [330, 360] as const;

const contour = (k: number, i: number) =>
  new Array(60)
    .fill(0)
    .map((_, n) => {
      const a = (n / 60) * Math.PI * 2;
      const w = 1 + 0.16 * Math.sin(a * 3 + i) + 0.08 * Math.sin(a * 5 - i);
      return `${S / 2 + Math.cos(a) * S * k * w},${S / 2 + Math.sin(a) * S * k * w * 0.85}`;
    })
    .join(' ');

const LAYERS: {ar: string; en: string; draw: () => React.ReactNode}[] = [
  {
    ar: 'التضاريس',
    en: 'Terrain',
    draw: () => [0.08, 0.15, 0.22, 0.29, 0.36, 0.43].map((k, i) => <polygon key={i} points={contour(k, i)} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={2} />),
  },
  {
    ar: 'المياه والأودية',
    en: 'Hydrology',
    draw: () => (
      <>
        <path d={`M0,${S * 0.3} C${S * 0.3},${S * 0.15} ${S * 0.5},${S * 0.55} ${S},${S * 0.45}`} fill="none" stroke="#9DA2E6" strokeWidth={14} />
        <path d={`M${S * 0.4},${S * 0.38} C${S * 0.45},${S * 0.6} ${S * 0.3},${S * 0.8} ${S * 0.35},${S}`} fill="none" stroke="#9DA2E6" strokeWidth={8} />
        <ellipse cx={S * 0.75} cy={S * 0.75} rx={70} ry={40} fill="#9DA2E6" opacity={0.7} />
      </>
    ),
  },
  {
    ar: 'شبكة الطرق',
    en: 'Transport',
    draw: () => (
      <g stroke="#fff" strokeWidth={4}>
        {[0.2, 0.4, 0.6, 0.8].map((k) => (
          <line key={`a${k}`} x1={0} x2={S} y1={S * k} y2={S * k} strokeOpacity={0.6} />
        ))}
        {[0.25, 0.5, 0.75].map((k) => (
          <line key={`b${k}`} y1={0} y2={S} x1={S * k} x2={S * k} strokeOpacity={0.6} />
        ))}
        <line x1={0} y1={S} x2={S} y2={0} strokeWidth={10} />
      </g>
    ),
  },
  {
    ar: 'المباني',
    en: 'Built environment',
    draw: () => {
      const out = [];
      for (let i = 0; i < 12; i++)
        for (let j = 0; j < 12; j++) {
          if (random(`L${i}-${j}`) < 0.45) continue;
          out.push(<rect key={`${i}-${j}`} x={i * (S / 12) + 8} y={j * (S / 12) + 8} width={S / 12 - 22} height={S / 12 - 22} fill="#fff" fillOpacity={0.75} />);
        }
      return out;
    },
  },
  {
    ar: 'الغطاء النباتي',
    en: 'Vegetation',
    draw: () =>
      new Array(140).fill(0).map((_, i) => {
        const cx = random(`vx${i}`);
        const cy = random(`vy${i}`);
        return <circle key={i} cx={(0.1 + cx * 0.8) * S} cy={(0.1 + cy * 0.8) * S} r={6 + random(`vr${i}`) * 10} fill="#C9CCF5" fillOpacity={0.55} />;
      }),
  },
];

export const DataLayers: React.FC = () => {
  const frame = useCurrentFrame();
  const collapse = interpolate(frame, COLLAPSE, [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const spin = interpolate(frame, [0, 450], [-48, -28]);
  const flash = interpolate(frame, [COLLAPSE[1], COLLAPSE[1] + 3, COLLAPSE[1] + 20], [0, 0.85, 0], clamp);
  const current = LAYERS.findIndex((_, i) => frame < DROP_AT(i + 1));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{perspective: 2400, alignItems: 'center', justifyContent: 'center', left: -220}}>
        <div style={{width: S, height: S, position: 'relative', transformStyle: 'preserve-3d', transform: `translateY(60px) rotateX(58deg) rotateZ(${spin}deg)`}}>
          {/* base plate */}
          <div style={{position: 'absolute', inset: 0, background: 'rgba(44,45,67,0.9)', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 0 120px rgba(157,162,230,0.25)'}} />
          {LAYERS.map((l, i) => {
            const drop = interpolate(frame, [DROP_AT(i), DROP_AT(i) + 16], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
            const stackZ = (i + 1) * 70;
            const z = interpolate(drop, [0, 1], [1600, stackZ]) * (1 - collapse) + collapse * 2;
            return (
              <div
                key={l.en}
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: `translateZ(${z}px)`,
                  opacity: drop,
                  border: `1.5px solid rgba(255,255,255,${0.35 * (1 - collapse)})`,
                  background: `rgba(157,162,230,${0.06 * (1 - collapse)})`,
                }}
              >
                <svg width={S} height={S}>{l.draw()}</svg>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {/* legend */}
      <div style={{position: 'absolute', right: 140, top: 230, display: 'flex', flexDirection: 'column', gap: 22}}>
        {LAYERS.map((l, i) => {
          const p = interpolate(frame, [DROP_AT(i) + 4, DROP_AT(i) + 14], [0, 1], clamp);
          const active = i === current && frame < COLLAPSE[0];
          return (
            <div key={l.en} style={{display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 20, opacity: p * (active || frame >= COLLAPSE[0] ? 1 : 0.55), transform: `translateX(${(1 - p) * 60}px)`}}>
              <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 22, color: active ? '#16182F' : '#fff', background: active ? '#fff' : 'transparent', border: '2px solid #fff', padding: '4px 10px'}}>0{i + 1}</div>
              <div style={{textAlign: 'right'}}>
                <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 44, color: '#fff'}}>
                  {l.ar}
                </div>
                <div style={{fontFamily: fonts.en, fontSize: 18, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase'}}>{l.en}</div>
              </div>
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <Caption ar="الخريطة ليست صورة… بل طبقات من البيانات" en="A map is not a picture — it is layers of data" from={0} to={326} pos="top" size={54} />
      <Caption ar="طبقات كثيرة… رؤية واحدة" en="Many layers. One clear view." from={362} to={450} pos="top" size={64} />
    </AbsoluteFill>
  );
};
