// الفكرة 17: «عرض ضوئي على البرج» (Projection Mapping) — صورة البرج الطيني الحقيقية تصبح شاشة:
// خطوط مسح ضوئية، مثلثات نجدية، نقاط نيو كابتا، ثم «شراكة استراتيجية» مُسقطة على البرج نفسه
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

// حدود المبنى في إطار 16:9 (الصورة بقصّ cover في المنتصف) — الإسقاط يقع على المبنى فقط
const BUILDING = 'polygon(470px 1080px, 495px 900px, 540px 450px, 640px 380px, 800px 340px, 960px 330px, 1120px 350px, 1290px 430px, 1310px 560px, 1450px 570px, 1515px 600px, 1465px 180px, 1465px 100px, 1560px 40px, 1600px 0px, 1920px 0px, 1920px 1080px)';

const Layer: React.FC<{children: React.ReactNode; o?: number}> = ({children, o = 1}) => (
  <AbsoluteFill style={{clipPath: BUILDING, mixBlendMode: 'screen', opacity: o}}>{children}</AbsoluteFill>
);

const Caption: React.FC<{from: number; to: number; ar: string; en: string}> = ({from, to, ar, en}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [from, from + 15, to - 12, to], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 70, top: 120, width: 420, textAlign: 'left', fontFamily: FONT, opacity: o}}>
      <div dir="rtl" style={{fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1.3, textAlign: 'right', textShadow: '0 4px 20px #000'}}>{ar}</div>
      <div style={{fontSize: 22, letterSpacing: 6, color: COLORS.copperLight, marginTop: 10, textAlign: 'right'}}>{en}</div>
    </div>
  );
};

