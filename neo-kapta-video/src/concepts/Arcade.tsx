// الفكرة 3: «الوضع التعاوني» — الإعلان كلعبة أركيد 8-بت:
// لاعب 1 نيو كابتا + لاعب 2 الدرعية ← أدخل عملة ← اختيار الشخصيات ← فتح الوضع التعاوني ← المهمة
import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT, PIXEL} from '../theme';
import {clamp, seeded, useFonts} from './shared';

const blink = (f: number, rate = 8) => (Math.floor(f / rate) % 2 === 0 ? 1 : 0);
// حركة «متقطعة» بخطوات مثل ألعاب البكسل
const stepped = (v: number, steps = 6) => Math.round(v * steps) / steps;

const Px: React.FC<{size: number; color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  size,
  color,
  children,
  style,
}) => (
  <div style={{fontFamily: PIXEL, fontSize: size, color, lineHeight: 1.6, textShadow: `4px 4px 0 #000`, ...style}}>
    {children}
  </div>
);

const Ar: React.FC<{size: number; color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  size,
  color,
  children,
  style,
}) => (
  <div dir="rtl" style={{fontFamily: FONT, fontWeight: 900, fontSize: size, color, textShadow: `4px 4px 0 #000`, ...style}}>
    {children}
  </div>
);

const CRT: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill
      style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 5px)'}}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.8) 100%)'}} />
  </AbsoluteFill>
);

const Grid: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#06071a'}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.neoBlue}33 2px, transparent 2px), linear-gradient(90deg, ${COLORS.neoBlue}33 2px, transparent 2px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: `0 ${(f * 2) % 60}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const Bar: React.FC<{label: string; ar: string; at: number; color: string}> = ({label, ar, at, color}) => {
  const f = useCurrentFrame();
  const v = stepped(interpolate(f, [at, at + 40], [0, 1], clamp), 10);
  return (
    <div style={{marginTop: 18}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Px size={16} color="#fff">{label}</Px>
        <Ar size={26} color={color}>{ar}</Ar>
      </div>
      <div style={{display: 'flex', gap: 4, marginTop: 4}}>
        {new Array(10).fill(0).map((_, i) => (
          <div key={i} style={{width: 44, height: 22, background: i < v * 10 ? color : '#ffffff22'}} />
        ))}
      </div>
      {v >= 1 ? <Px size={14} color={COLORS.sand} style={{textAlign: 'left'}}>MAX!</Px> : null}
    </div>
  );
};

