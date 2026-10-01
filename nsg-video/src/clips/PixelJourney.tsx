import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Planet} from '../components/Graphics';
import {Caption} from './Caption';
import {field, shade} from './geo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const COLS = 48;
const ROWS = 27;
const CELL = 40;

// Act 1-2: sun → photon → Earth → reflected to a satellite (camera shutter).
const LightAct: React.FC = () => {
  const frame = useCurrentFrame();
  const sun = {x: 160, y: 300};
  const hit = {x: 1180, y: 700};
  const sat = {x: 1500, y: 220};
  const a = interpolate(frame, [10, 80], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const b = interpolate(frame, [95, 150], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const px = frame < 90 ? sun.x + (hit.x - sun.x) * a : hit.x + (sat.x - hit.x) * b;
  const py = frame < 90 ? sun.y + (hit.y - sun.y) * a : hit.y + (sat.y - hit.y) * b;
  const shutter = interpolate(frame, [150, 153, 175], [0, 1, 0], clamp);
  const fadeOut = interpolate(frame, [170, 185], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      {/* sun */}
      <div style={{position: 'absolute', left: sun.x - 260, top: sun.y - 260, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, #fff 0%, rgba(255,255,255,0.8) 12%, rgba(157,162,230,0.25) 35%, transparent 70%)'}} />
      {/* earth */}
      <div style={{position: 'absolute', left: 850, top: 620}}>
        <Planet size={1400} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={sun.x} y1={sun.y} x2={frame < 90 ? px : hit.x} y2={frame < 90 ? py : hit.y} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeDasharray="4 10" />
        {frame >= 90 ? <line x1={hit.x} y1={hit.y} x2={px} y2={py} stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeDasharray="4 10" /> : null}
        <circle cx={px} cy={py} r={10} fill="#fff" />
        <circle cx={px} cy={py} r={30} fill="rgba(255,255,255,0.25)" />
        {frame >= 88 && frame < 110 ? <circle cx={hit.x} cy={hit.y} r={(frame - 88) * 4} fill="none" stroke="#fff" opacity={1 - (frame - 88) / 22} strokeWidth={3} /> : null}
        {/* satellite */}
        <g transform={`translate(${sat.x} ${sat.y}) rotate(-25)`}>
          <rect x={-22} y={-18} width={44} height={36} rx={4} fill="#fff" />
          <rect x={-120} y={-12} width={86} height={24} fill="rgba(255,255,255,0.75)" />
          <rect x={34} y={-12} width={86} height={24} fill="rgba(255,255,255,0.75)" />
          <circle cx={0} cy={26} r={10} fill="#9DA2E6" />
        </g>
      </svg>
      <AbsoluteFill style={{background: '#fff', opacity: shutter}} />
    </AbsoluteFill>
  );
};

// Act 3-4: one pixel multiplies into an image, then the image is traced into a vector map.
const ImageAct: React.FC = () => {
  const frame = useCurrentFrame() - 170;
  if (frame < 0) return null;
  const grow = interpolate(frame, [10, 110], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const zoomOut = interpolate(frame, [0, 120], [6, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const toMap = interpolate(frame, [140, 200], [0, 1], clamp);
  const draw = interpolate(frame, [150, 260], [0, 1], clamp);
  const maxD = Math.hypot(COLS / 2, ROWS / 2);
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d = Math.hypot(c - COLS / 2, r - ROWS / 2) / maxD;
      if (d > grow + 0.001 && !(r === Math.floor(ROWS / 2) && c === Math.floor(COLS / 2))) continue;
      cells.push(
        <rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL - 2} height={CELL - 2} fill={shade(field(c / COLS, r / ROWS))} opacity={1 - toMap * 0.75} />,
      );
    }
  }
  const W = COLS * CELL;
  const H = ROWS * CELL;
  const roads = [
    `M0,${H * 0.45} C${W * 0.3},${H * 0.4} ${W * 0.5},${H * 0.5} ${W},${H * 0.42}`,
    `M${W * 0.62},0 L${W * 0.62},${H}`,
    `M${W * 0.2},${H} L${W * 0.75},0`,
  ];
  const wadi = new Array(60).fill(0).map((_, i) => {
    const x = i / 59;
    return `${i ? 'L' : 'M'}${x * W},${(0.3 + 0.12 * Math.sin(x * 7)) * H}`;
  }).join(' ');
  const blocks = [];
  for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) blocks.push([W * (0.5 + i * 0.035), H * (0.35 + j * 0.05)]);
  const pins = [[0.62, 0.45], [0.3, 0.3], [0.82, 0.62]];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width={W} height={H} style={{transform: `scale(${zoomOut})`}}>
        {cells}
        <g fill="none" stroke="#fff" strokeLinecap="round">
          {roads.map((d, i) => (
            <path key={i} d={d} strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={toMap} />
          ))}
          <path d={wadi} stroke="#9DA2E6" strokeWidth={10} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity={toMap} />
        </g>
        {blocks.map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={W * 0.028} height={H * 0.04} fill="none" stroke="#fff" strokeWidth={2} opacity={toMap * (draw > i / blocks.length ? 1 : 0)} />
        ))}
        {pins.map(([x, y], i) => {
          const on = interpolate(frame, [230 + i * 12, 240 + i * 12], [0, 1], clamp);
          return (
            <g key={i} transform={`translate(${x * W} ${y * H}) scale(${on})`}>
              <circle r={34} fill="none" stroke="#fff" strokeWidth={3} />
              <circle r={12} fill="#fff" />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const PixelJourney: React.FC = () => (
  <AbsoluteFill>
    <LightAct />
    <ImageAct />
    <Caption ar="كل شيء يبدأ بشعاع ضوء" en="It all starts with a ray of light" from={0} to={88} pos="top" />
    <Caption ar="ينعكس عن الأرض… ويلتقطه قمر صناعي" en="Reflected by Earth, captured from orbit" from={92} to={168} pos="top" />
    <Caption ar="بكسل واحد… يصبح ملايين" en="One pixel becomes millions" from={180} to={300} pos="bottom" />
    <Caption ar="والصورة تصبح خريطة" en="The image becomes a map" from={310} to={450} pos="bottom" />
  </AbsoluteFill>
);
