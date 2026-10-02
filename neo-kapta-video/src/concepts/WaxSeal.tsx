// الفكرة 19: «ختم الشمع» — على مكتب خشبي داكن: رسالة رسمية تُكتب بخط اليد، تُطوى، يُسكب الشمع النحاسي
// ويُختم بالشعارين، ثم تُفتح أمام العالم فتظهر الدرعية. «مختومة بالثقة… مفتوحة للعالم»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const RUQAA = "'Aref Ruqaa', serif";
const PARCH = '#efe4cc';
const INK = '#2b1d12';
const WAX = '#8f3f22';

const Desk: React.FC = () => (
  <AbsoluteFill style={{background: 'repeating-linear-gradient(90deg, #2a1810 0 22px, #301c13 22px 50px, #26150d 50px 64px, #2d1a11 64px 100px)'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,190,120,0.22), transparent 60%), radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)'}} />
  </AbsoluteFill>
);

// ختم شمع: قرص نحاسي بحافة متموّجة وبداخله الشعاران
const Seal: React.FC<{size: number; press: number}> = ({size, press}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <svg width={size} height={size} viewBox="0 0 200 200" style={{position: 'absolute', inset: 0}}>
      <path
        d={new Array(24)
          .fill(0)
          .map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r = i % 2 ? 92 : 100;
            return `${i ? 'L' : 'M'}${100 + Math.cos(a) * r} ${100 + Math.sin(a) * r}`;
          })
          .join(' ') + 'Z'}
        fill={WAX}
      />
      <circle cx={100} cy={100} r={78} fill="#a24b2a" />
      <circle cx={100} cy={100} r={78} fill="none" stroke="#6f2c15" strokeWidth={4} opacity={press} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: size * 0.03, opacity: press, filter: 'sepia(1) saturate(2.2) hue-rotate(-20deg) brightness(0.8) contrast(1.2)'}}>
      <div style={{borderRadius: '50%', overflow: 'hidden'}}><NeoLogo size={size * 0.32} style={{boxShadow: 'none', border: 'none'}} /></div>
      <DiriyahLogo size={size * 0.32} style={{boxShadow: 'none', border: 'none'}} />
    </div>
    <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,210,170,0.45), transparent 45%)'}} />
  </div>
);

const LINES = [
  {t: 'إلى العالم،', size: 64},
  {t: 'يسرّنا أن نعلن عن', size: 58},
  {t: 'شراكة استراتيجية', size: 92, c: WAX},
  {t: 'بين نيو كابتا وشركة الدرعية', size: 58},
  {t: 'في التسويق والدعاية والإعلان', size: 52},
];

