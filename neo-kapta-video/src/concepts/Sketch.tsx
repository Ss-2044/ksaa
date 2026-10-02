// الفكرة 16: «من الفكرة إلى الواقع» — على ورق رسم: صورة الدرعية تُرسم أولاً سكتشاً بقلم الرصاص،
// ثم تلوّنها ضربات فرشاة فتصبح الصورة الحقيقية. «كل شيء يبدأ بفكرة… ونحوّلها إلى واقع»
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const RUQAA = "'Aref Ruqaa', serif";
const PW = 1440;
const PH = 760;
const GRAPHITE = '#3a3a40';

const Paper: React.FC = () => (
  <AbsoluteFill style={{background: '#f6f2ea'}}>
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.018) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,0.012) 0 1px, transparent 1px 4px)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, rgba(120,95,60,0.18) 100%)'}} />
  </AbsoluteFill>
);

// ضربات فرشاة عريضة تغطي الإطار تدريجياً (تُستخدم كقناع)
const STROKES = [
  `M-100 120 C 300 60, 700 180, 1600 90`,
  `M-100 300 C 400 240, 900 360, 1600 260`,
  `M-100 470 C 300 420, 1000 540, 1600 440`,
  `M-100 640 C 500 600, 900 700, 1600 620`,
  `M-100 800 C 400 760, 1000 840, 1600 780`,
];

const SketchToPhoto: React.FC<{src: string; id: string; drawFrom: number; drawTo: number; paintFrom: number; paintTo: number}> = ({
  src,
  id,
  drawFrom,
  drawTo,
  paintFrom,
  paintTo,
}) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [drawFrom, drawTo], [0, 1], clamp);
  const paintAt = (i: number) => {
    const span = (paintTo - paintFrom) / STROKES.length;
    return interpolate(f, [paintFrom + i * span, paintFrom + (i + 1) * span + 6], [1, 0], clamp);
  };
  const pencilX = draw * PW;
  return (
    <div style={{position: 'relative', width: PW, height: PH}}>
      <svg width={PW} height={PH} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id={`sk-${id}`} x="0" y="0" width="100%" height="100%">
            <feColorMatrix type="saturate" values="0" />
            <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="-7" intercept="1" />
              <feFuncG type="linear" slope="-7" intercept="1" />
              <feFuncB type="linear" slope="-7" intercept="1" />
            </feComponentTransfer>
          </filter>
          <clipPath id={`wipe-${id}`}>
            <rect x={0} y={0} width={pencilX} height={PH} />
          </clipPath>
          <mask id={`paint-${id}`}>
            <rect width={PW} height={PH} fill="#000" />
            {STROKES.map((d, i) => (
              <path key={i} d={d} stroke="#fff" strokeWidth={230} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={paintAt(i)} />
            ))}
          </mask>
        </defs>
        {/* السكتش */}
        <g clipPath={`url(#wipe-${id})`} style={{mixBlendMode: 'multiply'}}>
          <image href={src} width={PW} height={PH} preserveAspectRatio="xMidYMid slice" filter={`url(#sk-${id})`} opacity={0.9} />
        </g>
        {/* الألوان الحقيقية بضربات الفرشاة */}
        <g mask={`url(#paint-${id})`}>
          <image href={src} width={PW} height={PH} preserveAspectRatio="xMidYMid slice" />
        </g>
        <rect x={2} y={2} width={PW - 4} height={PH - 4} fill="none" stroke={GRAPHITE} strokeWidth={3} strokeDasharray={`${draw * 4400} 4400`} />
      </svg>
      {/* قلم الرصاص */}
      {draw > 0 && draw < 1 ? (
        <div style={{position: 'absolute', left: pencilX - 10, top: 360 + Math.sin(f / 2) * 120, fontSize: 90, transform: 'rotate(-10deg)'}}>✏️</div>
      ) : null}
    </div>
  );
};

const Hand: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [from, from + 30], [0, 1], clamp);
  const o = interpolate(f, [to - 12, to], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', bottom: 34, right: 240, textAlign: 'right', opacity: o}}>
      <div dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: 72, color: GRAPHITE, clipPath: `inset(0 0 0 ${(1 - w) * 100}%)`}}>{ar}</div>
      <div style={{fontFamily: FONT, fontSize: 24, letterSpacing: 8, color: COLORS.copper, opacity: w}}>{en}</div>
    </div>
  );
};

