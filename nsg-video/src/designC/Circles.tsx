import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {fonts} from '../theme';
import {TitleC} from './TextC';
import {C} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Act 1: one field, framed in a big circle.
const OneField: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > 120) return null;
  const p = interpolate(frame, [0, 18], [0, 1], clamp);
  const out = interpolate(frame, [106, 120], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 260, top: 160, width: 760, height: 760, borderRadius: '50%', overflow: 'hidden', clipPath: `circle(${50 * p * out}% at 50% 50%)`, boxShadow: '0 40px 100px rgba(22,24,47,0.3)'}}>
      <Img src={staticFile('space/sirhan-2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '62% 55%', transform: `scale(${interpolate(frame, [0, 120], [3.2, 2.2])})`}} />
    </div>
  );
};

// Act 2: line diagram of a centre-pivot — an arm sweeping around its pivot.
const PivotDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 110 || frame > 232) return null;
  const op = interpolate(frame, [110, 124, 220, 232], [0, 1, 1, 0], clamp);
  const a = (frame - 110) * 0.05;
  const R = 320;
  const swept = Math.min(Math.PI * 2, a);
  const large = swept > Math.PI ? 1 : 0;
  const ex = Math.cos(swept - Math.PI / 2) * R;
  const ey = Math.sin(swept - Math.PI / 2) * R;
  return (
    <svg width={900} height={900} viewBox="-450 -450 900 900" style={{position: 'absolute', left: 190, top: 90, opacity: op}}>
      <circle r={R} fill="none" stroke={C.ink} strokeWidth={3} />
      {swept < Math.PI * 2 ? <path d={`M0,0 L0,${-R} A${R},${R} 0 ${large} 1 ${ex},${ey} Z`} fill={C.accent} opacity={0.25} /> : <circle r={R} fill={C.accent} opacity={0.25} />}
      {[0.25, 0.5, 0.75].map((k) => (
        <circle key={k} r={R * k} fill="none" stroke={C.line} strokeDasharray="4 8" />
      ))}
      <g transform={`rotate(${(a * 180) / Math.PI})`}>
        <line x1={0} y1={0} x2={0} y2={-R} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
        {[0.2, 0.4, 0.6, 0.8, 1].map((k) => (
          <circle key={k} cx={0} cy={-R * k} r={9} fill="#fff" stroke={C.ink} strokeWidth={3} />
        ))}
      </g>
      <circle r={16} fill={C.ink} />
      <text x={0} y={R + 60} textAnchor="middle" fill={C.ink} fontFamily="Montserrat" fontWeight={700} fontSize={22} letterSpacing={4}>
        CENTRE PIVOT
      </text>
    </svg>
  );
};

// Act 3: a grid of circular crops that pop in, with a counter.
const CircleGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < 222 || frame > 346) return null;
  const out = interpolate(frame, [334, 346], [1, 0], clamp);
  const srcs = ['space/al-jowf-pivots.jpg', 'space/sirhan-3.jpg', 'space/sulayyil-pivots.jpg'];
  const items = [];
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 5; c++) {
      const i = r * 5 + c;
      const p = spring({frame: frame - 226 - i * 3, fps, config: {damping: 12}});
      items.push(
        <div key={i} style={{position: 'absolute', left: 130 + c * 190, top: 170 + r * 250, width: 170, height: 170, borderRadius: '50%', overflow: 'hidden', transform: `scale(${p * out})`, boxShadow: '0 12px 30px rgba(22,24,47,0.25)'}}>
          <Img src={staticFile(srcs[i % 3])} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(i * 37) % 100}% ${(i * 53) % 100}%`, transform: 'scale(2.6)'}} />
        </div>,
      );
    }
  const n = Math.round(interpolate(frame, [226, 300], [0, 15], clamp));
  return (
    <>
      {items}
      <div style={{position: 'absolute', left: 130, bottom: 70, fontFamily: fonts.en, fontWeight: 800, fontSize: 64, color: C.ink, opacity: out}}>
        {String(n).padStart(2, '0')} <span style={{fontSize: 22, letterSpacing: '0.3em', fontWeight: 600, color: C.muted}}>FIELDS DETECTED</span>
      </div>
    </>
  );
};

// Act 4: Al Jowf, 22 → thousands.
const Jowf: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < 338) return null;
  const p = interpolate(frame, [338, 356], [0, 1], clamp);
  return (
    <>
      <div style={{position: 'absolute', left: 230, top: 140, width: 800, height: 800, borderRadius: '50%', overflow: 'hidden', clipPath: `circle(${50 * p}% at 50% 50%)`, boxShadow: '0 40px 100px rgba(22,24,47,0.3)'}}>
        <Img src={staticFile('space/al-jowf-pivots.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [338, 450], [1.4, 1.05])})`}} />
      </div>
      <div style={{position: 'absolute', right: 140, top: 560, display: 'flex', gap: 60, flexDirection: 'row-reverse', opacity: interpolate(frame, [370, 386], [0, 1], clamp)}}>
        {[
          ['1989', '22', 'حقلاً'],
          ['2020', 'الآلاف', ''],
        ].map(([y, v, u], i) => (
          <div key={y} style={{textAlign: 'right', borderTop: `3px solid ${C.ink}`, paddingTop: 12, opacity: i === 1 ? interpolate(frame, [392, 406], [0, 1], clamp) : 1}}>
            <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', color: C.muted}}>{y}</div>
            <div dir="rtl" style={{fontFamily: v === '22' ? fonts.en : fonts.ar, fontWeight: 800, fontSize: 96, color: C.ink, lineHeight: 1.1}}>
              {v} <span style={{fontFamily: fonts.ar, fontSize: 36, fontWeight: 600}}>{u}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export const Circles: React.FC = () => (
  <AbsoluteFill>
    <OneField />
    <PivotDiagram />
    <CircleGrid />
    <Jowf />
    <TitleC n="01" ar="دائرة خضراء… في قلب الصحراء" en="A green circle in the heart of the desert" from={8} to={112} size={76} style={{right: 120, top: 380, width: 720}} />
    <TitleC n="02" ar="ذراعٌ يدور حول محور… فيرسم دائرة" en="An arm turns around a pivot and draws a circle" from={118} to={226} size={72} style={{right: 120, top: 380, width: 720}} />
    <TitleC n="03" ar="من الفضاء نعدّها… ونقيس نموّها" en="From space we count them and track their growth" from={232} to={338} size={70} style={{right: 120, top: 380, width: 700}} />
    <TitleC n="04" ar="الجوف: من 22 حقلاً… إلى الآلاف" en="Al Jowf: from 22 fields to thousands" from={344} to={450} size={66} style={{right: 120, top: 330, width: 760}} />
  </AbsoluteFill>
);
