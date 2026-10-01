// الفكرة 1: «الإشعار» — الإعلان كله يُروى عبر شاشة جوال:
// أيقونتا تطبيقين ← إشعارات ← محادثة ← «طلب شراكة» ← قبول + قصاصات احتفال
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, seeded, useFonts} from './shared';

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${30 + Math.sin(f / 60) * 10}% 30%, ${COLORS.neoBlue} 0%, transparent 45%),
          radial-gradient(circle at ${70 - Math.sin(f / 70) * 10}% 75%, ${COLORS.copper} 0%, transparent 40%),
          linear-gradient(160deg, ${COLORS.navy}, ${COLORS.neoBlack})`,
      }}
    />
  );
};

const AppIcon: React.FC<{which: 'neo' | 'dir'; size: number}> = ({which, size}) =>
  which === 'neo' ? (
    <NeoLogo size={size} style={{borderRadius: size * 0.22}} />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: COLORS.sand,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: `0 0 60px ${COLORS.copper}88`,
      }}
    >
      <DiriyahLogo size={size * 0.86} style={{border: 'none', boxShadow: 'none'}} />
    </div>
  );

// 0–3 ث: الشعاران كأيقونتي تطبيقين
const Icons: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: f, fps, config: {damping: 9}});
  const b = spring({frame: f - 8, fps, config: {damping: 9}});
  const out = interpolate(f, [78, 90], [1, 0], clamp);
  const wig = (k: number) => (f > 40 ? Math.sin(f * 0.9 + k) * 3 : 0);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out, transform: `scale(${out})`}}>
      <div style={{display: 'flex', gap: 160, fontFamily: FONT}}>
        {[
          {w: 'neo' as const, p: a, name: 'Neo Capta'},
          {w: 'dir' as const, p: b, name: 'Diriyah Company'},
        ].map((x, i) => (
          <div key={x.name} style={{textAlign: 'center', transform: `scale(${x.p}) rotate(${wig(i * 2)}deg)`}}>
            <AppIcon which={x.w} size={330} />
            <div style={{marginTop: 22, fontSize: 40, fontWeight: 700, color: COLORS.neoWhite}}>{x.name}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Notif: React.FC<{at: number; icon: 'neo' | 'dir'; title: string; body: string; y: number}> = ({
  at,
  icon,
  title,
  body,
  y,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 13}});
  if (f < at) return null;
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute',
        top: y,
        left: 18,
        right: 18,
        padding: '16px 18px',
        borderRadius: 26,
        background: 'rgba(255,255,255,0.16)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        transform: `translateY(${(1 - p) * -120}px)`,
        opacity: p,
        fontFamily: FONT,
      }}
    >
      <AppIcon which={icon} size={62} />
      <div style={{flex: 1}}>
        <div style={{fontSize: 21, fontWeight: 700, color: '#fff'}}>{title}</div>
        <div style={{fontSize: 22, color: '#ffffffcc'}}>{body}</div>
      </div>
    </div>
  );
};

const Bubble: React.FC<{at: number; me: boolean; text: string}> = ({at, me, text}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typing = f >= at - 18 && f < at;
  const p = spring({frame: f - at, fps, config: {damping: 12}});
  if (f < at - 18) return null;
  const dots = (
    <div style={{display: 'flex', gap: 6, padding: '16px 20px'}}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            background: '#fff',
            transform: `translateY(${Math.sin(f / 3 + i) * 4}px)`,
          }}
        />
      ))}
    </div>
  );
  return (
    <div style={{display: 'flex', justifyContent: me ? 'flex-start' : 'flex-end', margin: '8px 0'}}>
      <div
        dir="rtl"
        style={{
          maxWidth: '78%',
          borderRadius: 24,
          background: me ? COLORS.neoBlue : COLORS.copper,
          color: '#fff',
          fontFamily: FONT,
          fontSize: 25,
          fontWeight: 700,
          lineHeight: 1.45,
          transform: typing ? 'none' : `scale(${p})`,
          transformOrigin: me ? 'right bottom' : 'left bottom',
        }}
      >
        {typing ? dots : <div style={{padding: '12px 20px'}}>{text}</div>}
      </div>
    </div>
  );
};

const Confetti: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 90) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {seeded(90, 'cf').map((c, i) => {
        const ang = c.a * Math.PI * 2;
        const v = 14 + c.b * 22;
        const x = 960 + Math.cos(ang) * v * f;
        const y = 560 + Math.sin(ang) * v * f + 0.9 * f * f;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 14,
              height: 24,
              background: [COLORS.neoBlue, COLORS.copper, COLORS.sand, COLORS.neoBlueLight][i % 4],
              transform: `rotate(${f * (8 + c.x * 20)}deg)`,
              opacity: 1 - f / 90,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Side: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 12, to - 10, to], [0, 1, 1, 0], clamp);
  return (
    <>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          right: 1310,
          left: 60,
          top: 470,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.neoWhite,
          opacity: o,
          transform: `translateX(${(1 - o) * -40}px)`,
        }}
      >
        {ar}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1310,
          right: 60,
          top: 490,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: 4,
          color: COLORS.copperLight,
          opacity: o,
          transform: `translateX(${(1 - o) * 40}px)`,
        }}
      >
        {en}
      </div>
    </>
  );
};

// الجوال: 3–22 ث
const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: f - 90, fps, config: {damping: 15}});
  const exit = interpolate(f, [655, 680], [0, 1], clamp);
  const screen = f < 240 ? 'lock' : f < 480 ? 'chat' : 'request';
  const tap = 560;
  const accepted = f >= tap + 4;
  const tapRing = interpolate(f, [tap - 2, tap + 12], [0, 1], clamp);
  if (f < 90 || f > 690) return null;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          width: 500,
          height: 1000,
          borderRadius: 70,
          border: '14px solid #15161c',
          boxShadow: `0 40px 140px rgba(0,0,0,0.7), 0 0 0 2px #333`,
          overflow: 'hidden',
          position: 'relative',
          background: `linear-gradient(180deg, ${COLORS.navy}, #1a1230)`,
          transform: `translateY(${(1 - enter) * 1100 - exit * 1200}px) rotate(${exit * -12}deg) scale(${1 - exit * 0.3})`,
        }}
      >
        {/* النوتش */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            marginLeft: -70,
            width: 140,
            height: 36,
            borderRadius: 18,
            background: '#000',
            zIndex: 5,
          }}
        />
        {screen === 'lock' && (
          <>
            <div style={{position: 'absolute', top: 100, width: '100%', textAlign: 'center', fontFamily: FONT, color: '#fff'}}>
              <div style={{fontSize: 26, opacity: 0.8}}>الأربعاء</div>
              <div style={{fontSize: 120, fontWeight: 700, lineHeight: 1}}>9:41</div>
            </div>
            <Notif at={120} icon="neo" title="Neo Capta" body="عندنا خبر كبير… 👀" y={340} />
            <Notif at={150} icon="dir" title="Diriyah Company" body="ترقّبوا 🔔" y={470} />
            <Notif at={180} icon="neo" title="Neo Capta" body="+٩٩ إشعار جديد" y={600} />
          </>
        )}
        {screen === 'chat' && (
          <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column'}}>
            <div
              dir="rtl"
              style={{
                padding: '64px 22px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.08)',
                fontFamily: FONT,
                color: '#fff',
              }}
            >
              <AppIcon which="neo" size={52} />
              <AppIcon which="dir" size={52} />
              <div>
                <div style={{fontSize: 22, fontWeight: 700}}>نيو كابتا × الدرعية</div>
                <div style={{fontSize: 16, color: '#7CFC9A'}}>متصل الآن</div>
              </div>
            </div>
            <div style={{padding: '18px 18px', flex: 1}}>
              <Bubble at={262} me text="عندنا أفكار تسويقية تليق بالدرعية ✨" />
              <Bubble at={310} me={false} text="وعندنا قصة تستاهل توصل للعالم" />
              <Bubble at={358} me text="نسوّق، ونصمم الدعاية، ونطلق الإعلانات 🚀" />
              <Bubble at={410} me={false} text="إذن… نبدأ؟ 🤝" />
            </div>
          </div>
        )}
        {screen === 'request' && (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
            <div
              style={{
                width: 420,
                padding: '36px 24px',
                borderRadius: 36,
                background: 'rgba(255,255,255,0.1)',
                textAlign: 'center',
                color: '#fff',
                transform: `scale(${spring({frame: f - 480, fps, config: {damping: 12}})})`,
              }}
            >
              <div style={{display: 'flex', justifyContent: 'center', gap: 16}}>
                <AppIcon which="neo" size={110} />
                <AppIcon which="dir" size={110} />
              </div>
              <div style={{fontSize: 34, fontWeight: 900, marginTop: 20}}>طلب شراكة استراتيجية</div>
              <div style={{fontSize: 20, opacity: 0.7, letterSpacing: 2}}>PARTNERSHIP REQUEST</div>
              <div
                style={{
                  marginTop: 30,
                  padding: '18px 0',
                  borderRadius: 50,
                  fontSize: 32,
                  fontWeight: 900,
                  background: accepted ? '#2EBD6B' : COLORS.neoBlue,
                  transform: `scale(${f >= tap - 3 && f < tap + 4 ? 0.92 : 1})`,
                }}
              >
                {accepted ? '✓ تمت الشراكة' : 'قبول · Accept'}
              </div>
            </div>
            {/* نقرة الإصبع */}
            {tapRing > 0 && tapRing < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  top: 640,
                  left: 250 - 40,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  border: '5px solid #fff',
                  transform: `scale(${0.5 + tapRing})`,
                  opacity: 1 - tapRing,
                }}
              />
            ) : null}
          </AbsoluteFill>
        )}
      </div>
    </AbsoluteFill>
  );
};