export const SketchConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  if (f < 90) {
    // 0–3 ث: دائرتان تُرسمان بالرصاص ثم يظهر الشعاران بالألوان
    const ring = interpolate(f, [0, 35], [1, 0], clamp);
    const logo = interpolate(f, [25, 50], [0, 1], clamp);
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 180}}>
          {[0, 1].map((i) => (
            <div key={i} style={{position: 'relative', width: 400, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <svg width={400} height={400} style={{position: 'absolute', inset: 0}}>
                <circle cx={200} cy={200} r={185} fill="none" stroke={GRAPHITE} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={ring} transform={`rotate(${-90 + i * 40} 200 200)`} />
              </svg>
              <div style={{opacity: logo, filter: `grayscale(${1 - logo})`}}>
                {i === 0 ? <NeoLogo size={290} /> : <DiriyahLogo size={290} />}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  } else if (f < 450) {
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 110}}>
        <div style={{transform: 'rotate(-1deg)', boxShadow: '0 20px 40px rgba(80,60,30,0.15)'}}>
          <SketchToPhoto src={staticFile('diriyah/tower-night.jpg')} id="tw" drawFrom={95} drawTo={215} paintFrom={300} paintTo={380} />
        </div>
        <Hand from={150} to={295} ar="كل شيء يبدأ بفكرة…" en="IT ALL STARTS WITH AN IDEA" />
        <Hand from={330} to={450} ar="…ونحوّلها إلى واقع" en="…AND WE BRING IT TO LIFE" />
      </AbsoluteFill>
    );
  } else if (f < 660) {
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 110}}>
        <div style={{transform: 'rotate(0.8deg)', boxShadow: '0 20px 40px rgba(80,60,30,0.15)'}}>
          <SketchToPhoto src={staticFile('diriyah/aerial.jpg')} id="ae" drawFrom={455} drawTo={535} paintFrom={545} paintTo={615} />
        </div>
        <Hand from={480} to={660} ar="الدرعية تُلهم… ونيو كابتا تُبدع" en="DIRIYAH INSPIRES · NEO CAPTA CREATES" />
      </AbsoluteFill>
    );
  } else if (f < 810) {
    // 22–27 ث: «شراكة استراتيجية» تُكتب بخط اليد
    const t = f - 660;
    const w = interpolate(t, [5, 55], [0, 1], clamp);
    const rest = interpolate(t, [60, 80], [0, 1], clamp);
    const underline = interpolate(t, [50, 80], [1, 0], clamp);
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 10}}>
        <div dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: 200, color: COLORS.navy, clipPath: `inset(0 0 0 ${(1 - w) * 100}%)`, lineHeight: 1.3}}>
          شراكة استراتيجية
        </div>
        <svg width={1300} height={60}>
          <path d="M1280 30 C 900 60, 400 0, 20 34" fill="none" stroke={COLORS.copper} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={underline} />
        </svg>
        <div style={{fontFamily: FONT, fontSize: 40, letterSpacing: 14, color: COLORS.copper, opacity: rest}}>STRATEGIC PARTNERSHIP</div>
        <div dir="rtl" style={{fontFamily: FONT, fontSize: 52, fontWeight: 700, color: GRAPHITE, opacity: rest, marginTop: 20}}>
          نيو كابتا × شركة الدرعية · تسويق · دعاية · إعلان
        </div>
      </AbsoluteFill>
    );
  } else {
    const p = spring({frame: f - 812, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30}}>
        <div style={{display: 'flex', gap: 70, alignItems: 'center', transform: `scale(${p})`}}>
          <NeoLogo size={240} />
          <div style={{fontFamily: RUQAA, fontSize: 110, color: GRAPHITE}}>×</div>
          <DiriyahLogo size={240} />
        </div>
        <div style={{fontFamily: FONT, fontSize: 56, fontWeight: 900, color: COLORS.navy, opacity: p}}>Neo Capta × Diriyah Company</div>
        <div dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: 64, color: COLORS.copper, opacity: p}}>من الفكرة… إلى الواقع</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-sketch.wav')} />
      <Paper />
      {scene}
    </AbsoluteFill>
  );
};
