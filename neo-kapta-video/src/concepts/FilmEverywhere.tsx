// الفيلم ٢ (فكرة ٢٤): «من قلب الدرعية إلى كل مكان» — جريء، Premium عالمي (حسب سيناريو العميل)
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {AERIAL, CineFrame, GOLD, LogoPair, LuxText, Shot, TOWER} from './cine';
import {clamp, seeded, useFonts} from './shared';

const ORIGIN = {x: 960, y: 560};

// خطوط رقمية تنطلق من الدرعية بمسارات متكسّرة
const ROUTES = seeded(22, 'rt').map((s, i) => {
  const ang = (i / 22) * Math.PI * 2 + s.a * 0.3;
  const pts: [number, number][] = [[ORIGIN.x, ORIGIN.y]];
  let x = ORIGIN.x;
  let y = ORIGIN.y;
  const steps = 4 + Math.floor(s.b * 3);
  for (let k = 0; k < steps; k++) {
    const len = 90 + s.x * 120;
    // مسارات بزوايا 0/45/90 مثل الدوائر الإلكترونية
    const a = Math.round((ang + (k % 2 ? 0.4 : -0.4) * s.y) / (Math.PI / 4)) * (Math.PI / 4);
    x += Math.cos(a) * len;
    y += Math.sin(a) * len * 0.75;
    pts.push([x, y]);
  }
  return pts;
});

