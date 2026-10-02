// الفكرة 10: «جاء الوقت» — جولة سينمائية في الدرعية (صور بحركة كاميرا بطيئة) وساعة تدق،
// ثم تتوقف العقارب عند 12: «وجاء الوقت… للشراكة»
//
// الصور: public/diriyah/<slot>.jpg (انظر SLOTS في diriyah.tsx) — تُستخدم تلقائياً بدل المشاهد المرسومة.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {DiriyahImage, DiriyahScene, Slot} from './diriyah';
import {clamp, useFonts} from './shared';

// صورة بحركة «كين بيرنز» (تكبير وانزلاق بطيء)
const Photo: React.FC<{slot: Slot; from: number; dur: number; dir?: 1 | -1}> = ({slot, from, dur, dir = 1}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [from, from + dur], [0, 1], clamp);
  const o = interpolate(f, [from, from + 15, from + dur - 15, from + dur], [0, 1, 1, 0], clamp);
  if (f < from || f > from + dur) return null;
  return (
    <AbsoluteFill style={{opacity: o, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${1.08 + t * 0.12}) translateX(${dir * (t - 0.5) * 60}px)`}}>
        <DiriyahImage slot={slot} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};

const Caption: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 18, to - 12, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', bottom: 110, right: 120, left: 120, textAlign: 'right', fontFamily: FONT, opacity: o}}>
      <div dir="rtl" style={{fontSize: 96, fontWeight: 900, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.7)', transform: `translateY(${(1 - o) * 20}px)`}}>
        {ar}
      </div>
      <div style={{fontSize: 34, letterSpacing: 10, color: COLORS.sand, textShadow: '0 2px 10px #000'}}>{en}</div>
    </div>
  );
};

// ساعة صغيرة في الزاوية تدق طوال الجولة
const MiniClock: React.FC = () => {
  const f = useCurrentFrame();
  const sec = Math.floor(f / 15); // تكّة كل نصف ثانية
  const o = interpolate(f, [100, 120, 520, 540], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 70, left: 90, width: 120, height: 120, borderRadius: '50%', border: `4px solid ${COLORS.sand}`, opacity: o}}>
      <div style={{position: 'absolute', left: 58, top: 12, width: 4, height: 48, background: COLORS.copperLight, transformOrigin: '2px 48px', transform: `rotate(${sec * 6}deg)`}} />
      <div style={{position: 'absolute', left: 56, top: 56, width: 8, height: 8, borderRadius: 4, background: COLORS.sand}} />
    </div>
  );
};

// الساعة الكبيرة: العقارب تدور بسرعة ثم تتوقف عند 12
const BigClock: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 75], [0, 1], clamp);
  const e = 1 - Math.pow(1 - t, 3);
  const minute = 360 * 6 * e;
  const hour = 330 + 30 * e;
  const strike = interpolate(f, [at + 75, at + 80, at + 110], [0, 1, 0], clamp);
  const nums = ['١٢', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١'];
  return (
    <div style={{position: 'relative', width: 560, height: 560, borderRadius: '50%', border: `6px solid ${COLORS.sand}`, background: 'rgba(5,6,10,0.55)', boxShadow: `0 0 ${40 + strike * 120}px ${COLORS.copper}`}}>
      {nums.map((n, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return (
          <div key={n} style={{position: 'absolute', left: 280 + Math.sin(a) * 225 - 30, top: 280 - Math.cos(a) * 225 - 30, width: 60, textAlign: 'center', fontFamily: FONT, fontSize: 42, fontWeight: 700, color: i === 0 ? COLORS.copperLight : COLORS.sand}}>
            {n}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 274, top: 140, width: 12, height: 140, borderRadius: 6, background: COLORS.sand, transformOrigin: '6px 140px', transform: `rotate(${hour}deg)`}} />
      <div style={{position: 'absolute', left: 276, top: 70, width: 8, height: 210, borderRadius: 4, background: COLORS.copperLight, transformOrigin: '4px 210px', transform: `rotate(${minute}deg)`}} />
      <div style={{position: 'absolute', left: 266, top: 266, width: 28, height: 28, borderRadius: 14, background: COLORS.copper}} />
    </div>
  );
};

export const TimeHasComeConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);

  // 0–3 ث: الشعاران فوق صورة الدرعية المموّهة
  const logoA = spring({frame: f - 4, fps, config: {damping: 14}});
  const logoB = spring({frame: f - 12, fps, config: {damping: 14}});
  const logosOut = interpolate(f, [75, 90], [1, 0], clamp);

  // 18–23 ث: الساعة الكبيرة
  const clockIn = spring({frame: f - 540, fps, config: {damping: 14}});
  const clockOut = interpolate(f, [680, 695], [1, 0], clamp);
  const timeText = spring({frame: f - 618, fps, config: {damping: 12}});
  const flash = interpolate(f, [615, 620, 640], [0, 0.8, 0], clamp);

  // 23–27 ث: للشراكة
  const split = spring({frame: f - 690, fps, config: {damping: 15}});
  const word = spring({frame: f - 705, fps, config: {damping: 11}});
  const services = interpolate(f, [740, 760], [0, 1], clamp);

  const end = spring({frame: f - 812, fps, config: {damping: 13}});

  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Audio src={staticFile('music-time.wav')} />

      {/* 0–3 ث */}
      {f < 95 ? (
        <AbsoluteFill style={{opacity: logosOut}}>
          <AbsoluteFill style={{filter: 'blur(10px) brightness(0.55)', transform: 'scale(1.1)'}}>
            <DiriyahScene mood="sunset" variant={0} />
          </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div style={{display: 'flex', gap: 120, alignItems: 'center'}}>
              <div style={{transform: `scale(${logoA})`}}>
                <NeoLogo size={340} />
              </div>
              <div style={{fontFamily: FONT, fontSize: 100, color: '#fff', opacity: logoB}}>×</div>
              <div style={{transform: `scale(${logoB})`}}>
                <DiriyahLogo size={340} />
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* 3–18 ث: جولة الصور */}
      <Photo slot="turaif-sunset" from={85} dur={160} dir={1} />
      <Photo slot="turaif-wall" from={235} dur={160} dir={-1} />
      <Photo slot="bujairi-night" from={385} dur={170} dir={1} />
      <Caption from={95} to={240} ar="الدرعية… حيث بدأت الحكاية" en="DIRIYAH… WHERE IT ALL BEGAN" />
      <Caption from={245} to={390} ar="إرثٌ صنع التاريخ" en="A HERITAGE THAT SHAPED HISTORY" />
      <Caption from={395} to={545} ar="واليوم… العالم كله يتجه إليها" en="TODAY, THE WORLD IS LOOKING HERE" />
      <MiniClock />

      {/* 18–23 ث: جاء الوقت */}
      {f >= 535 && f < 700 ? (
        <AbsoluteFill style={{opacity: clockOut}}>
          <AbsoluteFill style={{filter: 'brightness(0.35) blur(4px)'}}>
            <DiriyahScene mood="night" variant={2} />
          </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 110}}>
            <div style={{transform: `scale(${clockIn})`}}>
              <BigClock at={540} />
            </div>
            <div style={{fontFamily: FONT, textAlign: 'right', minWidth: 760}}>
              <div dir="rtl" style={{fontSize: 70, fontWeight: 700, color: COLORS.sand, opacity: clockIn}}>وجاء…</div>
              <div dir="rtl" style={{fontSize: 170, fontWeight: 900, color: '#fff', lineHeight: 1.1, transform: `scale(${timeText})`, transformOrigin: 'right center'}}>
                الوقت
              </div>
              <div style={{fontSize: 40, letterSpacing: 10, color: COLORS.copperLight, opacity: timeText}}>THE TIME HAS COME</div>
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{background: '#fff', opacity: flash}} />
        </AbsoluteFill>
      ) : null}

      {/* 23–27 ث: للشراكة — الصورة تنقسم: نصف بإضاءة نيو كابتا الزرقاء ونصف نحاسي */}
      {f >= 688 && f < 815 ? (
        <AbsoluteFill style={{opacity: interpolate(f, [800, 815], [1, 0], clamp)}}>
          <Photo slot="wadi-hanifa" from={688} dur={127} dir={-1} />
          <AbsoluteFill style={{background: `linear-gradient(90deg, ${COLORS.neoBlue}cc 0%, ${COLORS.neoBlue}55 ${50 * split}%, ${COLORS.copper}55 ${100 - 50 * split}%, ${COLORS.copper}cc 100%)`, mixBlendMode: 'multiply'}} />
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
            <div dir="rtl" style={{fontSize: 190, fontWeight: 900, color: '#fff', transform: `scale(${word})`, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>
              …للشراكة
            </div>
            <div style={{fontSize: 50, letterSpacing: 16, color: '#fff', opacity: word}}>…FOR PARTNERSHIP</div>
            <div dir="rtl" style={{display: 'flex', gap: 24, marginTop: 40, opacity: services}}>
              {['تسويق', 'دعاية', 'إعلان'].map((t) => (
                <div key={t} style={{padding: '10px 36px', borderRadius: 40, border: '3px solid #fff', fontSize: 44, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.25)'}}>
                  {t}
                </div>
              ))}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* 27–30 ث: الختام */}
      {f >= 810 ? (
        <AbsoluteFill style={{background: COLORS.neoBlack, justifyContent: 'center', alignItems: 'center', gap: 28, fontFamily: FONT}}>
          <AbsoluteFill style={{opacity: 0.25, filter: 'blur(8px)'}}>
            <DiriyahScene mood="night" variant={2} />
          </AbsoluteFill>
          <div style={{display: 'flex', gap: 70, alignItems: 'center', transform: `scale(${end})`}}>
            <NeoLogo size={250} />
            <div style={{fontSize: 90, color: '#fff'}}>×</div>
            <DiriyahLogo size={250} />
          </div>
          <div dir="rtl" style={{fontSize: 84, fontWeight: 900, color: '#fff', opacity: end, zIndex: 1}}>حان وقت الشراكة</div>
          <div style={{fontSize: 40, fontWeight: 700, color: COLORS.copperLight, opacity: end, zIndex: 1}}>Neo Capta × Diriyah Company · Strategic Partnership</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
