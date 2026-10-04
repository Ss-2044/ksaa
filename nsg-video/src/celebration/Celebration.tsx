import '@fontsource/cairo/800.css';
import '@fontsource/cairo/900.css';
import {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, getStaticFiles, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const GREEN = '#0B6B3A';
const DEEP = '#03261A';
const GOLD = 'linear-gradient(180deg, #FFF3B0 0%, #F5C542 45%, #C8901E 75%, #FFE27A 100%)';
const CAIRO = '"Cairo", sans-serif';
export const CELEB_FRAMES = 300; // 10 s

const useCairo = () => {
  const [h] = useState(() => delayRender('cairo'));
  useEffect(() => {
    Promise.all([document.fonts.load('900 80px Cairo', 'الأخضر'), document.fonts.load('800 40px Cairo', 'مبروك')]).finally(() => continueRender(h));
  }, [h]);
};

// Photos are optional: drop them in public/celebration/ as team.(jpg|png) and owais.(jpg|png).
const findPhoto = (name: string) => {
  const f = getStaticFiles().find((s) => new RegExp(`^celebration/${name}\\.(jpe?g|png|webp)$`, 'i').test(s.name));
  return f ? f.name : null;
};

const Rays: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `repeating-conic-gradient(from ${frame * 0.4}deg at 50% 42%, rgba(245,197,66,0.16) 0deg 6deg, transparent 6deg 18deg)`,
        WebkitMaskImage: 'radial-gradient(circle at 50% 42%, #000 0%, rgba(0,0,0,0.6) 35%, transparent 70%)',
      }}
    />
  );
};

const Confetti: React.FC<{n?: number}> = ({n = 140}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const colors = ['#F5C542', '#FFE27A', '#FFFFFF', '#1DB462', '#C8901E'];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {new Array(n).fill(0).map((_, i) => {
        const x0 = random(`cx${i}`) * width;
        const speed = 2.5 + random(`cs${i}`) * 4;
        const delay = random(`cd${i}`) * 120;
        const t = Math.max(0, frame - 20 - delay);
        const y = -40 + ((t * speed) % (height + 80));
        const x = x0 + Math.sin(t / 14 + i) * 30;
        const w = 8 + random(`cw${i}`) * 10;
        const rot = t * (3 + random(`cr${i}`) * 6);
        return t > 0 ? <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.45, background: colors[i % colors.length], transform: `rotate(${rot}deg) rotateY(${rot * 2}deg)`, borderRadius: 2, opacity: 0.9}} /> : null;
      })}
    </AbsoluteFill>
  );
};

// Generic cup silhouette (not a replica of any real trophy).
const Cup: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120">
    <defs>
      <linearGradient id="gold" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="#FFF3B0" />
        <stop offset="45%" stopColor="#F5C542" />
        <stop offset="100%" stopColor="#B07B14" />
      </linearGradient>
    </defs>
    <path d="M25,8 H75 V30 C75,52 62,64 50,66 C38,64 25,52 25,30 Z" fill="url(#gold)" />
    <path d="M25,14 H12 C10,30 16,40 27,44" fill="none" stroke="url(#gold)" strokeWidth={6} />
    <path d="M75,14 H88 C90,30 84,40 73,44" fill="none" stroke="url(#gold)" strokeWidth={6} />
    <rect x={45} y={64} width={10} height={22} fill="url(#gold)" />
    <rect x={30} y={86} width={40} height={10} rx={2} fill="url(#gold)" />
    <rect x={24} y={96} width={52} height={14} rx={3} fill="url(#gold)" />
  </svg>
);

const TeamPlaceholder: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #0E7A44, #075230)', alignItems: 'center', justifyContent: 'flex-end'}}>
    <svg width="100%" height="80%" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMax meet">
      {new Array(11).fill(0).map((_, i) => {
        const x = 60 + i * 88;
        const back = i % 2 === 0;
        const y = back ? 120 : 170;
        return (
          <g key={i} fill={back ? '#0A5E36' : '#0C6B3E'} opacity={0.95}>
            <circle cx={x} cy={y} r={34} />
            <path d={`M${x - 62},420 C${x - 60},${y + 70} ${x + 60},${y + 70} ${x + 62},420 Z`} />
          </g>
        );
      })}
    </svg>
    <div dir="rtl" style={{position: 'absolute', top: 30, left: 0, right: 0, textAlign: 'center', fontFamily: CAIRO, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.55)', border: '3px dashed rgba(255,255,255,0.35)', margin: '0 60px', padding: 10, borderRadius: 16}}>
      مكان صورة اللاعبين
    </div>
  </AbsoluteFill>
);

const OwaisPlaceholder: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #12884C, #064527)', alignItems: 'center', justifyContent: 'center'}}>
    <svg width="62%" viewBox="0 0 200 160">
      <path d="M100,40 C112,30 130,32 136,46 L150,48 L138,56 C140,80 128,104 104,118 L118,150 L96,128 L72,150 L82,116 C60,104 52,82 58,62 L20,40 C52,40 70,46 82,54 C84,46 90,42 100,40 Z" fill="#E9D9A6" opacity={0.9} />
      <circle cx={122} cy={46} r={4} fill="#03261A" />
    </svg>
    <div dir="rtl" style={{position: 'absolute', bottom: '16%', fontFamily: CAIRO, fontWeight: 800, fontSize: 20, color: 'rgba(255,255,255,0.7)'}}>
      مكان صورة العويس والصقر
    </div>
  </AbsoluteFill>
);

