// الفيلم ٩ (فكرة ٣١): «مخطط» — مخطط هندسي أزرق يرسم برجاً نجدياً ثم يتحول إلى الصورة الحقيقية،
// ثم مخططات حملة (لوحة طرق، ريلز، شاشة، منشور) تمتلئ بالمحتوى، وختم «معتمد». «من المخطط… إلى المعلَم»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {AERIAL, CROPS, CineFrame, Crop, GOLD, LuxText, TOWER} from './cine';
import {clamp, useFonts} from './shared';

const BP = '#0E1F5C';
const LINE = 'rgba(235,242,255,0.92)';

const Grid: React.FC<{o?: number}> = ({o = 1}) => (
  <AbsoluteFill
    style={{
      opacity: o,
      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.13) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.13) 1.5px, transparent 1.5px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
      backgroundSize: '150px 150px, 150px 150px, 30px 30px, 30px 30px',
      backgroundPosition: '-15px -15px',
    }}
  />
);

const wallX = (y: number) => [770 + ((880 - y) / 550) * 40, 1150 - ((880 - y) / 550) * 40];

const crenels = (() => {
  let d = 'M810 330 ';
  for (let i = 0; i < 10; i++) {
    const x = 810 + i * 30;
    d += `L${x + 4} 330 L${x + 4} 314 L${x + 9} 314 L${x + 9} 298 L${x + 21} 298 L${x + 21} 314 L${x + 26} 314 L${x + 26} 330 L${x + 30} 330 `;
  }
  return d;
})();
const tri = (cx: number, cy: number) => `M${cx - 13} ${cy + 12} L${cx} ${cy - 12} L${cx + 13} ${cy + 12} Z`;

const TOWER_PATHS = [
  'M600 880 L1320 880',
  'M770 880 L810 330',
  'M1150 880 L1110 330',
  crenels,
  `M${wallX(610)[0]} 610 L${wallX(610)[1]} 610`,
  `M${wallX(470)[0]} 470 L${wallX(470)[1]} 470`,
  tri(900, 400) + tri(960, 400) + tri(1020, 400),
  tri(880, 540) + tri(960, 540) + tri(1040, 540),
  'M855 660 h32 v52 h-32 Z M1033 660 h32 v52 h-32 Z',
  'M925 880 L925 765 Q960 735 995 765 L995 880',
];

const Draw: React.FC<{paths: string[]; p: number; width?: number; color?: string}> = ({paths, p, width = 3, color = LINE}) => (
  <>
    {paths.map((d, i) => {
      const q = Math.min(1, Math.max(0, p * paths.length - i));
      return q > 0 ? <path key={i} d={d} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - q} /> : null;
    })}
  </>
);

const Label: React.FC<{x: number; y: number; o: number; children: React.ReactNode; anchor?: 'start' | 'end' | 'middle'; size?: number}> = ({x, y, o, children, anchor = 'start', size = 26}) => (
  <text x={x} y={y} fill={LINE} fontFamily={FONT} fontSize={size} fontWeight={300} textAnchor={anchor} opacity={o} direction="rtl">
    {children}
  </text>
);

// مخطط برج + أبعاد + ملاحظات
const TowerPlan: React.FC<{p: number; notes: number}> = ({p, notes}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
    <Draw paths={TOWER_PATHS} p={p} />
    <g opacity={notes} stroke={LINE} strokeWidth={1.5} fill="none">
      <path d="M1240 880 L1240 298 M1228 880 L1252 880 M1228 298 L1252 298" strokeDasharray="8 6" />
      <path d="M770 935 L1150 935 M770 923 L770 947 M1150 923 L1150 947" strokeDasharray="8 6" />
      <path d="M1100 306 L1290 236 L1480 236" />
      <path d="M1033 400 L1290 400 L1480 400" />
      <path d="M786 700 L600 700 L440 700" />
    </g>
    <g fill={LINE} opacity={notes}>
      <circle cx={1100} cy={306} r={5} />
      <circle cx={1033} cy={400} r={5} />
      <circle cx={786} cy={700} r={5} />
    </g>
    <Label x={1262} y={600} o={notes} anchor="start" size={24}>18.40 م</Label>
    <Label x={960} y={965} o={notes} anchor="middle" size={24}>9.20 م</Label>
    <Label x={1480} y={226} o={notes} anchor="end">شُرفات نجدية</Label>
    <Label x={1480} y={390} o={notes} anchor="end">فتحات تهوية مثلثة</Label>
    <Label x={600} y={690} o={notes} anchor="end">جدار من الطين واللبن</Label>
  </svg>
);

