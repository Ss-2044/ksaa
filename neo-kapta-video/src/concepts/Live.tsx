// الفكرة 9: «البث المباشر» (عمودي 9:16) — الإعلان كبث مباشر: عدّاد مشاهدين، تعليقات، قلوب،
// ثم «انضمت شركة الدرعية إلى البث» والكشف، وتعليق مثبّت، و«انتهى البث… وبدأت الشراكة»
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

const LIVE = '#E5484D';

type C = {at: number; user: string; text: string; color: string; system?: boolean};
const COMMENTS: C[] = [
  {at: 100, user: 'nouf.design', text: 'يا هلا 👋', color: '#8E7CF0'},
  {at: 125, user: 'abu_fahad', text: 'وش الخبر؟؟', color: '#4FB3A9'},
  {at: 150, user: 'riyadh.vibes', text: '🔥🔥🔥', color: '#E0A04F'},
  {at: 180, user: 'sara.mkt', text: 'لا تطولون علينا 😂', color: '#E5708B'},
  {at: 215, user: 'creative.sa', text: 'أكيد شي كبير', color: '#5B8DEF'},
  {at: 300, user: 'hessa.art', text: 'مع مين؟ 🤔', color: '#C77DDB'},
  {at: 330, user: 'khaled_x', text: 'الدرعية؟؟', color: '#6CC16F'},
  {at: 365, user: 'noura.ux', text: 'قلبي يقول شي تاريخي', color: '#F08A5D'},
  {at: 470, user: '', text: 'انضمت شركة الدرعية إلى البث', color: COLORS.copper, system: true},
  {at: 500, user: 'riyadh.vibes', text: 'مبرووووك 🎉', color: '#E0A04F'},
  {at: 522, user: 'sara.mkt', text: 'شراكة تاريخية 👏', color: '#E5708B'},
  {at: 545, user: 'creative.sa', text: '💙🤎', color: '#5B8DEF'},
  {at: 570, user: 'abu_fahad', text: 'يستاهلون والله', color: '#4FB3A9'},
  {at: 600, user: 'nouf.design', text: 'متحمسين للحملات 😍', color: '#8E7CF0'},
];

const viewers = (f: number) =>
  f < 90
    ? interpolate(f, [0, 90], [0, 120])
    : f < 450
      ? interpolate(f, [90, 450], [120, 3400])
      : interpolate(f, [450, 620], [3400, 12800], clamp);

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${Math.round(n)}`);

const Feed: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + Math.sin(f / 50) * 20}% ${30 + Math.cos(f / 60) * 10}%, ${COLORS.neoBlue} 0%, transparent 45%),
          radial-gradient(circle at ${70 + Math.cos(f / 45) * 15}% ${75 + Math.sin(f / 55) * 10}%, ${COLORS.copper} 0%, transparent 45%),
          ${COLORS.neoBlack}`,
      }}
    />
  );
};