const PixelBurst: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 45) return null;
  return (
    <AbsoluteFill>
      {seeded(60, 'pb').map((p, i) => {
        const ang = p.a * Math.PI * 2;
        const d = stepped(f / 45, 9) * (300 + p.b * 600);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 + Math.cos(ang) * d,
              top: 540 + Math.sin(ang) * d,
              width: 20,
              height: 20,
              background: [COLORS.neoBlue, COLORS.copper, COLORS.sand, '#fff'][i % 4],
              opacity: 1 - f / 45,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Typed: React.FC<{text: string; at: number; size: number; color: string; cps?: number}> = ({text, at, size, color, cps = 1.2}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor((f - at) * cps));
  return (
    <Px size={size} color={color}>
      {text.slice(0, n)}
      {n < text.length && f >= at ? <span style={{opacity: blink(f, 5)}}>█</span> : null}
    </Px>
  );
};

export const ArcadeConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const center: React.CSSProperties = {justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24};

  let scene: React.ReactNode = null;
  if (f < 90) {
    // 0–3 ث: لاعب 1 و لاعب 2
    const a = stepped(interpolate(f, [0, 18], [0, 1], clamp));
    const b = stepped(interpolate(f, [10, 28], [0, 1], clamp));
    scene = (
      <AbsoluteFill style={center}>
        <div style={{display: 'flex', gap: 240, alignItems: 'center'}}>
          <div style={{textAlign: 'center', transform: `scale(${a})`}}>
            <Px size={34} color={COLORS.neoBlueLight}>PLAYER 1</Px>
            <NeoLogo size={340} style={{borderRadius: 0, border: `10px solid ${COLORS.neoBlue}`, marginTop: 20}} />
          </div>
          <div style={{textAlign: 'center', transform: `scale(${b})`}}>
            <Px size={34} color={COLORS.copperLight}>PLAYER 2</Px>
            <div style={{border: `10px solid ${COLORS.copper}`, marginTop: 20, background: COLORS.sand}}>
              <DiriyahLogo size={340} style={{border: 'none', boxShadow: 'none', borderRadius: 0}} />
            </div>
          </div>
        </div>
        <Px size={30} color="#fff" style={{opacity: f > 35 ? blink(f) : 0}}>READY?</Px>
      </AbsoluteFill>
    );
  } else if (f < 210) {
    // 3–7 ث: أدخل عملة ← اضغط ابدأ
    const coinY = stepped(interpolate(f, [100, 125], [0, 1], clamp), 8);
    scene = (
      <AbsoluteFill style={center}>
        {f < 128 ? (
          <>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: COLORS.copperLight,
                border: '10px solid #8a5a3e',
                transform: `translateY(${coinY * 260 - 120}px)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Px size={30} color="#5a3420" style={{textShadow: 'none'}}>N</Px>
            </div>
            <div style={{width: 40, height: 140, background: '#000', border: `6px solid ${COLORS.neoBlueLight}`}} />
            <Px size={40} color="#fff" style={{opacity: blink(f)}}>INSERT COIN</Px>
          </>
        ) : (
          <>
            <Px size={26} color={COLORS.copperLight}>CREDIT 01</Px>
            <Px size={64} color="#fff" style={{opacity: blink(f, 7)}}>PRESS START</Px>
            <Ar size={80} color={COLORS.sand} style={{opacity: blink(f, 7)}}>اضغط ابدأ</Ar>
          </>
        )}
      </AbsoluteFill>
    );
  } else if (f < 390) {
    // 7–13 ث: اختيار الشخصيات
    const card = (side: 'p1' | 'p2') => {
      const p1 = side === 'p1';
      const c = p1 ? COLORS.neoBlue : COLORS.copper;
      const cl = p1 ? COLORS.neoBlueLight : COLORS.copperLight;
      return (
        <div style={{width: 640, padding: 34, border: `8px solid ${c}`, background: '#000000aa'}}>
          <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
            {p1 ? (
              <NeoLogo size={140} style={{borderRadius: 0}} />
            ) : (
              <div style={{background: COLORS.sand}}>
                <DiriyahLogo size={140} style={{border: 'none', boxShadow: 'none', borderRadius: 0}} />
              </div>
            )}
            <div>
              <Px size={18} color={cl}>{p1 ? 'P1' : 'P2'}</Px>
              <Px size={24} color="#fff">{p1 ? 'NEO CAPTA' : 'DIRIYAH CO.'}</Px>
              <Ar size={34} color={cl}>{p1 ? 'نيو كابتا' : 'شركة الدرعية'}</Ar>
            </div>
          </div>
          {(p1
            ? [['MARKETING', 'تسويق'], ['ADVERTISING', 'دعاية'], ['CAMPAIGNS', 'إعلان']]
            : [['HERITAGE', 'إرث'], ['CULTURE', 'ثقافة'], ['STORY', 'حكاية']]
          ).map(([en, ar], i) => (
            <Bar key={en} label={en} ar={ar} at={240 + i * 25 + (p1 ? 0 : 12)} color={cl} />
          ))}
        </div>
      );
    };
    scene = (
      <AbsoluteFill style={center}>
        <Px size={36} color="#fff">SELECT YOUR TEAM</Px>
        <div style={{display: 'flex', gap: 80}}>
          {card('p1')}
          {card('p2')}
        </div>
        <Px size={30} color={COLORS.sand} style={{opacity: f > 345 ? blink(f, 6) : 0}}>
          TEAM SELECTED!
        </Px>
      </AbsoluteFill>
    );
  } else if (f < 570) {
    // 13–19 ث: فتح الوضع التعاوني ← رفع المستوى = شراكة استراتيجية
    const xp = stepped(interpolate(f, [440, 510], [0, 1], clamp), 20);
    const shake = f < 400 ? (f % 2 ? 8 : -8) : 0;
    scene = (
      <AbsoluteFill style={{...center, transform: `translateX(${shake}px)`}}>
        <Px size={58} color={blink(f, 5) ? COLORS.sand : COLORS.copperLight}>CO-OP MODE UNLOCKED!</Px>
        <Ar size={76} color="#fff">تم فتح الوضع التعاوني</Ar>
        <div style={{width: 1100, height: 50, border: '6px solid #fff', marginTop: 30, padding: 4}}>
          <div style={{width: `${xp * 100}%`, height: '100%', background: `linear-gradient(90deg, ${COLORS.neoBlue}, ${COLORS.copper})`}} />
        </div>
        <Px size={20} color="#fff">XP {Math.round(xp * 9999)}/9999</Px>
        {f >= 512 ? (
          <>
            <Px size={46} color={COLORS.neoBlueLight}>LEVEL UP: STRATEGIC PARTNERSHIP</Px>
            <Ar size={90} color={COLORS.sand}>شراكة استراتيجية</Ar>
          </>
        ) : null}
      </AbsoluteFill>
    );
  } else if (f < 780) {
    // 19–26 ث: المهمة
    const item = (ar: string, en: string, at: number) =>
      f >= at ? (
        <div key={en} style={{display: 'flex', gap: 30, alignItems: 'center', justifyContent: 'flex-end'}}>
          <Px size={22} color={COLORS.neoBlueLight}>{en}</Px>
          <Ar size={56} color="#fff">{ar}</Ar>
          <Px size={40} color="#2EBD6B">✓</Px>
        </div>
      ) : null;
    scene = (
      <AbsoluteFill style={{...center, alignItems: 'center'}}>
        <div style={{width: 1400, border: `8px solid ${COLORS.copper}`, padding: 50, background: '#000000bb'}}>
          <Typed text="MISSION:" at={575} size={36} color={COLORS.copperLight} />
          <Typed text="TELL DIRIYAH'S STORY TO THE WORLD" at={590} size={30} color="#fff" />
          {f >= 625 ? <Ar size={64} color={COLORS.sand}>المهمة: نروي قصة الدرعية للعالم</Ar> : null}
          <div style={{marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6}}>
            {item('حملات تسويقية', 'MARKETING', 665)}
            {item('دعاية وهوية', 'ADVERTISING', 695)}
            {item('إعلانات تصل للعالم', 'CAMPAIGNS', 725)}
          </div>
        </div>
      </AbsoluteFill>
    );
  } else {
    // 26–30 ث: الختام
    const out = interpolate(f, [880, 900], [1, 0], clamp);
    scene = (
      <AbsoluteFill style={{...center, opacity: out}}>
        <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
          <NeoLogo size={220} style={{borderRadius: 0, border: `8px solid ${COLORS.neoBlue}`}} />
          <Px size={60} color="#fff">+</Px>
          <div style={{border: `8px solid ${COLORS.copper}`, background: COLORS.sand}}>
            <DiriyahLogo size={220} style={{border: 'none', boxShadow: 'none', borderRadius: 0}} />
          </div>
        </div>
        <Px size={36} color="#fff">NEO CAPTA × DIRIYAH COMPANY</Px>
        <Ar size={60} color={COLORS.copperLight}>شراكة استراتيجية</Ar>
        <Px size={24} color={COLORS.neoBlueLight} style={{opacity: blink(f, 10)}}>TO BE CONTINUED...</Px>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Audio src={staticFile('music-arcade.wav')} />
      <Grid />
      {scene}
      <PixelBurst at={390} />
      <PixelBurst at={512} />
      <AbsoluteFill style={{background: '#fff', opacity: [90, 210, 390, 570, 780].some((c) => f >= c && f < c + 3) ? 0.8 : 0}} />
      <CRT />
    </AbsoluteFill>
  );
};