const Network: React.FC<{draw: number; glow: number}> = ({draw, glow}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    {ROUTES.map((pts, i) => (
      <polyline
        key={i}
        points={pts.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke={i % 3 ? COLORS.neoBlueLight : GOLD}
        strokeWidth={2.5}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        style={{filter: `drop-shadow(0 0 ${6 + glow * 10}px ${COLORS.neoBlue})`}}
        opacity={0.9}
      />
    ))}
    <circle cx={ORIGIN.x} cy={ORIGIN.y} r={10 + glow * 6} fill={GOLD} style={{filter: `drop-shadow(0 0 20px ${GOLD})`}} />
  </svg>
);

// عند نهاية كل خط تظهر شاشة/إعلان/محتوى
const Endpoints: React.FC<{p: number}> = ({p}) => {
  const f = useCurrentFrame();
  return (
    <>
      {ROUTES.map((pts, i) => {
        const [x, y] = pts[pts.length - 1];
        const q = interpolate(p * 22 - i * 0.6, [0, 1], [0, 1], clamp);
        if (q <= 0) return null;
        const kind = i % 4;
        const w = kind === 1 ? 70 : 150;
        const h = kind === 1 ? 130 : 90;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              borderRadius: kind === 1 ? 12 : 4,
              border: `2px solid ${i % 3 ? COLORS.neoBlueLight : GOLD}`,
              overflow: 'hidden',
              transform: `scale(${q})`,
              boxShadow: `0 0 20px ${COLORS.neoBlue}88`,
              background: '#05060c',
            }}
          >
            {kind === 3 ? (
              <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6}}>
                <NeoLogo size={44} style={{boxShadow: 'none'}} />
                <DiriyahLogo size={44} style={{boxShadow: 'none'}} />
              </div>
            ) : (
              <Img src={i % 2 ? AERIAL : TOWER} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(i * 37) % 100}% ${(i * 53) % 100}%`, transform: `scale(${1.3 + Math.sin(f / 30 + i) * 0.05})`}} />
            )}
          </div>
        );
      })}
    </>
  );
};

export const FilmEverywhere: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  const beat = Math.max(0, Math.sin((f / 30) * Math.PI * 2)) ** 12; // نبض

  const draw = interpolate(f, [200, 300], [0, 1], clamp);
  const darken = interpolate(f, [190, 260], [0, 0.75], clamp);
  const endpoints = interpolate(f, [285, 400], [0, 1], clamp);
  const neo = spring({frame: f - 425, fps, config: {damping: 14}});
  const dotsSpread = interpolate(f, [440, 560], [0, 1], clamp);
  const logos = spring({frame: f - 605, fps, config: {damping: 18}});

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-film-everywhere.wav')} />

      {/* 0–4 ث: سواد + نبض ثم لقطة جوية */}
      {f < 120 ? (
        <AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{marginTop: 260, width: 300 + beat * 60, height: 2, background: GOLD, opacity: interpolate(f, [0, 60, 80], [0.8, 0.8, 0], clamp), boxShadow: `0 0 ${20 * beat}px ${GOLD}`}} />
          </AbsoluteFill>
          <AbsoluteFill style={{opacity: interpolate(f, [65, 105], [0, 1], clamp)}}>
            <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.25 - (f - 65) * 0.002})`, filter: 'brightness(0.8) contrast(1.08)'}} />
          </AbsoluteFill>
          <LuxText from={18} to={118} size={110} weight={200} color="#fff">من هنا…</LuxText>
        </AbsoluteFill>
      ) : null}

      {/* 4–9 ث: تفاصيل ثم خطوط رقمية تنتشر */}
      <Shot crop="mudDetail" from={120} dur={36} />
      <Shot crop="crenels" from={154} dur={36} drift={-1} />
      {f >= 188 && f < 430 ? (
        <AbsoluteFill>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05)'}} />
          <AbsoluteFill style={{background: `rgba(2,3,10,${darken})`}} />
          <Network draw={draw} glow={beat} />
          <Endpoints p={endpoints} />
        </AbsoluteFill>
      ) : null}
      <LuxText from={150} to={275} bottom={170} size={80} weight={300}>بدأت قصة.</LuxText>
      <LuxText from={285} to={425} bottom={170} size={80} weight={300}>واليوم… تصل أبعد.</LuxText>

      {/* 14–20 ث: نيو كابتا تدخل المشهد */}
      {f >= 420 && f < 605 ? (
        <AbsoluteFill style={{background: '#02030a', opacity: interpolate(f, [420, 432, 590, 605], [0, 1, 1, 0], clamp)}}>
          <Img src={AERIAL} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25}} />
          <AbsoluteFill
            style={{
              backgroundImage: `radial-gradient(${COLORS.neoBlueLight} 3px, transparent 3.5px)`,
              backgroundSize: '30px 30px',
              maskImage: `radial-gradient(circle at 50% 50%, black ${dotsSpread * 60}%, transparent ${dotsSpread * 80 + 1}%)`,
              WebkitMaskImage: `radial-gradient(circle at 50% 50%, black ${dotsSpread * 60}%, transparent ${dotsSpread * 80 + 1}%)`,
              opacity: 0.45,
            }}
          />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{transform: `scale(${interpolate(neo, [0, 1], [3, 1])})`, opacity: Math.min(1, neo * 1.5), filter: `drop-shadow(0 0 60px ${COLORS.neoBlue})`}}>
              <NeoLogo size={300} />
            </div>
          </AbsoluteFill>
          <LuxText from={470} to={600} bottom={170} size={74} weight={300}>الإبداع يلتقي بالمكان.</LuxText>
        </AbsoluteFill>
      ) : null}

      {/* 20–25 ث: الشعاران */}
      {f >= 600 && f < 752 ? (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #11131f, #000 70%)', justifyContent: 'center', alignItems: 'center', gap: 40, fontFamily: FONT, opacity: interpolate(f, [600, 612, 738, 752], [0, 1, 1, 0], clamp)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 80, opacity: logos}}>
            <DiriyahLogo size={240} />
            <div style={{fontSize: 90, fontWeight: 200, color: GOLD}}>×</div>
            <NeoLogo size={240} />
          </div>
          <div style={{fontSize: 70, fontWeight: 700, letterSpacing: 16, color: '#fff', opacity: interpolate(f, [630, 655], [0, 1], clamp)}}>DIRIYAH × NEO CAPTA</div>
        </AbsoluteFill>
      ) : null}

      {/* 25–30 ث: اللقطة النهائية */}
      {f >= 750 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [750, 765], [0, 1], clamp)}}>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.02 + (f - 750) * 0.0012})`, filter: 'brightness(0.7) saturate(1.1)'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7))'}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 6}}>
            <div style={{fontSize: 92, fontWeight: 200, letterSpacing: 6, color: '#fff', opacity: interpolate(f, [760, 780], [0, 1], clamp)}}>Built on Heritage.</div>
            <div style={{fontSize: 92, fontWeight: 700, letterSpacing: 2, color: GOLD, opacity: interpolate(f, [790, 810], [0, 1], clamp)}}>Designed for What&apos;s Next.</div>
            <div style={{marginTop: 40, opacity: interpolate(f, [825, 845], [0, 1], clamp)}}>
              <LogoPair p={1} size={130} gap={50} />
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      <CineFrame />
    </AbsoluteFill>
  );
};
