import '@fontsource/cairo/400.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/900.css';
import '@fontsource/aref-ruqaa/700.css';
import '@fontsource/great-vibes/400.css';
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
  DiriyahLogo,
  GradientBackground,
  GrowLine,
  LightSweep,
  NajdiBorder,
  NeoLogo,
  SceneFade,
} from './components';
import {COLORS, FONT, SCENES, SIGNATURE_AR, SIGNATURE_EN} from './theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// المشهد 1 (0–3 ث): شعار نيو كابتا × شعار الدرعية
const LogosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const left = spring({frame, fps, config: {damping: 12}});
  const right = spring({frame: frame - 6, fps, config: {damping: 12}});
  const x = spring({frame: frame - 16, fps, config: {damping: 10}});
  const out = interpolate(frame, [75, 90], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 90}}>
        <div style={{position: 'relative', transform: `translateX(${(1 - left) * -500}px) scale(${left})`}}>
          <NeoLogo size={420} />
          <LightSweep delay={30} size={420} />
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 140,
            fontWeight: 300,
            color: COLORS.neoWhite,
            transform: `scale(${x}) rotate(${(1 - x) * 180}deg)`,
          }}
        >
          ×
        </div>
        <div style={{position: 'relative', transform: `translateX(${(1 - right) * 500}px) scale(${right})`}}>
          <DiriyahLogo size={420} />
          <LightSweep delay={40} size={420} round />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// المشهد 2 (3–7 ث): إعلان الشراكة
const AnnounceScene: React.FC = () => (
  <SceneFade duration={SCENES.announce.duration}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center'}}>
      <AnimatedWords text="إعلان شراكة استراتيجية" dir="rtl" size={130} color={COLORS.neoWhite} weight={900} />
      <GrowLine delay={18} width={900} />
      <AnimatedWords
        text="STRATEGIC PARTNERSHIP"
        delay={24}
        size={64}
        color={COLORS.copperLight}
        weight={700}
        letterSpacing={10}
      />
      <AnimatedWords
        text="Neo Capta × Diriyah Company"
        delay={40}
        size={44}
        color={COLORS.neoBlueLight}
        weight={400}
      />
    </div>
  </SceneFade>
);

// المشهد 3 (7–12 ث): حيث يلتقي التاريخ بالإبداع — خطوط الجبل من شعار الدرعية ترسم نفسها
const HeritageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 60], [1, 0], clamp);
  const path =
    'M40 260 L120 160 L190 160 L230 110 L280 110 L300 60 L360 60 L400 150 L460 150 L520 110 L560 120 L600 260 Z';
  return (
    <SceneFade duration={SCENES.heritage.duration}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <svg width={640} height={300} viewBox="0 0 640 300">
          <path
            d={path}
            fill="none"
            stroke={COLORS.copper}
            strokeWidth={5}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={draw}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={60 + i * 25}
              x2={580 - i * 25}
              y1={278 + i * 0}
              y2={278}
              transform={`translate(0 ${i * 5})`}
              stroke={COLORS.copper}
              strokeWidth={2}
              opacity={interpolate(frame, [40 + i * 4, 50 + i * 4], [0, 1], clamp)}
            />
          ))}
        </svg>
        <AnimatedWords text="حيث يلتقي التاريخ بالإبداع" dir="rtl" delay={30} size={110} color={COLORS.sand} weight={900} />
        <AnimatedWords text="Where Heritage Meets Creativity" delay={50} size={56} color={COLORS.neoBlueLight} />
      </div>
    </SceneFade>
  );
};

// المشهد 4 (12–18 ث): ما تقدمه نيو كابتا في الشراكة
const SERVICES = [
  {ar: 'التسويق', en: 'Marketing', icon: '◆'},
  {ar: 'الدعاية', en: 'Advertising', icon: '▲'},
  {ar: 'الإعلان', en: 'Campaigns', icon: '●'},
];

const ServicesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <SceneFade duration={SCENES.services.duration}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60}}>
        <AnimatedWords text="نيو كابتا ترافق الدرعية في" dir="rtl" size={80} color={COLORS.neoWhite} weight={700} />
        <div dir="rtl" style={{display: 'flex', gap: 50}}>
          {SERVICES.map((s, i) => {
            const p = spring({frame: frame - 20 - i * 12, fps, config: {damping: 13}});
            const glow = 0.5 + 0.5 * Math.sin((frame - i * 10) / 10);
            return (
              <div
                key={s.en}
                style={{
                  width: 440,
                  height: 340,
                  borderRadius: 32,
                  background: `linear-gradient(160deg, ${COLORS.neoBlue}55, ${COLORS.copper}33)`,
                  border: `2px solid ${i % 2 ? COLORS.copper : COLORS.neoBlue}`,
                  boxShadow: `0 0 ${30 + glow * 30}px ${i % 2 ? COLORS.copper : COLORS.neoBlue}66`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                  fontFamily: FONT,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 120}px) rotateX(${(1 - p) * 60}deg)`,
                }}
              >
                <div style={{fontSize: 60, color: COLORS.copperLight}}>{s.icon}</div>
                <div style={{fontSize: 84, fontWeight: 900, color: COLORS.neoWhite}}>{s.ar}</div>
                <div style={{fontSize: 40, fontWeight: 400, color: COLORS.neoBlueLight, letterSpacing: 4}}>
                  {s.en.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
        <AnimatedWords
          text="Marketing, advertising & campaigns for Diriyah"
          delay={70}
          size={44}
          color={COLORS.copperLight}
          weight={400}
        />
      </div>
    </SceneFade>
  );
};

// المشهد 5 (18–22 ث): نروي قصة الدرعية للعالم
const StoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = interpolate(frame, [0, 150], [0.6, 1.5]);
  return (
    <SceneFade duration={SCENES.story.duration}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            border: `2px solid ${i % 2 ? COLORS.neoBlue : COLORS.copper}`,
            transform: `scale(${ring + i * 0.35})`,
            opacity: interpolate(ring + i * 0.35, [0.6, 2.2], [0.8, 0], clamp),
          }}
        />
      ))}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
        <AnimatedWords text="نروي قصة الدرعية للعالم" dir="rtl" size={120} color={COLORS.neoWhite} weight={900} />
        <GrowLine delay={15} width={700} color={COLORS.neoBlueLight} />
        <AnimatedWords text="Telling Diriyah's story to the world" delay={22} size={58} color={COLORS.copperLight} />
      </div>
    </SceneFade>
  );
};

// المشهد 6 (22–27 ث): توقيع الرئيس التنفيذي والمؤسس
const SignatureScene: React.FC = () => {
  const frame = useCurrentFrame();
  // كشف التوقيع العربي من اليمين لليسار كأنه يُكتب بالقلم
  const write = interpolate(frame, [10, 55], [0, 1], clamp);
  const writeEn = interpolate(frame, [50, 80], [0, 1], clamp);
  const flourish = interpolate(frame, [45, 75], [1, 0], clamp);
  const info = interpolate(frame, [60, 80], [0, 1], clamp);
  const nibX = 1 - write;
  return (
    <SceneFade duration={SCENES.signature.duration}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
        <AnimatedWords
          text="نصنع لإرث الدرعية حضوراً يليق به"
          dir="rtl"
          size={56}
          color={COLORS.neoWhite}
          weight={400}
          stagger={3}
        />
        <div style={{position: 'relative', marginTop: 20}}>
          <div
            dir="rtl"
            style={{
              fontFamily: SIGNATURE_AR,
              fontSize: 190,
              fontWeight: 700,
              lineHeight: 1.25,
              color: COLORS.copperLight,
              textShadow: `0 0 30px ${COLORS.copper}88`,
              clipPath: `inset(0 0 0 ${nibX * 100}%)`,
              padding: '0 30px',
            }}
          >
            سامي البجيدي
          </div>
          {/* رأس القلم المضيء */}
          {write > 0 && write < 1 ? (
            <div
              style={{
                position: 'absolute',
                top: '55%',
                left: `${nibX * 100}%`,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: COLORS.sand,
                boxShadow: `0 0 30px 10px ${COLORS.copperLight}`,
              }}
            />
          ) : null}
          <svg width={760} height={60} viewBox="0 0 760 60" style={{display: 'block', margin: '-30px auto 0'}}>
            <path
              d="M740 30 C 560 60, 300 0, 120 34 S 20 40, 40 20"
              fill="none"
              stroke={COLORS.copper}
              strokeWidth={4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={flourish}
            />
          </svg>
        </div>
        <div
          style={{
            fontFamily: SIGNATURE_EN,
            fontSize: 76,
            color: COLORS.neoBlueLight,
            clipPath: `inset(0 ${(1 - writeEn) * 100}% 0 0)`,
            marginTop: -6,
          }}
        >
          Sami Albujaidi
        </div>
        <div style={{opacity: info, transform: `translateY(${(1 - info) * 20}px)`, textAlign: 'center', fontFamily: FONT}}>
          <div dir="rtl" style={{fontSize: 46, fontWeight: 700, color: COLORS.neoWhite}}>
            الأستاذ سامي البجيدي — الرئيس التنفيذي والمؤسس، نيو كابتا
          </div>
          <div style={{fontSize: 32, fontWeight: 400, color: COLORS.copperLight, letterSpacing: 4, marginTop: 6}}>
            FOUNDER &amp; CEO — NEO CAPTA
          </div>
        </div>
      </div>
    </SceneFade>
  );
};

// المشهد 7 (27–30 ث): الختام
const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14}});
  const out = interpolate(frame, [75, 90], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 50, transform: `scale(${p})`}}>
          <NeoLogo size={260} />
          <div style={{fontFamily: FONT, fontSize: 90, color: COLORS.neoWhite}}>×</div>
          <DiriyahLogo size={260} />
        </div>
        <AnimatedWords text="معاً نصنع المستقبل" dir="rtl" delay={8} size={96} color={COLORS.sand} weight={900} />
        <AnimatedWords text="Together, we shape the future" delay={18} size={50} color={COLORS.neoBlueLight} />
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
      document.fonts.load(`700 40px 'Aref Ruqaa'`, 'سامي'),
      document.fonts.load(`400 40px 'Great Vibes'`, 'Sami'),
    ]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.neoBlack}}>
      <Audio src={staticFile('music.wav')} />
      <GradientBackground />
      <NajdiBorder position="top" />
      <NajdiBorder position="bottom" />
      <Sequence from={SCENES.logos.from} durationInFrames={SCENES.logos.duration}>
        <LogosScene />
      </Sequence>
      <Sequence from={SCENES.announce.from} durationInFrames={SCENES.announce.duration}>
        <AnnounceScene />
      </Sequence>
      <Sequence from={SCENES.heritage.from} durationInFrames={SCENES.heritage.duration}>
        <HeritageScene />
      </Sequence>
      <Sequence from={SCENES.services.from} durationInFrames={SCENES.services.duration}>
        <ServicesScene />
      </Sequence>
      <Sequence from={SCENES.story.from} durationInFrames={SCENES.story.duration}>
        <StoryScene />
      </Sequence>
      <Sequence from={SCENES.signature.from} durationInFrames={SCENES.signature.duration}>
        <SignatureScene />
      </Sequence>
      <Sequence from={SCENES.outro.from} durationInFrames={SCENES.outro.duration}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
