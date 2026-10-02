// الفيلم ٨ (فكرة ٣٠): «حبر» — على ورق فاتح تسقط قطرة حبر نحاسية فتنتشر وتتحول إلى الدرعية،
// ثم قطرة زرقاء (نيو كابتا) تكتب ما سيأتي، ويلتقي الحبران فيغمر المشهد. «نكتب الفصل القادم… معاً»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {AERIAL, CROPS, GOLD, LuxText} from './cine';
import {clamp, useFonts} from './shared';

const PAPER = '#F1EBE1';
const SEPIA = '#5A3520';
const NAVY_INK = '#1A2468';
const easeOut = (x: number) => 1 - (1 - x) ** 3;

type Blob = {x: number; y: number; r: number; seed: number};

// بقع حبر: دوائر رئيسية + رذاذ صغير، حوافها عضوية عبر تشويه الضوضاء
const blobsFor = (b: Blob) => {
  const sat = [0.7, 1.9, 3.1, 4.4, 5.6].map((a, i) => ({
    x: b.x + Math.cos(a + b.seed) * b.r * (1.05 + (i % 2) * 0.18),
    y: b.y + Math.sin(a + b.seed) * b.r * (1.05 + (i % 2) * 0.18),
    r: b.r * (0.09 + (i % 3) * 0.04),
  }));
  return [{x: b.x, y: b.y, r: b.r}, ...sat];
};

const Circles: React.FC<{blobs: Blob[]; k?: number; fill: string}> = ({blobs, k = 1, fill}) => (
  <>
    {blobs.flatMap((b, i) => blobsFor(b).map((c, j) => (c.r > 0.5 ? <circle key={`${i}-${j}`} cx={c.x} cy={c.y} r={c.r * k} fill={fill} /> : null)))}
  </>
);

// طبقة الورق فوق الصور: فيها ثقوب على شكل الحبر، وحافة حبر داكنة حول كل ثقب
const PaperOver: React.FC<{blobs: Blob[]; rims: string[]}> = ({blobs, rims}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <defs>
      <filter id="inkEdge" x={0} y={0} width={1920} height={1080} filterUnits="userSpaceOnUse">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves={3} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={95} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <radialGradient id="paperG" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor="#F7F2EA" />
        <stop offset="100%" stopColor="#DDD3C3" />
      </radialGradient>
      <mask id="holes">
        <rect width={1920} height={1080} fill="#fff" />
        <g filter="url(#inkEdge)">
          <Circles blobs={blobs} fill="#000" />
        </g>
      </mask>
    </defs>
    {/* حافة الحبر: نفس الشكل أكبر قليلاً، تظهر فقط خارج الثقب */}
    <g mask="url(#holes)">
      <rect width={1920} height={1080} fill="url(#paperG)" />
      {blobs.map((b, i) => (
        <g key={i} filter="url(#inkEdge)" opacity={0.92}>
          <Circles blobs={[b]} k={1.07} fill={rims[i]} />
        </g>
      ))}
    </g>
  </svg>
);

const InkText: React.FC<{from: number; to: number; children: React.ReactNode; color?: string; size?: number; bottom?: number; top?: number}> = ({from, to, children, color = NAVY_INK, size = 62, bottom, top}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 22, to - 15, to], [0, 1, 1, 0], clamp);
  return (
    <div dir="rtl" style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', ...(top !== undefined ? {top} : {bottom: bottom ?? 90}), fontFamily: FONT, fontSize: size, fontWeight: 700, color, opacity: o, filter: `blur(${(1 - o) * 6}px)`, textShadow: `0 0 18px ${PAPER}, 0 0 36px ${PAPER}, 0 0 60px ${PAPER}`}}>
      {children}
    </div>
  );
};

const Drop: React.FC<{x: number; y: number; at: number; color: string}> = ({x, y, at, color}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 40) return null;
  const fall = interpolate(t, [0, 22], [-80, y], {...clamp, easing: (q) => q * q});
  const splash = interpolate(t, [22, 40], [0, 1], clamp);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {t < 23 ? <ellipse cx={x} cy={fall} rx={14} ry={22} fill={color} /> : null}
      {t >= 22 ? <circle cx={x} cy={y} r={30 + splash * 160} fill="none" stroke={color} strokeWidth={6 * (1 - splash)} opacity={1 - splash} /> : null}
    </svg>
  );
};

