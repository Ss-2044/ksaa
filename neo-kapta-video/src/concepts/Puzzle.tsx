// الفكرة 7: «قطعتا البازل» — تصميم فاتح: قطعة نيو كابتا الزرقاء وقطعة الدرعية النحاسية تتطابقان «كليك»
// ثم تكتمل حولهما لوحة بازل كاملة = شراكة استراتيجية
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

export const S = 300; // حجم القطعة
const T = S * 0.15; // ارتفاع اللسان

type Edge = -1 | 0 | 1;
// مسار قطعة بازل: 1 = لسان للخارج، -1 = تجويف، 0 = حافة مستقيمة
export const piecePath = (top: Edge, right: Edge, bottom: Edge, left: Edge) => {
  const a = S * 0.36;
  const b = S * 0.64;
  return [
    `M0 0`,
    top ? `L${a} 0 C${a - 20} ${-top * T * 1.3}, ${b + 20} ${-top * T * 1.3}, ${b} 0` : '',
    `L${S} 0`,
    right ? `L${S} ${a} C${S + right * T * 1.3} ${a - 20}, ${S + right * T * 1.3} ${b + 20}, ${S} ${b}` : '',
    `L${S} ${S}`,
    bottom ? `L${b} ${S} C${b + 20} ${S + bottom * T * 1.3}, ${a - 20} ${S + bottom * T * 1.3}, ${a} ${S}` : '',
    `L0 ${S}`,
    left ? `L0 ${b} C${-left * T * 1.3} ${b + 20}, ${-left * T * 1.3} ${a - 20}, 0 ${a}` : '',
    'Z',
  ].join(' ');
};

