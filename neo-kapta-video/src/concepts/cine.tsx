// عناصر مشتركة للأفلام السينمائية (الأفكار ٢٣–٢٥): لقطات بحركة كاميرا من الصور الحقيقية، أشرطة سينما،
// نصوص فاخرة، ومشاهد «إبداعية» مرسومة (كاميرا، شاشة تصميم، فريق، شاشات إعلانية، محتوى على الجوال)
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp} from './shared';

export const AERIAL = staticFile('diriyah/aerial.jpg');
export const TOWER = staticFile('diriyah/tower-night.jpg');
export const GOLD = '#E3C08D';

// قصّات مختلفة من الصورتين تعمل كلقطات منفصلة
export const CROPS = {
  mudDetail: {src: TOWER, pos: '45% 88%', zoom: 2.4},
  crenels: {src: TOWER, pos: '50% 22%', zoom: 1.7},
  towerNight: {src: TOWER, pos: '50% 50%', zoom: 1.05},
  architecture: {src: AERIAL, pos: '62% 45%', zoom: 1.9},
  people: {src: AERIAL, pos: '78% 92%', zoom: 2.8},
  palms: {src: AERIAL, pos: '18% 70%', zoom: 2.2},
  aerialWide: {src: AERIAL, pos: '50% 50%', zoom: 1.0},
} as const;
export type Crop = keyof typeof CROPS;

// لقطة: صورة بحركة كاميرا بطيئة، تظهر وتختفي بقطع سريع أو مزج
export const Shot: React.FC<{crop: Crop; from: number; dur: number; drift?: number; push?: number; fade?: number; grade?: string}> = ({
  crop,
  from,
  dur,
  drift = 1,
  push = 0.08,
  fade = 6,
  grade = 'saturate(1.05) contrast(1.06)',
}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const t = (f - from) / dur;
  const c = CROPS[crop];
  const o = interpolate(f - from, [0, fade, dur - fade, dur], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <Img
        src={c.src}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: c.pos,
          transformOrigin: c.pos,
          transform: `scale(${c.zoom * (1 + push * t)}) translateX(${drift * (t - 0.5) * 30}px)`,
          filter: grade,
        }}
      />
    </AbsoluteFill>
  );
};

// أشرطة سينما + تظليل + لون دافئ
export const CineFrame: React.FC<{bars?: number}> = ({bars = 110}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,190,120,0.05), rgba(20,30,60,0.08))', mixBlendMode: 'overlay'}} />
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: bars, background: '#000'}} />
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: bars, background: '#000'}} />
  </AbsoluteFill>
);

