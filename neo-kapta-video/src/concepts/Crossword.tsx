// الفكرة 6: «الكلمات المتقاطعة» — صفحة جريدة: شبكة كلمات متقاطعة تُحل حرفاً حرفاً
// (دعاية ↓ · إعلان ↓) وكلمة التقاطع الأخيرة ← «شراكة»، ثم صفحة أولى بالخبر
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const PAPER = '#F3EEE4';
const INK = '#1b1b1f';
const COLS = 7;
const ROWS = 6;
const CELL = 112;

type Word = {letters: string[]; cells: [number, number][]; start: number; num: number; main?: boolean};
// [row, col] — الأعمدة من اليسار، والكلمات الأفقية تُكتب من اليمين لليسار
export const WORDS: Word[] = [
  {num: 2, letters: ['د', 'ع', 'ا', 'ي', 'ة'], cells: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]], start: 270},
  {num: 3, letters: ['إ', 'ع', 'ل', 'ا', 'ن'], cells: [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4]], start: 345},
  {num: 1, letters: ['ش', 'ر', 'ا', 'ك', 'ة'], cells: [[4, 6], [4, 5], [4, 4], [4, 3], [4, 2]], start: 420, main: true},
];
export const LETTER_STEP = 13;

const key = (r: number, c: number) => `${r}-${c}`;

const Paper: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <AbsoluteFill
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.025) 0 1px, transparent 1px 4px)',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(120,90,60,0.25) 100%)'}} />
  </AbsoluteFill>
);

const Grid: React.FC<{solved: number}> = ({solved}) => {
  const f = useCurrentFrame();
  const cells = new Map<string, {letter: string; at: number; main: boolean; num?: number}>();
  for (const w of WORDS) {
    w.cells.forEach(([r, c], i) => {
      const k = key(r, c);
      const prev = cells.get(k);
      const at = w.start + i * LETTER_STEP;
      cells.set(k, {
        letter: w.letters[i],
        at: prev ? Math.min(prev.at, at) : at,
        main: !!w.main || !!prev?.main,
        num: i === 0 ? w.num : prev?.num,
      });
    });
  }
  return (
    <div style={{position: 'relative', width: COLS * CELL, height: ROWS * CELL}}>
      {new Array(ROWS * COLS).fill(0).map((_, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        const cell = cells.get(key(r, c));
        const show = interpolate(f, [100 + i * 1.5, 110 + i * 1.5], [0, 1], clamp);
        const written = cell && f >= cell.at;
        const pop = cell ? interpolate(f, [cell.at, cell.at + 6], [1.6, 1], clamp) : 1;
        const isMain = cell?.main && f >= 480;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: c * CELL,
              top: r * CELL,
              width: CELL,
              height: CELL,
              border: `3px solid ${INK}`,
              marginLeft: -1.5,
              marginTop: -1.5,
              background: cell ? (isMain ? COLORS.copper : '#fff') : INK,
              opacity: show * (cell && !cell.main && solved > 0 ? 1 - solved * 0.6 : 1),
              transform: `scale(${show})`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontFamily: FONT,
            }}
          >
            {cell?.num ? (
              <div style={{position: 'absolute', top: 2, right: 8, fontSize: 22, fontWeight: 700, color: isMain ? '#fff' : INK}}>{cell.num}</div>
            ) : null}
            {written ? (
              <div style={{fontSize: 72, fontWeight: 900, color: isMain ? '#fff' : INK, transform: `scale(${pop})`}}>
                {cell!.letter}
              </div>
            ) : null}
          </div>
        );
      })}
      {/* دائرة حبر نحاسية حول الحل */}
      <svg width={COLS * CELL + 80} height={ROWS * CELL} style={{position: 'absolute', left: -40, top: 0, overflow: 'visible'}}>
        <ellipse
          cx={40 + 4.5 * CELL}
          cy={4.5 * CELL}
          rx={3.0 * CELL}
          ry={0.85 * CELL}
          fill="none"
          stroke={COLORS.copper}
          strokeWidth={8}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - solved}
          transform={`rotate(-3 ${40 + 4.5 * CELL} ${4.5 * CELL})`}
        />
      </svg>
    </div>
  );
};

const Clue: React.FC<{n: string; dir: string; text: string; at: number; done: number}> = ({n, dir, text, at, done}) => {
  const f = useCurrentFrame();
  const chars = Math.max(0, Math.floor((f - at) * 1.6));
  const solved = f >= done;
  return (
    <div dir="rtl" style={{fontSize: 36, color: INK, marginBottom: 22, fontFamily: FONT, lineHeight: 1.5}}>
      <span style={{fontWeight: 900, color: COLORS.copper}}>{n} {dir}: </span>
      <span style={{textDecoration: solved ? 'line-through' : 'none', textDecorationColor: COLORS.copper, textDecorationThickness: 4}}>
        {text.slice(0, chars)}
      </span>
    </div>
  );
};

