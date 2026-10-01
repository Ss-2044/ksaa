import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {Caption} from './Caption';
import {Chip, KenBurns} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Markers on the close-up: cloud pair at right, their shadows offset to the south-west.
const Markers: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 140 || frame > 262) return null;
  const p = interpolate(frame, [150, 170], [0, 1], clamp);
  const arrow = interpolate(frame, [175, 200], [0, 1], clamp);
  const op = interpolate(frame, [250, 262], [1, 0], clamp);
  const cloud = {x: 1510, y: 495};
  const shadow = {x: 1425, y: 610};
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', opacity: op}}>
      <circle cx={cloud.x} cy={cloud.y} r={60 * p} fill="none" stroke="#fff" strokeWidth={3} />
      <circle cx={shadow.x} cy={shadow.y} r={60 * p} fill="none" stroke="#9DA2E6" strokeWidth={3} strokeDasharray="8 8" />
      <line x1={cloud.x} y1={cloud.y} x2={cloud.x + (shadow.x - cloud.x) * arrow} y2={cloud.y + (shadow.y - cloud.y) * arrow} stroke="#fff" strokeWidth={3} />
      <text x={cloud.x + 75} y={cloud.y - 10} fill="#fff" fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={40} opacity={p}>
        غيمة
      </text>
      <text x={cloud.x + 75} y={cloud.y + 26} fill="rgba(255,255,255,0.7)" fontFamily="Montserrat" fontSize={20} letterSpacing={3} opacity={p}>
        CLOUD
      </text>
      <text x={shadow.x - 260} y={shadow.y + 90} fill="#fff" fontFamily="IBM Plex Sans Arabic" fontWeight={700} fontSize={40} opacity={p}>
        ظلّها
      </text>
      <text x={shadow.x - 260} y={shadow.y + 124} fill="rgba(255,255,255,0.7)" fontFamily="Montserrat" fontSize={20} letterSpacing={3} opacity={p}>
        SHADOW
      </text>
    </svg>
  );
};

// Geometry: shadow offset d = h · tan(θ), θ = sun zenith angle → h = d ÷ tan(θ).
const Diagram: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 255 || frame > 392) return null;
  const op = interpolate(frame, [255, 270, 380, 392], [0, 1, 1, 0], clamp);
  const ray = interpolate(frame, [270, 310], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const formula = interpolate(frame, [315, 335], [0, 1], clamp);
  const G = 820; // ground y
  const C = {x: 1080, y: 380}; // cloud
  const S = {x: 760, y: G}; // shadow
  return (
    <AbsoluteFill style={{background: 'rgba(13,15,34,0.92)', opacity: op}}>
      <svg width={1920} height={1080}>
        <line x1={300} x2={1620} y1={G} y2={G} stroke="#fff" strokeWidth={3} />
        {/* cloud */}
        <g transform={`translate(${C.x} ${C.y})`}>
          <ellipse rx={90} ry={40} fill="#fff" />
          <ellipse cx={-50} cy={10} rx={60} ry={30} fill="#fff" />
          <ellipse cx={55} cy={12} rx={55} ry={28} fill="#fff" />
        </g>
        {/* sun ray through the cloud to the shadow */}
        <line x1={C.x + (C.x - S.x) * 0.6} y1={C.y - (G - C.y) * 0.6} x2={C.x + (S.x - C.x) * ray} y2={C.y + (G - C.y) * ray} stroke="#F5D76E" strokeWidth={3} strokeDasharray="10 8" />
        <circle cx={C.x + (C.x - S.x) * 0.6} cy={C.y - (G - C.y) * 0.6} r={34} fill="#F5D76E" />
        {/* shadow */}
        <ellipse cx={S.x} cy={G + 4} rx={90 * ray} ry={12} fill="#000" opacity={0.85} />
        {/* height h */}
        <line x1={C.x} y1={C.y + 45} x2={C.x} y2={G} stroke="#fff" strokeDasharray="6 6" strokeWidth={2} />
        <text x={C.x + 20} y={(C.y + G) / 2} fill="#fff" fontFamily="Montserrat" fontWeight={700} fontSize={46}>
          h
        </text>
        {/* offset d */}
        <line x1={S.x} y1={G + 50} x2={C.x} y2={G + 50} stroke="#9DA2E6" strokeWidth={3} opacity={ray} />
        <text x={(S.x + C.x) / 2 - 12} y={G + 100} fill="#9DA2E6" fontFamily="Montserrat" fontWeight={700} fontSize={46} opacity={ray}>
          d
        </text>
        {/* zenith angle θ */}
        <line x1={C.x} y1={C.y - 45} x2={C.x} y2={C.y - 230} stroke="rgba(255,255,255,0.5)" strokeDasharray="4 6" />
        <text x={C.x + 30} y={C.y - 130} fill="#F5D76E" fontFamily="Montserrat" fontWeight={700} fontSize={42} opacity={ray}>
          θ
        </text>
      </svg>
      <div style={{position: 'absolute', right: 140, top: 150, opacity: formula, textAlign: 'right'}}>
        <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 64, color: '#fff'}}>h = d ÷ tan θ</div>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 32, color: 'rgba(255,255,255,0.8)', marginTop: 10, lineHeight: 1.6}}>
          h ارتفاع الغيمة · d إزاحة الظل
          <br />θ زاوية الشمس عن العمود
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CloudShadow: React.FC = () => (
  <AbsoluteFill style={{background: '#0D0F22'}}>
    <KenBurns src="space/empty-quarter-sharurah.jpg" from={0} to={130} zoom={[1.0, 1.9]} pan={[[0, 0], [8, 6]]} grade={0.15} />
    <KenBurns src="space/cloud-shadows.jpg" from={118} to={450} zoom={[1.0, 1.08]} grade={0.1} />
    <Markers />
    <Diagram />
    <Chip ar="الربع الخالي قرب شرورة" en="USGS / NASA · Landsat 7" from={0} to={255} corner="tr" />
    <Caption ar="فوق الربع الخالي… غيوم صغيرة" en="Small clouds over the Empty Quarter" from={6} to={128} pos="bottom" size={62} />
    <Caption ar="ولكل غيمة… ظلّ ينزاح عنها" en="Every cloud casts an offset shadow" from={140} to={252} pos="bottom" size={62} />
    <Caption ar="ومن إزاحة الظل… نحسب ارتفاع الغيمة" en="From the shadow's offset, we compute the cloud's height" from={262} to={388} pos="bottom" size={56} />
    <Caption ar="حتى الظل… بيانات" en="Even a shadow is data" from={396} to={450} pos="bottom" size={78} />
  </AbsoluteFill>
);
