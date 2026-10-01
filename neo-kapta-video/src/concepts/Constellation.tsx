// الفكرة 2: «كوكبة الدرعية» — سماء صحراء ليلية؛ النجوم تتصل لترسم جبل الدرعية (من شعارها)
// ثم مكبّر صوت (رمز الإعلان والتسويق) لنيو كابتا، ثم شهاب يربط الكوكبتين = شراكة
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

type Pt = [number, number];

const MOUNTAIN: Pt[] = [
  [200, 560], [290, 430], [370, 430], [430, 350], [510, 350], [550, 260],
  [630, 260], [690, 400], [770, 400], [830, 340], [880, 360], [930, 560], [200, 560],
];
const MEGAPHONE: Pt[] = [
  [1180, 430], [1260, 430], [1560, 300], [1560, 650], [1260, 520], [1180, 520], [1180, 430],
];
const WAVES: Pt[] = [[1630, 370], [1680, 475], [1630, 580]];

const STARS = seeded(240, 'st');

const Sky: React.FC<{lift: number}> = ({lift}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{background: `linear-gradient(180deg, #02030a 0%, ${COLORS.navy} 55%, #2a1a2e 85%, #4a2c22 100%)`}}
      />
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.x * 1920,
            top: s.y * 900 - lift * 0.3,
            width: 1 + s.a * 3,
            height: 1 + s.a * 3,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.25 + 0.75 * Math.abs(Math.sin(f / (12 + s.b * 30) + i)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Dunes: React.FC<{lift: number}> = ({lift}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', top: 0, left: 0, transform: `translateY(${180 - lift}px)`}}>
    <path d="M0 900 C 300 820, 520 860, 760 830 S 1300 780, 1920 860 L1920 1080 L0 1080 Z" fill="#3a2418" />
    <path d="M0 960 C 400 900, 700 980, 1100 930 S 1600 900, 1920 950 L1920 1080 L0 1080 Z" fill="#24160f" />
    <path d="M0 1020 C 500 990, 900 1050, 1920 1010 L1920 1080 L0 1080 Z" fill="#120b08" />
  </svg>
);

const Constellation: React.FC<{pts: Pt[]; start: number; per: number; color: string; glow: number}> = ({
  pts,
  start,
  per,
  color,
  glow,
}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {pts.slice(0, -1).map((p, i) => {
        const q = pts[i + 1];
        const t = interpolate(f, [start + i * per, start + (i + 1) * per], [0, 1], clamp);
        return (
          <line
            key={i}
            x1={p[0]}
            y1={p[1]}
            x2={p[0] + (q[0] - p[0]) * t}
            y2={p[1] + (q[1] - p[1]) * t}
            stroke={color}
            strokeWidth={2.5 + glow * 2}
            strokeOpacity={0.75}
            style={{filter: `drop-shadow(0 0 ${6 + glow * 14}px ${color})`}}
          />
        );
      })}
      {pts.map((p, i) => {
        const on = f >= start + i * per;
        return on ? (
          <circle
            key={`c${i}`}
            cx={p[0]}
            cy={p[1]}
            r={6 + glow * 4 + Math.sin(f / 6 + i) * 1.5}
            fill="#fff"
            style={{filter: `drop-shadow(0 0 12px ${color})`}}
          />
        ) : null;
      })}
    </svg>
  );
};

const Caption: React.FC<{from: number; to: number; ar: string; en: string; top?: number}> = ({from, to, ar, en, top = 760}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 20, to - 15, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: o}}>
      <div dir="rtl" style={{fontSize: 68, fontWeight: 700, color: COLORS.sand, filter: `blur(${(1 - o) * 6}px)`}}>
        {ar}
      </div>
      <div style={{fontSize: 30, fontWeight: 400, letterSpacing: 10, color: COLORS.neoBlueLight}}>{en}</div>
    </div>
  );
};

const ShootingStar: React.FC<{at: number; from: Pt; to: Pt; dur?: number; color?: string}> = ({
  at,
  from,
  to,
  dur = 30,
  color = '#fff',
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + dur], [0, 1], clamp);
  if (f < at || t >= 1) return null;
  const e = 1 - Math.pow(1 - t, 2);
  const x = from[0] + (to[0] - from[0]) * e;
  const y = from[1] + (to[1] - from[1]) * e - Math.sin(e * Math.PI) * 180;
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 160,
        top: y,
        width: 160,
        height: 4,
        borderRadius: 2,
        transformOrigin: 'right center',
        transform: `rotate(${ang}rad)`,
        background: `linear-gradient(90deg, transparent, ${color})`,
        boxShadow: `0 0 20px ${color}`,
      }}
    />
  );
};

