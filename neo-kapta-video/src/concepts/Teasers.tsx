// مقطعا تشويق عموديان (9:16، 10 ثوانٍ) يُنشران قبل يوم الإعلان — يُخفيان الشريك عمداً
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {Piece, S as PIECE} from './Puzzle';
import {clamp, useFonts} from './shared';

const Line: React.FC<{at: number; children: React.ReactNode; size: number; color: string; dir?: 'rtl' | 'ltr'; spacing?: number}> = ({
  at,
  children,
  size,
  color,
  dir = 'rtl',
  spacing = 0,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 14], [0, 1], clamp);
  return (
    <div
      dir={dir}
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color,
        letterSpacing: spacing,
        textAlign: 'center',
        opacity: p,
        filter: `blur(${(1 - p) * 10}px)`,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {children}
    </div>
  );
};

const MOUNTAIN = 'M40 260 L120 160 L190 160 L230 110 L280 110 L300 60 L360 60 L400 150 L460 150 L520 110 L560 120 L600 260 Z';

// تشويق 1: «مين الشريك؟» — شعار نيو كابتا × دائرة غامضة مموّهة + تلميحات سريعة
export const TeaserWho: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const neo = interpolate(f, [5, 40], [0, 1], clamp);
  const mystery = spring({frame: f - 50, fps, config: {damping: 14}});
  const glitch = (f >= 150 && f < 155) || (f >= 165 && f < 169);
  const hint = f >= 185 && f < 250 ? Math.floor((f - 185) / 22) : -1;
  const heart = 1 + 0.04 * Math.max(0, Math.sin((f / 30) * Math.PI * 2)) ** 8;
  const end = spring({frame: f - 255, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('music-teaser-who.wav')} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${COLORS.navy}, #000 65%)`}} />
      {f < 250 ? (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 230, gap: 40}}>
          <NeoLogo size={330} style={{opacity: neo, boxShadow: `0 0 ${60 * neo}px ${COLORS.neoBlue}`, transform: `scale(${heart})`}} />
          <div style={{fontFamily: FONT, fontSize: 100, color: '#fff', opacity: mystery}}>×</div>
          <div
            style={{
              position: 'relative',
              width: 330,
              height: 330,
              borderRadius: '50%',
              overflow: 'hidden',
              transform: `scale(${mystery * heart})`,
              border: `4px solid ${COLORS.copper}`,
              boxShadow: `0 0 80px ${COLORS.copper}66`,
            }}
          >
            {hint < 0 ? (
              <>
                <Img
                  src={staticFile('diriyah-logo.jpg')}
                  style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${glitch ? 14 : 38}px) brightness(0.55)`}}
                />
                <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, fontSize: 220, fontWeight: 900, color: COLORS.copperLight}}>
                  ؟
                </AbsoluteFill>
              </>
            ) : (
              <AbsoluteFill style={{background: hint === 1 ? '#8a5a3e' : '#1a0f0a', justifyContent: 'center', alignItems: 'center'}}>
                {hint === 0 ? (
                  <svg width={300} height={120} viewBox="0 0 300 120">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <path key={i} d={`M${10 + i * 58} 100 L${39 + i * 58} 20 L${68 + i * 58} 100 Z`} fill="none" stroke={COLORS.copperLight} strokeWidth={5} />
                    ))}
                  </svg>
                ) : hint === 1 ? (
                  <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle at 30% 30%, #b47a58, #6e4128 70%)'}} />
                ) : (
                  <svg width={260} height={130} viewBox="0 0 640 300">
                    <path d={MOUNTAIN} fill="none" stroke={COLORS.copperLight} strokeWidth={10} strokeLinejoin="round" />
                  </svg>
                )}
              </AbsoluteFill>
            )}
          </div>
          <div style={{marginTop: 60, display: 'flex', flexDirection: 'column', gap: 10}}>
            {f < 185 ? (
              <>
                <Line at={90} size={84} color="#fff">شريك جديد…</Line>
                <Line at={118} size={84} color={COLORS.copperLight}>بحجم التاريخ</Line>
                <Line at={140} size={34} color={COLORS.neoBlueLight} dir="ltr" spacing={6}>
                  A NEW PARTNER… AS BIG AS HISTORY
                </Line>
              </>
            ) : (
              <>
                <Line at={185} size={96} color="#fff">خمّن… مين؟</Line>
                <Line at={195} size={38} color={COLORS.neoBlueLight} dir="ltr" spacing={8}>GUESS WHO?</Line>
              </>
            )}
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 20, fontFamily: FONT}}>
          <div dir="rtl" style={{fontSize: 260, fontWeight: 900, color: '#fff', transform: `scale(${end})`}}>غداً</div>
          <div style={{fontSize: 56, letterSpacing: 20, color: COLORS.copperLight, opacity: end}}>TOMORROW</div>
          <div style={{fontSize: 44, fontWeight: 700, color: COLORS.neoBlueLight, marginTop: 40, opacity: end}}>#NeoCaptaX؟</div>
        </AbsoluteFill>
      )}
      {glitch ? (
        <AbsoluteFill
          style={{
            background: `repeating-linear-gradient(0deg, ${COLORS.neoBlue}55 0 6px, transparent 6px 22px)`,
            transform: `translateX(${f % 2 ? 14 : -14}px)`,
          }}
        />
      ) : null}
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [292, 300], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};

// تشويق 2: «غداً» — ساعة تعدّ تنازلياً من 24 ساعة، وثقب مفتاح يكشف لمحات نحاسية من الشريك
const KEYHOLE = "path('M250 70 A150 150 0 1 1 249.9 70 Z M175 300 L325 300 L380 680 L120 680 Z')";

export const TeaserTomorrow: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const secs = 24 * 3600 - Math.floor(f / 30);
  const hh = String(Math.floor(secs / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');
  const tick = interpolate(f % 30, [0, 6], [1.06, 1], clamp);
  const zoom = interpolate(f, [205, 240], [1, 9], clamp);
  const flash = interpolate(f, [236, 242, 262], [0, 1, 0], clamp);
  const end = spring({frame: f - 242, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: COLORS.neoBlack}}>
      <Audio src={staticFile('music-teaser-tomorrow.wav')} />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${COLORS.neoBlueLight}55 2px, transparent 2.5px)`,
          backgroundSize: '30px 30px',
          backgroundPosition: `0 ${f}px`,
          opacity: 0.4,
        }}
      />
      {f < 242 ? (
        <AbsoluteFill style={{alignItems: 'center', paddingTop: 150}}>
          <div dir="rtl" style={{fontFamily: FONT, fontSize: 52, fontWeight: 700, color: COLORS.copperLight}}>باقي</div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 170,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: 6,
              transform: `scale(${tick})`,
              fontVariantNumeric: 'tabular-nums',
              textShadow: `0 0 40px ${COLORS.neoBlue}`,
            }}
          >
            {hh}:{mm}:{ss}
          </div>
          <div
            style={{
              marginTop: 60,
              width: 500,
              height: 700,
              clipPath: KEYHOLE,
              position: 'relative',
              transform: `scale(${zoom})`,
              transformOrigin: '250px 220px',
              background: '#1a0f0a',
            }}
          >
            <Img
              src={staticFile('diriyah-logo.jpg')}
              style={{
                position: 'absolute',
                width: 2600,
                height: 2600,
                left: -700 - f * 2,
                top: -900 + Math.sin(f / 40) * 80,
                filter: 'sepia(0.6) saturate(1.4) brightness(0.8) blur(6px)',
              }}
            />
            <AbsoluteFill style={{background: `linear-gradient(180deg, transparent, ${COLORS.copper}66)`}} />
          </div>
          <div style={{marginTop: 50, display: 'flex', flexDirection: 'column', gap: 8}}>
            {f < 120 ? (
              <>
                <Line at={20} size={70} color="#fff">نيو كابتا تستعد…</Line>
                <Line at={55} size={70} color={COLORS.neoBlueLight}>لإعلان كبير</Line>
              </>
            ) : (
              <>
                <Line at={125} size={64} color="#fff">شيء يجمع الأمس بالغد</Line>
                <Line at={150} size={34} color={COLORS.copperLight} dir="ltr" spacing={6}>
                  WHERE YESTERDAY MEETS TOMORROW
                </Line>
              </>
            )}
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30, fontFamily: FONT}}>
          <div dir="rtl" style={{fontSize: 150, fontWeight: 900, color: '#fff', transform: `scale(${end})`}}>ترقّبونا غداً</div>
          <div style={{fontSize: 46, letterSpacing: 14, color: COLORS.copperLight, opacity: end}}>STAY TUNED · TOMORROW</div>
          <NeoLogo size={200} style={{marginTop: 80, opacity: end}} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [290, 300], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};

