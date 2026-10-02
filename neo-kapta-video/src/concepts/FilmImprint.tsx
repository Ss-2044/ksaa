// الفيلم ٥ (فكرة ٢٧): «بصمة» — بصمة نحاسية تُرسم وتتحول إلى الطين النجدي، وبصمة زرقاء لنيو كابتا،
// ثم تتداخل البصمتان وتعبر الكاميرا خلالهما إلى الدرعية: «حين تلتقي البصمتان… يُصنع أثرٌ لا يُنسى»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {AERIAL, CineFrame, GOLD, LuxText, TOWER} from './cine';
import {clamp, useFonts} from './shared';

// خطوط بصمة: حلقات بيضاوية متموجة حول مركز
const printPaths = (seed: number) =>
  new Array(26).fill(0).map((_, k) => {
    const r = 18 + k * 13;
    const pts = new Array(73).fill(0).map((__, i) => {
      const a = (i / 72) * Math.PI * 2;
      const wob = Math.sin(a * 3 + k * 0.5 + seed) * 6 + Math.sin(a * 7 + seed * 2) * 3;
      const gap = k > 4 && Math.sin(a + k + seed) > 0.93; // فراغات طبيعية في الخطوط
      return {x: Math.cos(a) * (r + wob) * 0.78, y: Math.sin(a) * (r + wob) * 1.05, gap};
    });
    let d = '';
    pts.forEach((p, i) => {
      d += `${i === 0 || pts[i - 1].gap ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    });
    return d;
  });

const PRINT_A = printPaths(0.3);
const PRINT_B = printPaths(2.1);

const Print: React.FC<{paths: string[]; color: string; draw: number; x: number; y: number; scale?: number; opacity?: number}> = ({paths, color, draw, x, y, scale = 1, opacity = 1}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity}}>
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {paths.map((d, k) => (
        <path key={k} d={d} fill="none" stroke={color} strokeWidth={3.2 / scale} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, draw * 1.6 - k * 0.025))} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
      ))}
    </g>
  </svg>
);

export const FilmImprint: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  const drawA = interpolate(f, [10, 140], [0, 1], clamp);
  const growA = interpolate(f, [150, 290], [1, 5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x});
  const towerO = interpolate(f, [170, 230, 285, 300], [0, 1, 1, 0], clamp);
  const drawB = interpolate(f, [305, 430], [0, 1], clamp);
  const meet = interpolate(f, [455, 560], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x)});
  const through = interpolate(f, [600, 680], [1, 9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * x});
  const aerialO = interpolate(f, [640, 690], [0, 1], clamp);
  const endO = interpolate(f, [785, 805], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#050404', opacity: out}}>
      <Audio src={staticFile('music-film-imprint.wav')} />

      {/* ١) بصمة الدرعية النحاسية */}
      {f < 300 ? (
        <AbsoluteFill>
          <AbsoluteFill style={{opacity: towerO}}>
            <Img src={TOWER} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '45% 85%', transform: 'scale(1.8)', transformOrigin: '45% 85%', filter: 'brightness(0.75)'}} />
          </AbsoluteFill>
          <Print paths={PRINT_A} color={COLORS.copperLight} draw={drawA} x={960} y={500} scale={growA} opacity={interpolate(f, [230, 290], [1, 0], clamp)} />
        </AbsoluteFill>
      ) : null}
      <LuxText from={30} to={150} bottom={170} size={70}>لكل مكان بصمة…</LuxText>
      <LuxText from={175} to={298} bottom={170} size={64}>والطين النجدي… بصمة الدرعية.</LuxText>

      {/* ٢) بصمة نيو كابتا الزرقاء */}
      {f >= 300 && f < 600 ? (
        <AbsoluteFill>
          <Print paths={PRINT_B} color={COLORS.neoBlueLight} draw={drawB} x={960 + meet * 0} y={500} />
          {f >= 450 ? <Print paths={PRINT_A} color={COLORS.copperLight} draw={1} x={interpolate(meet, [0, 1], [-300, 960])} y={500} opacity={0.9} /> : null}
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(255,230,190,${meet * 0.25}), transparent 35%)`}} />
        </AbsoluteFill>
      ) : null}
      <LuxText from={320} to={450} bottom={170} size={70}>ولكل علامة أثر.</LuxText>
      <LuxText from={465} to={598} bottom={170} size={70} color={GOLD}>حين تلتقي البصمتان…</LuxText>

      {/* ٣) العبور خلال البصمة إلى الدرعية */}
      {f >= 598 && f < 795 ? (
        <AbsoluteFill>
          <AbsoluteFill style={{opacity: aerialO}}>
            <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.2 - (f - 640) * 0.0008})`, filter: 'saturate(1.1)'}} />
            <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65))'}} />
          </AbsoluteFill>
          <Print paths={PRINT_A} color={COLORS.copperLight} draw={1} x={960} y={500} scale={through} opacity={1 - aerialO} />
          <Print paths={PRINT_B} color={COLORS.neoBlueLight} draw={1} x={960} y={500} scale={through} opacity={1 - aerialO} />
          <LuxText from={680} to={792} bottom={190} size={76}>يُصنع أثرٌ لا يُنسى.</LuxText>
          <LuxText from={695} to={792} bottom={140} size={26} dir="ltr" spacing={10} weight={300} color={GOLD}>AN IMPRINT THAT LASTS</LuxText>
        </AbsoluteFill>
      ) : null}

      {f >= 785 ? (
        <AbsoluteFill style={{background: '#050404', justifyContent: 'center', alignItems: 'center', gap: 24, fontFamily: FONT, opacity: endO}}>
          <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
            <NeoLogo size={190} />
            <div style={{fontSize: 70, fontWeight: 200, color: GOLD}}>×</div>
            <DiriyahLogo size={190} />
          </div>
          <div style={{fontSize: 56, fontWeight: 200, letterSpacing: 10, color: '#fff'}}>LEAVE AN IMPRINT</div>
          <div dir="rtl" style={{fontSize: 40, color: GOLD}}>نيو كابتا × شركة الدرعية</div>
        </AbsoluteFill>
      ) : null}

      <CineFrame />
    </AbsoluteFill>
  );
};