export const Celebration: React.FC<{animate?: boolean}> = ({animate = true}) => {
  useCairo();
  const real = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const frame = animate ? real : 280; // still image = final composed state
  const story = height / width > 1.5;
  const team = findPhoto('team');
  const owais = findPhoto('owais');

  const flash = interpolate(frame, [0, 4, 24], [1, 1, 0], clamp);
  const teamIn = interpolate(frame, [6, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const owaisIn = spring({frame: frame - 70, fps, config: {damping: 11, mass: 0.8}});
  const l1 = spring({frame: frame - 100, fps, config: {damping: 10, mass: 0.7}});
  const l2 = spring({frame: frame - 140, fps, config: {damping: 10, mass: 0.7}});
  const shine = interpolate(frame % 90, [0, 40], [-60, 160], clamp);
  const chip = interpolate(frame, [175, 195], [0, 1], clamp);
  const pulse = 1 + 0.02 * Math.sin(frame / 8);

  const L = story
    ? {teamTop: 170, teamH: 820, circle: 520, circleTop: 830, textTop: 1400, l1: 120, l2: 102}
    : {teamTop: 140, teamH: 560, circle: 400, circleTop: 520, textTop: 950, l1: 116, l2: 98};

  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 42%, ${GREEN} 0%, #075030 45%, ${DEEP} 100%)`, overflow: 'hidden'}}>
      <Rays />
      {/* team photo */}
      <div style={{position: 'absolute', top: L.teamTop, left: 40, right: 40, height: L.teamH, borderRadius: 36, overflow: 'hidden', opacity: teamIn, transform: `translateY(${(1 - teamIn) * 80}px) scale(${1.04 - 0.04 * teamIn})`, boxShadow: '0 30px 80px rgba(0,0,0,0.45)', border: '3px solid rgba(245,197,66,0.6)'}}>
        {team ? <Img src={staticFile(team)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 35%', transform: `scale(${interpolate(frame, [0, CELEB_FRAMES], [1.08, 1.0])})`}} /> : <TeamPlaceholder />}
        <AbsoluteFill style={{background: `linear-gradient(180deg, transparent 55%, rgba(3,38,26,0.85) 100%)`}} />
      </div>
      {/* Al-Owais + falcon */}
      <div style={{position: 'absolute', top: L.circleTop, left: (width - L.circle) / 2, width: L.circle, height: L.circle, transform: `scale(${owaisIn})`}}>
        <div style={{position: 'absolute', inset: -16, borderRadius: '50%', background: `conic-gradient(from ${frame * 2}deg, #FFF3B0, #F5C542, #B07B14, #FFE27A, #FFF3B0)`, boxShadow: '0 0 60px rgba(245,197,66,0.6)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', border: `6px solid ${DEEP}`}}>
          {owais ? <Img src={staticFile(owais)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%'}} /> : <OwaisPlaceholder />}
        </div>
      </div>
      {/* headline */}
      <div style={{position: 'absolute', top: L.textTop, left: 40, right: 40, textAlign: 'center'}}>
        <div dir="rtl" style={{fontFamily: CAIRO, fontWeight: 900, fontSize: L.l1, lineHeight: 1.15, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 8px 30px rgba(0,0,0,0.45)', transform: `scale(${(2 - l1) * pulse})`, opacity: Math.min(1, l1 * 1.4)}}>
          هذا الأخضر لا لعب
        </div>
        <div dir="rtl" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 6, transform: `scale(${2 - l2})`, opacity: Math.min(1, l2 * 1.4)}}>
          <div style={{position: 'relative', fontFamily: CAIRO, fontWeight: 900, fontSize: L.l2, lineHeight: 1.2, whiteSpace: 'nowrap', backgroundImage: GOLD, WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.45))'}}>
            جهّزوا كأس الذهب
            <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${shine - 15}%, rgba(255,255,255,0.85) ${shine}%, transparent ${shine + 15}%)`, WebkitBackgroundClip: 'text', color: 'transparent', mixBlendMode: 'overlay'}} aria-hidden>
              جهّزوا كأس الذهب
            </div>
          </div>
          <Cup size={L.l2 * 0.9} />
        </div>
        <div dir="rtl" style={{display: 'inline-block', marginTop: 22, opacity: chip, transform: `translateY(${(1 - chip) * 20}px)`, background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(245,197,66,0.7)', color: '#FFE27A', fontFamily: CAIRO, fontWeight: 800, fontSize: story ? 40 : 34, padding: '6px 30px', borderRadius: 999}}>
          ألف مبروك للأخضر 💚
        </div>
      </div>
      <Confetti n={story ? 170 : 130} />
      {/* NSG logo — top left */}
      <Img src={staticFile('nsg-logo.png')} style={{position: 'absolute', top: 40, left: 44, width: story ? 230 : 200, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))'}} />
      <AbsoluteFill style={{background: '#fff', opacity: animate ? flash : 0}} />
      {animate ? <Audio src={staticFile('music/hero-theme.mp3')} volume={(f) => 0.9 * interpolate(f, [0, 6, CELEB_FRAMES - 30, CELEB_FRAMES], [0, 1, 1, 0], clamp)} /> : null}
    </AbsoluteFill>
  );
};
