import '@fontsource/cairo/400.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/900.css';
import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {DiriyahLogo, LightSweep, NeoLogo} from './components';
import {BEAT, COLORS, FONT, SCENES} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// خلفية نابضة على الإيقاع: خطوط مائلة متحركة + توهج يومض مع كل ضربة بعد «الدروب»
const PulseBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const drop = SCENES.reveal.from;
  const sinceBeat = (frame - drop) % BEAT;
  const pulse = frame >= drop ? Math.exp(-sinceBeat / 4) : 0;
  const bar = Math.floor((frame - drop) / (BEAT * 4));
  const glow = bar % 2 ? COLORS.copper : COLORS.neoBlue;
  return (
    <AbsoluteFill style={{background: COLORS.neoBlack}}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, ${COLORS.navy} 0 40px, transparent 40px 80px)`,
          backgroundPosition: `${frame * 2}px 0`,
          opacity: 0.6,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glow} 0%, transparent 60%)`,
          opacity: 0.25 + pulse * 0.35,
        }}
      />
    </AbsoluteFill>
  );
};

// شريط نص متحرك (Marquee)
const Marquee: React.FC<{text: string; reverse?: boolean; top?: number; bottom?: number; bg: string; color: string}> = ({
  text,
  reverse,
  top,
  bottom,
  bg,
  color,
}) => {
  const frame = useCurrentFrame();
  const x = ((frame * 6) % 1200) * (reverse ? 1 : -1) - (reverse ? 1200 : 0);
  return (
    <div
      style={{
        position: 'absolute',
        left: -100,
        right: -100,
        top,
        bottom,
        height: 84,
        background: bg,
        overflow: 'hidden',
        transform: `rotate(${reverse ? 2 : -2}deg)`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          whiteSpace: 'nowrap',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 46,
          color,
          transform: `translateX(${x}px)`,
          letterSpacing: 2,
        }}
      >
        {new Array(8).fill(text).join('   ✦   ')}
      </div>
    </div>
  );
};

const MARQUEE_TEXT = 'NEO CAPTA × DIRIYAH COMPANY   ✦   نيو كابتا × شركة الدرعية';

// اهتزاز الكاميرا عند الضربات القوية
const shake = (frame: number, at: number, strength = 18) => {
  const d = frame - at;
  if (d < 0 || d > 10) return 'none';
  const k = strength * (1 - d / 10);
  return `translate(${Math.sin(d * 7) * k}px, ${Math.cos(d * 9) * k}px)`;
};

// المشهد 1 (0–3 ث): تقسيم مائل — نصف أزرق لنيو كابتا ونصف نحاسي للدرعية
const LogosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const l = spring({frame, fps, config: {damping: 14, stiffness: 160}});
  const r = spring({frame: frame - 5, fps, config: {damping: 14, stiffness: 160}});
  const x = spring({frame: frame - 18, fps, config: {damping: 8}});
  const flash = interpolate(frame, [84, 88, 90], [0, 1, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: 'polygon(0 0, 58% 0, 42% 100%, 0 100%)',
          background: `linear-gradient(135deg, ${COLORS.neoBlue}, ${COLORS.navy})`,
          transform: `translateX(${(l - 1) * 100}%)`,
        }}
      >
        <div style={{position: 'absolute', left: '25%', top: '50%', transform: 'translate(-50%,-50%)'}}>
          <div style={{position: 'relative'}}>
            <NeoLogo size={380} />
            <LightSweep delay={30} size={380} />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)',
          background: `linear-gradient(135deg, ${COLORS.copper}, #3a2216)`,
          transform: `translateX(${(1 - r) * 100}%)`,
        }}
      >
        <div style={{position: 'absolute', left: '75%', top: '50%', transform: 'translate(-50%,-50%)'}}>
          <div style={{position: 'relative'}}>
            <DiriyahLogo size={380} />
            <LightSweep delay={38} size={380} round />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: COLORS.neoBlack,
            border: `4px solid ${COLORS.neoWhite}`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: FONT,
            fontSize: 90,
            color: COLORS.neoWhite,
            transform: `scale(${x}) rotate(${(1 - x) * 270}deg)`,
          }}
        >
          ×
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: COLORS.neoWhite, opacity: flash}} />
    </AbsoluteFill>
  );
};

