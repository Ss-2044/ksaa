// الفكرة 20: «تحت المجهر» — عدسة مجهر تقترب أكثر فأكثر: جدار الدرعية ← حبة رمل ← شبكة بلّورية بداخلها
// نقاط زرقاء (نيو كابتا) تنبض… ثم تبتعد العدسة فجأة إلى الصورة كاملة: «نرى ما لا يُرى»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

const R = 470; // نصف قطر العدسة
const TOWER = staticFile('diriyah/tower-night.jpg');

const Eyepiece: React.FC<{children: React.ReactNode; mag: string; blur: number; radius?: number}> = ({children, mag, blur, radius = R}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#020203'}}>
      <div style={{position: 'absolute', left: 960 - radius, top: 540 - radius, width: radius * 2, height: radius * 2, borderRadius: '50%', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: radius - 960, top: radius - 540, width: 1920, height: 1080, filter: `blur(${blur}px)`}}>{children}</div>
        {/* تظليل العدسة والانحراف اللوني */}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset 0 0 ${radius * 0.35}px ${radius * 0.12}px rgba(0,0,0,0.9), inset 0 0 0 3px rgba(111,127,240,0.35)`}} />
        {/* الشعيرات والمقياس */}
        <div style={{position: 'absolute', left: radius - 0.5, top: radius * 0.25, height: radius * 1.5, width: 1, background: 'rgba(255,255,255,0.25)'}} />
        <div style={{position: 'absolute', top: radius - 0.5, left: radius * 0.25, width: radius * 1.5, height: 1, background: 'rgba(255,255,255,0.25)'}} />
        {new Array(11).fill(0).map((_, i) => (
          <div key={i} style={{position: 'absolute', left: radius - 150 + i * 30, top: radius * 1.55, width: 1, height: i % 5 === 0 ? 22 : 12, background: 'rgba(255,255,255,0.5)'}} />
        ))}
      </div>
      <div style={{position: 'absolute', right: 130, top: 120, fontFamily: FONT, color: '#9aa3c7', textAlign: 'right'}}>
        <div style={{fontSize: 22, letterSpacing: 6}}>MAGNIFICATION</div>
        <div style={{fontSize: 64, fontWeight: 300, color: '#fff'}}>{mag}</div>
        <div style={{fontSize: 20, letterSpacing: 4, opacity: 0.6}}>FOCUS {Math.round(100 - blur * 4)}%</div>
      </div>
      <div style={{position: 'absolute', left: 130, top: 120, fontFamily: FONT, fontSize: 22, letterSpacing: 6, color: '#9aa3c7'}}>
        SAMPLE · DIRIYAH
        <div style={{fontSize: 18, opacity: 0.5, marginTop: 6}}>T+{String(Math.floor(f / 30)).padStart(2, '0')}s</div>
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 25, to - 20, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: o}}>
      <div dir="rtl" style={{fontSize: 46, fontWeight: 400, color: '#e8e6f2'}}>{ar}</div>
      <div style={{fontSize: 20, letterSpacing: 10, color: '#8f97c0'}}>{en}</div>
    </div>
  );
};

// حبة رمل بزوايا غير منتظمة
const GRAIN = seeded(14, 'gr').map((p, i) => {
  const a = (i / 14) * Math.PI * 2;
  const r = 230 + p.a * 90;
  return [960 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.85] as const;
});

const LATTICE = (() => {
  const pts: {x: number; y: number; k: number}[] = [];
  for (let r = 0; r < 20; r++) for (let c = 0; c < 34; c++) pts.push({x: 960 - 33 * 30 + c * 60 + (r % 2) * 30, y: 540 - 10 * 52 + r * 52, k: r * 34 + c});
  return pts;
})();
const BLUE = new Set(seeded(70, 'bl').map((s) => Math.floor(s.a * 680)));

export const MicroscopeConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  if (f < 90) {
    const blur = interpolate(f, [0, 60], [14, 0], clamp);
    scene = (
      <Eyepiece mag="×1" blur={blur}>
        <AbsoluteFill style={{background: '#0d0f1a', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', gap: 60}}>
            <NeoLogo size={280} />
            <DiriyahLogo size={280} />
          </div>
        </AbsoluteFill>
      </Eyepiece>
    );
  } else if (f < 240) {
    const t = f - 90;
    const blur = interpolate(t, [0, 60], [16, 0], clamp);
    scene = (
      <Eyepiece mag="×10" blur={blur}>
        <Img src={TOWER} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '45% 88%', transform: `scale(${2.2 + t * 0.004})`, transformOrigin: '45% 88%'}} />
      </Eyepiece>
    );
  } else if (f < 420) {
    const t = f - 240;
    const blur = interpolate(t, [0, 50], [18, 0], clamp);
    scene = (
      <Eyepiece mag="×1,000" blur={blur}>
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #2b1d14, #0b0806)'}}>
          <svg width={1920} height={1080} style={{transform: `rotate(${t * 0.08}deg)`, transformOrigin: '960px 540px'}}>
            <defs>
              <radialGradient id="grain" cx="40%" cy="35%">
                <stop offset="0" stopColor="#f0c99e" />
                <stop offset="0.6" stopColor="#c08458" />
                <stop offset="1" stopColor="#6e4128" />
              </radialGradient>
            </defs>
            <polygon points={GRAIN.map((p) => p.join(',')).join(' ')} fill="url(#grain)" />
            {GRAIN.map((p, i) => (
              <line key={i} x1={960} y1={540} x2={p[0]} y2={p[1]} stroke="#fff" strokeOpacity={0.12} strokeWidth={2} />
            ))}
          </svg>
        </AbsoluteFill>
      </Eyepiece>
    );
  } else if (f < 600) {
    const t = f - 420;
    const blur = interpolate(t, [0, 40], [16, 0], clamp);
    const blueOn = interpolate(t, [60, 120], [0, 1], clamp);
    scene = (
      <Eyepiece mag="×10,000" blur={blur}>
        <AbsoluteFill style={{background: '#100a07'}}>
          <svg width={1920} height={1080}>
            {LATTICE.map((p) => {
              const isBlue = BLUE.has(p.k);
              const pulse = 0.6 + 0.4 * Math.sin(f / 12 + p.k);
              return (
                <g key={p.k}>
                  <circle cx={p.x + Math.sin(f / 30 + p.k) * 2} cy={p.y} r={isBlue ? 10 + blueOn * 6 * pulse : 9} fill={isBlue && blueOn > 0 ? COLORS.neoBlueLight : COLORS.copperLight} opacity={isBlue ? 0.4 + blueOn * 0.6 : 0.55} style={isBlue && blueOn > 0 ? {filter: `drop-shadow(0 0 ${10 * blueOn}px ${COLORS.neoBlue})`} : undefined} />
                </g>
              );
            })}
          </svg>
        </AbsoluteFill>
      </Eyepiece>
    );
  } else if (f < 800) {
    // العدسة تبتعد: من داخل الحبة إلى الصورة كاملة
    const t = f - 600;
    const radius = interpolate(t, [0, 60], [R, 1200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x});
    const zoom = interpolate(t, [0, 60], [4, 1.05], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
    const title = spring({frame: t - 70, fps, config: {damping: 14}});
    scene = (
      <AbsoluteFill style={{background: '#020203'}}>
        <div style={{position: 'absolute', left: 960 - radius, top: 540 - radius, width: radius * 2, height: radius * 2, borderRadius: '50%', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: radius - 960, top: radius - 540, width: 1920, height: 1080}}>
            <Img src={TOWER} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: '45% 80%'}} />
            <AbsoluteFill style={{background: 'rgba(2,2,6,0.45)'}} />
          </div>
        </div>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 10, opacity: title}}>
          <div dir="rtl" style={{fontSize: 130, fontWeight: 700, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>شراكة استراتيجية</div>
          <div dir="rtl" style={{fontSize: 46, color: COLORS.sand}}>نيو كابتا × شركة الدرعية</div>
          <div dir="rtl" style={{fontSize: 40, color: COLORS.neoBlueLight, marginTop: 20}}>نرى ما لا يُرى… ونرويه للعالم</div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else {
    const p = spring({frame: f - 800, fps, config: {damping: 16}});
    scene = (
      <AbsoluteFill style={{background: '#020203', justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: FONT}}>
        <div style={{display: 'flex', gap: 60, alignItems: 'center', opacity: p}}>
          <NeoLogo size={220} />
          <div style={{fontSize: 60, color: '#9aa3c7'}}>×</div>
          <DiriyahLogo size={220} />
        </div>
        <div style={{fontSize: 46, fontWeight: 300, letterSpacing: 6, color: '#fff', opacity: p}}>WE SEE WHAT OTHERS DON&apos;T</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-microscope.wav')} />
      {scene}
      <Caption from={95} to={240} ar="نظرنا عن قرب…" en="WE LOOKED CLOSER" />
      <Caption from={245} to={420} ar="في حبة رمل من الدرعية…" en="INTO A GRAIN OF DIRIYAH'S SAND" />
      <Caption from={425} to={600} ar="وجدنا قصة كاملة" en="AND FOUND A WHOLE STORY" />
    </AbsoluteFill>
  );
};
