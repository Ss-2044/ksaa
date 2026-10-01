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
import {
  AnimatedWords,
  CeremonyBackground,
  DiriyahLogo,
  GrowLine,
  LightSweep,
  NeoLogo,
  SceneFade,
  Shockwave,
} from './components';
import {COLORS, FONT, SCENES, SEAL_FRAMES} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// المشهد 1 (0–3 ث): الشعاران يُختمان على الشاشة تحت ضوء مسرحي
const LogosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stamp = (at: number) => spring({frame: frame - at, fps, config: {damping: 9, stiffness: 180}});
  const a = stamp(4);
  const b = stamp(16);
  const spot = interpolate(frame, [0, 20], [0, 1], clamp);
  const out = interpolate(frame, [76, 90], [1, 0], clamp);
  const logo = (p: number): React.CSSProperties => ({
    transform: `scale(${interpolate(p, [0, 1], [2.2, 1])})`,
    opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
    filter: `blur(${(1 - Math.min(p, 1)) * 10}px)`,
  });
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 45% 55% at 50% 50%, rgba(255,255,255,${0.1 * spot}) 0%, transparent 100%)`,
        }}
      />
      <div style={{display: 'flex', alignItems: 'center', gap: 140}}>
        <div style={{position: 'relative', ...logo(a)}}>
          <NeoLogo size={400} />
          <LightSweep delay={40} size={400} />
          <Shockwave at={10} color={COLORS.neoBlueLight} size={400} />
        </div>
        <div style={{position: 'relative', ...logo(b)}}>
          <DiriyahLogo size={400} />
          <LightSweep delay={48} size={400} round />
          <Shockwave at={22} color={COLORS.copperLight} size={400} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// المشهد 2 (3–9 ث): نص الخبر الرسمي
const AnnounceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const badge = interpolate(frame, [0, 15], [0, 1], clamp);
  return (
    <SceneFade duration={SCENES.announce.duration}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, maxWidth: 1600}}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 6,
            color: COLORS.neoBlack,
            background: COLORS.copperLight,
            padding: '6px 28px',
            borderRadius: 40,
            opacity: badge,
            transform: `scale(${0.8 + badge * 0.2})`,
          }}
        >
          OFFICIAL ANNOUNCEMENT · خبر رسمي
        </div>
        <AnimatedWords
          text="بحضور الرئيس التنفيذي والمؤسس"
          dir="rtl"
          delay={10}
          size={58}
          color={COLORS.copperLight}
          weight={700}
          stagger={3}
        />
        <AnimatedWords
          text="الأستاذ سامي البجيدي"
          dir="rtl"
          delay={24}
          size={124}
          color={COLORS.neoWhite}
          weight={900}
          stagger={5}
        />
        <GrowLine delay={40} width={1000} />
        <AnimatedWords
          text="وقّعت نيو كابتا شراكة استراتيجية مع شركة الدرعية"
          dir="rtl"
          delay={48}
          size={70}
          color={COLORS.sand}
          weight={700}
          stagger={4}
        />
        <AnimatedWords
          text="In the presence of Founder & CEO Mr. Sami Albujaidi, Neo Capta signed a strategic partnership with Diriyah Company"
          delay={80}
          size={30}
          color={COLORS.neoBlueLight}
          weight={400}
          stagger={1}
        />
      </div>
    </SceneFade>
  );
};

// خربشة توقيع مجردة تُرسم بالقلم
const Scribble: React.FC<{d: string; start: number; color: string}> = ({d, start, color}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + 28], [1, 0], clamp);
  return (
    <svg width={300} height={90} viewBox="0 0 300 90">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={p}
      />
    </svg>
  );
};

const SIGNERS = [
  {
    ar: 'نيو كابتا',
    en: 'Neo Capta',
    start: 35,
    at: SEAL_FRAMES[0],
    color: COLORS.neoBlue,
    d: 'M10 60 C 40 10, 60 80, 90 40 S 140 20, 150 55 S 200 70, 230 30 L 290 45',
    logo: <NeoLogo size={130} />,
  },
  {
    ar: 'شركة الدرعية',
    en: 'Diriyah Company',
    start: 62,
    at: SEAL_FRAMES[1],
    color: COLORS.copper,
    d: 'M15 50 C 50 70, 70 10, 100 45 S 150 75, 170 35 C 190 5, 220 80, 250 40 S 280 40, 290 30',
    logo: <DiriyahLogo size={130} />,
  },
];

// المشهد 3 (9–15 ث): مراسم التوقيع — اتفاقية، توقيعان، ثم ختم الشعارين
const SigningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 16}});
  const signed = interpolate(frame, [135, 150], [0, 1], clamp);
  return (
    <SceneFade duration={SCENES.signing.duration}>
      <div style={{perspective: 1600}}>
        <div
          dir="rtl"
          style={{
            width: 1150,
            padding: '50px 70px 60px',
            borderRadius: 18,
            background: `linear-gradient(170deg, ${COLORS.sand}, #E2D6C6)`,
            boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 80px ${COLORS.copper}44`,
            fontFamily: FONT,
            transform: `translateY(${(1 - enter) * 300}px) rotateX(${interpolate(enter, [0, 1], [40, 12])}deg)`,
            opacity: Math.min(enter, 1),
          }}
        >
          <div style={{textAlign: 'center', color: COLORS.neoBlack}}>
            <div style={{fontSize: 52, fontWeight: 900}}>اتفاقية شراكة استراتيجية</div>
            <div style={{fontSize: 26, fontWeight: 700, color: COLORS.copper, letterSpacing: 6}}>
              STRATEGIC PARTNERSHIP AGREEMENT
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14, margin: '34px 0 40px'}}>
            {[100, 92, 97, 70].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 10,
                  width: `${w}%`,
                  borderRadius: 5,
                  background: `${COLORS.copper}40`,
                  opacity: interpolate(frame, [10 + i * 3, 20 + i * 3], [0, 1], clamp),
                }}
              />
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            {SIGNERS.map((s) => {
              const p = spring({frame: frame - s.at, fps, config: {damping: 8, stiffness: 200}});
              return (
                <div key={s.en} style={{width: 420, textAlign: 'center', position: 'relative'}}>
                  <Scribble d={s.d} start={s.start} color={s.color} />
                  <div style={{height: 2, background: COLORS.neoBlack, opacity: 0.5}} />
                  <div style={{fontSize: 30, fontWeight: 700, color: COLORS.neoBlack, marginTop: 8}}>{s.ar}</div>
                  <div style={{fontSize: 20, color: COLORS.copper, letterSpacing: 3}}>{s.en.toUpperCase()}</div>
                  {/* ختم الشعار */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -50,
                      right: 0,
                      width: 130,
                      height: 130,
                      transform: `scale(${interpolate(p, [0, 1], [3, 1])}) rotate(${(1 - p) * -20 - 8}deg)`,
                      opacity: frame < s.at ? 0 : interpolate(p, [0, 0.2], [0, 1], clamp),
                    }}
                  >
                    {s.logo}
                    <Shockwave at={s.at + 4} color={s.color} size={130} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          fontFamily: FONT,
          fontSize: 44,
          fontWeight: 900,
          color: COLORS.copperLight,
          letterSpacing: 4,
          opacity: signed,
          transform: `scale(${0.8 + signed * 0.2})`,
        }}
      >
        <span dir="rtl">تم التوقيع ✓</span>
        <span style={{margin: '0 24px', opacity: 0.6}}>|</span>
        <span>SIGNED</span>
      </div>
    </SceneFade>
  );
};

// المشهد 4 (15–21 ث): نصفان يلتقيان — خبرة نيو كابتا + إرث الدرعية
const UnionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const slide = spring({frame, fps, config: {damping: 15}});
  const center = spring({frame: frame - 25, fps, config: {damping: 10}});
  const tagline = interpolate(frame, [55, 75], [0, 1], clamp);
  const half = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    [side]: 0,
    transform: `translateX(${(1 - slide) * (side === 'left' ? -100 : 100)}%)`,
    background:
      side === 'left'
        ? `linear-gradient(90deg, ${COLORS.neoBlue}cc, ${COLORS.navy}aa)`
        : `linear-gradient(270deg, ${COLORS.copper}cc, #2a1810aa)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    fontFamily: FONT,
  });
  const item = (txt: string, i: number, color: string) => (
    <div
      key={txt}
      dir="rtl"
      style={{
        fontSize: 64,
        fontWeight: 900,
        color,
        opacity: interpolate(frame, [15 + i * 6, 25 + i * 6], [0, 1], clamp),
        transform: `translateY(${interpolate(frame, [15 + i * 6, 25 + i * 6], [30, 0], clamp)}px)`,
      }}
    >
      {txt}
    </div>
  );
  return (
    <SceneFade duration={SCENES.union.duration}>
      <div style={half('left')}>
        <div style={{fontSize: 36, fontWeight: 700, color: COLORS.neoWhite, letterSpacing: 6}}>NEO CAPTA</div>
        {['التسويق', 'الدعاية', 'الإعلان'].map((t, i) => item(t, i, COLORS.neoWhite))}
        <div style={{fontSize: 30, color: COLORS.neoWhite, opacity: 0.8}}>Marketing · Advertising · Campaigns</div>
      </div>
      <div style={half('right')}>
        <div style={{fontSize: 36, fontWeight: 700, color: COLORS.sand, letterSpacing: 6}}>DIRIYAH COMPANY</div>
        {['الإرث', 'الوجهة', 'الثقافة'].map((t, i) => item(t, i, COLORS.sand))}
        <div style={{fontSize: 30, color: COLORS.sand, opacity: 0.8}}>Heritage · Destination · Culture</div>
      </div>
      <div
        style={{
          width: 230,
          height: 230,
          borderRadius: '50%',
          background: COLORS.neoBlack,
          border: `4px solid ${COLORS.copperLight}`,
          boxShadow: `0 0 80px ${COLORS.copper}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: FONT,
          fontSize: 50,
          fontWeight: 900,
          color: COLORS.neoWhite,
          transform: `scale(${center})`,
        }}
      >
        شراكة
      </div>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          bottom: 90,
          fontFamily: FONT,
          fontSize: 52,
          fontWeight: 900,
          color: COLORS.neoWhite,
          textShadow: '0 4px 20px #000',
          opacity: tagline,
        }}
      >
        خبرة إبداعية × إرث عريق
      </div>
    </SceneFade>
  );
};

// المشهد 5 (21–26 ث): جملة مفتاحية بطباعة حركية
const TaglineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = ['إبداعٌ', 'يليق', 'بالتاريخ'];
  return (
    <SceneFade duration={SCENES.tagline.duration}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <div dir="rtl" style={{display: 'flex', gap: 50, fontFamily: FONT}}>
          {words.map((w, i) => {
            const p = spring({frame: frame - i * 9, fps, config: {damping: 12}});
            return (
              <span
                key={w}
                style={{
                  display: 'inline-block',
                  fontSize: 180,
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: i === 2 ? COLORS.copperLight : COLORS.neoWhite,
                  transform: `scale(${interpolate(p, [0, 1], [3, 1])})`,
                  opacity: Math.min(p * 2, 1),
                  filter: `blur(${(1 - Math.min(p, 1)) * 14}px)`,
                  textShadow: i === 2 ? `0 0 40px ${COLORS.copper}` : 'none',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <GrowLine delay={30} width={1100} color={COLORS.neoBlueLight} />
        <AnimatedWords
          text="CREATIVITY WORTHY OF HISTORY"
          delay={38}
          size={54}
          color={COLORS.neoBlueLight}
          letterSpacing={10}
        />
      </div>
    </SceneFade>
  );
};

// المشهد 6 (26–30 ث): بطاقة الختام
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14}});
  const out = interpolate(frame, [100, 120], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 60, transform: `scale(${p})`}}>
          <NeoLogo size={260} />
          <div style={{fontFamily: FONT, fontSize: 90, color: COLORS.copperLight}}>×</div>
          <DiriyahLogo size={260} />
        </div>
        <AnimatedWords text="Neo Capta × Diriyah Company" delay={10} size={64} color={COLORS.neoWhite} weight={700} />
        <AnimatedWords text="شراكة استراتيجية" dir="rtl" delay={20} size={48} color={COLORS.copperLight} weight={700} />
        <AnimatedWords text="STRATEGIC PARTNERSHIP" delay={26} size={32} color={COLORS.copperLight} weight={400} letterSpacing={8} />
      </div>
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
      <CeremonyBackground />
      <Sequence from={SCENES.logos.from} durationInFrames={SCENES.logos.duration}>
        <LogosScene />
      </Sequence>
      <Sequence from={SCENES.announce.from} durationInFrames={SCENES.announce.duration}>
        <AnnounceScene />
      </Sequence>
      <Sequence from={SCENES.signing.from} durationInFrames={SCENES.signing.duration}>
        <SigningScene />
      </Sequence>
      <Sequence from={SCENES.union.from} durationInFrames={SCENES.union.duration}>
        <UnionScene />
      </Sequence>
      <Sequence from={SCENES.tagline.from} durationInFrames={SCENES.tagline.duration}>
        <TaglineScene />
      </Sequence>
      <Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.duration}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
