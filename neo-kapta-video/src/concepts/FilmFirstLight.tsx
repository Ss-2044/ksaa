// الفيلم ٤ (فكرة ٢٦): «أول ضوء» — شروق الشمس يكشف الدرعية: ضوء ذهبي يمسح البرج ثم المدينة ثم التفاصيل،
// ثم يُضيء الشعارين. «ومع أول ضوء… تبدأ قصة جديدة»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {FONT} from '../theme';
import {AERIAL, CROPS, CineFrame, Crop, GOLD, LuxText, TOWER} from './cine';
import {clamp, useFonts} from './shared';

// صورة تبدأ معتمة، وشريط ضوء ذهبي يمسحها فيكشف ألوانها
const LitPhoto: React.FC<{src: string; pos: string; zoom: number; from: number; dur: number; sweepFrom: number; sweepDur: number; dir?: 1 | -1}> = ({
  src,
  pos,
  zoom,
  from,
  dur,
  sweepFrom,
  sweepDur,
  dir = 1,
}) => {
  const f = useCurrentFrame();
  if (f < from || f >= from + dur) return null;
  const s = interpolate(f, [sweepFrom, sweepFrom + sweepDur], [-30, 130], clamp);
  const edge = dir === 1 ? s : 100 - s;
  const o = interpolate(f - from, [0, 12, dur - 12, dur], [0, 1, 1, 0], clamp);
  const t = (f - from) / dur;
  const img = (filter: string) => (
    <Img src={src} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transformOrigin: pos, transform: `scale(${zoom * (1 + 0.06 * t)})`, filter}} />
  );
  const mask = dir === 1 ? `linear-gradient(90deg, black ${edge - 25}%, transparent ${edge}%)` : `linear-gradient(270deg, black ${100 - edge - 25}%, transparent ${100 - edge}%)`;
  return (
    <AbsoluteFill style={{opacity: o}}>
      {img('grayscale(0.85) brightness(0.22) contrast(1.1)')}
      <AbsoluteFill style={{maskImage: mask, WebkitMaskImage: mask}}>{img('saturate(1.12) brightness(1.02)')}</AbsoluteFill>
      {/* حافة الضوء */}
      <div style={{position: 'absolute', top: 0, bottom: 0, left: `${edge - 6}%`, width: '8%', background: 'linear-gradient(90deg, transparent, rgba(255,214,150,0.35), transparent)', mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

const litCrop = (c: Crop, from: number, dur: number, dir: 1 | -1 = 1) => {
  const k = CROPS[c];
  return <LitPhoto src={k.src} pos={k.pos} zoom={k.zoom} from={from} dur={dur} sweepFrom={from + 4} sweepDur={dur - 14} dir={dir} />;
};

export const FilmFirstLight: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  const sun = interpolate(f, [150, 300], [0, 1], clamp);
  const logoSweep = interpolate(f, [470, 560], [-20, 120], clamp);
  const endO = interpolate(f, [780, 800], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-film-firstlight.wav')} />

      <LitPhoto src={TOWER} pos="50% 45%" zoom={1.1} from={0} dur={152} sweepFrom={50} sweepDur={95} />
      <LuxText from={20} to={150} bottom={170} size={64}>كل صباح في الدرعية… يحمل وعداً.</LuxText>

      <LitPhoto src={AERIAL} pos="50% 50%" zoom={1.08} from={150} dur={152} sweepFrom={160} sweepDur={120} dir={-1} />
      {f >= 150 && f < 302 ? (
        <div style={{position: 'absolute', right: 140 + sun * 60, top: 300 - sun * 160, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,236,190,0.95), rgba(255,190,110,0.35) 40%, transparent 70%)', mixBlendMode: 'screen', opacity: sun}} />
      ) : null}
      <LuxText from={165} to={300} bottom={170} size={70}>ومع أول ضوء…</LuxText>

      {litCrop('mudDetail', 300, 52)}
      {litCrop('architecture', 350, 52, -1)}
      {litCrop('palms', 400, 52)}
      <LuxText from={310} to={450} bottom={170} size={76} color={GOLD}>تبدأ قصة جديدة.</LuxText>

      {/* الشعاران يُضيئهما الشروق */}
      {f >= 450 && f < 602 ? (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #1a120a, #000 70%)', opacity: interpolate(f, [450, 462, 590, 602], [0, 1, 1, 0], clamp)}}>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: 120, alignItems: 'center', filter: `brightness(${interpolate(logoSweep, [-20, 50, 120], [0.15, 1.1, 1])})`}}>
              <NeoLogo size={280} />
              <DiriyahLogo size={280} />
            </div>
          </AbsoluteFill>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${logoSweep}%`, width: '14%', transform: 'skewX(-12deg)', background: 'linear-gradient(90deg, transparent, rgba(255,214,150,0.4), transparent)', mixBlendMode: 'screen'}} />
          <LuxText from={505} to={600} bottom={190} size={72} weight={700} dir="ltr" spacing={10}>Neo Capta × Diriyah</LuxText>
        </AbsoluteFill>
      ) : null}

      {/* المدينة مضيئة بالكامل */}
      {f >= 600 && f < 790 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [600, 615, 778, 790], [0, 1, 1, 0], clamp)}}>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 - (f - 600) * 0.0007})`, filter: 'saturate(1.15) brightness(1.05)'}} />
          <div style={{position: 'absolute', right: 120, top: 120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,236,190,0.6), transparent 65%)', mixBlendMode: 'screen'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.6))'}} />
          <LuxText from={620} to={785} bottom={190} size={72}>نُضيء الحكاية… لتراها كل العيون.</LuxText>
          <LuxText from={640} to={785} bottom={140} size={26} dir="ltr" spacing={10} color={GOLD} weight={300}>LIGHTING THE STORY FOR EVERY EYE</LuxText>
        </AbsoluteFill>
      ) : null}

      {f >= 780 ? (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #2a1c10, #000 70%)', justifyContent: 'center', alignItems: 'center', gap: 22, fontFamily: FONT, opacity: endO}}>
          <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
            <NeoLogo size={200} />
            <div style={{fontSize: 70, fontWeight: 200, color: GOLD}}>×</div>
            <DiriyahLogo size={200} />
          </div>
          <div style={{fontSize: 64, fontWeight: 200, letterSpacing: 12, color: '#fff'}}>A NEW LIGHT</div>
          <div dir="rtl" style={{fontSize: 40, fontWeight: 400, color: GOLD}}>شراكة استراتيجية</div>
        </AbsoluteFill>
      ) : null}

      <CineFrame />
    </AbsoluteFill>
  );
};
