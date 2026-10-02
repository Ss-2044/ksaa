// الفكرة 14: «رحلة إلى الدرعية» — أسلوب المطار: لوحة رحلات بخانات تتقلب، نداء صعود، بطاقة صعود
// بالشعارين، ثم نافذة طائرة تُفتح على الدرعية من الأعلى: «وصلنا… الوجهة: شراكة استراتيجية»
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

const BOARD = '#111215';
const FLAP = '#1d1f24';
const AMBER = '#F5C04A';

// خانة تتقلب بين كلمات عشوائية حتى تستقر على الكلمة النهائية
const Flap: React.FC<{final: string; at: number; width: number; color?: string; seed: string; dir?: 'rtl' | 'ltr'; size?: number}> = ({
  final,
  at,
  width,
  color = COLORS.sand,
  seed,
  dir = 'ltr',
  size = 40,
}) => {
  const f = useCurrentFrame();
  const POOL = ['الرياض', 'جدة', 'دبي', 'لندن', 'باريس', 'NYC', 'TOKYO', 'CAIRO', '----', '0000', 'ABHA', 'نيوم'];
  const settle = at + 18 + Math.floor(random(seed) * 14);
  const word = f < at ? '' : f >= settle ? final : POOL[Math.floor(random(`${seed}-${Math.floor(f / 2)}`) * POOL.length)];
  const flipping = f >= at && f < settle && f % 2 === 0;
  return (
    <div
      dir={dir}
      style={{
        width,
        height: 70,
        background: FLAP,
        borderRadius: 6,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        color,
        boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.5)',
      }}
    >
      <div style={{transform: flipping ? 'scaleY(0.85)' : 'none'}}>{word}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 34, height: 2, background: '#000'}} />
    </div>
  );
};

const ROWS = [
  {time: '09:00', flight: 'NC 101', dest: 'التسويق', en: 'MARKETING', status: 'أقلعت', c: '#7BD88F'},
  {time: '09:15', flight: 'NC 202', dest: 'الدعاية', en: 'ADVERTISING', status: 'أقلعت', c: '#7BD88F'},
  {time: '09:30', flight: 'NC 303', dest: 'الإعلان', en: 'CAMPAIGNS', status: 'أقلعت', c: '#7BD88F'},
];

