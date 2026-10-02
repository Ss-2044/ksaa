import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {AR, clamp, DarkFrame, EN, MAC, Music, NAVY, SERIES} from './common';

export const CHART_FRAMES = 750; // 25 s
const INK = '#FFFFFF';
const MUTED = 'rgba(255,255,255,0.62)';
const GRID = 'rgba(255,255,255,0.12)';

const Title: React.FC<{ar: string; sub: string}> = ({ar, sub}) => (
  <div style={{position: 'absolute', top: 170, left: 60, right: 60, textAlign: 'right'}}>
    <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 60, color: INK, lineHeight: 1.25}}>
      {ar}
    </div>
    <div dir="rtl" style={{fontFamily: AR, fontSize: 30, color: MUTED, marginTop: 6}}>
      {sub}
    </div>
  </div>
);

const Insight: React.FC<{text: string; at: number; top: number}> = ({text, at, top}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 200}});
  return (
    <div dir="rtl" style={{position: 'absolute', top, left: 60, right: 60, fontFamily: AR, fontWeight: 600, fontSize: 38, lineHeight: 1.55, color: INK, textAlign: 'right', opacity: p, transform: `translateY(${(1 - p) * 20}px)`, borderRight: `4px solid ${SERIES}`, paddingRight: 20}}>
      {text}
    </div>
  );
};

const EndCard: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [650, 670], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'rgba(13,15,34,0.95)', opacity: p, alignItems: 'center', justifyContent: 'center'}}>
      <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 62, color: INK, textAlign: 'center', lineHeight: 1.4, padding: '0 80px'}}>
        {text}
      </div>
      <Img src={staticFile('nsg-logo.png')} style={{width: 340, marginTop: 70}} />
    </AbsoluteFill>
  );
};

