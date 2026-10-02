// الفكرة 4: «من الطين إلى الشاشات» — جدار طين الدرعية: الشعاران مختومان فيه، كتابة محفورة،
// تشققات يتسرب منها ضوء أزرق رقمي، ثم يتحطم الطين ليكشف عالم نيو كابتا الرقمي
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

const CLAY = '#9a6446';

const ClayWall: React.FC = () => (
  <AbsoluteFill>
    <svg width="100%" height="100%">
      <filter id="clay">
        <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="5" seed="7" />
        <feDiffuseLighting lightingColor="#d9a47f" surfaceScale="4">
          <feDistantLight azimuth="225" elevation="50" />
        </feDiffuseLighting>
      </filter>
      <rect width="100%" height="100%" filter="url(#clay)" />
    </svg>
    <AbsoluteFill style={{background: CLAY, mixBlendMode: 'multiply'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 30%, rgba(255,220,180,0.25), transparent 60%)'}} />
  </AbsoluteFill>
);

// نص محفور في الطين
const Carved: React.FC<{text: string; at: number; size: number; dir?: 'rtl' | 'ltr'; spacing?: number}> = ({
  text,
  at,
  size,
  dir = 'rtl',
  spacing = 0,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 40], [0, 1], clamp);
  return (
    <div
      dir={dir}
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: spacing,
        color: '#6e4128',
        textShadow: '-3px -3px 3px rgba(0,0,0,0.55), 3px 3px 2px rgba(255,214,180,0.45)',
        clipPath: dir === 'rtl' ? `inset(0 0 0 ${(1 - p) * 100}%)` : `inset(0 ${(1 - p) * 100}% 0 0)`,
      }}
    >
      {text}
    </div>
  );
};

// تشققات تخرج من المركز ويتسرب منها ضوء أزرق
const CRACKS = seeded(9, 'ck').map((s, i) => {
  const ang = (i / 9) * Math.PI * 2 + s.a * 0.5;
  const pts: [number, number][] = [[960, 540]];
  let x = 960;
  let y = 540;
  for (let k = 1; k <= 7; k++) {
    const r = 95 + (s.b + k) * 9;
    x += Math.cos(ang + Math.sin(k * 2.3 + i) * 0.5) * r;
    y += Math.sin(ang + Math.sin(k * 2.3 + i) * 0.5) * r * 0.8;
    pts.push([x, y]);
  }
  return pts.map((p) => p.join(',')).join(' ');
});

const Cracks: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 90], [1, 0], clamp);
  const glow = interpolate(f, [at + 40, at + 150], [4, 22], clamp);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {CRACKS.map((pts, i) => (
        <g key={i}>
          <polyline points={pts} fill="none" stroke="#2a160c" strokeWidth={9} pathLength={1} strokeDasharray={1} strokeDashoffset={p} />
          <polyline
            points={pts}
            fill="none"
            stroke={COLORS.neoBlueLight}
            strokeWidth={3}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={p}
            style={{filter: `drop-shadow(0 0 ${glow}px ${COLORS.neoBlue}) drop-shadow(0 0 ${glow / 2}px #fff)`}}
          />
        </g>
      ))}
    </svg>
  );
};

