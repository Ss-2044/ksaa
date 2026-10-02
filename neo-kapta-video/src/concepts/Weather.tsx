// الفكرة 5: «النشرة الجوية الإبداعية» — الإعلان بأسلوب قنوات الأخبار:
// رادار يرصد «منخفض إبداعي» من نيو كابتا و«رياح تاريخية» من الدرعية تلتقيان، ثم «احتمالية الشراكة 100٪» ثم «عاجل»
import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {DiriyahLogo, NeoLogo} from '../components';
import {COLORS, FONT} from '../theme';
import {clamp, useFonts} from './shared';

const LIVE = '#E5484D';

const Studio: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #0a1240 0%, ${COLORS.navy} 60%, #05060A 100%)`}}>
      {/* شاشة LED خلفية */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(90deg, ${COLORS.neoBlue}22 1px, transparent 1px), linear-gradient(${COLORS.neoBlue}22 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: `${-f}px 0`,
          maskImage: 'linear-gradient(180deg, black 0%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, transparent 85%)',
        }}
      />
      <AbsoluteFill
        style={{background: `radial-gradient(ellipse at 50% 110%, ${COLORS.copper}55, transparent 50%)`}}
      />
    </AbsoluteFill>
  );
};

const Bug: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 40,
          right: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: FONT,
          background: 'rgba(255,255,255,0.1)',
          padding: '8px 22px',
          borderRadius: 12,
        }}
      >
        <div style={{width: 16, height: 16, borderRadius: 8, background: LIVE, opacity: Math.floor(f / 15) % 2 ? 0.4 : 1}} />
        <div style={{fontSize: 26, fontWeight: 900, color: '#fff'}}>مباشر · LIVE</div>
        <div style={{fontSize: 26, fontWeight: 700, color: COLORS.copperLight}}>قناة الإبداع</div>
      </div>
      <div style={{position: 'absolute', top: 44, left: 50, fontFamily: FONT, fontSize: 30, fontWeight: 700, color: '#fff'}}>
        21:00 · الرياض
      </div>
    </>
  );
};

const Ticker: React.FC = () => {
  const f = useCurrentFrame();
  const text =
    'الإبداع يلتقي بالتاريخ  ◆  تسويق  ◆  دعاية  ◆  إعلان  ◆  Neo Capta × Diriyah Company  ◆  شراكة استراتيجية  ◆  ';
  return (
    <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, height: 74, display: 'flex', fontFamily: FONT}}>
      <div style={{flex: 1, background: '#fff', overflow: 'hidden', position: 'relative'}}>
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            right: -4000,
            top: 10,
            whiteSpace: 'nowrap',
            fontSize: 34,
            fontWeight: 700,
            color: COLORS.navy,
            transform: `translateX(${f * 5}px)`,
          }}
        >
          {text.repeat(10)}
        </div>
      </div>
      <div style={{width: 200, background: COLORS.copper, color: '#fff', fontSize: 38, fontWeight: 900, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        الآن
      </div>
    </div>
  );
};

const Panel: React.FC<{children: React.ReactNode; style?: React.CSSProperties; at: number}> = ({children, style, at}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 15}});
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.08)',
        border: '2px solid rgba(255,255,255,0.18)',
        borderRadius: 28,
        backdropFilter: 'blur(8px)',
        transform: `perspective(1200px) rotateY(${(1 - p) * 50}deg)`,
        opacity: p,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Radar: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [250, 420], [0, 1], clamp);
  const ease = 1 - Math.pow(1 - t, 2);
  const merge = interpolate(f, [415, 440], [0, 1], clamp);
  return (
    <div style={{position: 'relative', width: 720, height: 720, borderRadius: '50%', overflow: 'hidden', background: '#071028', border: `3px solid ${COLORS.neoBlueLight}`}}>
      {[1, 2, 3].map((k) => (
        <div key={k} style={{position: 'absolute', inset: k * 90, borderRadius: '50%', border: `1px solid ${COLORS.neoBlueLight}55`}} />
      ))}
      <div style={{position: 'absolute', left: 359, top: 0, bottom: 0, width: 1, background: `${COLORS.neoBlueLight}44`}} />
      <div style={{position: 'absolute', top: 359, left: 0, right: 0, height: 1, background: `${COLORS.neoBlueLight}44`}} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `conic-gradient(from ${f * 4}deg, ${COLORS.neoBlueLight}88, transparent 60deg)`,
        }}
      />
      {/* سحابة نيو كابتا الزرقاء */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={`b${i}`}
          style={{
            position: 'absolute',
            left: 560 - ease * 200 + i * 30 - 60,
            top: 300 + (i % 2) * 50 - 40,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: COLORS.neoBlue,
            filter: 'blur(30px)',
            opacity: 0.8,
          }}
        />
      ))}
      {/* رياح الدرعية النحاسية */}
      {[0, 1, 2].map((i) => (
        <div
          key={`w${i}`}
          style={{
            position: 'absolute',
            left: 40 + ease * 210 + ((f * 3 + i * 40) % 80),
            top: 260 + i * 70,
            fontSize: 70,
            fontWeight: 900,
            color: COLORS.copperLight,
            fontFamily: FONT,
          }}
        >
          ➜
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: 360 - 40,
          top: 360 - 40,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: `0 0 ${20 + merge * 80}px ${20 + merge * 40}px ${COLORS.copperLight}`,
          opacity: 0.4 + merge * 0.6,
        }}
      />
      <div dir="rtl" style={{position: 'absolute', top: 440, width: '100%', textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff'}}>
        الدرعية
      </div>
    </div>
  );
};

const Sun: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'relative', width: 260, height: 260}}>
      {new Array(12).fill(0).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 125,
            top: 0,
            width: 10,
            height: 46,
            borderRadius: 5,
            background: COLORS.copperLight,
            transformOrigin: '5px 130px',
            transform: `rotate(${i * 30 + f}deg)`,
          }}
        />
      ))}
      <div style={{position: 'absolute', inset: 60, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, #ffe0b0, ${COLORS.copper})`, boxShadow: `0 0 60px ${COLORS.copper}`}} />
    </div>
  );
};

