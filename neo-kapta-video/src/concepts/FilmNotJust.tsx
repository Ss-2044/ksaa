// الفيلم ٣ (فكرة ٢٥): «ليس مجرد شراكة» — إحساس الخبر الكبير (حسب سيناريو العميل)
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {FONT} from '../theme';
import {AERIAL, BillboardScene, CameraScene, CineFrame, DesignScene, GOLD, LuxText, PhoneScene, ScreensScene, Shot, TOWER, Tag} from './cine';
import {clamp, useFonts} from './shared';

export const FilmNotJust: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  // 11–16 ث: ظهور سينمائي للشعارين بشعاع ضوء
  const sweep = interpolate(f, [335, 395], [-0.3, 1.3], clamp);
  const lA = interpolate(f, [340, 370], [0, 1], clamp);
  const lX = interpolate(f, [372, 392], [0, 1], clamp);
  const lB = interpolate(f, [392, 422], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-film-notjust.wav')} />

      {/* 0–6 ث: الدرعية بلا شعارات + سكتة قصيرة */}
      {f < 150 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [0, 20, 135, 150], [0, 1, 1, 0], clamp)}}>
          <Img src={TOWER} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%', transform: `scale(${1.12 - f * 0.0005})`, filter: 'contrast(1.08) saturate(1.05)'}} />
        </AbsoluteFill>
      ) : null}
      <LuxText from={28} to={150} size={92} weight={300}>ليست مجرد شراكة.</LuxText>
      {/* 150–180: سواد صامت */}

      {/* 6–11 ث: لقطات إبداعية سريعة */}
      <CameraScene from={180} dur={38} />
      <DesignScene from={218} dur={38} />
      <BillboardScene from={256} dur={38} />
      <ScreensScene from={294} dur={38} />
      {f >= 180 && f < 332 ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.3)'}} /> : null}
      <LuxText from={190} to={332} size={84} weight={400}>إنها بداية لشيء أكبر.</LuxText>

      {/* 11–16 ث: الشعاران سينمائياً */}
      {f >= 330 && f < 482 ? (
        <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [330, 340, 468, 482], [0, 1, 1, 0], clamp)}}>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep * 100}%`, width: 380, transform: 'translateX(-50%) skewX(-18deg)', background: 'linear-gradient(90deg, transparent, rgba(227,192,141,0.18), transparent)'}} />
          <div style={{position: 'absolute', top: 540, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, opacity: lX * 0.6}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: lA, filter: `blur(${(1 - lA) * 12}px)`}}>
              <DiriyahLogo size={150} />
              <div style={{fontSize: 92, fontWeight: 700, letterSpacing: 26, color: '#fff'}}>DIRIYAH</div>
            </div>
            <div style={{fontSize: 80, fontWeight: 200, color: GOLD, opacity: lX, margin: '10px 0'}}>×</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: lB, filter: `blur(${(1 - lB) * 12}px)`}}>
              <NeoLogo size={150} />
              <div style={{fontSize: 92, fontWeight: 700, letterSpacing: 26, color: '#fff'}}>NEO CAPTA</div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* 16–23 ث: مكان + إبداع + إعلام + جمهور */}
      <Shot crop="towerNight" from={480} dur={28} />
      <Tag from={480} to={508} text="المكان" />
      <DesignScene from={508} dur={26} />
      <Tag from={508} to={534} text="الإبداع" />
      <ScreensScene from={534} dur={26} />
      <Tag from={534} to={560} text="الإعلام" />
      <PhoneScene from={560} dur={26} />
      <Tag from={560} to={586} text="الجمهور" />
      <Shot crop="architecture" from={586} dur={26} />
      <Tag from={586} to={612} text="المكان" />
      <CameraScene from={612} dur={26} />
      <Tag from={612} to={638} text="الإبداع" />
      <Shot crop="people" from={638} dur={52} drift={-1} />
      <Tag from={638} to={690} text="الجمهور" />
      {f >= 480 && f < 690 ? <AbsoluteFill style={{background: 'rgba(0,0,0,0.3)'}} /> : null}
      <LuxText from={485} to={585} size={86} weight={400}>مكان يحمل التاريخ.</LuxText>
      <LuxText from={590} to={690} size={86} weight={400} color={GOLD}>وعلامة تصنع المستقبل.</LuxText>

      {/* 23–30 ث: لقطة واسعة جداً */}
      {f >= 688 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [688, 705], [0, 1], clamp)}}>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(f, [688, 900], [1.7, 1.0])})`, filter: 'brightness(0.78) contrast(1.06)'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.65))'}} />
          <LuxText from={705} to={810} size={96} weight={300}>معًا… نصنع حضورًا يُرى.</LuxText>
          {f >= 805 ? (
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 14, opacity: interpolate(f, [805, 825], [0, 1], clamp)}}>
              <div style={{display: 'flex', gap: 40}}>
                <NeoLogo size={130} />
                <DiriyahLogo size={130} />
              </div>
              <div style={{fontSize: 76, fontWeight: 700, letterSpacing: 14, color: '#fff'}}>NEO CAPTA × DIRIYAH</div>
              <div style={{fontSize: 40, fontWeight: 300, letterSpacing: 10, color: GOLD}}>A New Chapter Begins.</div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}

      <CineFrame />
    </AbsoluteFill>
  );
};
