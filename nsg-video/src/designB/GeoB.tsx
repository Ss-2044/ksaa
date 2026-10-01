import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, random} from 'remotion';
import {fonts} from '../theme';
import {Hud} from './BackgroundB';
import {Wipe} from './Wipe';

const R = 380;
const PINS = new Array(9).fill(0).map((_, i) => ({
  a: random(`a${i}`) * Math.PI * 2,
  d: 0.25 + random(`d${i}`) * 0.7,
}));

// Radar sweep over topographic contour lines (instead of design A's flat grid).
const Radar: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = (frame * 4) % 360;
  const contours = [0.2, 0.35, 0.5, 0.65, 0.8, 0.95];
  return (
    <svg width={R * 2 + 40} height={R * 2 + 40} viewBox={`${-R - 20} ${-R - 20} ${R * 2 + 40} ${R * 2 + 40}`}>
      <defs>
        <radialGradient id="sweepFade">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <clipPath id="radarClip">
          <circle r={R} />
        </clipPath>
      </defs>
      <circle r={R} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
      <g clipPath="url(#radarClip)" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5}>
        {contours.map((c, i) => {
          const pts = new Array(48).fill(0).map((_, k) => {
            const a = (k / 48) * Math.PI * 2;
            const wob = 1 + 0.12 * Math.sin(a * 3 + i) + 0.06 * Math.sin(a * 5 - i * 2);
            return `${Math.cos(a) * R * c * wob},${Math.sin(a) * R * c * wob * 0.8}`;
          });
          return <polygon key={i} points={pts.join(' ')} transform="translate(-40 20)" />;
        })}
        <line x1={-R} x2={R} y1={0} y2={0} />
        <line y1={-R} y2={R} x1={0} x2={0} />
      </g>
      <g transform={`rotate(${sweep})`} clipPath="url(#radarClip)">
        <path d={`M0 0 L${R} 0 A${R} ${R} 0 0 0 ${R * Math.cos(-0.6)} ${R * Math.sin(-0.6)} Z`} fill="url(#sweepFade)" />
        <line x1={0} y1={0} x2={R} y2={0} stroke="#fff" strokeWidth={3} />
      </g>
      {PINS.map((p, i) => {
        const ang = ((p.a * 180) / Math.PI) % 360;
        const since = (sweep - ang + 360) % 360;
        const glow = Math.max(0, 1 - since / 200);
        return (
          <g key={i} transform={`translate(${Math.cos(p.a) * R * p.d} ${Math.sin(p.a) * R * p.d})`}>
            <circle r={6 + glow * 16} fill="none" stroke="#fff" opacity={glow * 0.7} strokeWidth={2} />
            <circle r={5} fill="#fff" opacity={0.3 + glow * 0.7} />
          </g>
        );
      })}
    </svg>
  );
};

const Tag: React.FC<{n: string; ar: string; en: string; delay: number}> = ({n, ar, en, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 200}});
  return (
    <div style={{display: 'flex', flexDirection: 'row-reverse', gap: 24, alignItems: 'center', opacity: p, transform: `translateX(${(1 - p) * 60}px)`}}>
      <div style={{fontFamily: fonts.en, fontWeight: 700, fontSize: 22, color: '#0D0F22', background: '#fff', padding: '6px 12px'}}>{n}</div>
      <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 600, fontSize: 40, color: '#fff'}}>
        {ar}
      </div>
      <div style={{fontFamily: fonts.en, fontSize: 20, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em'}}>{en.toUpperCase()}</div>
    </div>
  );
};

export const GeoB: React.FC<{duration: number}> = ({duration}) => {
  const frame = useCurrentFrame();
  const step = Math.min(30, (duration - 90) / 3);
  const title = interpolate(frame, [6, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{flexDirection: 'row-reverse', alignItems: 'center', padding: '0 150px', gap: 60}}>
      <div style={{flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 28}}>
        <div style={{opacity: title, transform: `translateY(${(1 - title) * 30}px)`}}>
          <div dir="rtl" style={{fontFamily: fonts.ar, fontWeight: 700, fontSize: 86, color: '#fff', lineHeight: 1.2}}>
            الشركة الوطنية
            <br />
            للخدمات الجيومكانية
          </div>
          <div style={{fontFamily: fonts.en, fontSize: 28, fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: 10}}>
            NATIONAL GEOSPATIAL SERVICES
          </div>
        </div>
        <div dir="rtl" style={{fontFamily: fonts.ar, fontSize: 36, color: 'rgba(255,255,255,0.75)', opacity: title}}>
          من صور الأقمار الصناعية… إلى قرارات أذكى
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-end', marginTop: 10}}>
          <Tag n="A" ar="صور الأقمار الصناعية" en="Satellite imagery" delay={40} />
          <Tag n="B" ar="الخرائط والتحليلات" en="Mapping & analytics" delay={40 + step} />
          <Tag n="C" ar="دعم اتخاذ القرار" en="Decision support" delay={40 + step * 2} />
        </div>
      </div>
      <div style={{flex: 0.8, display: 'flex', justifyContent: 'center'}}>
        <Radar />
      </div>
      <Hud index="GEO" label="الخدمات الجيومكانية" />
      {frame < 16 ? <Wipe /> : null}
    </AbsoluteFill>
  );
};
