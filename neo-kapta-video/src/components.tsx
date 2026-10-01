import React from 'react';
import {
  AbsoluteFill,
  Img,
  random,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, DURATION, FONT} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// خلفية متدرجة متحركة: أسود → كحلي → لمعة نحاسية + نقاط هافتون مثل شعار نيو كابتا
export const GradientBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / DURATION;
  const angle = 120 + t * 90;
  const blueX = 20 + Math.sin(frame / 60) * 15;
  const blueY = 30 + Math.cos(frame / 75) * 15;
  const copperX = 80 - Math.sin(frame / 70) * 15;
  const copperY = 70 + Math.cos(frame / 55) * 12;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${angle}deg, ${COLORS.neoBlack} 0%, ${COLORS.navy} 55%, #1a0f0a 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${blueX}% ${blueY}%, ${COLORS.neoBlue}88 0%, transparent 45%),
            radial-gradient(circle at ${copperX}% ${copperY}%, ${COLORS.copper}77 0%, transparent 40%)`,
        }}
      />
      {/* نقاط هافتون متحركة */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${COLORS.neoWhite}33 1.6px, transparent 1.8px)`,
          backgroundSize: '22px 22px',
          backgroundPosition: `${frame * 0.4}px ${frame * 0.2}px`,
          maskImage: `linear-gradient(${angle + 30}deg, transparent 20%, black 50%, transparent 80%)`,
          WebkitMaskImage: `linear-gradient(${angle + 30}deg, transparent 20%, black 50%, transparent 80%)`,
        }}
      />
      {/* تظليل الأطراف */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)'}}
      />
    </AbsoluteFill>
  );
};

// نص يظهر كلمة كلمة
export const AnimatedWords: React.FC<{
  text: string;
  delay?: number;
  size: number;
  color: string;
  weight?: number;
  dir?: 'rtl' | 'ltr';
  stagger?: number;
  letterSpacing?: number;
}> = ({text, delay = 0, size, color, weight = 700, dir = 'ltr', stagger = 4, letterSpacing = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div
      dir={dir}
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: size * 0.28,
        lineHeight: 1.3,
        letterSpacing,
      }}
    >
      {words.map((w, i) => {
        const s = spring({frame: frame - delay - i * stagger, fps, config: {damping: 14, mass: 0.6}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: s,
              transform: `translateY(${(1 - s) * 40}px)`,
              filter: `blur(${(1 - s) * 8}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// خط نحاسي يتمدد
export const GrowLine: React.FC<{delay?: number; width?: number; color?: string}> = ({
  delay = 0,
  width = 520,
  color = COLORS.copper,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 20], [0, 1], clamp);
  return (
    <div
      style={{
        width: width * p,
        height: 3,
        borderRadius: 2,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        margin: '0 auto',
      }}
    />
  );
};

export const NeoLogo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <Img
    src={staticFile('neo-capta-logo.jpg')}
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.12,
      boxShadow: `0 0 60px ${COLORS.neoBlue}88`,
      border: `2px solid ${COLORS.neoBlue}`,
      ...style,
    }}
  />
);

export const DiriyahLogo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <Img
    src={staticFile('diriyah-logo.jpg')}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      objectFit: 'cover',
      objectPosition: '50% 50%',
      boxShadow: `0 0 60px ${COLORS.copper}88`,
      border: `3px solid ${COLORS.copper}`,
      ...style,
    }}
  />
);

// انتقال دخول/خروج لكل مشهد
export const SceneFade: React.FC<{duration: number; children: React.ReactNode}> = ({duration, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);
  const scale = interpolate(frame, [0, duration], [1.04, 1], clamp);
  return (
    <AbsoluteFill style={{opacity, transform: `scale(${scale})`, justifyContent: 'center', alignItems: 'center'}}>
      {children}
    </AbsoluteFill>
  );
};

// شريط مثلثات نجدية (مستوحى من إطار شعار الدرعية) يتحرك على حافتي الإطار
export const NajdiBorder: React.FC<{position: 'top' | 'bottom'}> = ({position}) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [60, 90], [0, 1], clamp);
  const shift = (frame * (position === 'top' ? 1 : -1)) % 60;
  const tri = 60;
  return (
    <div
      style={{
        position: 'absolute',
        left: -tri,
        right: -tri,
        [position]: 28,
        height: 26,
        opacity: appear * 0.55,
        transform: `translateX(${shift}px)`,
      }}
    >
      <svg width="100%" height="26">
        <defs>
          <pattern id={`najdi-${position}`} width={tri} height={26} patternUnits="userSpaceOnUse">
            <path
              d={position === 'top' ? 'M6 2 L30 24 L54 2 Z' : 'M6 24 L30 2 L54 24 Z'}
              fill="none"
              stroke={COLORS.copper}
              strokeWidth={2}
            />
          </pattern>
        </defs>
        <rect width="100%" height="26" fill={`url(#najdi-${position})`} />
      </svg>
    </div>
  );
};

// لمعة ضوء تمر فوق العنصر
export const LightSweep: React.FC<{delay: number; size: number; round?: boolean}> = ({delay, size, round}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame - delay, [0, 22], [-1.2, 1.2], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: size,
        height: size,
        borderRadius: round ? '50%' : size * 0.12,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -size * 0.5,
          left: x * size,
          width: size * 0.35,
          height: size * 2,
          transform: 'rotate(25deg)',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
        }}
      />
    </div>
  );
};

// خلفية «القاعة الملكية»: كحلي عميق، شعاعا ضوء أزرق ونحاسي يتقاطعان، وجزيئات ذهبية تصعد
export const CeremonyBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 50) * 6;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 120%, ${COLORS.navy} 0%, ${COLORS.neoBlack} 70%)`,
        }}
      />
      {/* شعاعا ضوء */}
      {[
        {color: COLORS.neoBlue, left: '18%', rot: 22 + sway},
        {color: COLORS.copper, left: '68%', rot: -22 - sway},
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: -200,
            left: b.left,
            width: 380,
            height: 1600,
            transformOrigin: 'top center',
            transform: `rotate(${b.rot}deg)`,
            background: `linear-gradient(180deg, ${b.color}66 0%, ${b.color}11 60%, transparent 100%)`,
            filter: 'blur(40px)',
          }}
        />
      ))}
      <Particles />
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)'}}
      />
    </AbsoluteFill>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(60).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1920;
        const speed = 0.6 + random(`s${i}`) * 1.6;
        const size = 2 + random(`z${i}`) * 5;
        const y = 1100 - ((frame * speed + random(`y${i}`) * 1100) % 1200);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / 15 + i));
        const c = i % 3 === 0 ? COLORS.neoBlueLight : COLORS.copperLight;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + Math.sin(frame / 40 + i) * 20,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: c,
              opacity: tw * 0.7,
              boxShadow: `0 0 ${size * 3}px ${c}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// موجة صدمة دائرية عند ختم/ظهور عنصر
export const Shockwave: React.FC<{at: number; color: string; size?: number}> = ({at, color, size = 300}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 20], [0, 1], clamp);
  if (frame < at || p >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: '50%',
        border: `4px solid ${color}`,
        transform: `scale(${0.6 + p * 1.4})`,
        opacity: 1 - p,
        pointerEvents: 'none',
      }}
    />
  );
};
