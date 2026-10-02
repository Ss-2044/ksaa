// الفيلم ٧ (فكرة ٢٩): «سدو» — خيط نحاسي (الدرعية) وخيط أزرق (نيو كابتا) يلتقيان، ثم يُنسج نقش سدو نجدي
// يملأ الشاشة، وتنفتح فيه نوافذ معيّنة تُطل على الدرعية. «معاً… ننسج حضوراً لا يُنسى»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {AERIAL, CROPS, CineFrame, Crop, GOLD, LuxText} from './cine';
import {clamp, useFonts} from './shared';

const RED = '#7A2E22';
const INK = '#0B0806';
const W = 1920;

type BandT = 'stripe' | 'zigzag' | 'diamond' | 'check' | 'teeth' | 'dots';
const BANDS: {h: number; t: BandT; a: string; b: string}[] = [
  {h: 22, t: 'stripe', a: COLORS.copper, b: INK},
  {h: 60, t: 'teeth', a: COLORS.sand, b: RED},
  {h: 14, t: 'stripe', a: INK, b: INK},
  {h: 110, t: 'diamond', a: COLORS.copperLight, b: COLORS.navy},
  {h: 14, t: 'stripe', a: COLORS.neoBlue, b: INK},
  {h: 48, t: 'check', a: COLORS.sand, b: INK},
  {h: 90, t: 'zigzag', a: RED, b: COLORS.sand},
  {h: 22, t: 'stripe', a: COLORS.copper, b: INK},
  {h: 120, t: 'diamond', a: COLORS.neoBlueLight, b: INK},
  {h: 22, t: 'stripe', a: COLORS.copper, b: INK},
  {h: 90, t: 'zigzag', a: COLORS.navy, b: COLORS.copperLight},
  {h: 48, t: 'dots', a: COLORS.sand, b: RED},
  {h: 14, t: 'stripe', a: COLORS.neoBlue, b: INK},
  {h: 110, t: 'diamond', a: COLORS.sand, b: RED},
  {h: 14, t: 'stripe', a: INK, b: INK},
  {h: 60, t: 'teeth', a: COLORS.copperLight, b: COLORS.navy},
  {h: 22, t: 'stripe', a: COLORS.copper, b: INK},
  {h: 120, t: 'zigzag', a: COLORS.neoBlue, b: COLORS.sand},
  {h: 22, t: 'stripe', a: COLORS.copper, b: INK},
  {h: 60, t: 'teeth', a: COLORS.sand, b: RED},
];
const BAND_Y = BANDS.reduce<number[]>((acc, b, i) => [...acc, i === 0 ? 0 : acc[i - 1] + BANDS[i - 1].h], []);

const BandShape: React.FC<{h: number; t: BandT; a: string; b: string; w?: number}> = ({h, t, a, b, w = W}) => {
  const els: React.ReactNode[] = [<rect key="bg" width={w} height={h} fill={b} />];
  if (t === 'stripe') els.push(<rect key="s" width={w} height={h} fill={a} />);
  if (t === 'zigzag') {
    const u = h * 0.9;
    let pts = '';
    for (let x = -u; x < w + u; x += u) pts += `${x},${h} ${x + u / 2},0 ${x + u},${h} `;
    els.push(<polygon key="z" points={`${pts} ${w + u},${h}`} fill={a} />);
    for (let x = -u; x < w + u; x += u) els.push(<polygon key={`zi${x}`} points={`${x + u / 2 - u * 0.14},${h} ${x + u / 2},${h * 0.62} ${x + u / 2 + u * 0.14},${h}`} fill={b} />);
  }
  if (t === 'diamond') {
    const u = h * 1.1;
    for (let x = 0; x < w + u; x += u) {
      const cx = x + u / 2;
      const cy = h / 2;
      const d = (k: number) => `${cx},${cy - h * 0.44 * k} ${cx + u * 0.46 * k},${cy} ${cx},${cy + h * 0.44 * k} ${cx - u * 0.46 * k},${cy}`;
      els.push(<polygon key={`d${x}`} points={d(1)} fill={a} />);
      els.push(<polygon key={`e${x}`} points={d(0.55)} fill={b} />);
      els.push(<polygon key={`f${x}`} points={d(0.2)} fill={a} />);
      els.push(<polygon key={`g${x}`} points={`${x},${cy - 6} ${x + 6},${cy} ${x},${cy + 6} ${x - 6},${cy}`} fill={a} />);
    }
  }
  if (t === 'check') {
    const s = h / 2;
    for (let x = 0, i = 0; x < w; x += s, i++) {
      els.push(<rect key={`c${i}`} x={x} y={i % 2 ? 0 : s} width={s} height={s} fill={a} />);
    }
  }
  if (t === 'teeth') {
    const s = h / 2;
    for (let x = 0; x < w + s; x += s) {
      els.push(<polygon key={`t${x}`} points={`${x},0 ${x + s / 2},${s * 0.8} ${x + s},0`} fill={a} />);
      els.push(<polygon key={`u${x}`} points={`${x + s / 2},${h} ${x + s},${h - s * 0.8} ${x + s * 1.5},${h}`} fill={a} />);
    }
  }
  if (t === 'dots') {
    const s = h;
    for (let x = s / 2; x < w; x += s) els.push(<rect key={`p${x}`} x={x - h * 0.18} y={h * 0.32} width={h * 0.36} height={h * 0.36} transform={`rotate(45 ${x} ${h / 2})`} fill={a} />);
  }
  return <>{els}</>;
};

