import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Caption, Readout} from './Caption';
import {BOUNDS, peninsulaPath} from './geo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = 1200;
const H = 990;
const PASSES = 12;
const START = 40;
const PASS_LEN = 28;
// interleaved revisit order, like real ground tracks shifting with Earth's rotation
const ORDER = [0, 6, 3, 9, 1, 7, 4, 10, 2, 8, 5, 11];
const SWATH = W / PASSES + 8;
const TILT = 0.22; // near-polar descending track

const trackX = (slot: number) => (slot + 0.5) * (W / PASSES) - TILT * H * 0.5;

export const OrbitCoverage: React.FC = () => {
  const frame = useCurrentFrame();
  const done = Math.max(0, Math.min(PASSES, (frame - START) / PASS_LEN));
  const current = Math.floor(done);
  const progress = done - current;
  const finale = interpolate(frame, [START + PASSES * PASS_LEN, START + PASSES * PASS_LEN + 30], [0, 1], clamp);
  const minutes = done * 95;
  const hh = Math.floor(minutes / 60);
  const mm = Math.floor(minutes % 60);
  const coverage = Math.min(100, Math.round(interpolate(done, [0, PASSES], [0, 100], {easing: Easing.out(Easing.quad)})));
  const mapIn = interpolate(frame, [0, 25], [0, 1], clamp);

  const swath = (slot: number, len: number, key: string, op: number) => {
    const x0 = trackX(slot);
    return (
      <line key={key} x1={x0} y1={-20} x2={x0 + TILT * (H + 40) * len} y2={-20 + (H + 40) * len} stroke="#fff" strokeOpacity={op} strokeWidth={SWATH} strokeLinecap="butt" />
    );
  };

  const swaths = [];
  for (let i = 0; i < current; i++) swaths.push(swath(ORDER[i], 1, `s${i}`, 0.22));
  if (current < PASSES) swaths.push(swath(ORDER[current], progress, 'live', 0.35));
  const live = current < PASSES ? ORDER[current] : null;
  const satX = live !== null ? trackX(live) + TILT * (H + 40) * progress : 0;
  const satY = -20 + (H + 40) * progress;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width={W} height={H} style={{opacity: mapIn, overflow: 'visible'}}>
        <defs>
          <clipPath id="land">
            <path d={peninsulaPath(W, H)} />
          </clipPath>
        </defs>
        {/* lat/lon graticule */}
        {new Array(8).fill(0).map((_, i) => (
          <line key={`v${i}`} x1={(i / 7) * W} x2={(i / 7) * W} y1={0} y2={H} stroke="rgba(255,255,255,0.07)" />
        ))}
        {new Array(7).fill(0).map((_, i) => (
          <line key={`h${i}`} y1={(i / 6) * H} y2={(i / 6) * H} x1={0} x2={W} stroke="rgba(255,255,255,0.07)" />
        ))}
        <g opacity={0.35}>{swaths}</g>
        <g clipPath="url(#land)">
          <rect width={W} height={H} fill="rgba(110,116,184,0.12)" />
          <g>{swaths}</g>
          <rect width={W} height={H} fill="#fff" opacity={finale * 0.55} />
        </g>
        <path d={peninsulaPath(W, H)} fill="none" stroke="#fff" strokeWidth={2.5} />
        {live !== null && frame >= START ? (
          <g transform={`translate(${satX} ${satY})`}>
            <circle r={26} fill="rgba(255,255,255,0.2)" />
            <rect x={-8} y={-8} width={16} height={16} fill="#fff" />
            <rect x={-34} y={-4} width={22} height={8} fill="#fff" />
            <rect x={12} y={-4} width={22} height={8} fill="#fff" />
          </g>
        ) : null}
        <text x={W - 10} y={H - 14} textAnchor="end" fill="rgba(255,255,255,0.4)" fontFamily="Montserrat" fontSize={16} letterSpacing={2}>
          {`${BOUNDS.lon[0]}°E – ${BOUNDS.lon[1]}°E`}
        </text>
      </svg>
      <Readout label="ORBIT" labelAr="المدار" value={String(Math.min(PASSES, current + 1)).padStart(2, '0')} style={{left: 90, top: 120}} />
      <Readout label="TIME" labelAr="الوقت" value={`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`} style={{left: 90, top: 240}} />
      <Readout label="SPEED" labelAr="السرعة" value="27,600 km/h" style={{left: 90, top: 360}} />
      <Readout label="COVERAGE" labelAr="التغطية" value={`${coverage}%`} style={{right: 90, top: 120}} />
      <Caption ar="كل 90 دقيقة… دورة كاملة حول الأرض" en="Every ~90 minutes, one full orbit" from={0} to={150} pos="bottom" size={58} />
      <Caption ar="مداراً بعد مدار… تكتمل الصورة" en="Orbit after orbit, the picture completes" from={152} to={376} pos="bottom" size={58} />
      <Caption ar="تغطية كاملة… من الفضاء" en="Complete coverage, from space" from={378} to={450} pos="bottom" size={58} />
    </AbsoluteFill>
  );
};
