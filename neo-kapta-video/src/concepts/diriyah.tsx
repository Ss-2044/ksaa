// صور الدرعية المشتركة بين المقاطع.
// الصور الحقيقية معرّفة في REAL أدناه؛ أي مكان بلا صورة يُعرض كمشهد مرسوم.
import React from 'react';
import {AbsoluteFill, Img, getStaticFiles, staticFile} from 'remotion';
import {seeded} from './shared';

export type Mood = 'sunset' | 'golden' | 'night' | 'dawn';

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
export const DiriyahScene: React.FC<{mood: Mood; variant: number}> = ({mood, variant}) => {
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
        {layout.map((b, i) => (
          <Building key={i} x={b.x} w={b.w} h={b.h} base={base} mood={mood} tower={b.tower} seed={`${variant}-${i}`} />
        ))}
        {variant === 3 ? (
          <>
            {/* مياه الوادي وانعكاسها */}
            <rect x={0} y={900} width={1920} height={180} fill="#9fb6c9" opacity={0.75} />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={200 + i * 330} y={930 + (i % 2) * 40} width={160} height={4} fill="#fff" opacity={0.5} />
            ))}
            {[60, 300, 560, 830, 1120, 1380, 1650, 1860].map((x, i) => (
              <Palm key={i} x={x} base={920} h={420 + (i % 3) * 90} dark={dark} />
            ))}
          </>
        ) : null}
        {variant !== 3 && variant !== 1
          ? [80, 1760].map((x, i) => <Palm key={i} x={x} base={1000} h={380} dark={dark} />)
          : null}
        {variant === 4
          ? [0, 1, 2].map((k) => {
              const y0 = 560 + k * 60;
              const pts = new Array(40).fill(0).map((_, i) => {
                const x = (i / 39) * 1920;
                const y = y0 + Math.sin((i / 39) * Math.PI * 3) * 40 + 30;
                return [x, y];
              });
              return (
                <g key={k}>
                  <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#2a1a12" strokeWidth={2} />
                  {pts.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y + 6} r={6} fill="#ffd28a" style={{filter: 'drop-shadow(0 0 8px #ffb347)'}} />
                  ))}
                </g>
              );
            })
          : null}
        {variant !== 3 ? <rect x={0} y={base} width={1920} height={1080 - base} fill={c2} /> : null}
      </svg>
      {mood === 'night' ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 85%, rgba(255,180,90,0.35), transparent 60%)'}} /> : null}
    </AbsoluteFill>
  );
};


export const SLOTS = {
  'turaif-sunset': {mood: 'sunset' as Mood, variant: 0, ar: 'الدرعية من الأعلى', en: 'DIRIYAH FROM ABOVE'},
  'turaif-wall': {mood: 'golden' as Mood, variant: 1, ar: 'الطين النجدي', en: 'NAJDI MUD-BRICK'},
  'bujairi-night': {mood: 'night' as Mood, variant: 2, ar: 'الدرعية ليلاً', en: 'DIRIYAH AT NIGHT'},
  'bujairi-terrace': {mood: 'night' as Mood, variant: 4, ar: 'قلب الدرعية', en: 'THE HEART OF DIRIYAH'},
  'wadi-hanifa': {mood: 'dawn' as Mood, variant: 3, ar: 'شوارع الدرعية', en: "DIRIYAH'S BOULEVARDS"},
};
export type Slot = keyof typeof SLOTS;

// الصور الحقيقية لكل مكان (في public/diriyah/) — مع موضع القصّ والتكبير لتناسب 16:9.
// الصورتان الطوليتان تُقصّان حول المباني. احذف سطراً ليعود المشهد المرسوم.
type Real = {file: string; pos: string; zoom?: number};
const REAL: Partial<Record<Slot, Real>> = {
  'turaif-sunset': {file: 'diriyah/aerial.jpg', pos: '50% 50%'},
  'turaif-wall': {file: 'diriyah/tower-night.jpg', pos: '50% 50%'},
  'bujairi-night': {file: 'diriyah/tower-night.jpg', pos: '50% 85%', zoom: 1.2},
  'bujairi-terrace': {file: 'diriyah/aerial.jpg', pos: '85% 60%', zoom: 1.6},
  'wadi-hanifa': {file: 'diriyah/aerial.jpg', pos: '15% 85%', zoom: 1.9},
};

export const hasRealPhoto = (slot: Slot) => {
  const r = REAL[slot];
  return !!r && getStaticFiles().some((s) => s.name === r.file);
};

// صورة المكان: الحقيقية إن وُجدت، وإلا المشهد المرسوم.
// w/h: مقاس الإطار إن كان أصغر من الشاشة، ليُصغَّر المشهد المرسوم ويغطي الإطار (مثل object-fit: cover)
export const DiriyahImage: React.FC<{slot: Slot; w?: number; h?: number}> = ({slot, w = 1920, h = 1080}) => {
  if (hasRealPhoto(slot)) {
    const r = REAL[slot]!;
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <Img
          src={staticFile(r.file)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: r.pos,
            transform: `scale(${r.zoom ?? 1})`,
            transformOrigin: r.pos,
          }}
        />
      </div>
    );
  }
  const s = Math.max(w / 1920, h / 1080);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: (w - 1920 * s) / 2, top: (h - 1080 * s) / 2, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: 'top left'}}>
        <DiriyahScene mood={SLOTS[slot].mood} variant={SLOTS[slot].variant} />
      </div>
    </div>
  );
};