// النسيج: كل شريط يُنسج من اليمين لليسار ثم العكس، مثل مكوك النول
const Loom: React.FC<{start: number; stagger: number; dur: number}> = ({start, stagger, dur}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        {BANDS.map((b, i) => {
          const p = interpolate(f, [start + i * stagger, start + i * stagger + dur], [0, 1], clamp);
          const w = p * W;
          return (
            <clipPath key={i} id={`sadu${i}`}>
              <rect x={i % 2 ? 0 : W - w} y={0} width={w} height={b.h} />
            </clipPath>
          );
        })}
      </defs>
      {BANDS.map((b, i) => {
        const p = interpolate(f, [start + i * stagger, start + i * stagger + dur], [0, 1], clamp);
        if (p <= 0) return null;
        const edge = i % 2 ? p * W : W - p * W;
        return (
          <g key={i} transform={`translate(0 ${BAND_Y[i]})`}>
            <g clipPath={`url(#sadu${i})`}>
              <BandShape {...b} />
            </g>
            {p < 1 ? <circle cx={edge} cy={b.h / 2} r={7} fill="#fff" style={{filter: `drop-shadow(0 0 14px ${GOLD})`}} /> : null}
          </g>
        );
      })}
    </svg>
  );
};

// نافذة معيّن تُطل على الدرعية من داخل النسيج
const Window: React.FC<{crop: Crop; cx: number; cy: number; r: number; o: number}> = ({crop, cx, cy, r, o}) => {
  const c = CROPS[crop];
  const f = useCurrentFrame();
  const poly = `polygon(${cx}px ${cy - r}px, ${cx + r * 0.78}px ${cy}px, ${cx}px ${cy + r}px, ${cx - r * 0.78}px ${cy}px)`;
  return (
    <>
      <AbsoluteFill style={{clipPath: poly, opacity: o}}>
        <Img src={c.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos, transformOrigin: c.pos, transform: `scale(${c.zoom * (1 + f * 0.0003)})`}} />
      </AbsoluteFill>
      <svg width={W} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
        <polygon points={`${cx},${cy - r} ${cx + r * 0.78},${cy} ${cx},${cy + r} ${cx - r * 0.78},${cy}`} fill="none" stroke={GOLD} strokeWidth={5} />
        <polygon points={`${cx},${cy - r - 18} ${cx + (r + 18) * 0.78},${cy} ${cx},${cy + r + 18} ${cx - (r + 18) * 0.78},${cy}`} fill="none" stroke={INK} strokeWidth={8} />
      </svg>
    </>
  );
};