export const FilmInk: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  const A = {x: 620, y: 500};
  const B = {x: 1310, y: 560};
  const rA =
    f < 600
      ? interpolate(f, [22, 160, 300, 600], [0, 330, 380, 520], {...clamp, easing: easeOut})
      : interpolate(f, [600, 690], [520, 1500], {...clamp, easing: (x) => x * x});
  const rB =
    f < 600
      ? interpolate(f, [322, 450, 600], [0, 330, 470], {...clamp, easing: easeOut})
      : interpolate(f, [600, 690], [470, 1500], {...clamp, easing: (x) => x * x});
  const blobs: Blob[] = [
    {...A, r: rA, seed: 0.4},
    {...B, r: rB, seed: 2.2},
  ];
  // الحبر يتحول إلى صورة: صبغة الحبر تتلاشى تدريجياً
  const tintA = interpolate(f, [60, 170], [1, 0], clamp);
  const tintB = interpolate(f, [360, 470], [1, 0], clamp);
  const merge = interpolate(f, [470, 560], [0, 1], clamp);
  const endO = interpolate(f, [770, 792], [0, 1], clamp);
  const stroke = interpolate(f, [800, 850], [0, 1], {...clamp, easing: easeOut});
  const logos = spring({frame: f - 790, fps, config: {damping: 18}});
  const tower = CROPS.towerNight;

  return (
    <AbsoluteFill style={{background: PAPER, opacity: out}}>
      <Audio src={staticFile('music-film-ink.wav')} />

      {f < 790 ? (
        <AbsoluteFill>
          {/* الصور تحت الورق */}
          <AbsoluteFill style={{opacity: 1 - merge}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'hidden'}}>
              <Img src={tower.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', transform: `scale(${1.05 + f * 0.0004})`}} />
              <AbsoluteFill style={{background: SEPIA, opacity: tintA * 0.95}} />
            </div>
            <div style={{position: 'absolute', left: 1000, top: 0, width: 920, height: 1080, overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, black 140px)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 140px)'}}>
              <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '65% 55%', transform: `scale(${1.3 + f * 0.0004})`}} />
              <AbsoluteFill style={{background: NAVY_INK, opacity: tintB * 0.95}} />
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{opacity: merge}}>
            <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.2 - (f - 470) * 0.0006})`}} />
            <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.6))', opacity: interpolate(f, [620, 680], [0, 1], clamp)}} />
          </AbsoluteFill>

          <PaperOver blobs={blobs} rims={[SEPIA, NAVY_INK]} />
          <Drop x={A.x} y={A.y} at={0} color={SEPIA} />
          <Drop x={B.x} y={B.y} at={300} color={NAVY_INK} />
        </AbsoluteFill>
      ) : null}

      <InkText from={40} to={150} color={SEPIA} top={150}>قطرةُ حبر…</InkText>
      <InkText from={160} to={295} color={SEPIA} top={150}>كتبت تاريخ الدرعية.</InkText>
      <InkText from={335} to={455} top={150}>وقطرةٌ أخرى… تكتب ما سيأتي.</InkText>
      <InkText from={470} to={595} top={150} size={70}>وحين يلتقي الحبر بالحبر…</InkText>
      <LuxText from={630} to={785} bottom={190} size={76}>نكتب الفصل القادم… معاً.</LuxText>
      <LuxText from={650} to={785} bottom={140} size={26} dir="ltr" spacing={10} weight={300} color={GOLD}>THE NEXT CHAPTER, IN ONE INK</LuxText>

      {/* الختام على الورق */}
      {f >= 770 ? (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #F7F2EA, #DDD3C3)', opacity: endO, justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 20}}>
          <div style={{display: 'flex', gap: 70, alignItems: 'center', opacity: logos, transform: `translateY(${(1 - logos) * 20}px)`}}>
            <NeoLogo size={190} style={{boxShadow: '0 10px 30px rgba(0,0,0,0.18)'}} />
            <div style={{fontSize: 70, fontWeight: 200, color: SEPIA}}>×</div>
            <DiriyahLogo size={190} style={{boxShadow: '0 10px 30px rgba(0,0,0,0.18)'}} />
          </div>
          <div style={{fontSize: 58, fontWeight: 300, letterSpacing: 12, color: NAVY_INK, opacity: logos}}>WRITTEN TOGETHER</div>
          {/* ضربة فرشاة حبر */}
          <svg width={720} height={40} style={{opacity: logos}}>
            <defs>
              <filter id="brush">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={3} />
                <feDisplacementMap in="SourceGraphic" scale={10} />
              </filter>
            </defs>
            <path d="M20 22 C 200 8, 520 34, 700 16" stroke={COLORS.copper} strokeWidth={12} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - stroke} filter="url(#brush)" />
          </svg>
          <div dir="rtl" style={{fontSize: 40, fontWeight: 700, color: SEPIA, opacity: logos}}>نيو كابتا × شركة الدرعية — شراكة استراتيجية</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