export const WeatherConcept: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const center: React.CSSProperties = {justifyContent: 'center', alignItems: 'center', fontFamily: FONT};
  let scene: React.ReactNode = null;

  if (f < 90) {
    // 0–3 ث: مقدمة القناة — أشرطة مائلة ثم الشعاران
    const sweep = interpolate(f, [0, 30], [-1, 1.4], clamp);
    const a = spring({frame: f - 20, fps, config: {damping: 13}});
    const b = spring({frame: f - 28, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={center}>
        {[COLORS.neoBlue, COLORS.copper, '#fff'].map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 3000,
              height: 160,
              background: c,
              transform: `rotate(-20deg) translateX(${(sweep - i * 0.12) * 2400}px)`,
              top: 300 + i * 150,
            }}
          />
        ))}
        <div style={{display: 'flex', gap: 80, alignItems: 'center'}}>
          {[<NeoLogo key="n" size={300} />, <DiriyahLogo key="d" size={300} />].map((logo, i) => (
            <div
              key={i}
              style={{
                padding: 24,
                borderRadius: 36,
                background: '#fff',
                transform: `translateY(${(1 - (i ? b : a)) * 500}px)`,
                boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
              }}
            >
              {logo}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    );
  } else if (f < 240) {
    // 3–8 ث: عنوان النشرة
    scene = (
      <AbsoluteFill style={center}>
        <Panel at={92} style={{padding: '50px 110px', textAlign: 'center'}}>
          <div dir="rtl" style={{fontSize: 110, fontWeight: 900, color: '#fff'}}>النشرة الجوية الإبداعية</div>
          <div style={{fontSize: 44, fontWeight: 700, color: COLORS.copperLight, letterSpacing: 10}}>THE CREATIVE FORECAST</div>
        </Panel>
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            bottom: 170,
            right: 120,
            background: COLORS.neoBlue,
            color: '#fff',
            padding: '12px 36px',
            fontSize: 40,
            fontWeight: 700,
            borderRight: `12px solid ${COLORS.copper}`,
            transform: `translateX(${interpolate(f, [130, 150], [700, 0], clamp)}px)`,
          }}
        >
          مباشر من سماء الدرعية
        </div>
      </AbsoluteFill>
    );
  } else if (f < 450) {
    // 8–15 ث: الرادار
    scene = (
      <AbsoluteFill style={{...center, flexDirection: 'row', gap: 80}}>
        <Radar />
        <Panel at={260} style={{padding: 40, width: 640}}>
          <div dir="rtl" style={{fontSize: 46, fontWeight: 900, color: '#fff', marginBottom: 24}}>خريطة الرصد</div>
          {[
            {c: COLORS.neoBlue, ar: 'منخفض إبداعي — نيو كابتا', en: 'CREATIVE LOW · NEO CAPTA'},
            {c: COLORS.copperLight, ar: 'رياح تاريخية — الدرعية', en: 'HISTORIC WINDS · DIRIYAH'},
          ].map((r) => (
            <div key={r.en} dir="rtl" style={{display: 'flex', gap: 20, alignItems: 'center', marginTop: 20}}>
              <div style={{width: 40, height: 40, borderRadius: 20, background: r.c, boxShadow: `0 0 20px ${r.c}`}} />
              <div>
                <div style={{fontSize: 36, fontWeight: 700, color: '#fff'}}>{r.ar}</div>
                <div style={{fontSize: 22, color: '#ffffffaa', letterSpacing: 3}}>{r.en}</div>
              </div>
            </div>
          ))}
          <div dir="rtl" style={{marginTop: 34, fontSize: 34, fontWeight: 700, color: COLORS.copperLight, opacity: interpolate(f, [415, 435], [0, 1], clamp)}}>
            ⚠ التقاء الجبهتين فوق الدرعية
          </div>
        </Panel>
      </AbsoluteFill>
    );
  } else if (f < 630) {
    // 15–21 ث: بطاقة التوقعات
    const pct = Math.round(interpolate(f, [480, 560], [0, 100], clamp));
    scene = (
      <AbsoluteFill style={center}>
        <Panel at={452} style={{padding: '50px 70px', width: 1400, display: 'flex', gap: 60, alignItems: 'center'}}>
          <Sun />
          <div dir="rtl" style={{flex: 1}}>
            <div style={{fontSize: 40, fontWeight: 700, color: COLORS.copperLight}}>توقعات الدرعية اليوم</div>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 24}}>
              <div style={{fontSize: 190, fontWeight: 900, color: '#fff', lineHeight: 1.1}}>{pct}٪</div>
              <div style={{fontSize: 44, fontWeight: 700, color: '#fff'}}>احتمالية الشراكة</div>
            </div>
            {[
              ['رياح التسويق', 'قوية'],
              ['أمطار الإعلانات', 'غزيرة'],
              ['الرؤية', 'واضحة حتى العالم'],
            ].map(([k, v], i) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 38,
                  padding: '10px 0',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  opacity: interpolate(f, [560 + i * 12, 575 + i * 12], [0, 1], clamp),
                }}
              >
                <span>{k}</span>
                <span style={{fontWeight: 900, color: COLORS.neoBlueLight}}>{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </AbsoluteFill>
    );
  } else if (f < 780) {
    // 21–26 ث: عاجل
    const p = spring({frame: f - 632, fps, config: {damping: 11}});
    const flash = interpolate(f, [630, 638], [1, 0], clamp);
    scene = (
      <AbsoluteFill style={{...center, gap: 30}}>
        <AbsoluteFill style={{background: COLORS.copper, opacity: 0.25 + flash * 0.6}} />
        <div
          style={{
            background: COLORS.copper,
            color: '#fff',
            fontSize: 120,
            fontWeight: 900,
            padding: '0 70px',
            transform: `scale(${p}) rotate(-2deg)`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            opacity: Math.floor(f / 10) % 2 && f < 690 ? 0.75 : 1,
          }}
        >
          عاجل
        </div>
        <div dir="rtl" style={{fontSize: 74, fontWeight: 900, color: '#fff', textAlign: 'center', maxWidth: 1600, opacity: p}}>
          نيو كابتا وشركة الدرعية تعلنان شراكة استراتيجية
        </div>
        <div style={{fontSize: 34, fontWeight: 700, color: COLORS.sand, letterSpacing: 4, opacity: interpolate(f, [660, 680], [0, 1], clamp)}}>
          BREAKING: NEO CAPTA &amp; DIRIYAH COMPANY ANNOUNCE A STRATEGIC PARTNERSHIP
        </div>
      </AbsoluteFill>
    );
  } else {
    // 26–30 ث: الختام
    const p = spring({frame: f - 782, fps, config: {damping: 13}});
    scene = (
      <AbsoluteFill style={{...center, gap: 34, opacity: interpolate(f, [880, 900], [1, 0], clamp)}}>
        <div style={{display: 'flex', gap: 60, alignItems: 'center', transform: `scale(${p})`}}>
          <NeoLogo size={240} />
          <Sun />
          <DiriyahLogo size={240} />
        </div>
        <div dir="rtl" style={{fontSize: 70, fontWeight: 900, color: '#fff', opacity: p}}>
          توقعاتنا؟ مستقبل مشمس للإبداع
        </div>
        <div style={{fontSize: 44, fontWeight: 700, color: COLORS.copperLight, opacity: p}}>Neo Capta × Diriyah Company</div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <Audio src={staticFile('music-weather.wav')} />
      <Studio />
      {scene}
      {f >= 90 && f < 780 ? (
        <>
          <Bug />
          <Ticker />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