export const FilmSadu: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  const copper = interpolate(f, [15, 120], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
  const blue = interpolate(f, [165, 265], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 3});
  const knot = spring({frame: f - 262, fps, config: {damping: 10}});
  const threadsO = interpolate(f, [300, 330], [1, 0], clamp);
  const dim = interpolate(f, [510, 540], [0, 0.55], clamp);
  const win = (s: number) => spring({frame: f - s, fps, config: {damping: 16}});
  const grow = interpolate(f, [610, 690], [300, 1900], {...clamp, easing: (x) => x * x * x});
  const endP = spring({frame: f - 795, fps, config: {damping: 18}});

  return (
    <AbsoluteFill style={{background: INK, opacity: out}}>
      <Audio src={staticFile('music-film-sadu.wav')} />

      {/* ١) خيطان */}
      {f < 335 ? (
        <svg width={W} height={1080} style={{position: 'absolute', inset: 0, opacity: threadsO}}>
          <line x1={W} y1={540} x2={W - copper * W} y2={540} stroke={COLORS.copperLight} strokeWidth={5} style={{filter: `drop-shadow(0 0 10px ${COLORS.copper})`}} />
          <line x1={960} y1={0} x2={960} y2={blue * 1080} stroke={COLORS.neoBlueLight} strokeWidth={5} style={{filter: `drop-shadow(0 0 10px ${COLORS.neoBlue})`}} />
          {f > 262 ? (
            <g transform={`translate(960 540) rotate(45) scale(${knot})`}>
              <rect x={-22} y={-22} width={44} height={44} fill="none" stroke={GOLD} strokeWidth={4} />
              <rect x={-9} y={-9} width={18} height={18} fill={GOLD} />
            </g>
          ) : null}
        </svg>
      ) : null}
      <LuxText from={25} to={150} top={300} size={70} weight={300}>خيطٌ واحد… لا يصنع نسيجاً.</LuxText>
      <LuxText from={175} to={300} top={300} size={70} weight={300}>لكن حين يلتقي خيطان…</LuxText>

      {/* ٢) النسيج يملأ الشاشة */}
      {f >= 300 && f < 700 ? (
        <AbsoluteFill>
          <Loom start={300} stagger={9} dur={34} />
          <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
        </AbsoluteFill>
      ) : null}
      <LuxText from={345} to={505} size={84} weight={700}>يولد نقشٌ… لا يشبه غيره.</LuxText>

      {/* ٣) نوافذ على الدرعية */}
      {f >= 515 && f < 700 ? (
        <>
          <Window crop="towerNight" cx={480} cy={520} r={260 * win(525)} o={Math.min(1, win(525) * 2) * (f < 610 ? 1 : 0)} />
          <Window crop="people" cx={1440} cy={520} r={260 * win(555)} o={Math.min(1, win(555) * 2) * (f < 610 ? 1 : 0)} />
          <Window crop="aerialWide" cx={960} cy={540} r={f < 610 ? 300 * win(540) : grow} o={Math.min(1, win(540) * 2)} />
        </>
      ) : null}
      <LuxText from={545} to={612} bottom={150} size={56}>من نسيج الدرعية…</LuxText>
      <LuxText from={612} to={690} bottom={150} size={56} color={GOLD}>إلى نسيج الإبداع.</LuxText>

      {/* ٤) الدرعية كاملة */}
      {f >= 688 && f < 800 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [785, 800], [1, 0], clamp)}}>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.04 + (f - 688) * 0.0008})`, filter: 'saturate(1.1)'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65))'}} />
          <LuxText from={700} to={798} bottom={190} size={72}>معاً… ننسج حضوراً لا يُنسى.</LuxText>
          <LuxText from={715} to={798} bottom={140} size={26} dir="ltr" spacing={10} weight={300} color={GOLD}>WOVEN TOGETHER</LuxText>
        </AbsoluteFill>
      ) : null}

      {/* ٥) الختام: شريطا سدو والشعاران */}
      {f >= 790 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [790, 805], [0, 1], clamp)}}>
          <svg width={W} height={1080} style={{position: 'absolute', inset: 0}}>
            <g transform={`translate(${(1 - endP) * 300} 140)`}>
              <BandShape h={70} t="diamond" a={COLORS.copperLight} b={COLORS.navy} w={W + 400} />
            </g>
            <g transform={`translate(${(endP - 1) * 300 - 300} 870)`}>
              <BandShape h={70} t="diamond" a={COLORS.neoBlueLight} b={RED} w={W + 400} />
            </g>
          </svg>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 22, fontFamily: FONT, opacity: endP}}>
            <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
              <NeoLogo size={190} />
              <svg width={60} height={60}>
                <polygon points="30,2 58,30 30,58 2,30" fill="none" stroke={GOLD} strokeWidth={4} />
                <polygon points="30,18 42,30 30,42 18,30" fill={GOLD} />
              </svg>
              <DiriyahLogo size={190} />
            </div>
            <div style={{fontSize: 58, fontWeight: 200, letterSpacing: 12, color: '#fff'}}>WOVEN TOGETHER</div>
            <div dir="rtl" style={{fontSize: 40, color: GOLD}}>نيو كابتا × شركة الدرعية</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      <CineFrame bars={f >= 790 ? 0 : 110} />
    </AbsoluteFill>
  );
};
