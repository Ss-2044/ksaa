// الفيلم ٦ (فكرة ٢٨): «الإيقاع» — مونتاج فاخر على إيقاع سعودي هادئ: كلمة واحدة مع كل ضربة،
// والشاشة تنقسم لوحات (١، ٢، ٣، ٤) من لقطات الدرعية والإبداع. «كل نبضة… حكاية»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {CROPS, CineFrame, Crop, GOLD} from './cine';
import {clamp, useFonts} from './shared';

const BEAT = 18; // 100 BPM
const STEP = BEAT * 2;
const START = 90;

type Cell = {crop?: Crop; color?: string};
const BEATS: {word: string; en: string; layout: 1 | 2 | 3 | 4; cells: Cell[]}[] = [
  {word: 'تراث.', en: 'HERITAGE', layout: 1, cells: [{crop: 'towerNight'}]},
  {word: 'طين.', en: 'MUD-BRICK', layout: 2, cells: [{crop: 'mudDetail'}, {crop: 'crenels'}]},
  {word: 'ضوء.', en: 'LIGHT', layout: 1, cells: [{crop: 'architecture'}]},
  {word: 'ناس.', en: 'PEOPLE', layout: 3, cells: [{crop: 'people'}, {crop: 'palms'}, {crop: 'towerNight'}]},
  {word: 'حكاية.', en: 'STORY', layout: 1, cells: [{crop: 'aerialWide'}]},
  {word: 'فكرة.', en: 'IDEA', layout: 2, cells: [{color: COLORS.neoBlue}, {crop: 'crenels'}]},
  {word: 'تصميم.', en: 'DESIGN', layout: 4, cells: [{color: COLORS.navy}, {crop: 'architecture'}, {crop: 'mudDetail'}, {color: COLORS.copper}]},
  {word: 'صورة.', en: 'IMAGE', layout: 1, cells: [{crop: 'palms'}]},
  {word: 'حملة.', en: 'CAMPAIGN', layout: 3, cells: [{crop: 'aerialWide'}, {color: COLORS.neoBlue}, {crop: 'people'}]},
  {word: 'شاشة.', en: 'SCREEN', layout: 4, cells: [{crop: 'towerNight'}, {crop: 'architecture'}, {crop: 'palms'}, {crop: 'crenels'}]},
  {word: 'شراكة.', en: 'PARTNERSHIP', layout: 2, cells: [{color: COLORS.copper}, {color: COLORS.neoBlue}]},
  {word: 'رؤية.', en: 'VISION', layout: 1, cells: [{crop: 'aerialWide'}]},
  {word: 'إبداع.', en: 'CREATIVITY', layout: 2, cells: [{crop: 'mudDetail'}, {color: COLORS.neoBlue}]},
  {word: 'أثر.', en: 'IMPACT', layout: 1, cells: [{crop: 'towerNight'}]},
  {word: 'حضور.', en: 'PRESENCE', layout: 4, cells: [{crop: 'aerialWide'}, {crop: 'crenels'}, {crop: 'people'}, {crop: 'mudDetail'}]},
];

const CellView: React.FC<{c: Cell; t: number; i: number}> = ({c, t, i}) => {
  if (c.color) return <AbsoluteFill style={{background: c.color}} />;
  const k = CROPS[c.crop!];
  return (
    <Img
      src={k.src}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: k.pos, transformOrigin: k.pos, transform: `scale(${k.zoom * (1.04 + t * 0.06)}) translateY(${(i % 2 ? -1 : 1) * t * 10}px)`, filter: 'contrast(1.06) saturate(1.05)'}}
    />
  );
};

