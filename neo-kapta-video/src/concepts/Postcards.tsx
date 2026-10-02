// الفكرة 12: «بطاقات من الدرعية» — طوابع بريد بالشعارين، ثم بطاقات بريدية بصور الطريف والبجيري
// ووادي حنيفة تتساقط على الطاولة، وآخر بطاقة تنقلب: «إلى العالم… شراكة استراتيجية» + ختم البريد
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {DiriyahImage, Slot} from './diriyah';
import {clamp, useFonts} from './shared';

const RUQAA = "'Aref Ruqaa', serif";
const INK = '#2b2118';

const Table: React.FC = () => (
  <AbsoluteFill style={{background: '#e9dfcf'}}>
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0 2px, transparent 2px 6px)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 45% 40%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(ellipse at center, transparent 60%, rgba(90,60,30,0.3) 100%)'}} />
  </AbsoluteFill>
);

// طابع بريدي بحواف مخرّمة
const Stamp: React.FC<{children: React.ReactNode; size: number; color: string}> = ({children, size, color}) => (
  <div
    style={{
      width: size,
      height: size * 1.2,
      background: '#fff',
      padding: 12,
      border: '9px dotted #e9dfcf',
      boxShadow: '0 10px 24px rgba(0,0,0,0.2)',
    }}
  >
    <div style={{width: '100%', height: '100%', background: color, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10}}>
      {children}
    </div>
  </div>
);