type Frame = {x: number; y: number; w: number; h: number; r?: number; label: string; crop?: Crop; logos?: boolean};
const FRAMES: Frame[] = [
  {x: 160, y: 230, w: 700, h: 270, label: 'لوحة طرق · 12×4 م', crop: 'aerialWide'},
  {x: 1000, y: 210, w: 240, h: 470, r: 34, label: 'ريلز · 9:16', crop: 'towerNight'},
  {x: 1320, y: 230, w: 460, h: 280, label: 'شاشة رقمية', crop: 'architecture'},
  {x: 1460, y: 660, w: 220, h: 220, label: 'منشور · 1:1', logos: true},
];

const CampaignPlan: React.FC<{p: number; fill: (i: number) => number}> = ({p, fill}) => {
  const rect = (fr: Frame) => {
    const r = fr.r ?? 6;
    return `M${fr.x + r} ${fr.y} H${fr.x + fr.w - r} Q${fr.x + fr.w} ${fr.y} ${fr.x + fr.w} ${fr.y + r} V${fr.y + fr.h - r} Q${fr.x + fr.w} ${fr.y + fr.h} ${fr.x + fr.w - r} ${fr.y + fr.h} H${fr.x + r} Q${fr.x} ${fr.y + fr.h} ${fr.x} ${fr.y + fr.h - r} V${fr.y + r} Q${fr.x} ${fr.y} ${fr.x + r} ${fr.y} Z`;
  };
  const extras = ['M380 500 L380 650 M640 500 L640 650 M300 650 L720 650', 'M1550 510 L1550 590 M1470 595 L1630 595', 'M1090 650 h60'];
  return (
    <>
      {FRAMES.map((fr, i) => (
        <div key={i} style={{position: 'absolute', left: fr.x, top: fr.y, width: fr.w, height: fr.h, borderRadius: fr.r ?? 6, overflow: 'hidden', opacity: fill(i)}}>
          {fr.logos ? (
            <div style={{width: '100%', height: '100%', background: COLORS.navy, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12}}>
              <NeoLogo size={80} style={{boxShadow: 'none'}} />
              <DiriyahLogo size={80} style={{boxShadow: 'none'}} />
            </div>
          ) : (
            <Img src={CROPS[fr.crop!].src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: CROPS[fr.crop!].pos}} />
          )}
          {i === 0 ? (
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.55), transparent 65%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 36, fontFamily: FONT, color: '#fff'}}>
              <div style={{fontSize: 40, fontWeight: 700}}>Neo Capta × Diriyah</div>
              <div dir="rtl" style={{fontSize: 30, color: GOLD, textAlign: 'left'}}>شراكة استراتيجية</div>
            </div>
          ) : null}
        </div>
      ))}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Draw paths={[...FRAMES.map(rect), ...extras]} p={p} width={3} />
        {FRAMES.map((fr, i) => (
          <Label key={i} x={fr.x + fr.w} y={fr.y - 16} o={interpolate(p, [0.5, 1], [0, 1], clamp)} anchor="end" size={24}>
            {fr.label}
          </Label>
        ))}
      </svg>
    </>
  );
};