export const FilmRhythm: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  const pulse = 1 + 0.035 * Math.exp(-((f - START) % BEAT) / 4) * (f >= 20 ? 1 : 0);
  let scene: React.ReactNode;

  if (f < START) {
    const p = spring({frame: f - 4, fps, config: {damping: 18}});
    scene = (
      <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 120, alignItems: 'center', opacity: p, transform: `scale(${pulse})`}}>
          <NeoLogo size={280} />
          <DiriyahLogo size={280} />
        </div>
      </AbsoluteFill>
    );
  } else if (f < START + BEATS.length * STEP) {
    const i = Math.floor((f - START) / STEP);
    const b = BEATS[i];
    const local = f - START - i * STEP;
    const t = local / STEP;
    const slide = interpolate(local, [0, 6], [1, 0], clamp);
    const n = b.layout;
    const cells = b.cells.map((c, k) => {
      let style: React.CSSProperties;
      if (n === 1) style = {inset: 0};
      else if (n === 2) style = {top: 0, bottom: 0, left: k ? '50%' : 0, width: '50%'};
      else if (n === 3) style = {top: 0, bottom: 0, left: `${(k * 100) / 3}%`, width: '33.34%'};
      else style = {left: k % 2 ? '50%' : 0, top: k > 1 ? '50%' : 0, width: '50%', height: '50%'};
      return (
        <div key={k} style={{position: 'absolute', overflow: 'hidden', ...style, transform: `translateY(${slide * (k % 2 ? -1 : 1) * 120}px)`, borderRight: n > 1 ? '3px solid #000' : 'none', borderBottom: n === 4 ? '3px solid #000' : 'none'}}>
          <CellView c={c} t={t} i={k} />
        </div>
      );
    });
    const wordP = spring({frame: local, fps, config: {damping: 14, stiffness: 200}});
    scene = (
      <AbsoluteFill style={{background: '#000'}}>
        {cells}
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.38)'}} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
          <div dir="rtl" style={{fontSize: 190, fontWeight: 700, color: '#fff', transform: `scale(${0.9 + wordP * 0.1})`, opacity: wordP, textShadow: '0 6px 40px rgba(0,0,0,0.8)'}}>{b.word}</div>
          <div style={{fontSize: 30, fontWeight: 300, letterSpacing: 18, color: GOLD, opacity: wordP}}>{b.en}</div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else if (f < 800) {
    // فسيفساء من كل اللقطات + العنوان
    const t = f - (START + BEATS.length * STEP);
    const crops: Crop[] = ['towerNight', 'architecture', 'mudDetail', 'people', 'palms', 'crenels', 'aerialWide', 'towerNight', 'architecture', 'mudDetail', 'palms', 'people'];
    const title = spring({frame: t - 20, fps, config: {damping: 16}});
    scene = (
      <AbsoluteFill style={{background: '#000'}}>
        <div style={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 4, transform: `scale(${1.1 - t * 0.0008})`}}>
          {crops.map((c, k) => (
            <div key={k} style={{position: 'relative', overflow: 'hidden', opacity: interpolate(t, [k * 2, k * 2 + 6], [0, 1], clamp)}}>
              <CellView c={{crop: c}} t={t / 110} i={k} />
            </div>
          ))}
        </div>
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.5)'}} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 10}}>
          <div style={{fontSize: 96, fontWeight: 700, letterSpacing: 10, color: '#fff', opacity: title, transform: `scale(${0.95 + title * 0.05})`}}>Neo Capta × Diriyah</div>
          <div dir="rtl" style={{fontSize: 56, fontWeight: 300, color: GOLD, opacity: title}}>كل نبضة… حكاية.</div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else {
    const p = spring({frame: f - 800, fps, config: {damping: 18}});
    scene = (
      <AbsoluteFill style={{background: '#000', justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: FONT}}>
        <div style={{display: 'flex', gap: 60, alignItems: 'center', opacity: p, transform: `scale(${pulse})`}}>
          <NeoLogo size={200} />
          <div style={{fontSize: 70, fontWeight: 200, color: GOLD}}>×</div>
          <DiriyahLogo size={200} />
        </div>
        <div style={{fontSize: 52, fontWeight: 200, letterSpacing: 10, color: '#fff', opacity: p}}>EVERY BEAT, A STORY</div>
        <div dir="rtl" style={{fontSize: 38, color: GOLD, opacity: p}}>شراكة استراتيجية</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-film-rhythm.wav')} />
      {scene}
      <CineFrame />
    </AbsoluteFill>
  );
};
