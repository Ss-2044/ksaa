// الفكرة 22: «انعكاس على الماء» — سطح ماء ساكن يعكس الدرعية (صور حقيقية مقلوبة ومتموّجة)،
// قطرات تسقط وكل قطرة تُطلع كلمة من عمق الماء: الدرعية ← نيو كابتا ← شراكة استراتيجية
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const DROPS = [150, 420, 610];

// شدة التموّج: هادئة دائماً وتقوى بعد كل قطرة ثم تهدأ
const rippleStrength = (f: number) => 7 + DROPS.reduce((s, d) => s + (f >= d ? 45 * Math.exp(-(f - d) / 25) : 0), 0);

const Water: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="water" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={`0.004 ${0.035 + Math.sin(f / 40) * 0.004}`} numOctaves={2} seed={Math.floor(f / 3)} />
          <feDisplacementMap in="SourceGraphic" scale={rippleStrength(f)} />
        </filter>
      </svg>
      <AbsoluteFill style={{filter: 'url(#water)'}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const Rings: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 150) return null;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {[0, 1, 2, 3].map((k) => {
        const r = Math.max(0, (t - k * 12) * 9);
        if (r <= 0) return null;
        return <ellipse key={k} cx={x} cy={y} rx={r} ry={r * 0.28} fill="none" stroke="#fff" strokeWidth={3} opacity={Math.max(0, 0.6 - r / 1400)} />;
      })}
    </svg>
  );
};

const Drop: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const f = useCurrentFrame();
  const t = f - (at - 20);
  if (t < 0 || t > 20) return null;
  return <div style={{position: 'absolute', left: x - 8, top: -40 + (y + 40) * (t / 20) ** 2, width: 16, height: 26, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: 'rgba(230,240,255,0.9)', boxShadow: '0 0 12px rgba(255,255,255,0.8)'}} />;
};

const Word: React.FC<{from: number; to: number; ar: string; en: string; color: string; size?: number}> = ({from, to, ar, en, color, size = 170}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 40, to - 25, to], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, opacity: o}}>
      <div dir="rtl" style={{fontSize: size, fontWeight: 900, color, filter: `blur(${(1 - o) * 10}px)`, textShadow: '0 0 30px rgba(0,0,0,0.5)'}}>{ar}</div>
      <div style={{fontSize: 26, letterSpacing: 12, color: '#e6ecf5', opacity: 0.85}}>{en}</div>
    </AbsoluteFill>
  );
};

export const ReflectionConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  const towerO = interpolate(f, [80, 120, 380, 440], [0, 1, 1, 0], clamp);
  const aerialO = interpolate(f, [400, 460], [0, 1], clamp);
  const logosO = interpolate(f, [0, 30, 70, 100], [0, 1, 1, 0], clamp);
  const endO = interpolate(f, [790, 830], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#04070f', opacity: out}}>
      <Audio src={staticFile('music-reflection.wav')} />
      <Water>
        {/* انعكاس مقلوب ومعتّم بلون الماء */}
        <AbsoluteFill style={{opacity: towerO, transform: 'scaleY(-1)'}}>
          <Img src={staticFile('diriyah/tower-night.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 60%', filter: 'brightness(0.55) saturate(0.8)'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{opacity: aerialO, transform: 'scaleY(-1)'}}>
          <Img src={staticFile('diriyah/aerial.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55) saturate(0.85)'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,30,70,0.55), rgba(4,7,15,0.25) 50%, rgba(10,30,70,0.6))', mixBlendMode: 'multiply'}} />
        {/* الشعاران كانعكاس */}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: logosO}}>
          <div style={{display: 'flex', gap: 140}}>
            <NeoLogo size={300} />
            <DiriyahLogo size={300} />
          </div>
        </AbsoluteFill>
        <Word from={170} to={400} ar="الدرعية" en="A REFLECTION OF HERITAGE" color={COLORS.sand} />
        <Word from={440} to={600} ar="نيو كابتا" en="A REFLECTION OF CREATIVITY" color={COLORS.neoBlueLight} />
        <Word from={630} to={790} ar="شراكة استراتيجية" en="WHEN TWO REFLECTIONS MEET" color="#fff" size={150} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 24, fontFamily: FONT, opacity: endO}}>
          <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
            <NeoLogo size={220} />
            <DiriyahLogo size={220} />
          </div>
          <div style={{fontSize: 52, fontWeight: 700, color: '#fff'}}>Neo Capta × Diriyah Company</div>
        </AbsoluteFill>
      </Water>
      {/* لمعان سطح الماء */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent 30%)', pointerEvents: 'none'}} />
      <Drop at={DROPS[0]} x={960} y={520} />
      <Drop at={DROPS[1]} x={760} y={560} />
      <Drop at={DROPS[2]} x={1160} y={540} />
      <Rings at={DROPS[0]} x={960} y={520} />
      <Rings at={DROPS[1]} x={760} y={560} />
      <Rings at={DROPS[2]} x={1160} y={540} />
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: FONT, fontSize: 30, color: '#b9c6dd', opacity: interpolate(f, [200, 240, 760, 790], [0, 0.9, 0.9, 0], clamp)}} dir="rtl">
        {f < 420 ? 'انعكاس الأصالة…' : f < 610 ? 'انعكاس الإبداع…' : 'حين يلتقي الانعكاسان'}
      </div>
    </AbsoluteFill>
  );
};
