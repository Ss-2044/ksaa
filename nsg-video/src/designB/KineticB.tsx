import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';
import {BAR, useBeatPulse} from './beat';
import {Hud} from './BackgroundB';
import {Wipe} from './Wipe';

const WORDS = [
  {ar: 'الفضاء', en: 'SPACE'},
  {ar: 'المستقبل', en: 'THE FUTURE'},
  {ar: 'يبدأ من هنا', en: 'STARTS HERE'},
];

// One giant word per bar, punched on every beat, with an outlined English marquee behind.
export const KineticB: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const pulse = useBeatPulse(3);
  const count = Math.max(1, Math.round(duration / BAR));
  const idx = Math.min(WORDS.length - 1, Math.floor(frame / BAR) % count);
  const local = frame % BAR;
  const word = WORDS[idx];
  const enter = interpolate(local, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  const marquee = `${word.en} • `.repeat(8);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 260,
          color: 'transparent',
          WebkitTextStroke: '2px rgba(255,255,255,0.18)',
          transform: `translateX(${-frame * 6}px)`,
          top: 90,
        }}
      >
        {marquee}
      </div>
      <div
        style={{
          position: 'absolute',
          whiteSpace: 'nowrap',
          fontFamily: fonts.en,
          fontWeight: 800,
          fontSize: 260,
          color: 'transparent',
          WebkitTextStroke: '2px rgba(255,255,255,0.12)',
          transform: `translateX(${frame * 6 - 2000}px)`,
          bottom: 60,
        }}
      >
        {marquee}
      </div>
      <div
        dir="rtl"
        style={{
          fontFamily: fonts.ar,
          fontWeight: 700,
          fontSize: 300,
          color: '#fff',
          lineHeight: 1.1,
          transform: `scale(${(0.85 + 0.15 * enter) * (1 + pulse * 0.04)})`,
          opacity: enter,
          textShadow: '0 20px 80px rgba(0,0,0,0.45)',
        }}
      >
        {word.ar}
      </div>
      <div
        style={{
          fontFamily: fonts.en,
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: `${0.2 + (1 - enter) * 0.6}em`,
          color: '#fff',
          opacity: enter * 0.8,
          marginTop: 10,
        }}
      >
        {word.en}
      </div>
      <Hud index={`0${idx + 1}`} label="مجموعة نيو للفضاء" />
      {local < 16 ? <Wipe /> : null}
    </AbsoluteFill>
  );
};