// نص فاخر: يظهر بتباعد أحرف يضيق وضبابية تزول
export const LuxText: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
  size?: number;
  weight?: number;
  color?: string;
  dir?: 'rtl' | 'ltr';
  spacing?: number;
  top?: number | string;
  bottom?: number;
}> = ({from, to, children, size = 64, weight = 400, color = '#fff', dir = 'rtl', spacing = 0, top, bottom}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 20, to - 15, to], [0, 1, 1, 0], clamp);
  const pos: React.CSSProperties = top !== undefined ? {top} : bottom !== undefined ? {bottom} : {top: '50%', transform: 'translateY(-50%)'};
  return (
    <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', ...pos}}>
      <div style={{position: 'absolute', left: '15%', right: '15%', top: '-40%', bottom: '-40%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55), transparent 70%)', opacity: o}} />
      <div
        dir={dir}
        style={{
          position: 'relative',
          display: 'inline-block',
          fontFamily: FONT,
          fontSize: size,
          fontWeight: weight,
          color,
          letterSpacing: spacing + (1 - o) * (dir === 'ltr' ? 14 : 0),
          opacity: o,
          filter: `blur(${(1 - o) * 8}px)`,
          textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 4px 30px rgba(0,0,0,0.7)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// وسم صغير أعلى اللقطة (تصوير، تصميم…)
export const Tag: React.FC<{from: number; to: number; text: string}> = ({from, to, text}) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div dir="rtl" style={{position: 'absolute', top: 140, right: 120, fontFamily: FONT, fontSize: 30, fontWeight: 300, color: GOLD, letterSpacing: 4, borderRight: `3px solid ${GOLD}`, paddingRight: 14}}>
      {text}
    </div>
  );
};

// ---------- مشاهد إبداعية مرسومة ----------

export const CameraScene: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const t = f - from;
  const focus = interpolate(t, [0, 18], [10, 0], clamp);
  const shutter = t >= dur - 10 && t < dur - 7;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: `blur(${focus}px)`}}>
        <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 50%', transform: `scale(${1.3 + t * 0.002})`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{border: '3px solid rgba(255,255,255,0.7)', margin: 160, fontFamily: FONT}}>
        <div style={{position: 'absolute', top: 16, left: 20, color: '#fff', fontSize: 24, display: 'flex', gap: 10, alignItems: 'center'}}>
          <div style={{width: 14, height: 14, borderRadius: 7, background: '#E5484D'}} /> REC
        </div>
        <div style={{position: 'absolute', top: 16, right: 20, color: '#fff', fontSize: 22, letterSpacing: 2}}>6K · 24fps · ISO 400</div>
        <div style={{position: 'absolute', left: '50%', top: '50%', width: 180, height: 120, marginLeft: -90, marginTop: -60, border: `3px solid ${focus < 1 ? '#5BE37D' : '#fff'}`}} />
      </AbsoluteFill>
      {shutter ? <AbsoluteFill style={{background: '#000'}} /> : null}
    </AbsoluteFill>
  );
};

export const DesignScene: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const t = f - from;
  const cx = interpolate(t, [0, dur], [1150, 760]);
  const cy = interpolate(t, [0, dur], [700, 420]);
  return (
    <AbsoluteFill style={{background: '#16171c', fontFamily: FONT, transform: `scale(${1.04 - t * 0.0006})`}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: '#202128', display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', color: '#aaa', fontSize: 20}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: '#E5484D'}} />
        <div style={{width: 12, height: 12, borderRadius: 6, background: '#F5C04A'}} />
        <div style={{width: 12, height: 12, borderRadius: 6, background: '#5BE37D'}} />
        <div style={{marginLeft: 30}}>Neo Capta — Diriyah Campaign.design</div>
      </div>
      <div style={{position: 'absolute', top: 60, left: 0, bottom: 0, width: 260, background: '#1c1d23', padding: 20, color: '#888', fontSize: 18, lineHeight: 2.2}}>
        {['Hero — Billboard', 'Social — Story', 'Social — Post', 'Digital — Banner', 'Print — Poster'].map((l, i) => (
          <div key={l} style={{color: i === 0 ? '#fff' : '#888'}}>▢ {l}</div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 60, right: 0, bottom: 0, width: 260, background: '#1c1d23', padding: 20, color: '#888', fontSize: 18}}>
        <div style={{marginBottom: 12}}>COLORS</div>
        <div style={{display: 'flex', gap: 10}}>
          {[COLORS.neoBlue, COLORS.copper, COLORS.sand, COLORS.navy].map((c) => (
            <div key={c} style={{width: 44, height: 44, borderRadius: 8, background: c}} />
          ))}
        </div>
        <div style={{marginTop: 30}}>TYPE</div>
        <div style={{color: '#fff', fontSize: 34, fontWeight: 700}}>Cairo Aa</div>
      </div>
      <div style={{position: 'absolute', left: 340, top: 120, width: 1240, height: 700, background: '#0b0b0d', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
        <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: interpolate(t, [0, 15], [0.3, 1], clamp)}} />
        <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,6,10,0.75), transparent 60%)'}} />
        <div dir="rtl" style={{position: 'absolute', right: 60, top: 220, color: '#fff', fontSize: 72, fontWeight: 900, clipPath: `inset(0 0 0 ${interpolate(t, [10, 40], [100, 0], clamp)}%)`}}>الدرعية</div>
        <div style={{position: 'absolute', left: 50, bottom: 50, display: 'flex', gap: 16}}>
          <NeoLogo size={80} />
          <DiriyahLogo size={80} />
        </div>
        <div style={{position: 'absolute', right: 56, top: 210, width: 330, height: 110, border: `2px solid ${COLORS.neoBlueLight}`, opacity: t > 40 ? 1 : 0}} />
      </div>
      <div style={{position: 'absolute', left: cx, top: cy, fontSize: 34, color: '#fff', textShadow: '0 2px 6px #000'}}>➤</div>
    </AbsoluteFill>
  );
};

