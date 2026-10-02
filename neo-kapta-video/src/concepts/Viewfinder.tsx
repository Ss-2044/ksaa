// الفكرة 13: «من خلف العدسة» — شاشة كاميرا مصوّر نيو كابتا تتجول في الدرعية: تركيز، لقطة، صوت الغالق،
// والصور تتجمع في معرض، ثم «نحن نصنع الصورة… والدرعية تصنع القصة»
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {DiriyahImage, SLOTS, Slot} from './diriyah';
import {clamp, useFonts} from './shared';

const SHOTS: Slot[] = ['turaif-sunset', 'bujairi-terrace', 'turaif-wall', 'wadi-hanifa'];
const SHOT_START = 90;
const SHOT_LEN = 135;
const SHUTTER_AT = 95; // داخل كل لقطة

const pad = (n: number) => String(n).padStart(2, '0');

const CameraUI: React.FC<{focus: number; label?: string; shots: number; box?: boolean}> = ({focus, label, shots, box: showBox = true}) => {
  const f = useCurrentFrame();
  const sec = Math.floor(f / 30);
  const corner = (pos: React.CSSProperties, rot: number) => (
    <div style={{position: 'absolute', width: 80, height: 80, borderTop: '5px solid #fff', borderLeft: '5px solid #fff', transform: `rotate(${rot}deg)`, ...pos}} />
  );
  const box = interpolate(focus, [0, 1], [1.3, 1]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', fontFamily: FONT}}>
      {/* شبكة الأثلاث */}
      {[1, 2].map((i) => (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: `${(i * 100) / 3}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.25)'}} />
          <div style={{position: 'absolute', top: `${(i * 100) / 3}%`, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.25)'}} />
        </React.Fragment>
      ))}
      {corner({top: 50, left: 50}, 0)}
      {corner({top: 50, right: 50}, 90)}
      {corner({bottom: 50, right: 50}, 180)}
      {corner({bottom: 50, left: 50}, 270)}
      {/* مربع التركيز */}
      {showBox ? <div
        style={{
          position: 'absolute',
          left: 960 - 130,
          top: 540 - 90,
          width: 260,
          height: 180,
          border: `4px solid ${focus >= 1 ? '#5BE37D' : '#fff'}`,
          transform: `scale(${box})`,
          opacity: 0.9,
        }}
      /> : null}
      <div style={{position: 'absolute', top: 80, left: 110, display: 'flex', gap: 14, alignItems: 'center', color: '#fff', fontSize: 30, fontWeight: 700}}>
        <div style={{width: 20, height: 20, borderRadius: 10, background: '#E5484D', opacity: Math.floor(f / 15) % 2 ? 0.3 : 1}} />
        REC 00:{pad(sec)}
      </div>
      <div style={{position: 'absolute', top: 80, right: 110, color: '#fff', fontSize: 28, fontWeight: 700, letterSpacing: 2}}>4K · 24fps · ISO 200 · f/2.8</div>
      <div style={{position: 'absolute', bottom: 80, left: 110, color: '#fff', fontSize: 26, letterSpacing: 2}}>NEO CAPTA · {pad(shots)} SHOTS</div>
      {label ? (
        <div dir="rtl" style={{position: 'absolute', bottom: 160, right: 110, color: '#fff', fontSize: 64, fontWeight: 900, textShadow: '0 3px 16px rgba(0,0,0,0.8)'}}>
          📍 {label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const ViewfinderConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  let scene: React.ReactNode;

  const thumbs = (n: number) => (
    <div style={{position: 'absolute', bottom: 130, left: 110, display: 'flex', gap: 14}}>
      {SHOTS.slice(0, n).map((s) => (
        <div key={s} style={{width: 160, height: 90, border: '3px solid #fff', overflow: 'hidden', position: 'relative', boxShadow: '0 6px 16px rgba(0,0,0,0.5)'}}>
          <div style={{position: 'absolute', width: 1920, height: 1080, transform: 'scale(0.0833)', transformOrigin: 'top left'}}>
            <DiriyahImage slot={s} />
          </div>
        </div>
      ))}
    </div>
  );

  if (f < SHOT_START) {
    // 0–3 ث: الكاميرا تركّز على الشعارين
    const focus = interpolate(f, [10, 50], [0, 1], clamp);
    scene = (
      <AbsoluteFill style={{background: COLORS.neoBlack}}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', filter: `blur(${(1 - focus) * 18}px)`}}>
          <div style={{display: 'flex', gap: 140, alignItems: 'center'}}>
            <NeoLogo size={330} />
            <div style={{fontFamily: FONT, fontSize: 90, color: '#fff'}}>×</div>
            <DiriyahLogo size={330} />
          </div>
        </AbsoluteFill>
        <CameraUI focus={focus} shots={0} />
      </AbsoluteFill>
    );
  } else if (f < SHOT_START + SHOTS.length * SHOT_LEN) {
    const i = Math.floor((f - SHOT_START) / SHOT_LEN);
    const t = f - SHOT_START - i * SHOT_LEN;
    const slot = SHOTS[i];
    const focus = interpolate(t, [15, 55], [0, 1], clamp);
    const pan = interpolate(t, [0, SHOT_LEN], [0, 1]);
    const shutter = t >= SHUTTER_AT && t < SHUTTER_AT + 3;
    const frozen = t >= SHUTTER_AT;
    const fly = interpolate(t, [SHUTTER_AT + 8, SHOT_LEN - 5], [0, 1], clamp);
    scene = (
      <AbsoluteFill style={{background: '#000'}}>
        <AbsoluteFill
          style={{
            filter: `blur(${(1 - focus) * 14}px)`,
            transform: frozen
              ? `translate(${-fly * 700}px, ${fly * 380}px) scale(${1.1 - fly * 0.85})`
              : `scale(${1.25 - pan * 0.15}) translateX(${(i % 2 ? -1 : 1) * (pan - 0.5) * 80}px)`,
            boxShadow: frozen ? '0 0 0 8px #fff' : 'none',
          }}
        >
          <DiriyahImage slot={slot} />
        </AbsoluteFill>
        {!frozen || fly < 0.05 ? <CameraUI focus={focus} label={SLOTS[slot].ar} shots={i + (frozen ? 1 : 0)} /> : null}
        {thumbs(i)}
        <AbsoluteFill style={{background: '#000', opacity: shutter ? 1 : 0}} />
        <AbsoluteFill style={{background: '#fff', opacity: interpolate(t, [SHUTTER_AT + 2, SHUTTER_AT + 3, SHUTTER_AT + 10], [0, 0.6, 0], clamp)}} />
      </AbsoluteFill>
    );
  } else if (f < 810) {
    // 21–27 ث: المعرض ثم الرسالة
    const t = f - (SHOT_START + SHOTS.length * SHOT_LEN);
    const msg = spring({frame: t - 25, fps, config: {damping: 13}});
    const partner = spring({frame: t - 85, fps, config: {damping: 12}});
    scene = (
      <AbsoluteFill style={{background: COLORS.neoBlack}}>
        <div style={{position: 'absolute', inset: 30, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 20}}>
          {SHOTS.map((s, k) => {
            const p = spring({frame: t - k * 5, fps, config: {damping: 14}});
            return (
              <div key={s} style={{position: 'relative', overflow: 'hidden', transform: `scale(${p})`, border: '4px solid #fff'}}>
                <DiriyahImage slot={s} w={922} h={502} />
              </div>
            );
          })}
        </div>
        <AbsoluteFill style={{background: 'rgba(5,6,10,0.6)', opacity: msg}} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, gap: 10}}>
          <div dir="rtl" style={{fontSize: 84, fontWeight: 900, color: '#fff', opacity: msg, transform: `translateY(${(1 - msg) * 30}px)`}}>
            نحن نصنع الصورة…
          </div>
          <div dir="rtl" style={{fontSize: 84, fontWeight: 900, color: COLORS.copperLight, opacity: msg}}>والدرعية تصنع القصة</div>
          <div style={{fontSize: 30, letterSpacing: 6, color: COLORS.sand, opacity: msg}}>WE MAKE THE PICTURE · DIRIYAH MAKES THE STORY</div>
          <div
            dir="rtl"
            style={{
              marginTop: 40,
              padding: '14px 50px',
              borderRadius: 60,
              background: `linear-gradient(90deg, ${COLORS.neoBlue}, ${COLORS.copper})`,
              fontSize: 64,
              fontWeight: 900,
              color: '#fff',
              transform: `scale(${partner})`,
            }}
          >
            شراكة استراتيجية
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  } else {
    // 27–30 ث: الختام داخل إطار الكاميرا
    const p = spring({frame: f - 812, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={{background: COLORS.neoBlack}}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 30, fontFamily: FONT}}>
          <div style={{display: 'flex', gap: 70, alignItems: 'center', transform: `scale(${p})`}}>
            <NeoLogo size={250} />
            <div style={{fontSize: 90, color: '#fff'}}>×</div>
            <DiriyahLogo size={250} />
          </div>
          <div style={{fontSize: 58, fontWeight: 900, color: '#fff', opacity: p}}>Neo Capta × Diriyah Company</div>
          <div dir="rtl" style={{fontSize: 40, fontWeight: 700, color: COLORS.copperLight, opacity: p}}>
            تسويق · دعاية · إعلان — لقصة الدرعية
          </div>
        </AbsoluteFill>
        <CameraUI focus={1} shots={4} box={false} />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{opacity: out}}>
      <Audio src={staticFile('music-viewfinder.wav')} />
      {scene}
    </AbsoluteFill>
  );
};