export const ProjectionConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [880, 900], [1, 0], clamp);
  // الإضاءة الحقيقية للمبنى: معتمة أثناء العرض ثم تُضاء في النهاية
  const lit = interpolate(f, [0, 20, 600, 660, 780, 800], [0.25, 0.3, 0.3, 1, 1, 0.25], clamp);
  const flick = f % 47 === 0 || f % 61 === 0 ? 0.6 : 1; // رمشة جهاز العرض

  // ١) الشعاران (0–3 ث)
  const logos = spring({frame: f - 6, fps, config: {damping: 14}});
  const logosO = interpolate(f, [70, 90], [1, 0], clamp);
  // ٢) خطوط مسح + مثلثات (3–8 ث)
  const scanY = interpolate(f, [90, 150], [1100, -200], clamp);
  const tri = interpolate(f, [140, 160, 230, 245], [0, 1, 1, 0], clamp);
  // ٣) نقاط نيو كابتا (8–14 ث)
  const dots = interpolate(f, [245, 265, 410, 425], [0, 1, 1, 0], clamp);
  // ٤) شراكة استراتيجية (14–20 ث)
  const word = spring({frame: f - 430, fps, config: {damping: 12}});
  const wordO = interpolate(f, [585, 600], [1, 0], clamp);
  const ripple = (f - 430) / 40;
  // ٥) الخدمات بعد الإضاءة (20–26 ث)
  const svc = interpolate(f, [660, 680, 765, 780], [0, 1, 1, 0], clamp);
  const endP = spring({frame: f - 800, fps, config: {damping: 13}});

  return (
    <AbsoluteFill style={{background: '#05060a', opacity: out}}>
      <Audio src={staticFile('music-projection.wav')} />
      <AbsoluteFill style={{filter: `brightness(${lit})`, transform: `scale(${1.04 - f * 0.00004})`}}>
        <Img src={staticFile('diriyah/tower-night.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>

      {f < 95 ? (
        <Layer o={logosO * flick}>
          <div style={{position: 'absolute', left: 640, top: 520, transform: `scale(${logos})`, filter: 'drop-shadow(0 0 30px #6F7FF0)'}}>
            <NeoLogo size={300} style={{boxShadow: 'none', border: 'none'}} />
          </div>
          <div style={{position: 'absolute', left: 1560, top: 300, transform: `scale(${logos})`, filter: 'drop-shadow(0 0 30px #D9A47F)'}}>
            <DiriyahLogo size={300} style={{boxShadow: 'none', border: 'none'}} />
          </div>
        </Layer>
      ) : null}

      {f >= 90 && f < 250 ? (
        <Layer o={flick}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{position: 'absolute', left: 0, right: 0, top: scanY + k * 90, height: 24, background: COLORS.neoBlueLight, boxShadow: `0 0 60px 20px ${COLORS.neoBlue}`, opacity: 0.9 - k * 0.25}} />
          ))}
          <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: tri}}>
            {new Array(9).fill(0).map((_, r) =>
              new Array(24).fill(0).map((__, c) => (
                <path
                  key={`${r}-${c}`}
                  d={`M${c * 80 + (r % 2) * 40 - ((f * 2) % 80)} ${r * 120 + 100} l40 -70 l40 70 Z`}
                  fill="none"
                  stroke={r % 2 ? COLORS.copperLight : COLORS.neoBlueLight}
                  strokeWidth={5}
                />
              ))
            )}
          </svg>
        </Layer>
      ) : null}

      {f >= 245 && f < 430 ? (
        <Layer o={dots * flick}>
          <AbsoluteFill
            style={{
              backgroundImage: `radial-gradient(${COLORS.neoBlueLight} 5px, transparent 6px)`,
              backgroundSize: '34px 34px',
              backgroundPosition: `${f * 1.5}px ${Math.sin(f / 20) * 30}px`,
              maskImage: `radial-gradient(circle at ${50 + Math.sin(f / 30) * 20}% 55%, black 20%, transparent 60%)`,
              WebkitMaskImage: `radial-gradient(circle at ${50 + Math.sin(f / 30) * 20}% 55%, black 20%, transparent 60%)`,
            }}
          />
        </Layer>
      ) : null}

      {f >= 428 && f < 600 ? (
        <Layer o={wordO * flick}>
          {[0, 1, 2].map((k) => {
            const r = ((ripple + k / 3) % 1) * 900;
            return <div key={k} style={{position: 'absolute', left: 900 - r, top: 650 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `6px solid ${k % 2 ? COLORS.copperLight : COLORS.neoBlueLight}`, opacity: 1 - r / 900}} />;
          })}
          <div dir="rtl" style={{position: 'absolute', left: 520, width: 760, top: 470, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 190, color: '#fff', transform: `scale(${word})`, textShadow: `0 0 40px ${COLORS.neoBlueLight}`}}>
            شراكة
          </div>
          <div dir="rtl" style={{position: 'absolute', left: 500, width: 800, top: 790, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 110, color: COLORS.copperLight, opacity: word, textShadow: `0 0 30px ${COLORS.copper}`}}>
            استراتيجية
          </div>
        </Layer>
      ) : null}

      {f >= 655 && f < 785 ? (
        <Layer o={svc}>
          {['تسويق', 'دعاية', 'إعلان'].map((t, i) => (
            <div key={t} dir="rtl" style={{position: 'absolute', left: 560, width: 680, top: 470 + i * 150, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 110, color: i === 1 ? COLORS.copperLight : COLORS.neoBlueLight, opacity: interpolate(f, [665 + i * 12, 680 + i * 12], [0, 1], clamp)}}>
              {t}
            </div>
          ))}
        </Layer>
      ) : null}

      <Caption from={95} to={245} ar="حين يتحدث الطين…" en="WHEN MUD-BRICK SPEAKS" />
      <Caption from={250} to={425} ar="…بلغة الضوء" en="IN THE LANGUAGE OF LIGHT" />
      <Caption from={435} to={600} ar="نيو كابتا × شركة الدرعية" en="NEO CAPTA × DIRIYAH COMPANY" />
      <Caption from={610} to={780} ar="نُضيء قصة الدرعية للعالم" en="LIGHTING UP DIRIYAH'S STORY" />

      {f >= 790 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 26, fontFamily: FONT, background: `rgba(5,6,10,${0.6 * endP})`}}>
          <div style={{display: 'flex', gap: 70, alignItems: 'center', transform: `scale(${endP})`}}>
            <NeoLogo size={230} />
            <div style={{fontSize: 90, color: '#fff'}}>×</div>
            <DiriyahLogo size={230} />
          </div>
          <div dir="rtl" style={{fontSize: 90, fontWeight: 900, color: '#fff', opacity: endP}}>شراكة استراتيجية</div>
          <div style={{fontSize: 40, fontWeight: 700, color: COLORS.copperLight, opacity: endP}}>Neo Capta × Diriyah Company</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