export const FilmBlueprint: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  const draw = interpolate(f, [15, 200], [0, 1], clamp);
  const notes = interpolate(f, [170, 210, 245, 265], [0, 1, 1, 0], clamp);
  const scan = interpolate(f, [240, 320], [0, 1], {...clamp, easing: (x) => x * x * (3 - 2 * x)});
  const scanY = 1080 - scan * 1080;
  const planO = interpolate(f, [300, 340], [1, 0], clamp);
  const camp = interpolate(f, [395, 490], [0, 1], clamp);
  const fill = (i: number) => interpolate(f, [505 + i * 14, 525 + i * 14], [0, 1], clamp);
  const sheet = spring({frame: f - 600, fps, config: {damping: 18}});
  const stamp = spring({frame: f - 640, fps, config: {damping: 9, stiffness: 180}});
  const gridOut = interpolate(f, [700, 760], [0.9, 0], clamp);
  const endP = spring({frame: f - 795, fps, config: {damping: 18}});

  return (
    <AbsoluteFill style={{background: BP, opacity: out}}>
      <Audio src={staticFile('music-film-blueprint.wav')} />
      <Grid o={interpolate(f, [0, 25], [0, 1], clamp)} />

      {/* ١) مخطط البرج ← الصورة الحقيقية */}
      {f < 395 ? (
        <AbsoluteFill>
          {f >= 240 ? (
            <AbsoluteFill style={{clipPath: `inset(${scanY}px 0 0 0)`}}>
              <Img src={TOWER} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 48%', transform: `scale(${1.05 + (f - 240) * 0.0006})`}} />
            </AbsoluteFill>
          ) : null}
          <AbsoluteFill style={{opacity: planO}}>
            <TowerPlan p={draw} notes={notes} />
          </AbsoluteFill>
          {f >= 240 && f < 322 ? <div style={{position: 'absolute', left: 0, right: 0, top: scanY - 2, height: 4, background: '#fff', boxShadow: '0 0 30px 8px rgba(160,190,255,0.8)'}} /> : null}
          <AbsoluteFill style={{background: BP, opacity: interpolate(f, [375, 395], [0, 1], clamp)}} />
        </AbsoluteFill>
      ) : null}
      <LuxText from={20} to={235} top={140} size={60} weight={300}>كل أثرٍ عظيم… بدأ بمخطط.</LuxText>
      <LuxText from={260} to={385} bottom={160} size={70}>الدرعية بُنيت بإتقان.</LuxText>

      {/* ٢) مخططات الحملة تمتلئ بالمحتوى */}
      {f >= 390 && f < 610 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [595, 610], [1, 0], clamp)}}>
          <CampaignPlan p={camp} fill={fill} />
        </AbsoluteFill>
      ) : null}
      <LuxText from={405} to={505} bottom={150} size={60}>ونحن نصمّم الحضور… بالإتقان نفسه.</LuxText>
      <LuxText from={515} to={600} bottom={150} size={60} color={GOLD}>من المخطط… إلى الواقع.</LuxText>

      {/* ٣) لوحة العنوان + ختم معتمد */}
      {f >= 600 && f < 705 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: interpolate(f, [690, 705], [1, 0], clamp)}}>
          <div dir="rtl" style={{width: 1100, border: `3px solid ${LINE}`, fontFamily: FONT, color: LINE, transform: `scale(${0.92 + sheet * 0.08})`, opacity: sheet}}>
            {[
              ['المشروع', 'شراكة استراتيجية'],
              ['الطرفان', 'نيو كابتا × شركة الدرعية'],
              ['النطاق', 'تسويق · دعاية · إعلان · محتوى'],
              ['الحالة', ''],
            ].map(([k, v], i) => (
              <div key={i} style={{display: 'flex', borderBottom: i < 3 ? `1.5px solid ${LINE}` : 'none', fontSize: 40, height: 92, alignItems: 'center'}}>
                <div style={{width: 260, paddingRight: 30, fontWeight: 300, opacity: 0.7, borderLeft: `1.5px solid ${LINE}`, height: '100%', display: 'flex', alignItems: 'center'}}>{k}</div>
                <div style={{paddingRight: 30, fontWeight: 700}}>{v}</div>
              </div>
            ))}
          </div>
          {f >= 640 ? (
            <div
              style={{
                position: 'absolute',
                left: 700,
                top: 625,
                transform: `rotate(-10deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`,
                opacity: Math.min(1, stamp * 2),
                border: `7px solid ${COLORS.copperLight}`,
                borderRadius: 18,
                padding: '4px 40px',
                fontFamily: FONT,
                fontSize: 76,
                fontWeight: 900,
                color: COLORS.copperLight,
                letterSpacing: 6,
                textAlign: 'center',
                lineHeight: 1.1,
              }}
            >
              <div dir="rtl">معتمد</div>
              <div style={{fontSize: 24, letterSpacing: 10}}>APPROVED</div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* ٤) الدرعية: المعلَم */}
      {f >= 698 && f < 800 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [698, 712, 788, 800], [0, 1, 1, 0], clamp)}}>
          <Img src={AERIAL} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.12 - (f - 698) * 0.0008})`}} />
          <AbsoluteFill style={{background: BP, opacity: gridOut * 0.5}} />
          <Grid o={gridOut} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.6))'}} />
          <LuxText from={712} to={798} bottom={190} size={72}>شراكةٌ تُبنى… لتبقى.</LuxText>
          <LuxText from={725} to={798} bottom={140} size={26} dir="ltr" spacing={10} weight={300} color={GOLD}>FROM BLUEPRINT TO LANDMARK</LuxText>
        </AbsoluteFill>
      ) : null}

      {f >= 790 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 24, fontFamily: FONT, opacity: interpolate(f, [790, 805], [0, 1], clamp)}}>
          <div style={{display: 'flex', gap: 60, alignItems: 'center', opacity: endP, transform: `translateY(${(1 - endP) * 20}px)`}}>
            <NeoLogo size={190} />
            <div style={{fontSize: 70, fontWeight: 200, color: GOLD}}>×</div>
            <DiriyahLogo size={190} />
          </div>
          <div style={{fontSize: 54, fontWeight: 200, letterSpacing: 10, color: '#fff', opacity: endP}}>FROM BLUEPRINT TO LANDMARK</div>
          <div dir="rtl" style={{fontSize: 40, color: GOLD, opacity: endP}}>شراكة استراتيجية</div>
        </AbsoluteFill>
      ) : null}

      <CineFrame />
    </AbsoluteFill>
  );
};
