// الفكرة 18: «الأمس × الغد» — شاشة منقسمة بأسلوب تحريري: يسار البرج الطيني (الأمس) ويمين الدرعية الحديثة (الغد)،
// ثم شريط مقارنة يتحرك بينهما، ثم يتحول الخط الفاصل إلى شعاع أزرق: نيو كابتا تروي الحكاية
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const OLD = staticFile('diriyah/tower-night.jpg');
const NEW = staticFile('diriyah/aerial.jpg');
const INK = '#f4ede2';

const Photo: React.FC<{src: string; filter: string; pos: string; zoom: number}> = ({src, filter, pos, zoom}) => (
  <Img src={src} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, filter, transform: `scale(${zoom})`}} />
);

const Label: React.FC<{side: 'l' | 'r'; big: string; small: string; en: string; o: number}> = ({side, big, small, en, o}) => (
  <div style={{position: 'absolute', bottom: 90, [side === 'l' ? 'left' : 'right']: 90, textAlign: side === 'l' ? 'left' : 'right', fontFamily: FONT, opacity: o}}>
    <div style={{fontSize: 26, letterSpacing: 12, color: INK, opacity: 0.8}}>{en}</div>
    <div dir="rtl" style={{fontSize: 150, fontWeight: 900, color: INK, lineHeight: 1.1, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>{big}</div>
    <div dir="rtl" style={{fontSize: 44, fontWeight: 400, color: INK, textShadow: '0 3px 14px rgba(0,0,0,0.7)'}}>{small}</div>
  </div>
);

export const YesterdayTomorrowConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  // موضع الخط الفاصل (نسبة من العرض)
  const split =
    f < 450
      ? 0.5
      : f < 630
        ? 0.5 + 0.32 * Math.sin(((f - 450) / 180) * Math.PI * 2)
        : 0.5;
  const leftIn = interpolate(f, [90, 120], [0, 1], clamp);
  const rightIn = interpolate(f, [270, 300], [0, 1], clamp);
  const beam = interpolate(f, [640, 700], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x});
  const x = split * 1920;
  const lineGlow = f >= 630 ? 20 + beam * 60 : 20;

  let overlay: React.ReactNode = null;
  if (f < 90) {
    const a = spring({frame: f, fps, config: {damping: 13}});
    const b = spring({frame: f - 8, fps, config: {damping: 13}});
    overlay = (
      <AbsoluteFill style={{flexDirection: 'row'}}>
        <div style={{flex: 1, background: '#2a1d14', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `translateY(${(1 - a) * 400}px)`, opacity: a}}><DiriyahLogo size={320} /></div>
        </div>
        <div style={{flex: 1, background: COLORS.navy, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `translateY(${(1 - b) * -400}px)`, opacity: b}}><NeoLogo size={320} /></div>
        </div>
      </AbsoluteFill>
    );
  }

  const midText = (from: number, to: number, ar: string, en: string) => {
    const o = interpolate(f, [from, from + 15, to - 12, to], [0, 1, 1, 0], clamp);
    return (
      <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: o}}>
        <div dir="rtl" style={{fontSize: 74, fontWeight: 900, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.8)'}}>{ar}</div>
        <div style={{fontSize: 26, letterSpacing: 10, color: INK, textShadow: '0 2px 10px #000'}}>{en}</div>
      </div>
    );
  };

  const brand = spring({frame: f - 690, fps, config: {damping: 13}});
  const end = spring({frame: f - 790, fps, config: {damping: 13}});

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-yesterday.wav')} />
      {f >= 90 && f < 790 ? (
        <>
          {/* الغد (يمين) */}
          <AbsoluteFill style={{opacity: rightIn}}>
            <Photo src={NEW} filter="saturate(1.15) hue-rotate(-8deg) contrast(1.05)" pos="50% 50%" zoom={1.08 + f * 0.0001} />
          </AbsoluteFill>
          {/* الأمس (يسار) — مقصوص حتى الخط الفاصل */}
          <AbsoluteFill style={{clipPath: `inset(0 ${1920 - x}px 0 0)`, opacity: leftIn}}>
            <AbsoluteFill style={{background: '#000'}} />
            <Photo src={OLD} filter="sepia(0.55) contrast(1.1)" pos="50% 60%" zoom={1.05 + f * 0.0001} />
          </AbsoluteFill>
          {/* الخط الفاصل + المقبض */}
          <div style={{position: 'absolute', top: 0, bottom: 0, left: x - 2, width: 4, background: `linear-gradient(180deg, ${COLORS.copperLight}, ${COLORS.neoBlueLight})`, boxShadow: `0 0 ${lineGlow}px ${COLORS.neoBlueLight}`}} />
          {f >= 450 && f < 630 ? (
            <div style={{position: 'absolute', top: 500, left: x - 40, width: 80, height: 80, borderRadius: 40, background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 34, color: COLORS.navy, fontWeight: 900, boxShadow: '0 8px 24px rgba(0,0,0,0.4)'}}>
              ⇆
            </div>
          ) : null}
          {f < 450 ? <Label side="l" big="الأمس" small="إرثٌ عمره قرون" en="YESTERDAY" o={interpolate(f, [110, 130], [0, 1], clamp)} /> : null}
          {f < 450 ? <Label side="r" big="الغد" small="رؤية تُبنى اليوم" en="TOMORROW" o={interpolate(f, [290, 310], [0, 1], clamp)} /> : null}
          {midText(455, 540, 'بينهما…', 'IN BETWEEN')}
          {midText(545, 640, 'حكاية تحتاج من يرويها', 'A STORY THAT NEEDS A STORYTELLER')}
          {/* الخط يتحول شعاعاً أزرق يملأ الشاشة */}
          {f >= 630 ? (
            <div style={{position: 'absolute', top: 0, bottom: 0, left: 960 - beam * 960, width: Math.max(4, beam * 1920), background: `linear-gradient(90deg, ${COLORS.neoBlue}, ${COLORS.navy} 50%, ${COLORS.neoBlue})`, opacity: Math.min(1, beam * 1.2)}} />
          ) : null}
          {f >= 690 ? (
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 12}}>
              <div style={{transform: `scale(${brand})`}}><NeoLogo size={200} /></div>
              <div dir="rtl" style={{fontSize: 110, fontWeight: 900, color: '#fff', opacity: brand}}>نيو كابتا… تروي الحكاية</div>
              <div dir="rtl" style={{fontSize: 52, fontWeight: 700, color: COLORS.copperLight, opacity: interpolate(f, [720, 740], [0, 1], clamp)}}>
                شراكة استراتيجية مع شركة الدرعية
              </div>
              <div dir="rtl" style={{fontSize: 36, color: INK, opacity: interpolate(f, [735, 755], [0, 1], clamp)}}>تسويق · دعاية · إعلان</div>
            </AbsoluteFill>
          ) : null}
        </>
      ) : null}
      {overlay}
      {f >= 790 ? (
        <AbsoluteFill style={{flexDirection: 'row'}}>
          <div style={{flex: 1, position: 'relative', overflow: 'hidden', transform: `translateX(${(1 - end) * -100}%)`}}>
            <Photo src={OLD} filter="sepia(0.55) brightness(0.45)" pos="50% 60%" zoom={1.1} />
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}><DiriyahLogo size={260} /></AbsoluteFill>
          </div>
          <div style={{flex: 1, position: 'relative', overflow: 'hidden', transform: `translateX(${(1 - end) * 100}%)`}}>
            <Photo src={NEW} filter="brightness(0.45)" pos="50% 50%" zoom={1.1} />
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}><NeoLogo size={260} /></AbsoluteFill>
          </div>
          <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110, fontFamily: FONT, opacity: end}}>
            <div dir="rtl" style={{fontSize: 80, fontWeight: 900, color: '#fff'}}>الأمس × الغد</div>
            <div style={{fontSize: 38, fontWeight: 700, color: COLORS.copperLight}}>Neo Capta × Diriyah Company</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
