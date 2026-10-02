// الفكرة 21: «جزيرة في السماء» — مشهد سريالي حالم: الشعاران شمس وقمر، جزيرة طائرة فوق الغيم عليها الدرعية،
// وجزيرة ثانية بالبرج الطيني، وجسر من ضوء ينبني بينهما… ثم «شراكة استراتيجية» بحروف من غيم
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

const Sky: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #8d93c9 0%, #c9b5d6 40%, #f2c9b0 75%, #f7dcc4 100%)'}}>
      {seeded(9, 'cl').map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: ((c.x * 2400 + f * (0.3 + c.a * 0.6)) % 2600) - 400,
            top: 150 + c.y * 800,
            width: 380 + c.b * 300,
            height: 110 + c.a * 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)',
            filter: 'blur(28px)',
          }}
        />
      ))}
      {/* بحر الغيم في الأسفل */}
      <div style={{position: 'absolute', left: -200, right: -200, bottom: -120, height: 330, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', filter: 'blur(40px)'}} />
    </AbsoluteFill>
  );
};

// جزيرة طائرة: سطح بصورة حقيقية وقاعدة صخرية بطبقات وجذور معلّقة
const Island: React.FC<{src: string; w: number; pos: string; x: number; y: number; bob: number}> = ({src, w, pos, x, y, bob}) => {
  const h = w * 0.3;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y + bob, width: w, height: w}}>
      <svg width={w} height={w * 0.8} viewBox="0 0 100 80" style={{position: 'absolute', top: h * 0.55, left: 0}}>
        <path d="M2 4 Q 50 14 98 4 L 80 30 L 64 52 L 52 76 L 44 56 L 30 40 L 14 22 Z" fill="#8a5a3e" />
        <path d="M6 9 Q 50 18 94 9" stroke="#6e4128" strokeWidth={2} fill="none" />
        <path d="M14 22 Q 50 30 80 30" stroke="#6e4128" strokeWidth={1.5} fill="none" />
        <path d="M30 40 Q 48 46 64 52" stroke="#5a3420" strokeWidth={1.5} fill="none" />
        {[20, 35, 58, 72].map((rx, i) => (
          <path key={i} d={`M${rx} ${20 + i * 6} q 2 ${10 + i * 3} -2 ${18 + i * 2}`} stroke="#5a3420" strokeWidth={0.8} fill="none" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 8px 20px rgba(80,50,30,0.35)'}}>
        <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}} />
      </div>
    </div>
  );
};

const Caption: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 30, to - 25, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 80, left: 420, right: 420, textAlign: 'center', fontFamily: FONT, opacity: o, transform: `translateY(${Math.sin(f / 40) * 6}px)`}}>
      <div dir="rtl" style={{fontSize: 58, fontWeight: 400, color: '#3d3560'}}>{ar}</div>
      <div style={{fontSize: 22, letterSpacing: 10, color: '#6b5d8f'}}>{en}</div>
    </div>
  );
};

export const FloatingIslandConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  // الشمس والقمر (الشعاران)
  const rise = spring({frame: f, fps, config: {damping: 20, mass: 2}});
  const celestialUp = interpolate(f, [90, 200], [0, -170], clamp);
  // الجزيرة الكبرى (الدرعية الحديثة)
  const island1Y = interpolate(f, [90, 220], [1300, 600], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
  const island1X = interpolate(f, [300, 420], [960, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x)});
  // الجزيرة الثانية (البرج الطيني)
  const island2X = interpolate(f, [300, 440], [2400, 1400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
  const bridge = interpolate(f, [470, 560], [0, 1], clamp);
  const lift = interpolate(f, [660, 740], [0, 700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x});
  const word = interpolate(f, [700, 760], [0, 1], clamp);
  const end = spring({frame: f - 800, fps, config: {damping: 18}});

  const b1 = Math.sin(f / 35) * 12;
  const b2 = Math.sin(f / 30 + 1.5) * 14;
  const a = {x: island1X + 300, y: island1Y + b1 + 70};
  const b = {x: island2X - 190, y: 520 + b2 + 50};

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-island.wav')} />
      <Sky />
      {/* الشعاران: قمر وشمس */}
      <div style={{position: 'absolute', left: 110, top: 260 + (1 - rise) * 500 + celestialUp, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 120px 40px rgba(111,127,240,0.45)'}}>
        <NeoLogo size={220} style={{borderRadius: '50%', boxShadow: 'none', border: 'none'}} />
      </div>
      <div style={{position: 'absolute', right: 110, top: 240 + (1 - rise) * 560 + celestialUp, boxShadow: '0 0 140px 50px rgba(255,214,170,0.7)', borderRadius: '50%'}}>
        <DiriyahLogo size={240} style={{boxShadow: 'none', border: 'none'}} />
      </div>

      <AbsoluteFill style={{transform: `translateY(${lift}px)`}}>
        {f >= 90 ? <Island src={staticFile('diriyah/aerial.jpg')} w={600} pos="50% 50%" x={island1X} y={island1Y} bob={b1} /> : null}
        {f >= 300 ? <Island src={staticFile('diriyah/tower-night.jpg')} w={380} pos="50% 55%" x={island2X} y={520} bob={b2} /> : null}
        {bridge > 0 ? (
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path
              d={`M${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 120}, ${b.x} ${b.y}`}
              stroke="#fff"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - bridge}
              style={{filter: `drop-shadow(0 0 12px ${COLORS.neoBlueLight}) drop-shadow(0 0 20px ${COLORS.copperLight})`}}
            />
            {bridge >= 1
              ? [0, 1, 2, 3].map((k) => {
                  const t = ((f / 60 + k / 4) % 1);
                  const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * ((a.x + b.x) / 2) + t * t * b.x;
                  const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * (Math.min(a.y, b.y) - 120) + t * t * b.y;
                  return <circle key={k} cx={x} cy={y} r={7} fill={k % 2 ? COLORS.copperLight : COLORS.neoBlueLight} />;
                })
              : null}
          </svg>
        ) : null}
      </AbsoluteFill>

      {/* حروف من غيم */}
      {f >= 690 && f < 810 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, opacity: word * interpolate(f, [790, 810], [1, 0], clamp)}}>
          <div dir="rtl" style={{fontSize: 170, fontWeight: 900, color: '#fff', filter: `blur(${(1 - word) * 20}px)`, textShadow: '0 0 40px rgba(255,255,255,0.9), 0 0 80px rgba(200,190,240,0.8)'}}>شراكة استراتيجية</div>
          <div dir="rtl" style={{fontSize: 48, color: '#4a3f75', marginTop: 10}}>نيو كابتا × شركة الدرعية</div>
        </AbsoluteFill>
      ) : null}

      <Caption from={110} to={300} ar="في مكانٍ بين الحلم والحقيقة…" en="SOMEWHERE BETWEEN A DREAM AND REALITY" />
      <Caption from={310} to={470} ar="تقترب جزيرتان…" en="TWO ISLANDS DRAW CLOSER" />
      <Caption from={480} to={660} ar="ويُبنى بينهما جسر من نور" en="AND A BRIDGE OF LIGHT IS BUILT" />

      {f >= 800 ? (
        <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150, fontFamily: FONT, opacity: end}}>
          <div style={{fontSize: 56, fontWeight: 700, color: '#3d3560'}}>Neo Capta × Diriyah Company</div>
          <div dir="rtl" style={{fontSize: 40, color: '#6b5d8f'}}>حين يلتقي الحلم بالحقيقة</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