// «فريق يعمل»: لوحة أفكار مشتركة تتحرك عليها مؤشرات أعضاء الفريق
export const TeamScene: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const t = f - from;
  const cards = [
    {x: 260, y: 220, w: 420, h: 260, src: TOWER, pos: '50% 55%'},
    {x: 740, y: 160, w: 460, h: 300, src: AERIAL, pos: '50% 50%'},
    {x: 1260, y: 260, w: 380, h: 240, src: AERIAL, pos: '80% 90%'},
  ];
  const cursors = [
    {name: 'تصميم', c: COLORS.neoBlueLight, x0: 400, y0: 700, x1: 900, y1: 380},
    {name: 'محتوى', c: COLORS.copperLight, x0: 1500, y0: 760, x1: 1350, y1: 420},
    {name: 'إعلام', c: '#7BD88F', x0: 900, y0: 900, x1: 520, y1: 360},
  ];
  return (
    <AbsoluteFill style={{background: '#f2eee6', fontFamily: FONT}}>
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.12) 1.5px, transparent 2px)', backgroundSize: '28px 28px'}} />
      {cards.map((c, i) => {
        const p = interpolate(t, [i * 5, i * 5 + 15], [0, 1], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: c.x, top: c.y + (1 - p) * 40, width: c.w, height: c.h, background: '#fff', padding: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', opacity: p, transform: `rotate(${(i - 1) * 2}deg)`}}>
            <Img src={c.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos}} />
          </div>
        );
      })}
      {[COLORS.neoBlue, COLORS.copper, COLORS.sand, COLORS.navy].map((c, i) => (
        <div key={c} style={{position: 'absolute', left: 380 + i * 90, top: 620, width: 70, height: 70, borderRadius: 35, background: c, opacity: interpolate(t, [15 + i * 3, 25 + i * 3], [0, 1], clamp)}} />
      ))}
      <div dir="rtl" style={{position: 'absolute', left: 820, top: 560, width: 600, padding: 24, background: '#fff8c6', fontSize: 34, color: '#333', transform: 'rotate(-2deg)', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', opacity: interpolate(t, [20, 30], [0, 1], clamp)}}>
        فكرة: الدرعية كما لم تُرَ من قبل ✨
      </div>
      {cursors.map((c, i) => {
        const p = interpolate(t, [0, dur], [0, 1]);
        const x = c.x0 + (c.x1 - c.x0) * p + Math.sin(t / 8 + i) * 20;
        const y = c.y0 + (c.y1 - c.y0) * p + Math.cos(t / 9 + i) * 14;
        return (
          <div key={c.name} style={{position: 'absolute', left: x, top: y}}>
            <div style={{fontSize: 34, color: c.c}}>➤</div>
            <div style={{background: c.c, color: '#fff', fontSize: 20, padding: '2px 10px', borderRadius: 6, marginLeft: 20}}>{c.name}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// شاشة إعلانية عملاقة في مشهد ليلي
export const BillboardScene: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const t = f - from;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #05060c, #0e1230 70%, #1a1420)', perspective: 1600}}>
      <div style={{position: 'absolute', left: 260, top: 160, width: 1400, height: 640, transform: `rotateY(-14deg) scale(${1 + t * 0.002})`, transformOrigin: 'left center', boxShadow: `0 0 120px ${COLORS.neoBlue}66`, border: '10px solid #111', overflow: 'hidden'}}>
        <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <AbsoluteFill style={{background: 'linear-gradient(90deg, transparent 40%, rgba(5,6,10,0.85))'}} />
        <div style={{position: 'absolute', right: 60, top: 260, display: 'flex', gap: 14}}>
          <NeoLogo size={70} />
          <DiriyahLogo size={70} />
        </div>
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 75%, rgba(80,90,200,0.25))'}} />
    </AbsoluteFill>
  );
};

// جدار شاشات
export const ScreensScene: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const t = f - from;
  const tiles = [
    {src: AERIAL, pos: '50% 50%'},
    {src: TOWER, pos: '50% 40%'},
    {src: AERIAL, pos: '80% 90%'},
    {src: TOWER, pos: '45% 88%'},
    {src: AERIAL, pos: '20% 70%'},
    {src: TOWER, pos: '50% 60%'},
  ];
  return (
    <AbsoluteFill style={{background: '#030308', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 520px)', gap: 14, transform: `scale(${1.08 - t * 0.002})`}}>
        {tiles.map((s, i) => (
          <div key={i} style={{height: 300, border: '4px solid #1a1a22', overflow: 'hidden', position: 'relative', opacity: interpolate(t, [i * 2, i * 2 + 6], [0, 1], clamp)}}>
            <Img src={s.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.pos}} />
            {i === 4 ? (
              <AbsoluteFill style={{background: 'rgba(5,6,10,0.6)', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 20}}>
                <NeoLogo size={110} />
                <DiriyahLogo size={110} />
              </AbsoluteFill>
            ) : null}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// محتوى على الجوال: بوست يتفاعل معه الجمهور
export const PhoneScene: React.FC<{from: number; dur: number}> = ({from, dur}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const t = f - from;
  const likes = Math.round(interpolate(t, [0, dur], [1200, 48600]));
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #1b1f3d, #050508)`, justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
      <div style={{width: 470, height: 930, borderRadius: 60, border: '12px solid #111', background: '#fff', overflow: 'hidden', transform: `rotate(-4deg) translateY(${(1 - Math.min(1, t / 12)) * 200}px)`, boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '60px 20px 14px'}}>
          <NeoLogo size={50} style={{borderRadius: 25}} />
          <div style={{fontSize: 22, fontWeight: 700}}>neo.capta</div>
        </div>
        <div style={{height: 470, position: 'relative'}}>
          <Img src={TOWER} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 55%'}} />
        </div>
        <div style={{padding: '14px 20px', fontSize: 26}}>
          <span style={{color: '#E5484D'}}>♥</span> {likes.toLocaleString('en-US')}
        </div>
        <div dir="rtl" style={{padding: '0 20px', fontSize: 22, color: '#333'}}>الدرعية كما لم ترها من قبل ✨</div>
      </div>
      {new Array(10).fill(0).map((_, i) => {
        const p = ((t + i * 7) % 40) / 40;
        return <div key={i} style={{position: 'absolute', left: 1200 + Math.sin(i * 2) * 60, top: 800 - p * 500, fontSize: 40, color: i % 2 ? '#E5484D' : COLORS.neoBlueLight, opacity: 1 - p}}>♥</div>;
      })}
    </AbsoluteFill>
  );
};

export const LogoPair: React.FC<{p: number; size?: number; gap?: number; sep?: string}> = ({p, size = 220, gap = 80, sep = '×'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
    <NeoLogo size={size} />
    <div style={{fontFamily: FONT, fontWeight: 200, fontSize: size * 0.35, color: GOLD}}>{sep}</div>
    <DiriyahLogo size={size} />
  </div>
);