// 22–27 ث: النتيجة الكبيرة
const Result: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < 670 || f >= 815) return null;
  const p = spring({frame: f - 672, fps, config: {damping: 11}});
  const out = interpolate(f, [800, 815], [1, 0], clamp);
  const chips = [
    {t: 'تسويق · MARKETING', x: 260, y: 200, c: COLORS.neoBlue},
    {t: 'دعاية · ADVERTISING', x: 1280, y: 230, c: COLORS.copper},
    {t: 'إعلان · CAMPAIGNS', x: 330, y: 800, c: COLORS.copper},
    {t: 'محتوى · CONTENT', x: 1250, y: 820, c: COLORS.neoBlue},
  ];
  return (
    <AbsoluteFill style={{opacity: out, fontFamily: FONT}}>
      {chips.map((c, i) => {
        const q = spring({frame: f - 690 - i * 15, fps, config: {damping: 10}});
        return (
          <div
            key={c.t}
            dir="rtl"
            style={{
              position: 'absolute',
              left: c.x,
              top: c.y + Math.sin((f + i * 20) / 20) * 10,
              padding: '14px 30px',
              borderRadius: 40,
              background: c.c,
              color: '#fff',
              fontSize: 34,
              fontWeight: 700,
              transform: `scale(${q})`,
            }}
          >
            {c.t}
          </div>
        );
      })}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div dir="rtl" style={{fontSize: 150, fontWeight: 900, color: COLORS.neoWhite, transform: `scale(${p})`}}>
          شراكة استراتيجية
        </div>
        <div style={{fontSize: 52, fontWeight: 700, letterSpacing: 14, color: COLORS.copperLight, opacity: p}}>
          STRATEGIC PARTNERSHIP
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < 810) return null;
  const p = spring({frame: f - 812, fps, config: {damping: 12}});
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, opacity: out, gap: 30}}>
      <div style={{display: 'flex', gap: 60, alignItems: 'center', transform: `scale(${p})`}}>
        <AppIcon which="neo" size={230} />
        <div style={{fontSize: 90, color: '#fff'}}>×</div>
        <AppIcon which="dir" size={230} />
      </div>
      <div style={{fontSize: 60, fontWeight: 900, color: '#fff', opacity: p}}>Neo Capta × Diriyah Company</div>
      <div dir="rtl" style={{fontSize: 40, fontWeight: 700, color: COLORS.copperLight, opacity: p}}>
        الإشعار الذي انتظرناه 🔔
      </div>
    </AbsoluteFill>
  );
};

export const NotificationConcept: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Audio src={staticFile('music-notification.wav')} />
      <Bg />
      <AbsoluteFill>
        {useCurrentFrame() < 90 ? <Icons /> : null}
      </AbsoluteFill>
      <Side from={110} to={238} ar="خبر في الطريق…" en="SOMETHING'S COMING" />
      <Side from={250} to={478} ar="حوار الإبداع والتاريخ" en="CREATIVITY × HERITAGE" />
      <Side from={490} to={655} ar="لحظة القرار" en="THE BIG YES" />
      <Phone />
      <Confetti at={564} />
      <Result />
      <End />
    </AbsoluteFill>
  );
};
