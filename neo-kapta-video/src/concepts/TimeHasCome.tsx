// الفكرة 10: «جاء الوقت» — جولة سينمائية في الدرعية (صور بحركة كاميرا بطيئة) وساعة تدق،
// ثم تتوقف العقارب عند 12: «وجاء الوقت… للشراكة»
//
// الصور: ضع صورك الحقيقية في public/diriyah/photo-1.jpg … photo-4.jpg وأعد التصدير —
// تُستخدم تلقائياً بدل المشاهد المرسومة.
import React from 'react';
import {AbsoluteFill, Audio, Img, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

type Mood = 'sunset' | 'golden' | 'night' | 'dawn';

const SKY: Record<Mood, string> = {
  sunset: 'linear-gradient(180deg, #2c2342 0%, #8a4a52 35%, #e08a5a 62%, #f6c27f 75%)',
  golden: 'linear-gradient(180deg, #7fa3c7 0%, #d9c4a0 55%, #f1d29c 75%)',
  night: 'linear-gradient(180deg, #03040c 0%, #0b1036 55%, #2a1f3a 78%)',
  dawn: 'linear-gradient(180deg, #4b5d8c 0%, #c7a3a4 50%, #f2c9a0 72%)',
};

const MUD: Record<Mood, [string, string]> = {
  sunset: ['#b06d48', '#7a4630'],
  golden: ['#d0a072', '#a77650'],
  night: ['#6b4430', '#3a2418'],
  dawn: ['#b98a6c', '#86604a'],
};

// مبنى نجدي: جدار بشرفات مثلثة ونوافذ مثلثة ورؤوس جذوع خشبية
const Building: React.FC<{x: number; w: number; h: number; base: number; mood: Mood; tower?: boolean; seed: string}> = ({
  x,
  w,
  h,
  base,
  mood,
  tower,
  seed,
}) => {
  const [c1, c2] = MUD[mood];
  const top = base - h;
  const taper = tower ? w * 0.12 : 0;
  const tri = 22;
  const n = Math.floor((w - 2 * taper) / tri);
  const wins = seeded(Math.max(1, Math.floor(w / 90)), seed);
  const lit = mood === 'night';
  return (
    <g>
      <path d={`M${x} ${base} L${x + taper} ${top} L${x + w - taper} ${top} L${x + w} ${base} Z`} fill={`url(#mud-${mood})`} />
      {/* شرفات مثلثة */}
      {new Array(n).fill(0).map((_, i) => (
        <path key={i} d={`M${x + taper + i * tri} ${top} l${tri / 2} -${tri * 0.9} l${tri / 2} ${tri * 0.9} Z`} fill={c1} />
      ))}
      {/* رؤوس جذوع الأثل */}
      {new Array(Math.floor(w / 26)).fill(0).map((_, i) => (
        <circle key={`b${i}`} cx={x + 14 + i * 26} cy={top + 40} r={3.5} fill={c2} />
      ))}
      {/* نوافذ مثلثة صغيرة */}
      {wins.map((s, i) => {
        const wx = x + 30 + s.x * (w - 70);
        const wy = top + 70 + s.y * Math.max(10, h - 140);
        return (
          <g key={`w${i}`}>
            {[0, 1, 2].map((k) => (
              <path key={k} d={`M${wx + k * 14} ${wy} l6 -11 l6 11 Z`} fill={lit ? '#ffcf7a' : '#3a2418'} opacity={lit ? 0.95 : 0.8} />
            ))}
          </g>
        );
      })}
      {/* تظليل جانبي */}
      <path d={`M${x + w * 0.7} ${base} L${x + w * 0.7} ${top} L${x + w - taper} ${top} L${x + w} ${base} Z`} fill="#000" opacity={0.15} />
    </g>
  );
};

const Palm: React.FC<{x: number; base: number; h: number; dark: string}> = ({x, base, h, dark}) => (
  <g>
    <path d={`M${x} ${base} Q ${x + 12} ${base - h / 2}, ${x + 6} ${base - h}`} stroke={dark} strokeWidth={10} fill="none" />
    {[-150, -120, -80, -40, -10, 20, 60].map((a, i) => {
      const r = 90 + (i % 2) * 20;
      const rad = (a * Math.PI) / 180;
      const ex = x + 6 + Math.cos(rad) * r;
      const ey = base - h + Math.sin(rad) * r * 0.6 + 30;
      return <path key={i} d={`M${x + 6} ${base - h} Q ${(x + 6 + ex) / 2} ${base - h - 40}, ${ex} ${ey}`} stroke={dark} strokeWidth={9} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

// مشهد مرسوم للدرعية — يُستبدل تلقائياً بالصورة الحقيقية إن وُجدت
const DiriyahScene: React.FC<{mood: Mood; variant: number}> = ({mood, variant}) => {
  const [c1, c2] = MUD[mood];
  const base = variant === 1 ? 1080 : 860;
  const dark = mood === 'night' ? '#05060a' : '#2a1a12';
  const layout =
    variant === 1
      ? // لقطة قريبة لجدار وبرج
        [
          {x: -40, w: 900, h: 760, tower: false},
          {x: 860, w: 360, h: 940, tower: true},
          {x: 1220, w: 760, h: 700, tower: false},
        ]
      : [
          {x: -60, w: 420, h: 300, tower: false},
          {x: 300, w: 180, h: 420, tower: true},
          {x: 470, w: 520, h: 340, tower: false},
          {x: 960, w: 200, h: 470, tower: true},
          {x: 1150, w: 480, h: 360, tower: false},
          {x: 1600, w: 380, h: 280, tower: false},
        ];
  return (
    <AbsoluteFill style={{background: SKY[mood]}}>
      {mood === 'night'
        ? seeded(120, 'ns').map((s, i) => (
            <div key={i} style={{position: 'absolute', left: s.x * 1920, top: s.y * 500, width: 2 + s.a * 2, height: 2 + s.a * 2, borderRadius: '50%', background: '#fff', opacity: 0.4 + s.b * 0.6}} />
          ))
        : null}
      {mood === 'sunset' || mood === 'dawn' ? (
        <div style={{position: 'absolute', left: 1250, top: 430, width: 220, height: 220, borderRadius: '50%', background: '#ffe2b0', boxShadow: '0 0 160px 60px rgba(255,200,140,0.6)'}} />
      ) : null}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id={`mud-${mood}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="1" stopColor={c2} />
          </linearGradient>
        </defs>
        <path d="M0 800 C 400 760, 800 790, 1200 770 S 1700 760, 1920 790 L1920 1080 L0 1080 Z" fill={c2} opacity={0.6} />
        {variant === 3
          ? [140, 420, 760, 1080, 1400, 1700].map((x, i) => <Palm key={i} x={x} base={1000} h={330 + (i % 3) * 60} dark={dark} />)
          : null}
        {layout.map((b, i) => (
          <Building key={i} x={b.x} w={b.w} h={b.h} base={base} mood={mood} tower={b.tower} seed={`${variant}-${i}`} />
        ))}
        {variant !== 3 && variant !== 1
          ? [80, 1760].map((x, i) => <Palm key={i} x={x} base={1000} h={380} dark={dark} />)
          : null}
        <rect x={0} y={base} width={1920} height={1080 - base} fill={c2} />
      </svg>
      {mood === 'night' ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 85%, rgba(255,180,90,0.35), transparent 60%)'}} /> : null}
    </AbsoluteFill>
  );
};

const PHOTOS = [
  {file: 'diriyah/photo-1.jpg', mood: 'sunset' as Mood, variant: 0},
  {file: 'diriyah/photo-2.jpg', mood: 'golden' as Mood, variant: 1},
  {file: 'diriyah/photo-3.jpg', mood: 'night' as Mood, variant: 2},
  {file: 'diriyah/photo-4.jpg', mood: 'dawn' as Mood, variant: 3},
];

// صورة بحركة «كين بيرنز» (تكبير وانزلاق بطيء)
const Photo: React.FC<{i: number; from: number; dur: number; dir?: 1 | -1}> = ({i, from, dur, dir = 1}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [from, from + dur], [0, 1], clamp);
  const o = interpolate(f, [from, from + 15, from + dur - 15, from + dur], [0, 1, 1, 0], clamp);
  if (f < from || f > from + dur) return null;
  const p = PHOTOS[i];
  const real = getStaticFiles().some((s) => s.name === p.file);
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${1.08 + t * 0.12}) translateX(${dir * (t - 0.5) * 60}px)`}}>
        {real ? (
          <Img src={staticFile(p.file)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <DiriyahScene mood={p.mood} variant={p.variant} />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 18, to - 12, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', bottom: 110, right: 120, left: 120, textAlign: 'right', fontFamily: FONT, opacity: o}}>
      <div dir="rtl" style={{fontSize: 96, fontWeight: 900, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.7)', transform: `translateY(${(1 - o) * 20}px)`}}>
        {ar}
      </div>
      <div style={{fontSize: 34, letterSpacing: 10, color: COLORS.sand, textShadow: '0 2px 10px #000'}}>{en}</div>
    </div>
  );
};

// ساعة صغيرة في الزاوية تدق طوال الجولة
const MiniClock: React.FC = () => {
  const f = useCurrentFrame();
  const sec = Math.floor(f / 15); // تكّة كل نصف ثانية
  const o = interpolate(f, [100, 120, 520, 540], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 70, left: 90, width: 120, height: 120, borderRadius: '50%', border: `4px solid ${COLORS.sand}`, opacity: o}}>
      <div style={{position: 'absolute', left: 58, top: 12, width: 4, height: 48, background: COLORS.copperLight, transformOrigin: '2px 48px', transform: `rotate(${sec * 6}deg)`}} />
      <div style={{position: 'absolute', left: 56, top: 56, width: 8, height: 8, borderRadius: 4, background: COLORS.sand}} />
    </div>
  );
};

// الساعة الكبيرة: العقارب تدور بسرعة ثم تتوقف عند 12
const BigClock: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 75], [0, 1], clamp);
  const e = 1 - Math.pow(1 - t, 3);
  const minute = 360 * 6 * e;
  const hour = 330 + 30 * e;
  const strike = interpolate(f, [at + 75, at + 80, at + 110], [0, 1, 0], clamp);
  const nums = ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'];
  return (
    <div style={{position: 'relative', width: 560, height: 560, borderRadius: '50%', border: `6px solid ${COLORS.sand}`, background: 'rgba(5,6,10,0.55)', boxShadow: `0 0 ${40 + strike * 120}px ${COLORS.copper}`}}>
      {nums.map((n, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <div key={n} style={{position: 'absolute', left: 280 + Math.sin(a) * 225 - 30, top: 280 - Math.cos(a) * 225 - 30, width: 60, textAlign: 'center', fontFamily: FONT, fontSize: 42, fontWeight: 700, color: i === 0 ? COLORS.copperLight : COLORS.sand}}>
            {n}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 274, top: 140, width: 12, height: 140, borderRadius: 6, background: COLORS.sand, transformOrigin: '6px 140px', transform: `rotate(${hour}deg)`}} />
      <div style={{position: 'absolute', left: 276, top: 70, width: 8, height: 210, borderRadius: 4, background: COLORS.copperLight, transformOrigin: '4px 210px', transform: `rotate(${minute}deg)`}} />
      <div style={{position: 'absolute', left: 266, top: 266, width: 28, height: 28, borderRadius: 14, background: COLORS.copper}} />
    </div>
  );
};

export const TimeHasComeConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  // 0–3 ث: الشعاران فوق صورة الدرعية المموّهة
  const logoA = spring({frame: f - 4, fps, config: {damping: 14}});
  const logoB = spring({frame: f - 12, fps, config: {damping: 14}});
  const logosOut = interpolate(f, [75, 90], [1, 0], clamp);

  // 18–23 ث: الساعة الكبيرة
  const clockIn = spring({frame: f - 540, fps, config: {damping: 14}});
  const clockOut = interpolate(f, [680, 695], [1, 0], clamp);
  const timeText = spring({frame: f - 618, fps, config: {damping: 12}});
  const flash = interpolate(f, [615, 620, 640], [0, 0.8, 0], clamp);

  // 23–27 ث: للشراكة
  const split = spring({frame: f - 690, fps, config: {damping: 15}});
  const word = spring({frame: f - 705, fps, config: {damping: 11}});
  const services = interpolate(f, [740, 760], [0, 1], clamp);

  const end = spring({frame: f - 812, fps, config: {damping: 13}});

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-time.wav')} />

      {/* 0–3 ث */}
      {f < 95 ? (
        <AbsoluteFill style={{opacity: logosOut}}>
          <AbsoluteFill style={{filter: 'blur(10px) brightness(0.55)', transform: 'scale(1.1)'}}>
            <DiriyahScene mood="sunset" variant={0} />
          </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: 120, alignItems: 'center'}}>
              <div style={{transform: `scale(${logoA})`}}>
                <NeoLogo size={340} />
              </div>
              <div style={{fontFamily: FONT, fontSize: 100, color: '#fff', opacity: logoB}}>×</div>
              <div style={{transform: `scale(${logoB})`}}>
                <DiriyahLogo size={340} />
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* 3–18 ث: جولة الصور */}
      <Photo i={0} from={85} dur={160} dir={1} />
      <Photo i={1} from={235} dur={160} dir={-1} />
      <Photo i={2} from={385} dur={170} dir={1} />
      <Caption from={95} to={240} ar="الدرعية… حيث بدأت الحكاية" en="DIRIYAH… WHERE IT ALL BEGAN" />
      <Caption from={245} to={390} ar="إرثٌ صنع التاريخ" en="A HERITAGE THAT SHAPED HISTORY" />
      <Caption from={395} to={545} ar="واليوم… العالم كله يتجه إليها" en="TODAY, THE WORLD IS LOOKING HERE" />
      <MiniClock />

      {/* 18–23 ث: جاء الوقت */}
      {f >= 535 && f < 700 ? (
        <AbsoluteFill style={{opacity: clockOut}}>
          <AbsoluteFill style={{filter: 'brightness(0.35) blur(4px)'}}>
            <DiriyahScene mood="night" variant={2} />
          </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 110}}>
            <div style={{transform: `scale(${clockIn})`}}>
              <BigClock at={540} />
            </div>
            <div style={{fontFamily: FONT, textAlign: 'right', minWidth: 760}}>
              <div dir="rtl" style={{fontSize: 70, fontWeight: 700, color: COLORS.sand, opacity: clockIn}}>وجاء…</div>
              <div dir="rtl" style={{fontSize: 170, fontWeight: 900, color: '#fff', lineHeight: 1.1, transform: `scale(${timeText})`, transformOrigin: 'right center'}}>
                الوقت
              </div>
              <div style={{fontSize: 40, letterSpacing: 10, color: COLORS.copperLight, opacity: timeText}}>THE TIME HAS COME</div>
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{background: '#fff', opacity: flash}} />
        </AbsoluteFill>
      ) : null}

      {/* 23–27 ث: للشراكة — الصورة تنقسم: نصف بإضاءة نيو كابتا الزرقاء ونصف نحاسي */}
      {f >= 688 && f < 815 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [800, 815], [1, 0], clamp)}}>
          <Photo i={3} from={688} dur={127} dir={-1} />
          <AbsoluteFill style={{background: `linear-gradient(90deg, ${COLORS.neoBlue}cc 0%, ${COLORS.neoBlue}55 ${50 * split}%, ${COLORS.copper}55 ${100 - 50 * split}%, ${COLORS.copper}cc 100%)`, mixBlendMode: 'multiply'}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
            <div dir="rtl" style={{fontSize: 190, fontWeight: 900, color: '#fff', transform: `scale(${word})`, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>
              …للشراكة
            </div>
            <div style={{fontSize: 50, letterSpacing: 16, color: '#fff', opacity: word}}>…FOR PARTNERSHIP</div>
            <div dir="rtl" style={{display: 'flex', gap: 24, marginTop: 40, opacity: services}}>
              {['تسويق', 'دعاية', 'إعلان'].map((t) => (
                <div key={t} style={{padding: '10px 36px', borderRadius: 40, border: '3px solid #fff', fontSize: 44, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.25)'}}>
                  {t}
                </div>
              ))}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* 27–30 ث: الختام */}
      {f >= 810 ? (
        <AbsoluteFill style={{background: COLORS.neoBlack, justifyContent: 'center', alignItems: 'center', gap: 28, fontFamily: FONT}}>
          <AbsoluteFill style={{opacity: 0.25, filter: 'blur(8px)'}}>
            <DiriyahScene mood="night" variant={2} />
          </AbsoluteFill>
          <div style={{display: 'flex', gap: 70, alignItems: 'center', transform: `scale(${end})`}}>
            <NeoLogo size={250} />
            <div style={{fontSize: 90, color: '#fff'}}>×</div>
            <DiriyahLogo size={250} />
          </div>
          <div dir="rtl" style={{fontSize: 84, fontWeight: 900, color: '#fff', opacity: end, zIndex: 1}}>حان وقت الشراكة</div>
          <div style={{fontSize: 40, fontWeight: 700, color: COLORS.copperLight, opacity: end, zIndex: 1}}>Neo Capta × Diriyah Company · Strategic Partnership</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