export const ConstellationConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lift = interpolate(f, [690, 760], [0, 200], clamp);
  // 0–3 ث: الشعاران يظهران كقمرين مضيئين
  const logoIn = interpolate(f, [0, 30], [0, 1], clamp);
  const logoOut = interpolate(f, [72, 90], [1, 0], clamp);
  // الربط عند 17–18 ث
  const linkFlash = interpolate(f, [548, 556, 600], [0, 1, 0], clamp);
  const glow = interpolate(f, [550, 570], [0, 1], clamp);
  const title = spring({frame: f - 560, fps, config: {damping: 14}});
  const titleOut = interpolate(f, [680, 700], [1, 0], clamp);
  const end = spring({frame: f - 815, fps, config: {damping: 14}});
  const endOut = interpolate(f, [880, 900], [1, 0], clamp);
  const label = (txt: string, x: number, y: number, at: number, c: string) => (
    <div
      style={{
        position: 'absolute',
        left: x - 200,
        width: 400,
        top: y,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 34,
        fontWeight: 700,
        color: c,
        opacity: interpolate(f, [at, at + 20], [0, 1], clamp) * interpolate(f, [800, 815], [1, 0], clamp),
      }}
    >
      {txt}
    </div>
  );
  return (
    <AbsoluteFill>
      <Audio src={staticFile('music-constellation.wav')} />
      <Sky lift={lift} />
      {f < 90 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: logoIn * logoOut}}>
          <div style={{display: 'flex', gap: 200, transform: `translateY(-80px) scale(${0.9 + logoIn * 0.1})`}}>
            <NeoLogo size={300} style={{boxShadow: `0 0 120px 30px ${COLORS.neoBlue}88`, filter: `blur(${(1 - logoIn) * 12}px)`}} />
            <DiriyahLogo size={300} style={{boxShadow: `0 0 120px 30px ${COLORS.copper}88`, filter: `blur(${(1 - logoIn) * 12}px)`}} />
          </div>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{transform: `translateY(${-lift}px)`, opacity: interpolate(f, [800, 815], [1, 0], clamp)}}>
        <ShootingStar at={100} from={[1700, 80]} to={[900, 260]} />
        <ShootingStar at={190} from={[300, 60]} to={[1100, 200]} />
        <Constellation pts={MOUNTAIN} start={130} per={11} color={COLORS.copperLight} glow={glow} />
        {label('شركة الدرعية', 565, 600, 270, COLORS.copperLight)}
        <Constellation pts={MEGAPHONE} start={310} per={16} color={COLORS.neoBlueLight} glow={glow} />
        <Constellation pts={WAVES} start={420} per={14} color={COLORS.neoBlueLight} glow={glow} />
        {label('نيو كابتا', 1400, 690, 440, COLORS.neoBlueLight)}
        <ShootingStar at={515} from={[1180, 475]} to={[930, 560]} dur={36} color={COLORS.sand} />
        {glow > 0 ? (
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path
              d="M930 560 Q 1055 300 1180 475"
              fill="none"
              stroke={COLORS.sand}
              strokeWidth={3}
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset={1 - glow}
              style={{filter: `drop-shadow(0 0 14px ${COLORS.sand})`}}
            />
          </svg>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: linkFlash * 0.5}} />
      <Dunes lift={lift} />
      <Caption from={95} to={290} ar="في سماء الدرعية…" en="IN DIRIYAH'S SKY" />
      <Caption from={305} to={505} ar="نجمٌ في التسويق والدعاية والإعلان" en="A STAR IN MARKETING & ADVERTISING" />
      {f >= 555 && f < 700 ? (
        <div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: titleOut}}>
          <div dir="rtl" style={{fontSize: 120, fontWeight: 900, color: '#fff', transform: `scale(${title})`, textShadow: `0 0 40px ${COLORS.copper}`}}>
            شراكة استراتيجية
          </div>
          <div style={{fontSize: 40, letterSpacing: 14, color: COLORS.copperLight, opacity: title}}>STRATEGIC PARTNERSHIP</div>
        </div>
      ) : null}
      <Caption from={705} to={812} ar="معاً نرسم قصة تصل للعالم" en="TOGETHER, WE DRAW A STORY FOR THE WORLD" top={620} />
      {f >= 812 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30, opacity: endOut, fontFamily: FONT}}>
          <div style={{display: 'flex', gap: 70, alignItems: 'center', transform: `translateY(-60px) scale(${end})`}}>
            <NeoLogo size={230} style={{boxShadow: `0 0 100px ${COLORS.neoBlue}`}} />
            <div style={{fontSize: 80, color: COLORS.sand}}>✦</div>
            <DiriyahLogo size={230} style={{boxShadow: `0 0 100px ${COLORS.copper}`}} />
          </div>
          <div style={{fontSize: 58, fontWeight: 700, color: '#fff', opacity: end, transform: 'translateY(-60px)'}}>
            Neo Capta × Diriyah Company
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