export const WaxSealConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  if (f < 90) {
    // 0–3 ث: ختمان يهبطان على الشمع: ختم نيو كابتا وختم الدرعية
    const s = (at: number) => spring({frame: f - at, fps, config: {damping: 10, stiffness: 200}});
    const a = s(6);
    const b = s(20);
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 140}}>
          {[a, b].map((p, i) => (
            <div key={i} style={{position: 'relative', width: 360, height: 360, transform: `scale(${interpolate(p, [0, 1], [1.5, 1])})`, opacity: Math.min(1, p * 2)}}>
              <svg width={360} height={360} viewBox="0 0 200 200" style={{position: 'absolute', inset: 0}}>
                <circle cx={100} cy={100} r={98} fill={WAX} />
                <circle cx={100} cy={100} r={84} fill="#a24b2a" />
              </svg>
              <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', filter: 'sepia(1) saturate(2) hue-rotate(-20deg) brightness(0.85) contrast(1.2)'}}>
                {i === 0 ? <NeoLogo size={220} style={{boxShadow: 'none', border: 'none', borderRadius: 110}} /> : <DiriyahLogo size={220} style={{boxShadow: 'none', border: 'none'}} />}
              </div>
              <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, rgba(255,210,170,0.45), transparent 45%)'}} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  } else if (f < 450) {
    // 3–15 ث: الرسالة تُفرد وتُكتب، ثم تُطوى
    const unroll = spring({frame: f - 92, fps, config: {damping: 16}});
    // الطيّ: الرسالة تنضغط إلى ثلثها مع ظلال خطوط الطي، ثم تصغر
    const fold = interpolate(f, [345, 420], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * (3 - 2 * x)});
    const shrink = interpolate(f, [420, 450], [1, 0.7], clamp);
    const h = 840 - fold * 560;
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            position: 'relative',
            width: 1100,
            height: h,
            transform: `scale(${shrink}) scaleY(${unroll})`,
            background: fold > 0.95 ? '#e3d5b8' : PARCH,
            overflow: 'hidden',
            boxShadow: '0 30px 40px rgba(0,0,0,0.6), inset 0 0 60px rgba(120,80,30,0.25)',
          }}
        >
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 840, padding: '60px 90px', transform: `scaleY(${h / 840})`, transformOrigin: 'top', opacity: 1 - fold * 1.2}}>
            {LINES.map((l, i) => {
              const at = 120 + i * 40;
              const w = interpolate(f, [at, at + 32], [0, 1], clamp);
              return (
                <div key={i} dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: l.size, color: l.c ?? INK, lineHeight: 1.55, clipPath: `inset(0 0 0 ${(1 - w) * 100}%)`, textAlign: 'right'}}>
                  {l.t}
                </div>
              );
            })}
            <div style={{position: 'absolute', bottom: 70, left: 90, display: 'flex', gap: 20, opacity: interpolate(f, [330, 345], [0, 1], clamp)}}>
              <NeoLogo size={90} />
              <DiriyahLogo size={90} />
            </div>
          </div>
          {[1, 2].map((k) => (
            <div key={k} style={{position: 'absolute', left: 0, right: 0, top: (h * k) / 3 - 20, height: 40, background: 'linear-gradient(180deg, transparent, rgba(80,50,20,0.35), transparent)', opacity: fold}} />
          ))}
        </div>
        <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: FONT, fontSize: 26, letterSpacing: 8, color: '#d9c3a0', opacity: interpolate(f, [130, 150, 330, 345], [0, 1, 1, 0], clamp)}}>
          AN OFFICIAL LETTER · رسالة رسمية
        </div>
      </AbsoluteFill>
    );
  } else if (f < 600) {
    // 15–20 ث: الشمع يُسكب ثم يُختم
    const drip = interpolate(f, [455, 490], [0, 1], clamp);
    const press = spring({frame: f - 505, fps, config: {damping: 9, stiffness: 220}});
    const shine = interpolate(f, [530, 560], [-1, 2], clamp);
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'relative', width: 1100 * 0.7, height: 280 * 0.7, background: '#e3d5b8', boxShadow: '0 30px 40px rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          {f < 505 ? (
            <div style={{width: 260 * drip, height: 260 * drip, borderRadius: '50%', background: `radial-gradient(circle at 40% 35%, #b4582f, ${WAX})`, filter: 'blur(1px)'}} />
          ) : (
            <div style={{transform: `scale(${interpolate(press, [0, 1], [1.4, 1])})`}}>
              <Seal size={300} press={Math.min(1, press)} />
            </div>
          )}
          {f >= 530 ? (
            <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
              <div style={{position: 'absolute', top: -100, bottom: -100, left: `${shine * 100}%`, width: 120, transform: 'rotate(20deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)'}} />
            </div>
          ) : null}
        </div>
        <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: interpolate(f, [520, 540], [0, 1], clamp)}}>
          <div dir="rtl" style={{fontSize: 74, fontWeight: 900, color: PARCH}}>مختومة بالثقة…</div>
          <div style={{fontSize: 28, letterSpacing: 10, color: COLORS.copperLight}}>SEALED WITH TRUST</div>
        </div>
      </AbsoluteFill>
    );
  } else if (f < 790) {
    // 20–26 ث: تُفتح أمام العالم — الدرعية تظهر
    const t = f - 600;
    const open = spring({frame: t, fps, config: {damping: 16}});
    const photo = interpolate(t, [25, 70], [0, 1], clamp);
    const zoom = interpolate(t, [25, 190], [0.45, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'absolute', transform: `scale(${1 - open * 0.3}) translateY(${open * 600}px)`, opacity: 1 - open}}>
          <Seal size={300} press={1} />
        </div>
        <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, opacity: photo, borderRadius: (1 - zoom) * 60, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)'}}>
          <Img src={staticFile('diriyah/aerial.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.65))'}} />
          <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120, fontFamily: FONT}}>
            <div dir="rtl" style={{fontSize: 96, fontWeight: 900, color: '#fff', opacity: interpolate(t, [80, 100], [0, 1], clamp)}}>…مفتوحة للعالم</div>
            <div style={{fontSize: 30, letterSpacing: 10, color: COLORS.sand, opacity: interpolate(t, [90, 110], [0, 1], clamp)}}>OPEN TO THE WORLD</div>
          </AbsoluteFill>
        </div>
      </AbsoluteFill>
    );
  } else {
    const p = spring({frame: f - 792, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: FONT}}>
        <div style={{transform: `scale(${p})`}}><Seal size={300} press={1} /></div>
        <div dir="rtl" style={{fontSize: 84, fontWeight: 900, color: PARCH, opacity: p}}>شراكة استراتيجية</div>
        <div style={{fontSize: 40, fontWeight: 700, color: COLORS.copperLight, opacity: p}}>Neo Capta × Diriyah Company</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-waxseal.wav')} />
      <Desk />
      {scene}
    </AbsoluteFill>
  );
};
