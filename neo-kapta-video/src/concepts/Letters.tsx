// الفكرة 15: «حروف من الدرعية» — طباعة حركية ضخمة: صور الدرعية الحقيقية تظهر داخل الحروف نفسها،
// ثم «نيو كابتا» بحروف من ضوء أزرق، ثم «معاً» نصفها هذا ونصفها ذاك، ثم تدخل الكاميرا عبر الحرف إلى الصورة
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const TOWER = staticFile('diriyah/tower-night.jpg');
const AERIAL = staticFile('diriyah/aerial.jpg');

// كلمة ضخمة محشوّة بخلفية (صورة أو تدرج)
const FilledWord: React.FC<{text: string; bg: string; size: number; pos: string; style?: React.CSSProperties}> = ({text, bg, size, pos, style}) => (
  <div
    dir="rtl"
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.1,
      backgroundImage: bg,
      backgroundSize: 'cover',
      backgroundPosition: pos,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);

const Small: React.FC<{children: React.ReactNode; color: string; o: number; dir?: 'rtl' | 'ltr'; size?: number}> = ({children, color, o, dir = 'ltr', size = 40}) => (
  <div dir={dir} style={{fontFamily: FONT, fontWeight: 700, fontSize: size, letterSpacing: dir === 'ltr' ? 14 : 0, color, opacity: o, textAlign: 'center'}}>
    {children}
  </div>
);

type Beat = {from: number; to: number; word: string; bg: string; size: number; small: string; ar?: string; paper: string; ink: string};
const BEATS: Beat[] = [
  {from: 90, to: 210, word: 'الدرعية', bg: `url(${TOWER})`, size: 420, small: 'DIRIYAH', ar: 'حيث بدأ كل شيء', paper: '#f4ede2', ink: COLORS.copper},
  {from: 210, to: 330, word: 'تاريخ', bg: `url(${AERIAL})`, size: 480, small: 'HISTORY', ar: 'يُروى منذ قرون', paper: '#0b0b0d', ink: COLORS.sand},
  {from: 330, to: 450, word: 'نيو كابتا', bg: `linear-gradient(120deg, ${COLORS.neoBlueLight}, ${COLORS.neoBlue}, #1b2380, ${COLORS.neoBlueLight})`, size: 360, small: 'NEO CAPTA', ar: 'تسويق · دعاية · إعلان', paper: '#f4ede2', ink: COLORS.neoBlue},
  {from: 450, to: 570, word: 'معاً', bg: `linear-gradient(90deg, ${COLORS.neoBlue} 0 50%, transparent 50%), url(${TOWER})`, size: 560, small: 'TOGETHER', paper: '#0b0b0d', ink: COLORS.sand},
];

export const LettersConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  if (f < 90) {
    // 0–3 ث: الشعاران يدخلان من أعلى وأسفل على خلفية فاتحة
    const a = spring({frame: f, fps, config: {damping: 12}});
    const b = spring({frame: f - 8, fps, config: {damping: 12}});
    scene = (
      <AbsoluteFill style={{background: '#f4ede2', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 160, alignItems: 'center'}}>
          <div style={{transform: `translateY(${(1 - a) * -700}px)`}}><NeoLogo size={340} /></div>
          <div style={{transform: `translateY(${(1 - b) * 700}px)`}}><DiriyahLogo size={340} /></div>
        </div>
      </AbsoluteFill>
    );
  } else if (f < 570) {
    const beat = BEATS.find((b) => f >= b.from && f < b.to)!;
    const t = f - beat.from;
    const p = spring({frame: t, fps, config: {damping: 11, stiffness: 160}});
    const pan = interpolate(t, [0, 120], [0, 100]);
    const smallO = interpolate(t, [14, 28], [0, 1], clamp);
    const isTogether = beat.word === 'معاً';
    scene = (
      <AbsoluteFill style={{background: beat.paper, justifyContent: 'center', alignItems: 'center', gap: 6}}>
        <Small color={beat.ink} o={smallO}>{beat.small}</Small>
        <FilledWord
          text={beat.word}
          bg={beat.bg}
          size={beat.size}
          pos={isTogether ? `0 0, 50% 68%` : beat.bg.includes('tower') ? `50% ${60 + pan * 0.12}%` : `${pan}% 45%`}
          style={{
            transform: `scale(${interpolate(p, [0, 1], [1.6, 1])}) translateX(${(1 - p) * 200}px)`,
            backgroundSize: isTogether ? '100% 100%, cover' : beat.word === 'نيو كابتا' ? '300% 100%' : 'cover',
            filter: beat.paper === '#0b0b0d' ? 'drop-shadow(0 0 30px rgba(217,164,127,0.25))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))',
          }}
        />
        {beat.ar ? <Small color={beat.ink} o={smallO} dir="rtl" size={54}>{beat.ar}</Small> : null}
        {isTogether ? (
          <div style={{display: 'flex', gap: 300, marginTop: 10, opacity: smallO}}>
            <DiriyahLogo size={130} />
            <NeoLogo size={130} />
          </div>
        ) : null}
      </AbsoluteFill>
    );
  } else if (f < 780) {
    // 19–26 ث: الكاميرا تعبر عبر حرف كلمة «شراكة» إلى الصورة الجوية
    const t = f - 570;
    const zoom = interpolate(t, [0, 70], [1, 40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => x * x * x});
    const reveal = interpolate(t, [55, 75], [0, 1], clamp);
    const title = spring({frame: t - 90, fps, config: {damping: 12}});
    scene = (
      <AbsoluteFill style={{background: '#0b0b0d'}}>
        <AbsoluteFill style={{opacity: reveal, transform: `scale(${1.2 - t * 0.0008})`}}>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'rgba(5,6,10,0.45)', opacity: reveal}} />
        {reveal < 1 ? (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - reveal}}>
            <FilledWord text="شراكة" bg={`url(${AERIAL})`} size={520} pos="50% 50%" style={{transform: `scale(${zoom})`, transformOrigin: '48% 55%'}} />
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 10}}>
          <div dir="rtl" style={{fontSize: 170, fontWeight: 900, color: '#fff', transform: `scale(${title})`, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>شراكة استراتيجية</div>
          <div style={{fontSize: 44, letterSpacing: 16, color: COLORS.sand, opacity: title}}>STRATEGIC PARTNERSHIP</div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else {
    const p = spring({frame: f - 782, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={{background: '#f4ede2', justifyContent: 'center', alignItems: 'center', gap: 20}}>
        <div style={{display: 'flex', gap: 60, alignItems: 'center', transform: `scale(${p})`}}>
          <NeoLogo size={220} />
          <FilledWord text="×" bg={`url(${TOWER})`} size={160} pos="50% 50%" />
          <DiriyahLogo size={220} />
        </div>
        <FilledWord text="نيو كابتا × شركة الدرعية" bg={`url(${AERIAL})`} size={110} pos="50% 50%" style={{opacity: p}} />
        <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 700, color: COLORS.navy, opacity: p}}>Neo Capta × Diriyah Company</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-letters.wav')} />
      {scene}
    </AbsoluteFill>
  );
};