// ── 50 years of Landsat: a dated event strip (single series → no legend; every mark direct-labelled) ──
const LAUNCHES: [string, number, boolean][] = [
  ['1', 1972, true],
  ['2', 1975, true],
  ['3', 1978, true],
  ['4', 1982, true],
  ['5', 1984, true],
  ['6', 1993, false],
  ['7', 1999, true],
  ['8', 2013, true],
  ['9', 2021, true],
];
export const LandsatTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const X0 = 90;
  const X1 = 990;
  const yr = (y: number) => X0 + ((y - 1970) / (2025 - 1970)) * (X1 - X0);
  const AX = 800;
  const span = interpolate(frame, [330, 400], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return (
    <DarkFrame series="بالأرقام" seriesEn="BY THE NUMBERS" source={`Launch years: NASA/USGS Landsat program · ${MAC} — "Movement Proposition"`}>
      <Title ar="50 عاماً من صور Landsat" sub="تسعة أقمار، منذ 1972 حتى اليوم" />
      <svg width={1080} height={1350} style={{position: 'absolute', top: 0, left: 0}}>
        {[1970, 1980, 1990, 2000, 2010, 2020].map((y) => (
          <g key={y}>
            <line x1={yr(y)} x2={yr(y)} y1={430} y2={AX} stroke={GRID} strokeWidth={1} />
            <text x={yr(y)} y={AX + 40} textAnchor="middle" fill={MUTED} fontFamily="Montserrat" fontSize={22}>
              {y}
            </text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={AX} y2={AX} stroke={MUTED} strokeWidth={2} />
        {/* Landsat 5 service span */}
        <rect x={yr(1984)} y={AX - 310} width={(yr(2013) - yr(1984)) * span} height={8} rx={4} fill={SERIES} opacity={0.6} />
        {span > 0.95 ? (
          <text x={(yr(1984) + yr(2013)) / 2} y={AX - 326} textAnchor="middle" fill={INK} fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={24}>
            Landsat 5 عمل قرابة 29 عاماً
          </text>
        ) : null}
        {LAUNCHES.map(([n, y, ok], i) => {
          const at = 70 + i * 26;
          const p = interpolate(frame, [at, at + 12], [0, 1], clamp);
          const up = i % 2 === 0;
          const ly = up ? AX - 50 : AX - 170;
          return (
            <g key={n} opacity={p}>
              <line x1={yr(y)} x2={yr(y)} y1={ly + 10} y2={AX - 8} stroke={GRID} strokeWidth={2} />
              <circle cx={yr(y)} cy={AX} r={9 * p} fill={ok ? SERIES : '#16182F'} stroke={ok ? '#16182F' : SERIES} strokeWidth={ok ? 2 : 3} />
              <text x={yr(y)} y={ly} textAnchor="middle" fill={INK} fontFamily="Montserrat" fontWeight={800} fontSize={26}>
                L{n}
              </text>
              <text x={yr(y)} y={ly - 28} textAnchor="middle" fill={MUTED} fontFamily="Montserrat" fontSize={18}>
                {y}
              </text>
              {!ok ? (
                <text x={yr(y)} y={ly - 54} textAnchor="middle" fill={MUTED} fontFamily="IBM Plex Sans Arabic" fontSize={20}>
                  لم يصل إلى المدار
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <Insight at={440} top={900} text="أطول سجل متواصل لصور سطح الأرض من الفضاء… وأرشيفه مفتوح للجميع." />
      <Insight at={520} top={1050} text="بفضله نستطيع مقارنة أي مكان اليوم بصورته قبل عقود." />
      <EndCard text="الأرشيف الطويل… أثمن ما في البيانات" />
      <Music src="music/movement-proposition.mp3" volume={0.28} trimBefore={20} />
    </DarkFrame>
  );
};

// ── altitude ladder: ranked horizontal bars on a log axis (one series, direct labels) ──
const ALT: [string, string, number][] = [
  ['محطة الفضاء الدولية', 'ISS', 420],
  ['Landsat 8/9', 'Landsat', 705],
  ['Sentinel-2', 'Sentinel-2', 786],
  ['أقمار GPS', 'GPS', 20200],
  ['المدار الثابت', 'GEO', 35786],
  ['القمر', 'Moon', 384400],
];
export const AltitudeLadder: React.FC = () => {
  const frame = useCurrentFrame();
  const R = 600; // baseline x (bars grow leftwards, RTL); names + values sit right of it
  const L = 70;
  const lx = (v: number) => R - ((Math.log10(v) - 2) / (6 - 2)) * (R - L);
  const top = 470;
  const BH = 34;
  const GAP = 62;
  return (
    <DarkFrame series="بالأرقام" seriesEn="BY THE NUMBERS" source={`Typical/nominal altitudes (km) · ${MAC} — "Echoes of Time"`}>
      <Title ar="كم يرتفع كل قمر عن الأرض؟" sub="بالكيلومتر · مقياس لوغاريتمي" />
      <svg width={1080} height={1350} style={{position: 'absolute', top: 0, left: 0}}>
        {[100, 1000, 10000, 100000, 1000000].map((v) => (
          <g key={v}>
            <line x1={lx(v)} x2={lx(v)} y1={top - 30} y2={top + ALT.length * (BH + GAP) - GAP + 20} stroke={GRID} strokeWidth={1} />
            <text x={lx(v)} y={top - 44} textAnchor="middle" fill={MUTED} fontFamily="Montserrat" fontSize={18}>
              {v >= 1000000 ? '1M' : v >= 1000 ? `${v / 1000}k` : v}
            </text>
          </g>
        ))}
        {ALT.map(([ar, , v], i) => {
          const at = 60 + i * 30;
          const p = interpolate(frame, [at, at + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const y = top + i * (BH + GAP);
          const end = R - (R - lx(v)) * p;
          return (
            <g key={ar}>
              <rect x={end} y={y} width={Math.max(0, R - end)} height={BH} rx={4} fill={SERIES} />
              <text x={1020} y={y + BH / 2 - 2} textAnchor="end" fill={INK} fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={28}>
                {ar}
              </text>
              <text x={1020} y={y + BH / 2 + 28} textAnchor="end" fill={MUTED} fontFamily="Montserrat" fontWeight={700} fontSize={22} opacity={p}>
                {`${Math.round(v * p).toLocaleString('en-US')} km`}
              </text>
            </g>
          );
        })}
        <line x1={R} x2={R} y1={top - 20} y2={top + ALT.length * (BH + GAP) - GAP + 10} stroke={MUTED} strokeWidth={2} />
      </svg>
      <Insight at={380} top={1060} text="أقمار التصوير قريبة نسبياً (مئات الكيلومترات)، بينما يبعد المدار الثابت نحو 36 ألف كم." />
      <EndCard text="كل ارتفاع… لمهمة مختلفة" />
      <Music src="music/echoes-of-time.mp3" volume={0.3} trimBefore={8} />
    </DarkFrame>
  );
};