const Postmark: React.FC<{p: number}> = ({p}) => (
  <svg width={300} height={160} style={{opacity: p * 0.75, transform: `scale(${interpolate(p, [0, 1], [1.6, 1])}) rotate(-12deg)`}}>
    <circle cx={80} cy={80} r={64} fill="none" stroke={COLORS.copper} strokeWidth={5} />
    <circle cx={80} cy={80} r={50} fill="none" stroke={COLORS.copper} strokeWidth={2} />
    <text x={80} y={88} textAnchor="middle" fontFamily="Cairo" fontWeight={900} fontSize={24} fill={COLORS.copper}>
      الدرعية
    </text>
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M150 ${48 + i * 22} q 18 -10 36 0 t 36 0 t 36 0 t 36 0`} fill="none" stroke={COLORS.copper} strokeWidth={4} />
    ))}
  </svg>
);

const Card: React.FC<{slot: Slot; caption: string; en: string}> = ({slot, caption, en}) => (
  <div style={{width: 820, height: 600, background: '#fbf8f2', padding: 26, boxShadow: '0 30px 50px rgba(60,40,20,0.35)', display: 'flex', flexDirection: 'column'}}>
    <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
      <DiriyahImage slot={slot} w={768} h={490} />
    </div>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10}}>
      <div style={{fontFamily: FONT, fontSize: 20, letterSpacing: 4, color: COLORS.copper}}>{en}</div>
      <div dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: 44, color: INK}}>{caption}</div>
    </div>
  </div>
);

const CARDS: {slot: Slot; caption: string; en: string; x: number; y: number; rot: number}[] = [
  {slot: 'turaif-sunset', caption: 'تحية من الدرعية', en: 'GREETINGS FROM DIRIYAH', x: 300, y: 120, rot: -6},
  {slot: 'bujairi-terrace', caption: 'سلامات من البجيري', en: 'SALAAM FROM AL BUJAIRI', x: 820, y: 330, rot: 5},
  {slot: 'turaif-wall', caption: 'حيث الطين يحكي', en: 'WHERE MUD-BRICK SPEAKS', x: 160, y: 420, rot: 4},
  {slot: 'wadi-hanifa', caption: 'مستقبل يُبنى', en: 'A FUTURE IN THE MAKING', x: 900, y: 60, rot: -4},
];
const CARD_START = 90;
const CARD_LEN = 120;

export const PostcardsConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  // 0–3 ث: طابعان بالشعارين
  const s1 = spring({frame: f - 4, fps, config: {damping: 11, stiffness: 180}});
  const s2 = spring({frame: f - 16, fps, config: {damping: 11, stiffness: 180}});
  const stampsOut = interpolate(f, [80, 95], [1, 0], clamp);

  // البطاقة الأخيرة تنقلب (19–26 ث)
  const finalIn = spring({frame: f - 570, fps, config: {damping: 14}});
  const flip = interpolate(f, [620, 660], [0, 180], clamp);
  const mark = spring({frame: f - 715, fps, config: {damping: 9, stiffness: 220}});
  const write = interpolate(f, [662, 720], [0, 1], clamp);

  const endP = spring({frame: f - 790, fps, config: {damping: 13}});
  const pan = interpolate(f, [CARD_START, 570], [0, -60], clamp);

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-postcards.wav')} />
      <Table />

      {f < 100 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: stampsOut}}>
          <div style={{display: 'flex', gap: 120}}>
            <div style={{transform: `scale(${interpolate(s1, [0, 1], [1.8, 1])}) rotate(-5deg)`, opacity: Math.min(1, s1 * 2)}}>
              <Stamp size={300} color={COLORS.neoBlack}>
                <NeoLogo size={220} style={{boxShadow: 'none', border: 'none'}} />
                <div style={{fontFamily: FONT, fontSize: 22, color: '#fff', letterSpacing: 3}}>NEO CAPTA</div>
              </Stamp>
            </div>
            <div style={{transform: `scale(${interpolate(s2, [0, 1], [1.8, 1])}) rotate(4deg)`, opacity: Math.min(1, s2 * 2)}}>
              <Stamp size={300} color={COLORS.sand}>
                <DiriyahLogo size={220} style={{boxShadow: 'none'}} />
                <div style={{fontFamily: FONT, fontSize: 22, color: COLORS.copper, letterSpacing: 3}}>DIRIYAH</div>
              </Stamp>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* البطاقات تتساقط واحدة تلو الأخرى */}
      {f >= CARD_START && f < 800 ? (
        <AbsoluteFill style={{transform: `translateY(${pan}px)`, opacity: interpolate(f, [560, 590], [1, 0.35], clamp)}}>
          {CARDS.map((c, i) => {
            const at = CARD_START + i * CARD_LEN;
            if (f < at) return null;
            const p = spring({frame: f - at, fps, config: {damping: 15}});
            return (
              <div
                key={c.slot}
                style={{
                  position: 'absolute',
                  left: c.x,
                  top: c.y,
                  transform: `translate(${(1 - p) * (i % 2 ? 900 : -900)}px, ${(1 - p) * -500}px) rotate(${c.rot + (1 - p) * 40}deg) scale(${1 + (1 - p) * 0.3})`,
                }}
              >
                <Card slot={c.slot} caption={c.caption} en={c.en} />
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}

      {/* البطاقة الأخيرة: وجه بصورة البجيري ليلاً، وظهر برسالة */}
      {f >= 570 && f < 800 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', perspective: 2400}}>
          <div style={{position: 'relative', width: 1100, height: 760, transform: `translateY(${(1 - finalIn) * 900}px) rotateY(${flip}deg)`, transformStyle: 'preserve-3d'}}>
            <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#fbf8f2', padding: 30, boxShadow: '0 40px 70px rgba(60,40,20,0.4)', display: 'flex', flexDirection: 'column'}}>
              <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
                <DiriyahImage slot="bujairi-night" w={1040} h={630} />
              </div>
              <div dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: 50, color: INK, textAlign: 'right', paddingTop: 10}}>
                والبطاقة الأهم…
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: '#fbf8f2',
                boxShadow: '0 40px 70px rgba(60,40,20,0.4)',
                display: 'flex',
                padding: 50,
                gap: 40,
              }}
            >
              {/* يسار: العنوان والطوابع — يمين: الرسالة */}
              <div style={{width: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, borderRight: `3px dashed ${COLORS.copper}`, paddingRight: 30}}>
                <div style={{display: 'flex', gap: 14}}>
                  <Stamp size={120} color={COLORS.neoBlack}>
                    <NeoLogo size={92} style={{boxShadow: 'none', border: 'none'}} />
                  </Stamp>
                  <Stamp size={120} color={COLORS.sand}>
                    <DiriyahLogo size={92} style={{boxShadow: 'none'}} />
                  </Stamp>
                </div>
                <Postmark p={mark} />
                <div dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: 46, color: INK, marginTop: 'auto', borderBottom: `2px solid ${INK}55`, width: '100%', textAlign: 'center'}}>
                  إلى: العالم
                </div>
                <div style={{fontFamily: FONT, fontSize: 22, letterSpacing: 4, color: COLORS.copper}}>TO: THE WORLD</div>
              </div>
              <div dir="rtl" style={{flex: 1, fontFamily: RUQAA, fontWeight: 700, color: INK, clipPath: `inset(0 0 ${(1 - write) * 100}% 0)`}}>
                <div style={{fontSize: 52, lineHeight: 1.7}}>من الدرعية… إلى العالم</div>
                <div style={{fontSize: 46, lineHeight: 1.8}}>يسعدنا أن نعلن</div>
                <div style={{fontSize: 70, lineHeight: 1.5, color: COLORS.copper}}>شراكة استراتيجية</div>
                <div style={{fontSize: 46, lineHeight: 1.8}}>بين نيو كابتا وشركة الدرعية</div>
                <div style={{fontSize: 38, lineHeight: 1.8, color: COLORS.neoBlue}}>تسويق · دعاية · إعلان</div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* الختام */}
      {f >= 790 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30, background: `rgba(233,223,207,${Math.min(1, endP)})`}}>
          <div style={{display: 'flex', gap: 60, alignItems: 'center', transform: `scale(${endP})`}}>
            <Stamp size={220} color={COLORS.neoBlack}>
              <NeoLogo size={170} style={{boxShadow: 'none', border: 'none'}} />
            </Stamp>
            <div style={{fontFamily: FONT, fontSize: 80, color: INK}}>×</div>
            <Stamp size={220} color={COLORS.sand}>
              <DiriyahLogo size={170} style={{boxShadow: 'none'}} />
            </Stamp>
          </div>
          <div dir="rtl" style={{fontFamily: RUQAA, fontWeight: 700, fontSize: 80, color: INK, opacity: endP}}>من الدرعية… إلى العالم</div>
          <div style={{fontFamily: FONT, fontSize: 40, fontWeight: 700, color: COLORS.copper, opacity: endP}}>Neo Capta × Diriyah Company</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