const Board: React.FC = () => {
  const f = useCurrentFrame();
  const boarding = Math.floor(f / 10) % 2 === 0;
  const row = (r: (typeof ROWS)[number] & {hl?: boolean}, i: number, at: number) => (
    <div key={r.flight} style={{display: 'flex', gap: 14, alignItems: 'center', padding: '8px 18px', background: r.hl ? 'rgba(245,192,74,0.08)' : 'transparent', borderRadius: 10}}>
      <Flap final={r.time} at={at} width={170} seed={`t${i}`} color={AMBER} />
      <Flap final={r.flight} at={at + 4} width={200} seed={`f${i}`} />
      <Flap final={r.dest} at={at + 8} width={330} seed={`d${i}`} dir="rtl" color={r.hl ? AMBER : COLORS.sand} />
      <Flap final={r.en} at={at + 10} width={330} seed={`e${i}`} size={34} />
      <Flap final={r.status} at={at + 14} width={250} seed={`s${i}`} dir="rtl" color={r.c} />
    </div>
  );
  return (
    <div style={{background: BOARD, padding: 30, borderRadius: 20, boxShadow: '0 40px 90px rgba(0,0,0,0.6)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '0 18px', fontFamily: FONT}}>
        <div style={{fontSize: 40, fontWeight: 900, color: AMBER, letterSpacing: 6}}>DEPARTURES</div>
        <div dir="rtl" style={{fontSize: 44, fontWeight: 900, color: AMBER}}>المغادرة</div>
      </div>
      {ROWS.map((r, i) => row(r, i, 100 + i * 10))}
      <div style={{opacity: f < 175 || boarding ? 1 : 0.35}}>
        {row({time: 'الآن', flight: 'NC 2026', dest: 'الدرعية', en: 'DIRIYAH', status: 'صعود', c: AMBER, hl: true}, 3, 140)}
      </div>
    </div>
  );
};

const BoardingPass: React.FC<{p: number; stamp: number}> = ({p, stamp}) => (
  <div
    style={{
      width: 1400,
      height: 620,
      display: 'flex',
      borderRadius: 30,
      overflow: 'hidden',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`,
      fontFamily: FONT,
      position: 'relative',
    }}
  >
    <div style={{flex: 1, background: '#fbf8f2', padding: '34px 50px', display: 'flex', flexDirection: 'column', gap: 18}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 900, letterSpacing: 6, color: COLORS.navy}}>BOARDING PASS</div>
        <div dir="rtl" style={{fontSize: 36, fontWeight: 900, color: COLORS.navy}}>بطاقة صعود</div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>
        <div style={{textAlign: 'center'}}>
          <NeoLogo size={130} />
          <div style={{fontSize: 56, fontWeight: 900, color: COLORS.navy}}>NC</div>
          <div style={{fontSize: 24, color: '#666'}}>NEO CAPTA</div>
        </div>
        <div style={{flex: 1, margin: '0 40px', borderTop: `4px dashed ${COLORS.copper}`, position: 'relative'}}>
          <div style={{position: 'absolute', left: '50%', top: -44, marginLeft: -40, fontSize: 70, color: COLORS.copper}}>✈</div>
        </div>
        <div style={{textAlign: 'center'}}>
          <DiriyahLogo size={130} />
          <div style={{fontSize: 56, fontWeight: 900, color: COLORS.navy}}>DRY</div>
          <div style={{fontSize: 24, color: '#666'}}>DIRIYAH</div>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 'auto', fontSize: 22, color: '#666'}}>
        {[
          ['FLIGHT', 'NC 2026'],
          ['CLASS', 'STRATEGIC'],
          ['GATE', 'A1'],
          ['SEAT', '1A'],
        ].map(([k, v]) => (
          <div key={k}>
            <div>{k}</div>
            <div style={{fontSize: 38, fontWeight: 900, color: COLORS.navy}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{width: 340, background: COLORS.neoBlue, borderLeft: '6px dashed #fbf8f2', padding: 34, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff'}}>
      <div dir="rtl" style={{fontSize: 34, fontWeight: 900, lineHeight: 1.5}}>
        الرحلة:
        <br />
        شراكة استراتيجية
      </div>
      <div style={{display: 'flex', gap: 4, height: 110, alignItems: 'stretch'}}>
        {seeded(36, 'bc').map((b, i) => (
          <div key={i} style={{width: 2 + Math.round(b.a * 5), background: '#fff'}} />
        ))}
      </div>
    </div>
    <div
      style={{
        position: 'absolute',
        right: 470,
        top: 250,
        border: `7px solid ${COLORS.copper}`,
        color: COLORS.copper,
        fontSize: 52,
        fontWeight: 900,
        padding: '4px 28px',
        borderRadius: 14,
        transform: `rotate(-14deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})`,
        opacity: stamp > 0 ? Math.min(1, stamp * 2) * 0.9 : 0,
      }}
    >
      ✓ صعود
    </div>
  </div>
);

// نافذة الطائرة على الدرعية
const PlaneWindow: React.FC<{t: number}> = ({t}) => {
  const shade = interpolate(t, [10, 45], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #d9d6cf, #b9b5ad)', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{width: 560, height: 800, borderRadius: 280, padding: 40, background: 'linear-gradient(180deg, #f2f0eb, #cfcac1)', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.25), 0 20px 60px rgba(0,0,0,0.25)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 240, overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'}}>
          <Img
            src={staticFile('diriyah/aerial.jpg')}
            style={{position: 'absolute', height: '100%', left: -400 - t * 3, top: 0, transform: `scale(${1.1 + t * 0.002})`}}
          />
          {seeded(5, 'cl').map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 600 - ((t * (4 + c.a * 4) + c.x * 900) % 1200),
                top: c.y * 600,
                width: 300,
                height: 120,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.8)',
                filter: 'blur(30px)',
                opacity: interpolate(t, [0, 120], [0.9, 0.2], clamp),
              }}
            />
          ))}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: `${(1 - shade) * 100}%`, background: 'linear-gradient(180deg, #e8e5df, #cfcac1)', borderBottom: '10px solid #b5b0a6'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const FlightConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  if (f < 90) {
    // 0–3 ث: الشعاران كشركتي طيران فوق صالة المطار
    const a = spring({frame: f, fps, config: {damping: 13}});
    const b = spring({frame: f - 8, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #2a2c33, ${BOARD})`, justifyContent: 'center', alignItems: 'center', gap: 40, fontFamily: FONT}}>
        <div style={{display: 'flex', gap: 100, alignItems: 'center'}}>
          <div style={{transform: `translateX(${(1 - a) * -600}px)`}}><NeoLogo size={330} /></div>
          <div style={{fontSize: 110, color: AMBER, transform: `scale(${b}) rotate(${(1 - b) * -90}deg)`}}>✈</div>
          <div style={{transform: `translateX(${(1 - b) * 600}px)`}}><DiriyahLogo size={330} /></div>
        </div>
      </AbsoluteFill>
    );
  } else if (f < 270) {
    // 3–9 ث: لوحة الرحلات + النداء
    const call = interpolate(f, [190, 205], [0, 1], clamp);
    scene = (
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 30%, #2a2c33, ${BOARD})`, justifyContent: 'center', alignItems: 'center', gap: 40}}>
        <Board />
        <div style={{textAlign: 'center', fontFamily: FONT, opacity: call}}>
          <div dir="rtl" style={{fontSize: 64, fontWeight: 900, color: '#fff'}}>🔔 النداء الأخير للرحلة المتجهة إلى الدرعية</div>
          <div style={{fontSize: 30, letterSpacing: 8, color: AMBER}}>FINAL CALL FOR FLIGHT NC 2026 TO DIRIYAH</div>
        </div>
      </AbsoluteFill>
    );
  } else if (f < 450) {
    // 9–15 ث: بطاقة الصعود
    const t = f - 270;
    const print = interpolate(t, [5, 45], [0, 1], clamp);
    const stamp = spring({frame: t - 110, fps, config: {damping: 9, stiffness: 220}});
    scene = (
      <AbsoluteFill style={{background: `linear-gradient(160deg, ${COLORS.navy}, ${COLORS.neoBlack})`, justifyContent: 'center', alignItems: 'center'}}>
        <div style={{transform: `rotate(${interpolate(t, [0, 180], [-3, 2])}deg)`}}>
          <BoardingPass p={print} stamp={t >= 110 ? stamp : 0} />
        </div>
      </AbsoluteFill>
    );
  } else if (f < 690) {
    // 15–23 ث: نافذة الطائرة
    const t = f - 450;
    const txt = interpolate(t, [60, 80], [0, 1], clamp);
    scene = (
      <AbsoluteFill>
        <PlaneWindow t={t} />
        <div style={{position: 'absolute', right: 110, top: 380, textAlign: 'right', fontFamily: FONT, opacity: txt}}>
          <div dir="rtl" style={{fontSize: 90, fontWeight: 900, color: COLORS.navy}}>وصلنا…</div>
          <div dir="rtl" style={{fontSize: 110, fontWeight: 900, color: COLORS.copper}}>الدرعية</div>
          <div style={{fontSize: 30, letterSpacing: 8, color: COLORS.navy}}>WELCOME TO DIRIYAH</div>
        </div>
        <div style={{position: 'absolute', left: 110, top: 440, fontFamily: FONT, opacity: txt}}>
          <div style={{fontSize: 26, color: '#555', letterSpacing: 4}}>ALTITUDE</div>
          <div style={{fontSize: 56, fontWeight: 900, color: COLORS.navy}}>{Math.max(0, Math.round(interpolate(t, [0, 240], [12000, 600])))} ft</div>
        </div>
      </AbsoluteFill>
    );
  } else if (f < 810) {
    // 23–27 ث: الوجهة — شراكة استراتيجية
    const t = f - 690;
    const p = spring({frame: t - 5, fps, config: {damping: 12}});
    scene = (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `scale(${1.15 - t * 0.0012})`}}>
          <Img src={staticFile('diriyah/aerial.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,6,10,0.2), rgba(5,6,10,0.75))'}} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 14}}>
          <div style={{fontSize: 34, letterSpacing: 10, color: AMBER, opacity: p}}>DESTINATION · الوجهة</div>
          <div dir="rtl" style={{fontSize: 160, fontWeight: 900, color: '#fff', transform: `scale(${p})`}}>شراكة استراتيجية</div>
          <div dir="rtl" style={{fontSize: 44, fontWeight: 700, color: COLORS.sand, opacity: p}}>تسويق · دعاية · إعلان</div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else {
    const p = spring({frame: f - 812, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={{background: BOARD, justifyContent: 'center', alignItems: 'center', gap: 30, fontFamily: FONT}}>
        <div style={{display: 'flex', gap: 70, alignItems: 'center', transform: `scale(${p})`}}>
          <NeoLogo size={240} />
          <div style={{fontSize: 90, color: AMBER}}>✈</div>
          <DiriyahLogo size={240} />
        </div>
        <div style={{fontSize: 56, fontWeight: 900, color: '#fff', opacity: p}}>Neo Capta × Diriyah Company</div>
        <div dir="rtl" style={{fontSize: 44, fontWeight: 700, color: AMBER, opacity: p}}>رحلة بدأت للتو</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out, background: BOARD}}>
      <Audio src={staticFile('music-flight.wav')} />
      {scene}
    </AbsoluteFill>
  );
};