// المشهد 2 (3–6 ث): عدّ تنازلي 3-2-1 على الإيقاع
const COUNT = [
  {n: '3', bg: COLORS.neoBlue, fg: COLORS.neoWhite},
  {n: '2', bg: COLORS.copper, fg: COLORS.neoWhite},
  {n: '1', bg: COLORS.sand, fg: COLORS.neoBlack},
];

const CountdownScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = Math.min(2, Math.floor(frame / 30));
  const local = frame - idx * 30;
  const c = COUNT[idx];
  const p = spring({frame: local, fps, config: {damping: 10, stiffness: 220}});
  const ring = interpolate(local, [0, 30], [0, 1], clamp);
  const R = 300;
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{background: c.bg, justifyContent: 'center', alignItems: 'center'}}>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 40,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 48,
          color: c.fg,
          letterSpacing: 2,
        }}
      >
        <div style={{textAlign: 'center'}}>خبر كبير قادم</div>
        <div style={{textAlign: 'center', fontSize: 28, letterSpacing: 10, opacity: 0.8}}>BIG NEWS IN</div>
      </div>
      <svg width={700} height={700} style={{position: 'absolute'}}>
        <circle cx={350} cy={350} r={R} fill="none" stroke={c.fg} strokeOpacity={0.2} strokeWidth={14} />
        <circle
          cx={350}
          cy={350}
          r={R}
          fill="none"
          stroke={c.fg}
          strokeWidth={14}
          strokeDasharray={circ}
          strokeDashoffset={circ * ring}
          transform="rotate(-90 350 350)"
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 420,
          lineHeight: 1,
          color: c.fg,
          transform: `scale(${interpolate(p, [0, 1], [1.8, 1])})`,
          opacity: Math.min(1, p * 2),
        }}
      >
        {c.n}
      </div>
    </AbsoluteFill>
  );
};

// المشهد 3 (6–11 ث): الدروب — كشف «شراكة استراتيجية» بقناع دائري + أشرطة متحركة
const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mask = interpolate(frame, [0, 14], [0, 150], clamp);
  const flash = interpolate(frame, [0, 8], [1, 0], clamp);
  const w1 = spring({frame: frame - 4, fps, config: {damping: 11}});
  const w2 = spring({frame: frame - 12, fps, config: {damping: 11}});
  const en = interpolate(frame, [24, 40], [0, 1], clamp);
  const out = interpolate(frame, [140, 150], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out, transform: shake(frame, 0)}}>
      <AbsoluteFill
        style={{
          clipPath: `circle(${mask}% at 50% 50%)`,
          background: `radial-gradient(circle at 50% 50%, ${COLORS.navy}, ${COLORS.neoBlack})`,
        }}
      />
      <Marquee text={MARQUEE_TEXT} top={70} bg={COLORS.neoBlue} color={COLORS.neoWhite} />
      <Marquee text={MARQUEE_TEXT} bottom={70} reverse bg={COLORS.copper} color={COLORS.neoBlack} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
        <div
          dir="rtl"
          style={{
            fontSize: 260,
            fontWeight: 900,
            lineHeight: 1.05,
            color: COLORS.neoWhite,
            transform: `scale(${interpolate(w1, [0, 1], [2.4, 1])})`,
            opacity: Math.min(1, w1 * 2),
          }}
        >
          شراكة
        </div>
        <div
          dir="rtl"
          style={{
            fontSize: 150,
            fontWeight: 900,
            lineHeight: 1.1,
            color: COLORS.copperLight,
            transform: `translateY(${(1 - w2) * 80}px)`,
            opacity: Math.min(1, w2 * 2),
          }}
        >
          استراتيجية
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: interpolate(en, [0, 1], [40, 14]),
            color: COLORS.neoBlueLight,
            opacity: en,
          }}
        >
          STRATEGIC PARTNERSHIP
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: COLORS.neoWhite, opacity: flash}} />
    </AbsoluteFill>
  );
};