export const CrosswordConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const solved = interpolate(f, [500, 540], [0, 1], clamp);
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  if (f < 90) {
    // 0–3 ث: الشعاران كختم حبر على الورق
    const ink = (at: number) => interpolate(f, [at, at + 20], [0, 1], clamp);
    const a = ink(2);
    const b = ink(12);
    const stampStyle = (p: number): React.CSSProperties => ({
      transform: `scale(${interpolate(p, [0, 0.3, 1], [1.5, 0.95, 1])}) rotate(${(1 - p) * -8}deg)`,
      opacity: Math.min(1, p * 3),
      filter: `grayscale(${1 - p}) contrast(1.1)`,
    });
    scene = (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: 120, alignItems: 'center'}}>
          <div style={stampStyle(a)}>
            <NeoLogo size={340} style={{boxShadow: 'none', border: `4px solid ${INK}`}} />
          </div>
          <div style={{fontFamily: FONT, fontSize: 110, color: INK, opacity: ink(22)}}>×</div>
          <div style={stampStyle(b)}>
            <DiriyahLogo size={340} style={{boxShadow: 'none', border: `4px solid ${INK}`}} />
          </div>
        </div>
      </AbsoluteFill>
    );
  } else if (f < 690) {
    // 3–23 ث: الجريدة + الشبكة + الحل
    const head = spring({frame: f - 90, fps, config: {damping: 15}});
    scene = (
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 80,
            right: 80,
            borderBottom: `4px double ${INK}`,
            paddingBottom: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontFamily: FONT,
            transform: `translateY(${(1 - head) * -200}px)`,
          }}
        >
          <div style={{fontSize: 28, color: INK, letterSpacing: 6, fontWeight: 700}}>THE CREATIVE TIMES</div>
          <div dir="rtl" style={{fontSize: 64, fontWeight: 900, color: INK}}>جريدة الإبداع</div>
          <div dir="rtl" style={{fontSize: 26, color: INK}}>عدد خاص · كلمات متقاطعة</div>
        </div>
        <div style={{position: 'absolute', top: 210, left: 130}}>
          <Grid solved={solved} />
        </div>
        <div style={{position: 'absolute', top: 230, right: 110, width: 820}}>
          <div dir="rtl" style={{fontFamily: FONT, fontSize: 50, fontWeight: 900, color: INK, borderBottom: `3px solid ${INK}`, marginBottom: 26}}>
            حُلّ اللغز
          </div>
          <Clue n="١" dir="أفقي" text="ما يجمع نيو كابتا وشركة الدرعية (٥)" at={130} done={485} />
          <Clue n="٢" dir="عمودي" text="فنّ جذب الانتباه وبناء الصورة (٥)" at={160} done={335} />
          <Clue n="٣" dir="عمودي" text="رسالة تُنشر لتصل إلى الجميع (٥)" at={190} done={410} />
          {f >= 520 ? (
            <div style={{marginTop: 40, fontFamily: FONT, opacity: solved}}>
              <div dir="rtl" style={{fontSize: 70, fontWeight: 900, color: COLORS.copper}}>الحل: شراكة استراتيجية</div>
              <div style={{fontSize: 30, fontWeight: 700, letterSpacing: 6, color: INK, textAlign: 'right'}}>SOLVED: STRATEGIC PARTNERSHIP</div>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  } else {
    // 23–30 ث: الصفحة الأولى
    const p = spring({frame: f - 692, fps, config: {damping: 14}});
    const st = spring({frame: f - 770, fps, config: {damping: 9, stiffness: 220}});
    scene = (
      <AbsoluteFill style={{fontFamily: FONT, padding: '40px 90px', transform: `scale(${0.9 + p * 0.1})`, opacity: p}}>
        <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: `6px double ${INK}`, alignItems: 'flex-end'}}>
          <div style={{fontSize: 28, letterSpacing: 6, color: INK}}>THE CREATIVE TIMES</div>
          <div dir="rtl" style={{fontSize: 70, fontWeight: 900, color: INK}}>جريدة الإبداع</div>
          <div dir="rtl" style={{fontSize: 26, color: INK}}>الصفحة الأولى</div>
        </div>
        <div dir="rtl" style={{textAlign: 'center', marginTop: 40}}>
          <div style={{fontSize: 130, fontWeight: 900, color: INK, lineHeight: 1.15}}>نيو كابتا × شركة الدرعية</div>
          <div style={{fontSize: 54, fontWeight: 700, color: COLORS.copper}}>شراكة استراتيجية في التسويق والدعاية والإعلان</div>
          <div style={{fontSize: 30, letterSpacing: 6, color: INK, marginTop: 8}}>NEO CAPTA × DIRIYAH COMPANY · STRATEGIC PARTNERSHIP</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 100, marginTop: 50}}>
          <NeoLogo size={230} style={{boxShadow: 'none', border: `4px solid ${INK}`}} />
          <DiriyahLogo size={230} style={{boxShadow: 'none', border: `4px solid ${INK}`}} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 140,
            bottom: 110,
            border: `8px solid ${COLORS.copper}`,
            color: COLORS.copper,
            fontSize: 64,
            fontWeight: 900,
            padding: '6px 34px',
            borderRadius: 16,
            transform: `rotate(-12deg) scale(${interpolate(st, [0, 1], [2.5, 1])})`,
            opacity: f >= 770 ? Math.min(1, st * 2) * 0.9 : 0,
          }}
        >
          ✓ تم الحل
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-crossword.wav')} />
      <Paper />
      {scene}
    </AbsoluteFill>
  );
};
