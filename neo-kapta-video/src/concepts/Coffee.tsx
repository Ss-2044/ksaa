// الفكرة 8: «على فنجال» — ضيافة سعودية: دلّة تصب القهوة في فنجالين (أزرق لنيو كابتا ونحاسي للدرعية)
// والبخار يرتفع ويلتقي ليكتب «شراكة استراتيجية»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const COFFEE = '#C9A063';

const Wood: React.FC<{top?: boolean}> = ({top}) => (
  <AbsoluteFill
    style={{
      background: top
        ? 'repeating-linear-gradient(90deg, #5a3a26 0 18px, #64412b 18px 40px, #4f3322 40px 52px, #5d3c28 52px 90px)'
        : 'linear-gradient(180deg, #1a120d 0%, #2b1c13 62%, #5a3a26 62%, #3e2819 100%)',
    }}
  >
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,200,140,0.22), transparent 65%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'}} />
  </AbsoluteFill>
);

// فنجال من الأعلى، والشعار في قاعه
const CupTop: React.FC<{neo: boolean; size: number; fill?: number}> = ({neo, size, fill = 0}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#f7f3ec',
      boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 0 0 ${size * 0.04}px ${neo ? COLORS.neoBlue : COLORS.copper}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}
  >
    <div style={{width: size * 0.78, height: size * 0.78, borderRadius: '50%', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 8px 20px rgba(0,0,0,0.3)'}}>
      <Img src={staticFile(neo ? 'neo-capta-logo.jpg' : 'diriyah-logo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: COFFEE, opacity: fill * 0.85}} />
    </div>
  </div>
);

// فنجال جانبي
const CupSide: React.FC<{neo: boolean; level: number}> = ({neo, level}) => {
  const d = 'M0 0 L200 0 L170 150 Q100 170 30 150 Z';
  return (
    <svg width={200} height={175} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id={`cup${neo ? 'n' : 'd'}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#f7f3ec" />
      <rect x={0} y={150 - level * 130} width={200} height={200} fill={COFFEE} clipPath={`url(#cup${neo ? 'n' : 'd'})`} />
      <path d="M8 40 L192 40 L186 70 L14 70 Z" fill={neo ? COLORS.neoBlue : COLORS.copper} opacity={0.9} />
      <ellipse cx={100} cy={0} rx={100} ry={10} fill="none" stroke="#e7dfd2" strokeWidth={4} />
    </svg>
  );
};

// دلّة نحاسية بزخرفة زرقاء
const Dallah: React.FC = () => (
  <svg width={400} height={500} viewBox="0 0 400 500">
    <defs>
      <linearGradient id="cu" x1="0" x2="1">
        <stop offset="0" stopColor="#7a4a30" />
        <stop offset="0.45" stopColor="#e2b48d" />
        <stop offset="1" stopColor="#8a5a3e" />
      </linearGradient>
    </defs>
    <path d="M240 200 C 340 210, 345 330, 285 365" fill="none" stroke="#7a4a30" strokeWidth={16} strokeLinecap="round" />
    <path d="M172 240 C 120 230, 70 182, 30 150 L 42 138 C 82 166, 130 204, 175 214 Z" fill="url(#cu)" />
    <path d="M120 300 C 75 360, 90 452, 200 462 C 310 452, 325 360, 280 300 Z" fill="url(#cu)" />
    <path d="M150 300 L170 180 L230 180 L250 300 Z" fill="url(#cu)" />
    <rect x={128} y={292} width={144} height={18} rx={6} fill={COLORS.neoBlue} />
    <path d="M160 182 L200 110 L240 182 Z" fill="url(#cu)" />
    <circle cx={200} cy={100} r={13} fill="#e2b48d" />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M${140 + i * 25} 400 l12 -20 l12 20 Z`} fill="none" stroke={COLORS.neoBlue} strokeWidth={3} />
    ))}
  </svg>
);

const Steam: React.FC<{x: number; y: number; start: number; toX: number}> = ({x, y, start, toX}) => {
  const f = useCurrentFrame();
  const t = f - start;
  if (t < 0) return null;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {[0, 1, 2].map((k) => {
        const rise = Math.min(1, t / 90);
        const pts = new Array(12).fill(0).map((_, i) => {
          const s = i / 11;
          const px = x + (toX - x) * s * rise + Math.sin(s * 8 + t / 10 + k * 2) * 25 * (1 - s * 0.5);
          const py = y - s * 420 * rise;
          return `${px},${py}`;
        });
        return (
          <polyline
            key={k}
            points={pts.join(' ')}
            fill="none"
            stroke="#fff"
            strokeWidth={14 - k * 3}
            strokeLinecap="round"
            opacity={0.18}
            style={{filter: 'blur(6px)'}}
          />
        );
      })}
    </svg>
  );
};

const Caption: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 18, to - 12, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: o}}>
      <div dir="rtl" style={{fontSize: 86, fontWeight: 900, color: COLORS.sand}}>{ar}</div>
      <div style={{fontSize: 32, letterSpacing: 10, color: COLORS.copperLight}}>{en}</div>
    </div>
  );
};

export const CoffeeConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  if (f < 90 || f >= 780) {
    // البداية والختام: منظر علوي للفنجالين
    const endPhase = f >= 780;
    const a = spring({frame: f - (endPhase ? 780 : 2), fps, config: {damping: 13}});
    const b = spring({frame: f - (endPhase ? 786 : 12), fps, config: {damping: 13}});
    const together = endPhase ? interpolate(f, [800, 820], [0, 1], clamp) : 0;
    const clink = endPhase ? interpolate(f, [818, 822, 845], [0, 1, 0], clamp) : 0;
    const txt = endPhase ? interpolate(f, [825, 845], [0, 1], clamp) : 0;
    scene = (
      <AbsoluteFill>
        <Wood top />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', gap: 200 - together * 170, transform: `translateY(${-txt * 90}px)`}}>
            <div style={{transform: `scale(${a})`}}>
              <CupTop neo size={380} fill={endPhase ? 1 : 0} />
            </div>
            <div style={{transform: `scale(${b})`}}>
              <CupTop neo={false} size={380} fill={endPhase ? 1 : 0} />
            </div>
          </div>
          <div style={{position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: `6px solid ${COLORS.sand}`, transform: `translateY(${-txt * 90}px) scale(${1 + (1 - clink) * 2})`, opacity: clink}} />
          {endPhase ? (
            <div style={{position: 'absolute', bottom: 120, textAlign: 'center', fontFamily: FONT, opacity: txt}}>
              <div dir="rtl" style={{fontSize: 74, fontWeight: 900, color: COLORS.sand, textShadow: '0 4px 20px #000'}}>على فنجال… بدأت الحكاية</div>
              <div style={{fontSize: 44, fontWeight: 700, color: '#fff', textShadow: '0 4px 20px #000'}}>Neo Capta × Diriyah Company</div>
            </div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else if (f < 630) {
    // 3–21 ث: منظر جانبي — الدلّة تصب في الفنجالين ثم البخار يكتب الخبر
    const cup1 = 620;
    const cup2 = 1100;
    const cupY = 700;
    const pourX = (cx: number) => cx + 100 + 194;
    const enter = interpolate(f, [90, 130], [2300, pourX(cup1)], clamp);
    const move = interpolate(f, [255, 300], [pourX(cup1), pourX(cup2)], clamp);
    const exit = interpolate(f, [430, 470], [0, 1400], clamp);
    const dx = f < 255 ? enter : move + exit;
    const tilt =
      f < 255
        ? interpolate(f, [135, 160, 225, 250], [0, -40, -40, 0], clamp)
        : interpolate(f, [305, 330, 395, 420], [0, -40, -40, 0], clamp);
    const pouring1 = f >= 158 && f < 228;
    const pouring2 = f >= 328 && f < 398;
    const lvl1 = interpolate(f, [160, 228], [0, 0.8], clamp);
    const lvl2 = interpolate(f, [330, 398], [0, 0.8], clamp);
    // مركز الدلّة؛ عند الميل -40° يكون طرف البزبوز عند (المركز - 194، المركز + 33) فوق الفنجال
    const centerX = dx;
    const centerY = cupY - 153;
    const word = interpolate(f, [520, 560], [0, 1], clamp);
    const tipX = dx - 194;
    const tipY = centerY + 33;
    scene = (
      <AbsoluteFill>
        <Wood />
        <div style={{position: 'absolute', left: cup1, top: cupY}}>
          <CupSide neo level={lvl1} />
        </div>
        <div style={{position: 'absolute', left: cup2, top: cupY}}>
          <CupSide neo={false} level={lvl2} />
        </div>
        <div style={{position: 'absolute', left: cup1 + 70, top: cupY + 185, opacity: 0.9}}>
          <NeoLogo size={60} style={{boxShadow: 'none'}} />
        </div>
        <div style={{position: 'absolute', left: cup2 + 70, top: cupY + 185, opacity: 0.9}}>
          <DiriyahLogo size={60} style={{boxShadow: 'none', border: 'none'}} />
        </div>
        {pouring1 || pouring2 ? (
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
            <path
              d={`M${tipX} ${tipY} Q ${tipX - 50} ${tipY + 40}, ${(pouring1 ? cup1 : cup2) + 100} ${cupY + 20}`}
              fill="none"
              stroke={COFFEE}
              strokeWidth={9}
              strokeLinecap="round"
              opacity={0.95}
            />
          </svg>
        ) : null}
        <div style={{position: 'absolute', left: centerX - 200, top: centerY - 250, transform: `rotate(${tilt}deg)`, transformOrigin: '200px 250px'}}>
          <Dallah />
        </div>
        <Steam x={cup1 + 100} y={cupY - 10} start={440} toX={960} />
        <Steam x={cup2 + 100} y={cupY - 10} start={445} toX={960} />
        <Caption from={100} to={260} ar="على فنجال…" en="OVER A CUP OF COFFEE…" />
        <Caption from={275} to={440} ar="تبدأ أجمل الحكايات" en="GREAT STORIES BEGIN" />
        <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: word}}>
          <div dir="rtl" style={{fontSize: 150, fontWeight: 900, color: COLORS.sand, filter: `blur(${(1 - word) * 18}px)`, textShadow: '0 0 40px rgba(255,255,255,0.4)'}}>
            شراكة استراتيجية
          </div>
          <div style={{fontSize: 40, letterSpacing: 14, color: COLORS.copperLight}}>STRATEGIC PARTNERSHIP</div>
        </div>
      </AbsoluteFill>
    );
  } else {
    // 21–26 ث: ضيافة الشراكة — صينية وثلاث تمرات
    const p = spring({frame: f - 632, fps, config: {damping: 14}});
    const items = ['تسويق', 'دعاية', 'إعلان'];
    scene = (
      <AbsoluteFill>
        <Wood top />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              width: 760,
              height: 760,
              borderRadius: '50%',
              background: `radial-gradient(circle at 40% 35%, #e9bb94, ${COLORS.copper} 55%, #7a4a30)`,
              boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 0 0 26px rgba(0,0,0,0.12)',
              transform: `translateY(90px) scale(${p * 0.88})`,
              position: 'relative',
            }}
          >
            {items.map((t, i) => {
              const q = spring({frame: f - 660 - i * 14, fps, config: {damping: 12}});
              const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
              const x = 380 + Math.cos(ang) * 200;
              const y = 380 + Math.sin(ang) * 200;
              return (
                <div key={t} style={{position: 'absolute', left: x - 110, top: y - 70, width: 220, textAlign: 'center', transform: `scale(${q})`}}>
                  <div style={{width: 120, height: 70, margin: '0 auto', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #8a4b2a, #3e1f10)', boxShadow: '0 8px 14px rgba(0,0,0,0.5)'}} />
                  <div dir="rtl" style={{fontFamily: FONT, fontSize: 46, fontWeight: 900, color: '#fff', textShadow: '0 3px 10px #000'}}>{t}</div>
                </div>
              );
            })}
          </div>
          <div style={{position: 'absolute', top: 60, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: p}}>
            <div dir="rtl" style={{fontSize: 70, fontWeight: 900, color: COLORS.sand, textShadow: '0 4px 20px #000'}}>ضيافة الشراكة</div>
            <div style={{fontSize: 28, letterSpacing: 8, color: COLORS.copperLight}}>MARKETING · ADVERTISING · CAMPAIGNS</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-coffee.wav')} />
      {scene}
    </AbsoluteFill>
  );
};