// تشويق 3: «القطعة الناقصة» — قطعة بازل نيو كابتا وبجانبها فراغ نحاسي ينتظر قطعته
export const TeaserMissingPiece: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f, fps, config: {damping: 13}});
  // القطعة تحاول الاقتراب من الفراغ مرتين ثم تتراجع
  const tryFit = f < 200 ? Math.max(0, Math.sin(((f - 60) / 70) * Math.PI)) * (f > 60 ? 40 : 0) : 0;
  const glow = 0.5 + 0.5 * Math.sin(f / 8);
  const end = spring({frame: f - 220, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: COLORS.sand}}>
      <Audio src={staticFile('music-teaser-piece.wav')} />
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.05) 2px, transparent 2px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div style={{position: 'absolute', top: 640, left: 540 - PIECE, width: 2 * PIECE, height: PIECE}}>
        <Piece
          edges={[0, 0, 0, -1]}
          fill={`rgba(185,122,87,${0.08 + glow * 0.12})`}
          stroke={COLORS.copper}
          dashed
          style={{left: PIECE, top: 0}}
        >
          <div style={{fontFamily: FONT, fontSize: 200, fontWeight: 900, color: COLORS.copper, opacity: 0.4 + glow * 0.6}}>؟</div>
        </Piece>
        <Piece
          edges={[0, 1, 0, 0]}
          fill={COLORS.neoBlack}
          style={{left: tryFit - (1 - enter) * 700, top: 0, transform: `rotate(${-tryFit / 8}deg)`}}
        >
          <NeoLogo size={220} style={{boxShadow: 'none', border: 'none'}} />
        </Piece>
      </div>
      <div style={{position: 'absolute', top: 1080, width: '100%', display: 'flex', flexDirection: 'column', gap: 10}}>
        {f < 215 ? (
          <>
            <Line at={30} size={92} color={COLORS.navy}>ينقصنا قطعة…</Line>
            <Line at={60} size={34} color={COLORS.copper} dir="ltr" spacing={8}>ONE PIECE IS MISSING…</Line>
            <Line at={120} size={76} color={COLORS.copper}>قطعة بحجم التاريخ</Line>
          </>
        ) : (
          <div style={{textAlign: 'center', fontFamily: FONT, transform: `scale(${end})`}}>
            <div dir="rtl" style={{fontSize: 110, fontWeight: 900, color: COLORS.navy}}>غداً تكتمل الصورة</div>
            <div style={{fontSize: 36, letterSpacing: 8, color: COLORS.copper}}>TOMORROW, THE PICTURE IS COMPLETE</div>
          </div>
        )}
      </div>
      <AbsoluteFill style={{background: COLORS.sand, opacity: interpolate(f, [290, 300], [0, 1], clamp)}} />
    </AbsoluteFill>
  );
};