const Hearts: React.FC<{boost: number}> = ({boost}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {seeded(40, 'ht').map((h, i) => {
        if (i > 12 + boost * 28) return null;
        const period = 90 + h.a * 60;
        const t = ((f + h.b * period) % period) / period;
        const c = [COLORS.neoBlueLight, COLORS.copperLight, '#fff', LIVE][i % 4];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              right: 50 + Math.sin(t * 6 + i) * 30 + h.x * 40,
              top: 1500 - t * 700,
              fontSize: 44 + h.y * 30,
              color: c,
              opacity: 1 - t,
              transform: `scale(${0.6 + t})`,
            }}
          >
            ♥
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Comments: React.FC = () => {
  const f = useCurrentFrame();
  const visible = COMMENTS.filter((c) => f >= c.at).slice(-4);
  return (
    <div style={{position: 'absolute', left: 36, right: 200, bottom: 190, display: 'flex', flexDirection: 'column', gap: 14}}>
      {visible.map((c) => {
        const p = interpolate(f, [c.at, c.at + 8], [0, 1], clamp);
        return (
          <div
            key={c.at}
            dir="rtl"
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'center',
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              fontFamily: FONT,
              background: c.system ? `${COLORS.copper}cc` : 'transparent',
              borderRadius: 20,
              padding: c.system ? '8px 18px' : 0,
              alignSelf: 'flex-start',
            }}
          >
            {!c.system ? <div style={{width: 52, height: 52, borderRadius: 26, background: c.color, flexShrink: 0}} /> : null}
            <div style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>
              {c.user ? <div style={{fontSize: 26, fontWeight: 700, color: '#ffffffcc'}}>{c.user}</div> : null}
              <div style={{fontSize: 34, fontWeight: c.system ? 900 : 700, color: '#fff'}}>{c.text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div dir="rtl" style={{position: 'absolute', top: 70, left: 36, right: 36, display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT}}>
      <div style={{width: 84, height: 84, borderRadius: 42, overflow: 'hidden', border: `4px solid ${LIVE}`}}>
        <NeoLogo size={76} style={{borderRadius: 38, boxShadow: 'none', border: 'none'}} />
      </div>
      <div style={{fontSize: 34, fontWeight: 900, color: '#fff'}}>neo.capta</div>
      {f >= 470 ? (
        <>
          <div style={{fontSize: 34, color: '#fff'}}>+</div>
          <div style={{width: 84, height: 84, borderRadius: 42, overflow: 'hidden', border: `4px solid ${LIVE}`, background: COLORS.sand}}>
            <DiriyahLogo size={76} style={{boxShadow: 'none', border: 'none'}} />
          </div>
        </>
      ) : null}
      <div style={{flex: 1}} />
      <div style={{background: LIVE, color: '#fff', fontSize: 28, fontWeight: 900, padding: '4px 18px', borderRadius: 10}}>مباشر</div>
      <div style={{background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 28, fontWeight: 700, padding: '4px 18px', borderRadius: 10}}>
        👁 {fmt(viewers(f))}
      </div>
    </div>
  );
};

const InputBar: React.FC = () => (
  <div dir="rtl" style={{position: 'absolute', bottom: 70, left: 36, right: 36, display: 'flex', gap: 20, alignItems: 'center', fontFamily: FONT}}>
    <div style={{flex: 1, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 50, padding: '18px 30px', fontSize: 30, color: '#ffffffaa'}}>
      أضف تعليقاً…
    </div>
    <div style={{fontSize: 56, color: '#fff'}}>♡</div>
    <div style={{fontSize: 50, color: '#fff'}}>➤</div>
  </div>
);

export const LiveConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const center: React.CSSProperties = {justifyContent: 'center', alignItems: 'center', fontFamily: FONT, paddingBottom: 300};
  let content: React.ReactNode;

  if (f < 90) {
    const a = spring({frame: f, fps, config: {damping: 12}});
    const b = spring({frame: f - 10, fps, config: {damping: 12}});
    const ring = (f % 30) / 30;
    content = (
      <AbsoluteFill style={{...center, gap: 30}}>
        <div style={{position: 'relative', transform: `scale(${a})`}}>
          <NeoLogo size={330} />
          <div style={{position: 'absolute', inset: -20, borderRadius: 60, border: `5px solid ${LIVE}`, transform: `scale(${1 + ring * 0.25})`, opacity: 1 - ring}} />
        </div>
        <div style={{fontSize: 90, color: '#fff'}}>×</div>
        <div style={{transform: `scale(${b})`}}>
          <DiriyahLogo size={330} />
        </div>
      </AbsoluteFill>
    );
  } else if (f < 300) {
    const p = spring({frame: f - 95, fps, config: {damping: 12}});
    content = (
      <AbsoluteFill style={center}>
        <div dir="rtl" style={{fontSize: 130, fontWeight: 900, color: '#fff', transform: `scale(${p})`, textAlign: 'center', lineHeight: 1.3}}>
          عندنا لكم
          <br />
          خبر…
        </div>
        <div style={{fontSize: 40, letterSpacing: 10, color: COLORS.copperLight, opacity: p}}>WE HAVE NEWS…</div>
      </AbsoluteFill>
    );
  } else if (f < 450) {
    const pulse = 1 + 0.08 * Math.sin(f / 5);
    content = (
      <AbsoluteFill style={center}>
        <div dir="rtl" style={{fontSize: 110, fontWeight: 900, color: '#fff'}}>مع مين؟</div>
        <div style={{fontSize: 420, fontWeight: 900, color: COLORS.copperLight, transform: `scale(${pulse})`, lineHeight: 1.1}}>؟</div>
      </AbsoluteFill>
    );
  } else if (f < 630) {
    const s = spring({frame: f - 452, fps, config: {damping: 14}});
    const t = spring({frame: f - 490, fps, config: {damping: 11}});
    content = (
      <AbsoluteFill>
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: `linear-gradient(180deg, ${COLORS.navy}, ${COLORS.neoBlue})`, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `translateY(${(1 - s) * -100}%)`}}>
          <NeoLogo size={340} />
        </div>
        <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: `linear-gradient(0deg, #2a1810, ${COLORS.copper})`, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 150, transform: `translateY(${(1 - s) * 100}%)`}}>
          <DiriyahLogo size={270} />
        </div>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{background: COLORS.neoBlack, padding: '24px 50px', borderRadius: 24, textAlign: 'center', transform: `scale(${t})`, border: `3px solid ${COLORS.copperLight}`, fontFamily: FONT}}>
            <div dir="rtl" style={{fontSize: 92, fontWeight: 900, color: '#fff'}}>شراكة استراتيجية</div>
            <div style={{fontSize: 32, letterSpacing: 8, color: COLORS.copperLight}}>STRATEGIC PARTNERSHIP</div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else if (f < 780) {
    const p = spring({frame: f - 640, fps, config: {damping: 13}});
    content = (
      <AbsoluteFill style={center}>
        <div style={{display: 'flex', gap: 40, marginBottom: 50, opacity: 0.9}}>
          <NeoLogo size={200} />
          <DiriyahLogo size={200} />
        </div>
        <div
          dir="rtl"
          style={{
            width: 900,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 30,
            padding: '30px 40px',
            transform: `translateY(${(1 - p) * 300}px)`,
            opacity: p,
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{fontSize: 30, fontWeight: 700, color: COLORS.copper}}>📌 تعليق مثبّت · neo.capta</div>
          <div style={{fontSize: 50, fontWeight: 900, color: COLORS.neoBlack, lineHeight: 1.4, marginTop: 8}}>
            نيو كابتا × شركة الدرعية: شراكة استراتيجية في التسويق والدعاية والإعلان
          </div>
        </div>
      </AbsoluteFill>
    );
  } else {
    const p = spring({frame: f - 782, fps, config: {damping: 13}});
    content = (
      <AbsoluteFill style={{background: 'rgba(5,6,10,0.85)', justifyContent: 'center', alignItems: 'center', gap: 30, fontFamily: FONT, opacity: interpolate(f, [880, 900], [1, 0], clamp)}}>
        <div dir="rtl" style={{fontSize: 48, fontWeight: 700, color: '#ffffffaa'}}>انتهى البث المباشر</div>
        <div dir="rtl" style={{fontSize: 100, fontWeight: 900, color: '#fff', transform: `scale(${p})`}}>…وبدأت الشراكة</div>
        <div style={{display: 'flex', gap: 40, marginTop: 30, opacity: p}}>
          <NeoLogo size={220} />
          <DiriyahLogo size={220} />
        </div>
        <div style={{fontSize: 50, fontWeight: 900, color: '#fff', opacity: p}}>Neo Capta × Diriyah Company</div>
        <div style={{fontSize: 30, color: COLORS.copperLight, opacity: p}}>👁 12.8K شاهدوا البث</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Audio src={staticFile('music-live.wav')} />
      <Feed />
      {content}
      {f < 780 ? (
        <>
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 15%, transparent 60%, rgba(0,0,0,0.6) 100%)'}} />
          <Hearts boost={f >= 470 ? 1 : 0} />
          <TopBar />
          <Comments />
          <InputBar />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