export const Piece: React.FC<{
  edges: [Edge, Edge, Edge, Edge];
  fill: string;
  stroke?: string;
  dashed?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({edges, fill, stroke = 'rgba(0,0,0,0.15)', dashed, children, style}) => (
  <div style={{position: 'absolute', width: S, height: S, ...style}}>
    <svg width={S + 2 * T} height={S + 2 * T} style={{position: 'absolute', left: -T, top: -T, overflow: 'visible'}}>
      <path
        d={piecePath(...edges)}
        transform={`translate(${T} ${T})`}
        fill={fill}
        stroke={stroke}
        strokeWidth={dashed ? 5 : 3}
        strokeDasharray={dashed ? '16 12' : undefined}
        style={{filter: dashed ? 'none' : 'drop-shadow(0 18px 24px rgba(60,40,20,0.25))'}}
      />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>{children}</div>
  </div>
);

const COLS = 4;
const ROWS = 2;
const edgesAt = (r: number, c: number): [Edge, Edge, Edge, Edge] => {
  const h = (rr: number, cc: number): Edge => ((rr + cc) % 2 ? 1 : -1); // الحافة اليمنى للقطعة (rr,cc)
  const v = (cc: number): Edge => (cc % 2 ? 1 : -1); // الحافة السفلى لصف 0
  const top: Edge = r === 0 ? 0 : (-v(c) as Edge);
  const bottom: Edge = r === ROWS - 1 ? 0 : v(c);
  const right: Edge = c === COLS - 1 ? 0 : h(r, c);
  const left: Edge = c === 0 ? 0 : (-h(r, c - 1) as Edge);
  return [top, right, bottom, left];
};

// القطع المحيطة (ما عدا قطعتي الشعارين في الصف الأول، العمودين 1 و 2)
const EXTRA = [
  {r: 0, c: 0, ar: 'تسويق', en: 'MARKETING', fill: COLORS.neoBlue},
  {r: 0, c: 3, ar: 'إرث', en: 'HERITAGE', fill: COLORS.copper},
  {r: 1, c: 0, ar: 'دعاية', en: 'ADVERTISING', fill: COLORS.copper},
  {r: 1, c: 1, ar: 'إعلان', en: 'CAMPAIGNS', fill: COLORS.neoBlue},
  {r: 1, c: 2, ar: 'ثقافة', en: 'CULTURE', fill: COLORS.copper},
  {r: 1, c: 3, ar: 'محتوى', en: 'CONTENT', fill: COLORS.neoBlue},
];

export const PuzzleConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gx = 960 - (COLS * S) / 2;
  const gy = 540 - (ROWS * S) / 2 - 40;

  // المرحلة 1 (0–12 ث): القطعتان كبيرتان في المنتصف تقتربان وتتطابقان عند 11 ث
  const enter = spring({frame: f, fps, config: {damping: 14}});
  const snapT = interpolate(f, [270, 330], [0, 1], clamp);
  const snapEase = snapT < 1 ? 1 - Math.pow(1 - snapT, 3) : 1;
  const gap = interpolate(snapEase, [0, 1], [260, 0]);
  const wob = f < 330 ? Math.sin(f / 18) * 8 * (1 - snapEase) : 0;
  const click = interpolate(f, [330, 336, 360], [0, 1, 0], clamp);
  // المرحلة 2 (12 ث+): تصغير إلى موضعيهما في اللوحة
  const zoom = interpolate(f, [360, 400], [0, 1], clamp);
  const heroScale = interpolate(zoom, [0, 1], [1.5, 1]);
  const done = f >= 610;
  const seams = interpolate(f, [610, 640], [0, 1], clamp);
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  const heroPos = (c: number) => {
    // في البداية: متمركزتان بجانب بعض؛ بعد التصغير: موضعهما في اللوحة
    const startX = 960 + (c === 1 ? -S * heroScale - gap / 2 : gap / 2);
    const startY = 540 - (S * heroScale) / 2 - 90;
    const endX = gx + c * S;
    const endY = gy;
    return {
      left: interpolate(zoom, [0, 1], [startX, endX]),
      top: interpolate(zoom, [0, 1], [startY, endY]) + (c === 1 ? wob : -wob),
    };
  };

  const caption = (from: number, to: number, ar: string, en: string) => {
    const o = interpolate(f, [from, from + 15, to - 12, to], [0, 1, 1, 0], clamp);
    return (
      <div style={{position: 'absolute', bottom: 60, width: '100%', textAlign: 'center', fontFamily: FONT, opacity: o}}>
        <div dir="rtl" style={{fontSize: 78, fontWeight: 900, color: COLORS.navy}}>{ar}</div>
        <div style={{fontSize: 32, letterSpacing: 10, color: COLORS.copper}}>{en}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: COLORS.sand, opacity: out}}>
      <Audio src={staticFile('music-puzzle.wav')} />
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.04) 2px, transparent 2px)',
          backgroundSize: '60px 60px',
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7), transparent 70%)'}} />

      {/* القطع المحيطة تطير إلى أماكنها */}
      {f >= 400 &&
        EXTRA.map((p, i) => {
          const q = spring({frame: f - 410 - i * 15, fps, config: {damping: 13}});
          const fromX = p.c < 2 ? -500 : 2400;
          const fromY = p.r === 0 ? -400 : 1500;
          return (
            <Piece
              key={p.en}
              edges={edgesAt(p.r, p.c)}
              fill={p.fill}
              stroke={done ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.15)'}
              style={{
                left: interpolate(q, [0, 1], [fromX, gx + p.c * S]),
                top: interpolate(q, [0, 1], [fromY, gy + p.r * S]),
                transform: `rotate(${(1 - q) * (i % 2 ? 90 : -90)}deg)`,
                opacity: 1 - seams * 0.15,
              }}
            >
              <div style={{textAlign: 'center', fontFamily: FONT, opacity: 1 - seams}}>
                <div dir="rtl" style={{fontSize: 54, fontWeight: 900, color: '#fff'}}>{p.ar}</div>
                <div style={{fontSize: 20, letterSpacing: 4, color: '#ffffffcc'}}>{p.en}</div>
              </div>
            </Piece>
          );
        })}

      {/* قطعتا الشعارين */}
      {[1, 2].map((c) => {
        const pos = heroPos(c);
        const neo = c === 1;
        return (
          <Piece
            key={c}
            edges={edgesAt(0, c)}
            fill={neo ? COLORS.neoBlack : '#fff'}
            stroke={done ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.15)'}
            style={{
              ...pos,
              transform: `scale(${heroScale * enter}) rotate(${(1 - snapEase) * (neo ? -6 : 6)}deg)`,
              transformOrigin: 'top left',
              opacity: 1 - seams * 0.15,
            }}
          >
            <div style={{opacity: 1 - seams}}>
              {neo ? <NeoLogo size={220} style={{boxShadow: 'none', border: 'none'}} /> : <DiriyahLogo size={220} style={{boxShadow: 'none'}} />}
            </div>
          </Piece>
        );
      })}

      {/* وميض «كليك» */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 150,
          top: 540 - 150 - 90,
          width: 300,
          height: 300,
          borderRadius: '50%',
          border: `8px solid ${COLORS.copper}`,
          transform: `scale(${1 + (1 - click) * 1.5})`,
          opacity: click,
        }}
      />

      {/* اللوحة المكتملة */}
      {done && f < 790 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 80, fontFamily: FONT}}>
          <div dir="rtl" style={{fontSize: 120, fontWeight: 900, color: '#fff', opacity: seams, textShadow: '0 6px 30px rgba(0,0,0,0.35)'}}>
            شراكة استراتيجية
          </div>
          <div style={{fontSize: 44, letterSpacing: 16, color: '#fff', opacity: seams}}>STRATEGIC PARTNERSHIP</div>
        </AbsoluteFill>
      ) : null}

      {caption(95, 190, 'قطعتان مميزتان…', 'TWO UNIQUE PIECES')}
      {caption(195, 300, 'لكن معاً؟', 'BUT TOGETHER?')}
      {caption(335, 405, 'تتطابقان تماماً', 'A PERFECT FIT')}
      {caption(640, 780, 'الصورة اكتملت', 'THE PICTURE IS COMPLETE')}

      {/* الختام */}
      {f >= 790 ? (
        <AbsoluteFill style={{background: COLORS.sand, justifyContent: 'center', alignItems: 'center', gap: 30, fontFamily: FONT, opacity: interpolate(f, [790, 805], [0, 1], clamp)}}>
          <div style={{display: 'flex', gap: 60, alignItems: 'center'}}>
            <NeoLogo size={240} />
            <div style={{fontSize: 90, color: COLORS.navy}}>+</div>
            <DiriyahLogo size={240} />
          </div>
          <div style={{fontSize: 62, fontWeight: 900, color: COLORS.navy}}>Neo Capta × Diriyah Company</div>
          <div dir="rtl" style={{fontSize: 44, fontWeight: 700, color: COLORS.copper}}>قطعتان… وصورة واحدة</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
