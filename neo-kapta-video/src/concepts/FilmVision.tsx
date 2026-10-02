// الفيلم ١ (فكرة ٢٣): «حين تلتقي الرؤية» — سينمائي، فاخر، هادئ (حسب سيناريو العميل)
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {AERIAL, BillboardScene, CameraScene, CineFrame, DesignScene, GOLD, LogoPair, LuxText, PhoneScene, ScreensScene, Shot, Tag, TeamScene} from './cine';
import {clamp, useFonts} from './shared';

export const FilmVision: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  // 10–15 ث: الشعاران تدريجياً
  const dLogo = interpolate(f, [305, 350], [0, 1], clamp);
  const nLogo = interpolate(f, [350, 395], [0, 1], clamp);
  // 23–30 ث: لقطة البطل
  const heroLogos = spring({frame: f - 715, fps, config: {damping: 20}});

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-film-vision.wav')} />

      {/* 0–5 ث: لقطات سريعة للدرعية */}
      <Shot crop="mudDetail" from={0} dur={40} />
      <Shot crop="architecture" from={38} dur={40} drift={-1} />
      <Shot crop="towerNight" from={76} dur={40} />
      <Shot crop="people" from={114} dur={40} drift={-1} />
      <LuxText from={30} to={150} bottom={170} size={66}>كل قصة عظيمة… تبدأ برؤية.</LuxText>

      {/* 5–10 ث: من الدرعية إلى الإبداع */}
      <CameraScene from={150} dur={40} />
      <DesignScene from={190} dur={40} />
      <TeamScene from={230} dur={40} />
      <PhoneScene from={270} dur={32} />
      <LuxText from={160} to={300} bottom={170} size={66}>وحين تلتقي الرؤية بالإبداع…</LuxText>

      {/* 10–15 ث: الشعاران */}
      {f >= 300 && f < 452 ? (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a2016, #050403 70%)', justifyContent: 'center', alignItems: 'center', opacity: interpolate(f, [300, 310, 440, 452], [0, 1, 1, 0], clamp)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 110}}>
            <div style={{opacity: dLogo, filter: `blur(${(1 - dLogo) * 16}px)`, transform: `scale(${0.94 + dLogo * 0.06})`}}>
              <DiriyahLogo size={300} />
            </div>
            <div style={{width: 1, height: 260 * Math.max(dLogo, nLogo), background: GOLD, opacity: 0.6}} />
            <div style={{opacity: nLogo, filter: `blur(${(1 - nLogo) * 16}px)`, transform: `scale(${0.94 + nLogo * 0.06})`}}>
              <NeoLogo size={300} />
            </div>
          </div>
          <LuxText from={392} to={452} bottom={190} size={62} color={GOLD}>تبدأ قصة جديدة.</LuxText>
        </AbsoluteFill>
      ) : null}

      {/* 15–23 ث: مونتاج العمل المشترك */}
      <CameraScene from={450} dur={30} />
      <Tag from={450} to={480} text="تصوير" />
      <DesignScene from={480} dur={30} />
      <Tag from={480} to={510} text="تصميم" />
      <BillboardScene from={510} dur={30} />
      <Tag from={510} to={540} text="إعلانات رقمية" />
      <ScreensScene from={540} dur={30} />
      <Tag from={540} to={570} text="شاشات" />
      <PhoneScene from={570} dur={30} />
      <Tag from={570} to={600} text="محتوى" />
      <Shot crop="towerNight" from={600} dur={30} />
      <Shot crop="palms" from={630} dur={30} drift={-1} />
      <Shot crop="crenels" from={660} dur={32} />
      <Tag from={600} to={690} text="الدرعية" />
      {f >= 450 && f < 690 ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.25)'}} /> : null}
      <LuxText from={455} to={575} size={96} weight={700} dir="ltr" spacing={10}>Neo Capta × Diriyah</LuxText>
      <LuxText from={575} to={690} size={80} weight={400}>شراكة لصناعة أثر يُرى.</LuxText>

      {/* 23–30 ث: لقطة البطل */}
      {f >= 688 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [688, 705], [0, 1], clamp)}}>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.18 - (f - 688) * 0.0007})`, filter: 'saturate(1.08) contrast(1.05) brightness(0.85)'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.65))'}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: FONT}}>
            <LogoPair p={heroLogos} size={190} />
            <div style={{fontSize: 74, fontWeight: 700, letterSpacing: 14, color: '#fff', opacity: interpolate(f, [740, 765], [0, 1], clamp)}}>NEO CAPTA × DIRIYAH</div>
            <div style={{fontSize: 40, fontWeight: 300, letterSpacing: 8, color: GOLD, opacity: interpolate(f, [765, 790], [0, 1], clamp)}}>Where Vision Meets Impact.</div>
            <div dir="rtl" style={{fontSize: 50, fontWeight: 300, color: '#fff', marginTop: 10, opacity: interpolate(f, [805, 830], [0, 1], clamp)}}>شراكة جديدة. أثر أكبر.</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      <CineFrame />
    </AbsoluteFill>
  );
};

// ألوان مستخدمة لإبقاء الاستيراد صريحاً
void COLORS;
