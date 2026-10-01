import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {fonts} from '../theme';
import {Caption} from './Caption';
import {Chip} from './Photo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// NASA PIA11087: the same ~27×34 km around Riyadh — Landsat MSS 1972, Landsat TM 1990, ASTER 2000.
const YEARS = [
  {y: '1972', src: 'space/riyadh-1972.jpg'},
  {y: '1990', src: 'space/riyadh-1990.jpg'},
  {y: '2000', src: 'space/riyadh-2000.jpg'},
];

const BigYear: React.FC<{year: string; at: number}> = ({year, at}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 12], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.6))});
  return (
    <div style={{position: 'absolute', left: 80, top: 60, fontFamily: fonts.en, fontWeight: 800, fontSize: 200, lineHeight: 1, color: 'transparent', WebkitTextStroke: '3px #fff', opacity: p, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: 'left top', textShadow: '0 0 40px rgba(0,0,0,0.6)'}}>
      {year}
    </div>
  );
};

export const RiyadhGrows: React.FC = () => {
  const frame = useCurrentFrame();
  const s2 = interpolate(frame, [105, 150], [0, 100], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const s3 = interpolate(frame, [210, 255], [0, 100], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const zoom = interpolate(frame, [0, 320], [1.18, 1.0], clamp);
  const tri = interpolate(frame, [318, 345], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const full = (src: string, reveal?: number) => (
    <Img
      src={staticFile(src)}
      style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, clipPath: reveal === undefined ? undefined : `inset(0 ${100 - reveal}% 0 0)`}}
    />
  );
  const year = frame < 150 ? (frame < 105 ? '1972' : '1990') : frame < 255 ? '1990' : '2000';
  return (
    <AbsoluteFill style={{background: '#0D0F22'}}>
      <AbsoluteFill style={{opacity: 1 - tri}}>
        {full(YEARS[0].src)}
        {full(YEARS[1].src, s2)}
        {full(YEARS[2].src, s3)}
        {s2 > 0.5 && s2 < 99.5 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${s2}%`, width: 4, background: '#fff', boxShadow: '0 0 24px #fff'}} /> : null}
        {s3 > 0.5 && s3 < 99.5 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: `${s3}%`, width: 4, background: '#fff', boxShadow: '0 0 24px #fff'}} /> : null}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(13,15,34,0.55), transparent 35%, transparent 60%, rgba(13,15,34,0.85))'}} />
        <BigYear key={year} year={year} at={year === '1972' ? 4 : year === '1990' ? 128 : 233} />
      </AbsoluteFill>
      {/* triptych */}
      {tri > 0 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 0, paddingBottom: 120}}>
          <div dir="ltr" style={{display: 'flex', gap: 28}}>
            {YEARS.map((y, i) => {
              const q = interpolate(frame, [322 + i * 8, 340 + i * 8], [0, 1], clamp);
              return (
                <div key={y.y} style={{opacity: q, transform: `translateY(${(1 - q) * 60}px)`, textAlign: 'center'}}>
                  <Img src={staticFile(y.src)} style={{width: 560, height: 368, objectFit: 'cover', border: '2px solid #fff'}} />
                  <div style={{fontFamily: fonts.en, fontWeight: 800, fontSize: 52, color: '#fff', marginTop: 10}}>{y.y}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}
      <Chip ar="الرياض" en="NASA · Landsat / ASTER" from={0} to={320} corner="tr" />
      <Caption ar="الرياض عام 1972… نحو نصف مليون نسمة" en="Riyadh, 1972 — about half a million people" from={6} to={102} pos="bottom" size={60} />
      <Caption ar="1990… المدينة تمتد في كل اتجاه" en="1990 — the city spreads in every direction" from={110} to={207} pos="bottom" size={60} />
      <Caption ar="2000… أكثر من مليوني نسمة" en="2000 — more than two million people" from={215} to={316} pos="bottom" size={60} />
      <Caption ar="ثلاث صور… وثلاثة عقود من النمو" en="Three images. Three decades of growth." from={330} to={450} pos="bottom" size={64} />
    </AbsoluteFill>
  );
};
