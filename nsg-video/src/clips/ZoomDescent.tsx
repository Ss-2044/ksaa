import {AbsoluteFill, interpolate, random, useCurrentFrame, Easing} from 'remotion';
import {Planet} from '../components/Graphics';
import {fonts} from '../theme';
import {Caption, Readout} from './Caption';
import {field, peninsulaPath, project, RIYADH, shade} from './geo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// Act 1: Earth with GEO / MEO / LEO rings at true relative scale, camera falls inward.
const OrbitAct: React.FC = () => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [0, 170], [60, 900], {...clamp, easing: Easing.in(Easing.cubic)});
  const op = interpolate(frame, [150, 175], [1, 0], clamp);
  const rings = [
    {k: 6.61, ar: 'المدار الثابت', en: 'GEO · 35,786 KM'},
    {k: 4.17, ar: 'المدار المتوسط', en: 'MEO · 20,200 KM'},
    {k: 1.08, ar: 'المدار المنخفض', en: 'LEO · 500 KM'},
  ];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op}}>
      <div style={{position: 'absolute'}}>
        <div style={{transform: 'translate(-50%,-50%)', position: 'absolute'}}>
          <Planet size={r * 2} />
        </div>
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}} viewBox="-960 -540 1920 1080">
        {rings.map((g, i) => (
          <g key={g.en} transform={`rotate(${-20 + i * 8})`}>
            <ellipse rx={r * g.k} ry={r * g.k * 0.38} fill="none" stroke="#fff" strokeOpacity={0.45} strokeDasharray={i === 1 ? '3 9' : undefined} strokeWidth={2} />
            <circle cx={Math.cos(frame * 0.03 + i * 2) * r * g.k} cy={Math.sin(frame * 0.03 + i * 2) * r * g.k * 0.38} r={7} fill="#fff" />
            <text x={r * g.k + 14} y={-6} fill="#fff" fontFamily="Montserrat" fontSize={20} letterSpacing={3}>
              {g.en}
            </text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// Act 2: the peninsula appears and we dive toward Riyadh.
const MapAct: React.FC = () => {
  const frame = useCurrentFrame() - 150;
  if (frame < 0 || frame > 170) return null;
  const W = 1300;
  const H = 1070;
  const [rx, ry] = project(RIYADH[0], RIYADH[1], W, H);
  const zoom = interpolate(frame, [0, 80, 165], [0.85, 1.25, 9], {...clamp, easing: Easing.in(Easing.quad)});
  const op = interpolate(frame, [0, 20, 145, 170], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op}}>
      <svg width={W} height={H} style={{transform: `scale(${zoom})`, transformOrigin: `${rx}px ${ry}px`, overflow: 'visible'}}>
        <path d={peninsulaPath(W, H)} fill="rgba(110,116,184,0.25)" stroke="#fff" strokeWidth={2.5 / Math.sqrt(zoom)} />
        {new Array(12).fill(0).map((_, i) => (
          <line key={i} x1={0} x2={W} y1={(i / 11) * H} y2={(i / 11) * H} stroke="rgba(255,255,255,0.08)" />
        ))}
        <g transform={`translate(${rx} ${ry})`}>
          <circle r={40 / zoom + 6} fill="none" stroke="#fff" strokeWidth={2 / zoom + 0.5} />
          <circle r={4} fill="#fff" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Act 3: city footprints at sub-metre detail.
const CityAct: React.FC = () => {
  const frame = useCurrentFrame() - 300;
  if (frame < 0 || frame > 80) return null;
  const op = interpolate(frame, [0, 12, 66, 80], [0, 1, 1, 0], clamp);
  const scale = interpolate(frame, [0, 80], [1.5, 1.05]);
  const blocks = [];
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 11; j++) {
      if (random(`b${i}-${j}`) < 0.18) continue;
      const w = 50 + random(`w${i}${j}`) * 30;
      const h = 40 + random(`h${i}${j}`) * 40;
      blocks.push(<rect key={`${i}-${j}`} x={i * 100 + 15} y={j * 100 + 15} width={w} height={h} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={1.5} />);
    }
  }
  return (
    <AbsoluteFill style={{opacity: op, transform: `scale(${scale})`}}>
      <svg width={2000} height={1100}>
        {blocks}
        <line x1={0} x2={2000} y1={505} y2={505} stroke="#9DA2E6" strokeWidth={14} />
        <line x1={1005} x2={1005} y1={0} y2={1100} stroke="#9DA2E6" strokeWidth={10} />
      </svg>
    </AbsoluteFill>
  );
};

// Act 4: same place at 30 m, 10 m and 0.5 m.
const ResAct: React.FC = () => {
  const frame = useCurrentFrame() - 375;
  if (frame < 0) return null;
  const tiles = [
    {n: 6, ar: '30 متر', en: '30 m'},
    {n: 18, ar: '10 أمتار', en: '10 m'},
    {n: 60, ar: 'نصف متر', en: '0.5 m'},
  ];
  const S = 440;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div dir="rtl" style={{display: 'flex', gap: 50, marginTop: -60}}>
        {tiles.map((t, i) => {
          const p = interpolate(frame, [i * 8, i * 8 + 12], [0, 1], clamp);
          const cells = [];
          const c = S / t.n;
          for (let y = 0; y < t.n; y++) for (let x = 0; x < t.n; x++) cells.push(<rect key={`${x}-${y}`} x={x * c} y={y * c} width={c + 0.5} height={c + 0.5} fill={shade(field(0.45 + (x / t.n) * 0.35, 0.28 + (y / t.n) * 0.35))} />);
          return (
            <div key={t.en} style={{opacity: p, transform: `translateY(${(1 - p) * 60}px)`, textAlign: 'center'}}>
              <svg width={S} height={S} style={{border: '2px solid #fff'}}>
                {cells}
              </svg>
              <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 40, color: '#fff', marginTop: 14}}>
                {t.ar}
              </div>
              <div style={{fontFamily: fonts.en, fontSize: 20, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.65)'}}>RESOLUTION {t.en}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ZoomDescent: React.FC = () => {
  const frame = useCurrentFrame();
  const alt = Math.exp(interpolate(frame, [0, 170, 300, 375], [Math.log(35786), Math.log(500), Math.log(500), Math.log(500)], clamp));
  const res = Math.exp(interpolate(frame, [150, 300, 375], [Math.log(1000), Math.log(0.5), Math.log(0.5)], clamp));
  return (
    <AbsoluteFill>
      <OrbitAct />
      <MapAct />
      <CityAct />
      <ResAct />
      {frame < 375 ? (
        <>
          <Readout label="ALT" labelAr="الارتفاع" value={`${fmt(alt)} km`} style={{left: 90, top: 90}} />
          <Readout label="RES" labelAr="الدقة" value={res >= 1 ? `${fmt(res)} m` : `${res.toFixed(1)} m`} style={{left: 90, top: 210}} />
        </>
      ) : null}
      <Caption ar="من ارتفاع 36,000 كم" en="From 36,000 km above Earth" from={0} to={150} pos="bottom" />
      <Caption ar="نقترب من شبه الجزيرة العربية" en="Closing in on the Arabian Peninsula" from={152} to={298} pos="bottom" />
      <Caption ar="حتى نرى كل مبنى وكل طريق" en="Until every building and road is visible" from={300} to={375} pos="bottom" />
      <Caption ar="كلما اقتربنا… رأينا أكثر" en="The closer we look, the more we see" from={378} to={450} pos="top" size={56} />
    </AbsoluteFill>
  );
};