const Shatter: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const cols = 12;
  const rows = 7;
  const w = 1920 / cols;
  const h = 1080 / rows;
  return (
    <AbsoluteFill>
      {seeded(cols * rows, 'sh').map((s, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const dx = c * w + w / 2 - 960;
        const dy = r * h + h / 2 - 540;
        const t = Math.max(0, f - s.a * 6);
        const k = t * (0.06 + s.b * 0.05);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c * w,
              top: r * h,
              width: w + 1,
              height: h + 1,
              background: `radial-gradient(circle at ${s.x * 100}% ${s.y * 100}%, #b47a58, ${CLAY} 70%)`,
              boxShadow: 'inset -4px -4px 8px rgba(0,0,0,0.35), inset 3px 3px 6px rgba(255,210,170,0.3)',
              transform: `translate(${dx * k}px, ${dy * k + t * t * 0.6}px) rotate(${t * (s.x - 0.5) * 14}deg) scale(${1 - Math.min(0.6, t / 60)})`,
              opacity: interpolate(t, [20, 40], [1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Digital: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${COLORS.navy}, ${COLORS.neoBlack})`}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${COLORS.neoBlueLight} 2px, transparent 2.5px)`,
          backgroundSize: '26px 26px',
          backgroundPosition: `${f * 0.5}px 0`,
          opacity: 0.35,
          maskImage: 'radial-gradient(circle at 50% 50%, black 10%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 10%, transparent 70%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const ClayConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = (at: number) => spring({frame: f - at, fps, config: {damping: 13, stiffness: 140}});
  const a = stamp(3);
  const b = stamp(14);
  const shatterAt = 450;
  const title = spring({frame: f - 470, fps, config: {damping: 12}});
  const end = spring({frame: f - 780, fps, config: {damping: 13}});
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  const pressed = (p: number): React.CSSProperties => ({
    transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})`,
    opacity: Math.min(1, p * 2),
    filter: `drop-shadow(${(1 - p) * 30}px ${(1 - p) * 30}px 20px rgba(0,0,0,0.5)) sepia(${0.5 * p})`,
  });
  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-clay.wav')} />
      <Digital />
      {f < shatterAt + 60 ? (
        <AbsoluteFill style={{opacity: f < shatterAt ? 1 : 0}}>
          <ClayWall />
        </AbsoluteFill>
      ) : null}
      <Shatter at={shatterAt} />
      {f < shatterAt ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 20}}>
          {f < 95 ? (
            <div style={{display: 'flex', gap: 180}}>
              <div style={pressed(a)}>
                <NeoLogo size={360} style={{boxShadow: 'inset 0 0 30px #000, 0 6px 0 rgba(255,210,170,0.3)'}} />
              </div>
              <div style={pressed(b)}>
                <DiriyahLogo size={360} style={{boxShadow: 'inset 0 0 30px #000, 0 6px 0 rgba(255,210,170,0.3)'}} />
              </div>
            </div>
          ) : (
            <>
              <Carved text="من طين الدرعية…" at={100} size={150} />
              <Carved text="FROM DIRIYAH'S CLAY" at={130} size={56} dir="ltr" spacing={12} />
              {f > 270 ? (
                <div style={{opacity: interpolate(f, [270, 300], [0, 1], clamp)}}>
                  <Carved text="…يولد ضوء جديد" at={280} size={110} />
                  <Carved text="A NEW LIGHT IS BORN" at={300} size={46} dir="ltr" spacing={10} />
                </div>
              ) : null}
            </>
          )}
          <Cracks at={270} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{background: COLORS.neoBlueLight, opacity: interpolate(f, [shatterAt - 4, shatterAt, shatterAt + 14], [0, 0.9, 0], clamp)}} />
      {f >= 465 && f < 780 ? (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: FONT,
            opacity: interpolate(f, [760, 780], [1, 0], clamp),
          }}
        >
          <div dir="rtl" style={{fontSize: 170, fontWeight: 900, color: '#fff', transform: `scale(${title})`, textShadow: `0 0 50px ${COLORS.neoBlue}`}}>
            شراكة استراتيجية
          </div>
          <div style={{fontSize: 50, letterSpacing: 16, color: COLORS.neoBlueLight, opacity: title}}>STRATEGIC PARTNERSHIP</div>
          <div dir="rtl" style={{display: 'flex', gap: 30, marginTop: 50}}>
            {['تسويق', 'دعاية', 'إعلان'].map((t, i) => {
              const q = spring({frame: f - 560 - i * 15, fps, config: {damping: 12}});
              return (
                <div
                  key={t}
                  style={{
                    padding: '14px 50px',
                    fontSize: 54,
                    fontWeight: 900,
                    color: COLORS.sand,
                    background: `linear-gradient(135deg, ${CLAY}, #6e4128)`,
                    borderRadius: 14,
                    border: `2px solid ${COLORS.neoBlueLight}`,
                    boxShadow: `0 0 30px ${COLORS.neoBlue}`,
                    transform: `translateY(${(1 - q) * 80}px)`,
                    opacity: q,
                  }}
                >
                  {t}
                </div>
              );
            })}
          </div>
          <div dir="rtl" style={{marginTop: 40, fontSize: 40, color: COLORS.copperLight, opacity: interpolate(f, [640, 670], [0, 1], clamp)}}>
            إرث من طين… وإبداع من ضوء
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= 780 ? (
        <AbsoluteFill style={{flexDirection: 'row'}}>
          <div style={{width: '50%', height: '100%', position: 'relative', overflow: 'hidden', transform: `translateX(${(1 - end) * -100}%)`}}>
            <AbsoluteFill style={{width: 1920}}>
              <ClayWall />
            </AbsoluteFill>
          </div>
          <div style={{width: '50%', height: '100%', background: COLORS.neoBlack, transform: `translateX(${(1 - end) * 100}%)`}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30, fontFamily: FONT}}>
            <div style={{display: 'flex', gap: 200, opacity: end}}>
              <NeoLogo size={260} />
              <DiriyahLogo size={260} />
            </div>
            <div style={{fontSize: 58, fontWeight: 900, color: '#fff', textShadow: '0 4px 20px #000', opacity: end}}>
              Neo Capta × Diriyah Company
            </div>
            <div dir="rtl" style={{fontSize: 44, fontWeight: 700, color: COLORS.sand, textShadow: '0 4px 20px #000', opacity: end}}>
              من الطين… إلى الشاشات
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