// المشهد 4 (11–18 ث): المعادلة ثم شبكة ما تقدمه الشراكة
const TILES = [
  {ar: 'حملات تسويقية', en: 'MARKETING CAMPAIGNS', bg: COLORS.neoBlue, fg: COLORS.neoWhite},
  {ar: 'دعاية وهوية', en: 'ADVERTISING & BRANDING', bg: COLORS.copper, fg: COLORS.neoWhite},
  {ar: 'محتوى إبداعي', en: 'CREATIVE CONTENT', bg: COLORS.sand, fg: COLORS.neoBlack},
  {ar: 'حضور رقمي', en: 'DIGITAL PRESENCE', bg: COLORS.navy, fg: COLORS.copperLight},
];

const EquationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (at: number) => spring({frame: frame - at, fps, config: {damping: 10, stiffness: 200}});
  const eqOut = interpolate(frame, [84, 96], [1, 0], clamp);
  const sign = (s: string, p: number) => (
    <div style={{fontFamily: FONT, fontSize: 140, fontWeight: 900, color: COLORS.neoWhite, transform: `scale(${p})`}}>
      {s}
    </div>
  );
  const result = pop(45);
  return (
    <AbsoluteFill>
      {/* المرحلة 1: نيو كابتا + الدرعية = قصة تصل للعالم */}
      <AbsoluteFill
        style={{justifyContent: 'center', alignItems: 'center', opacity: eqOut, transform: `scale(${1 + (1 - eqOut) * 0.2})`}}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 50}}>
          <div style={{transform: `scale(${pop(0)})`}}>
            <NeoLogo size={260} />
          </div>
          {sign('+', pop(12))}
          <div style={{transform: `scale(${pop(22)})`}}>
            <DiriyahLogo size={260} />
          </div>
          {sign('=', pop(34))}
          <div
            style={{
              width: 520,
              height: 260,
              borderRadius: 30,
              background: `linear-gradient(135deg, ${COLORS.neoBlue}, ${COLORS.copper})`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: FONT,
              transform: `scale(${result}) rotate(${(1 - result) * -10}deg)`,
              boxShadow: `0 0 80px ${COLORS.copper}88`,
            }}
          >
            <div dir="rtl" style={{fontSize: 64, fontWeight: 900, color: COLORS.neoWhite}}>
              قصة تصل للعالم
            </div>
            <div style={{fontSize: 28, fontWeight: 700, color: COLORS.sand, letterSpacing: 4}}>
              A STORY FOR THE WORLD
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* المرحلة 2: أربع بطاقات تنقلب على الإيقاع */}
      {frame >= 90 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', perspective: 1800}}>
          <div
            dir="rtl"
            style={{display: 'grid', gridTemplateColumns: 'repeat(2, 760px)', gap: 30, fontFamily: FONT}}
          >
            {TILES.map((t, i) => {
              const p = spring({frame: frame - 90 - i * BEAT, fps, config: {damping: 13}});
              return (
                <div
                  key={t.en}
                  style={{
                    height: 300,
                    borderRadius: 28,
                    background: t.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    transform: `rotateY(${(1 - p) * 90}deg)`,
                    opacity: p > 0.02 ? 1 : 0,
                    border: `2px solid ${COLORS.neoWhite}22`,
                  }}
                >
                  <div style={{fontSize: 88, fontWeight: 900, color: t.fg}}>{t.ar}</div>
                  <div style={{fontSize: 30, fontWeight: 700, color: t.fg, opacity: 0.8, letterSpacing: 5}}>
                    {t.en}
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// المشهد 5 (18–24 ث): كلمات تضرب الشاشة على الإيقاع، كل كلمة بلون كامل
const WORDS = [
  {ar: 'نسوّق', en: 'WE MARKET', bg: COLORS.neoBlue, fg: COLORS.neoWhite},
  {ar: 'نُعلن', en: 'WE ADVERTISE', bg: COLORS.copper, fg: COLORS.neoWhite},
  {ar: 'نُبدع', en: 'WE CREATE', bg: COLORS.sand, fg: COLORS.neoBlack},
  {ar: 'نُلهم', en: 'WE INSPIRE', bg: COLORS.neoBlack, fg: COLORS.copperLight},
];

const SlamScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const step = BEAT * 2;
  if (frame < WORDS.length * step) {
    const i = Math.floor(frame / step);
    const w = WORDS[i];
    const local = frame - i * step;
    const p = spring({frame: local, fps, config: {damping: 9, stiffness: 260}});
    return (
      <AbsoluteFill
        style={{background: w.bg, justifyContent: 'center', alignItems: 'center', transform: shake(local, 0, 12)}}
      >
        <div
          dir="rtl"
          style={{
            fontFamily: FONT,
            fontSize: 330,
            fontWeight: 900,
            lineHeight: 1.1,
            color: w.fg,
            transform: `scale(${interpolate(p, [0, 1], [2.6, 1])}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
          }}
        >
          {w.ar}
        </div>
        <div style={{fontFamily: FONT, fontSize: 56, fontWeight: 700, letterSpacing: 16, color: w.fg, opacity: p}}>
          {w.en}
        </div>
      </AbsoluteFill>
    );
  }
  const local = frame - WORDS.length * step;
  const p = spring({frame: local, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
      <div dir="rtl" style={{fontSize: 130, fontWeight: 900, color: COLORS.neoWhite, transform: `scale(${p})`}}>
        لقصة الدرعية
      </div>
      <div
        style={{
          fontSize: 54,
          fontWeight: 700,
          letterSpacing: 12,
          color: COLORS.copperLight,
          opacity: interpolate(local, [10, 25], [0, 1], clamp),
        }}
      >
        FOR DIRIYAH&apos;S STORY
      </div>
    </AbsoluteFill>
  );
};

// المشهد 6 (24–30 ث): بطاقة الختام مع الأشرطة
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 12}});
  const t1 = spring({frame: frame - 12, fps, config: {damping: 14}});
  const t2 = interpolate(frame, [24, 40], [0, 1], clamp);
  const out = interpolate(frame, [158, 180], [1, 0], clamp);
  const flash = interpolate(frame, [0, 8], [0.9, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: out, transform: shake(frame, 0)}}>
      <Marquee text={MARQUEE_TEXT} top={50} bg={COLORS.copper} color={COLORS.neoBlack} />
      <Marquee text={MARQUEE_TEXT} bottom={50} reverse bg={COLORS.neoBlue} color={COLORS.neoWhite} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 22}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 50, transform: `scale(${p})`}}>
          <NeoLogo size={250} />
          <div style={{fontSize: 100, color: COLORS.neoWhite, fontWeight: 300}}>×</div>
          <DiriyahLogo size={250} />
        </div>
        <div style={{fontSize: 66, fontWeight: 900, color: COLORS.neoWhite, transform: `translateY(${(1 - t1) * 40}px)`, opacity: t1}}>
          Neo Capta × Diriyah Company
        </div>
        <div dir="rtl" style={{fontSize: 46, fontWeight: 700, color: COLORS.copperLight, opacity: t2}}>
          شراكة استراتيجية في التسويق والدعاية والإعلان
        </div>
        <div style={{fontSize: 30, fontWeight: 700, color: COLORS.neoBlueLight, letterSpacing: 6, opacity: t2}}>
          #NeoCaptaXDiriyah
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: COLORS.neoWhite, opacity: flash}} />
    </AbsoluteFill>
  );
};

export const PartnershipVideo: React.FC = () => {
  // انتظار تحميل الخط العربي قبل التصيير
  const [handle] = useState(() => delayRender('Loading Cairo font'));
  useEffect(() => {
    Promise.all([
      document.fonts.load(`900 40px Cairo`, 'نيو'),
      document.fonts.load(`700 40px Cairo`, 'نيو'),
      document.fonts.load(`400 40px Cairo`, 'Neo'),
    ]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.neoBlack}}>
      <Audio src={staticFile('music.wav')} />
      <PulseBackground />
      <Sequence from={SCENES.logos.from} durationInFrames={SCENES.logos.duration}>
        <LogosScene />
      </Sequence>
      <Sequence from={SCENES.countdown.from} durationInFrames={SCENES.countdown.duration}>
        <CountdownScene />
      </Sequence>
      <Sequence from={SCENES.reveal.from} durationInFrames={SCENES.reveal.duration}>
        <RevealScene />
      </Sequence>
      <Sequence from={SCENES.equation.from} durationInFrames={SCENES.equation.duration}>
        <EquationScene />
      </Sequence>
      <Sequence from={SCENES.slam.from} durationInFrames={SCENES.slam.duration}>
        <SlamScene />
      </Sequence>
      <Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.duration}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
