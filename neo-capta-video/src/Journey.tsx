import React from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame } from 'remotion';
import { JOURNEY, Lang } from './copy';
import {
  AnimatedLine,
  BLUE,
  BLUE_LIGHT,
  Backdrop,
  BrandEndCard,
  FPS,
  PersonSvg,
  Vignette,
  WHITE,
  clamp,
  ease,
  fontFor,
} from './shared';

export const JOURNEY_DURATION = 22 * FPS;

// Scene boundaries (frames) — keep in sync with music/compose.py score_journey.
const STEP0 = 75;
const STEP_LEN = 120;
const END = STEP0 + 4 * STEP_LEN + 0; // 555

const PANEL_W = 780;
const PANEL_H = 560;

const draw = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });

/* ------------------------------------------------------------ panels */

// 01 — understand the audience: a magnifier scans a crowd, insight bars grow.
const AudiencePanel: React.FC<{ t: number }> = ({ t }) => {
  const mx = 120 + interpolate(t, [10, 100], [0, 520], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const my = 170 + Math.sin(t / 10) * 50;
  const people = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      const x = 80 + c * 88;
      const y = 70 + r * 78;
      const near = Math.hypot(x - mx, y + 10 - my) < 95;
      const pop = draw(t, (r * 8 + c) * 0.6, (r * 8 + c) * 0.6 + 8);
      const color = near ? BLUE_LIGHT : 'rgba(232,233,238,0.35)';
      people.push(
        <g key={`${r}-${c}`} transform={`translate(${x} ${y}) scale(${pop})`}>
          <circle cx={0} cy={-14} r={11} fill={color} />
          <path d="M-20 22 Q-20 0 0 0 Q20 0 20 22 Z" fill={color} />
        </g>,
      );
    }
  }
  return (
    <svg width={PANEL_W} height={PANEL_H}>
      {people}
      <g transform={`translate(${mx} ${my})`} opacity={draw(t, 8, 16)}>
        <circle r={86} fill="rgba(116,134,242,0.08)" stroke={WHITE} strokeWidth={5} />
        <path d="M62 62 L110 110" stroke={WHITE} strokeWidth={12} strokeLinecap="round" />
      </g>
      {[0.82, 0.58, 0.92].map((w, k) => (
        <g key={k} transform={`translate(80 ${390 + k * 52})`}>
          <rect width={620} height={22} rx={11} fill="rgba(232,233,238,0.1)" />
          <rect width={620 * w * draw(t, 30 + k * 10, 70 + k * 10)} height={22} rx={11} fill={k === 2 ? BLUE_LIGHT : BLUE} />
        </g>
      ))}
    </svg>
  );
};

// 02 — strategy: a target at the centre, connected to channel nodes.
const StrategyPanel: React.FC<{ t: number }> = ({ t }) => {
  const cx = PANEL_W / 2;
  const cy = PANEL_H / 2;
  const nodes = [0, 1, 2, 3, 4, 5].map((k) => {
    const a = -Math.PI / 2 + (k * Math.PI * 2) / 6;
    return [cx + Math.cos(a) * 270, cy + Math.sin(a) * 195];
  });
  const pulse = 1 + Math.sin(t / 6) * 0.04;
  return (
    <svg width={PANEL_W} height={PANEL_H}>
      {nodes.map(([x, y], k) => {
        const p = draw(t, 12 + k * 7, 30 + k * 7);
        return (
          <g key={k}>
            <line x1={cx} y1={cy} x2={cx + (x - cx) * p} y2={cy + (y - cy) * p} stroke={BLUE_LIGHT} strokeWidth={3} strokeDasharray="10 8" opacity={0.8} />
            <g transform={`translate(${x} ${y}) scale(${draw(t, 26 + k * 7, 34 + k * 7)})`}>
              <rect x={-62} y={-28} width={124} height={56} rx={28} fill="rgba(23,36,107,0.95)" stroke={BLUE_LIGHT} strokeWidth={2.5} />
              <rect x={-36} y={-6} width={72 * draw(t, 32 + k * 7, 44 + k * 7)} height={12} rx={6} fill={k % 2 ? WHITE : BLUE_LIGHT} opacity={0.85} />
            </g>
          </g>
        );
      })}
      <g transform={`translate(${cx} ${cy}) scale(${draw(t, 0, 14) * pulse})`}>
        {[78, 56, 34].map((r, k) => (
          <circle key={r} r={r} fill={k === 1 ? BLUE : 'none'} stroke={k === 1 ? 'none' : WHITE} strokeWidth={8} />
        ))}
        <circle r={12} fill={WHITE} />
        <g transform={`translate(${interpolate(t, [40, 52], [160, 0], { ...clamp, easing: Easing.in(Easing.cubic) })} ${interpolate(t, [40, 52], [-160, 0], { ...clamp, easing: Easing.in(Easing.cubic) })})`} opacity={draw(t, 38, 42)}>
          <path d="M0 0 L70 -70" stroke={BLUE_LIGHT} strokeWidth={7} strokeLinecap="round" />
          <path d="M70 -70 L58 -92 M70 -70 L92 -58" stroke={BLUE_LIGHT} strokeWidth={7} strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
};

// 03 — create: a layout assembles on an artboard while a cursor places each piece.
const CreatePanel: React.FC<{ t: number }> = ({ t }) => {
  const items: { x: number; y: number; w: number; h: number; at: number; fill: string; rx?: number }[] = [
    { x: 70, y: 60, w: 300, h: 300, at: 8, fill: 'url(#heroGrad)', rx: 16 },
    { x: 410, y: 80, w: 300, h: 36, at: 30, fill: WHITE, rx: 8 },
    { x: 410, y: 130, w: 220, h: 36, at: 38, fill: WHITE, rx: 8 },
    { x: 410, y: 200, w: 290, h: 14, at: 48, fill: 'rgba(232,233,238,0.5)', rx: 7 },
    { x: 410, y: 228, w: 260, h: 14, at: 52, fill: 'rgba(232,233,238,0.5)', rx: 7 },
    { x: 410, y: 256, w: 200, h: 14, at: 56, fill: 'rgba(232,233,238,0.5)', rx: 7 },
    { x: 410, y: 300, w: 170, h: 54, at: 66, fill: BLUE_LIGHT, rx: 27 },
  ];
  const targets = items.map((it) => [it.x + it.w * 0.7, it.y + it.h * 0.6]);
  let cx = 700;
  let cy = 520;
  let active = -1;
  items.forEach((it, k) => {
    const p = draw(t, it.at - 8, it.at);
    if (p > 0) {
      cx = cx + (targets[k][0] - cx) * p;
      cy = cy + (targets[k][1] - cy) * p;
      active = k;
    }
  });
  const sel = active >= 0 ? items[active] : null;
  return (
    <svg width={PANEL_W} height={PANEL_H}>
      <defs>
        <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BLUE_LIGHT} />
          <stop offset="1" stopColor={BLUE} />
        </linearGradient>
      </defs>
      <rect x={40} y={30} width={700} height={360} rx={18} fill="rgba(5,8,26,0.6)" stroke="rgba(232,233,238,0.2)" strokeDasharray="6 6" />
      {items.map((it, k) => {
        const p = draw(t, it.at, it.at + 8);
        return (
          <rect
            key={k}
            x={it.x}
            y={it.y}
            width={it.w * p}
            height={it.h}
            rx={it.rx}
            fill={it.fill}
            opacity={p}
          />
        );
      })}
      {draw(t, 8, 16) > 0.9 && (
        <g transform="translate(220 210)" opacity={draw(t, 16, 26)}>
          <circle r={70} fill="rgba(255,255,255,0.15)" />
          <path d="M-36 30 L-6 -10 L16 14 L30 -2 L48 30 Z" fill={WHITE} opacity={0.85} />
          <circle cx={20} cy={-30} r={10} fill={WHITE} />
        </g>
      )}
      {sel && (
        <g opacity={0.9}>
          <rect x={sel.x - 6} y={sel.y - 6} width={sel.w + 12} height={sel.h + 12} fill="none" stroke={WHITE} strokeWidth={1.5} />
          {[
            [sel.x - 6, sel.y - 6],
            [sel.x + sel.w + 6, sel.y - 6],
            [sel.x - 6, sel.y + sel.h + 6],
            [sel.x + sel.w + 6, sel.y + sel.h + 6],
          ].map(([x, y], k) => (
            <rect key={k} x={x - 5} y={y - 5} width={10} height={10} fill={WHITE} stroke={BLUE} strokeWidth={2} />
          ))}
        </g>
      )}
      {/* colour swatches + tool bar */}
      {[BLUE, BLUE_LIGHT, WHITE, '#0a1033'].map((c, k) => (
        <circle key={c} cx={80 + k * 54} cy={460} r={20 * draw(t, 70 + k * 4, 78 + k * 4)} fill={c} stroke="rgba(232,233,238,0.4)" strokeWidth={2} />
      ))}
      <rect x={340} y={440} width={400} height={40} rx={20} fill="rgba(232,233,238,0.08)" />
      <rect x={340} y={440} width={400 * draw(t, 60, 110)} height={40} rx={20} fill="rgba(116,134,242,0.35)" />
      <path
        d="M0 0 L0 34 L9 25 L16 40 L22 37 L15 23 L27 23 Z"
        fill={WHITE}
        stroke="#000"
        strokeWidth={1.5}
        transform={`translate(${cx} ${cy})`}
      />
    </svg>
  );
};

// 04 — launch & measure: a feed scrolls on a phone, a growth curve draws, reactions pop.
const LaunchPanel: React.FC<{ t: number }> = ({ t }) => {
  const scroll = interpolate(t, [10, 110], [0, -260], clamp);
  const chart = draw(t, 18, 90);
  const pts = Array.from({ length: 9 }, (_, k) => {
    const x = 330 + k * 50;
    const y = 400 - (Math.pow(k / 8, 1.6) * 260 + Math.sin(k * 1.9) * 18 + 20);
    return [x, y];
  });
  const visible = Math.max(1, Math.floor(chart * (pts.length - 1)) + 1);
  const frac = chart * (pts.length - 1) - (visible - 1);
  const shown = pts.slice(0, visible);
  if (visible < pts.length) {
    const [ax, ay] = pts[visible - 1];
    const [bx, by] = pts[visible];
    shown.push([ax + (bx - ax) * frac, ay + (by - ay) * frac]);
  }
  const line = shown.map(([x, y], k) => `${k ? 'L' : 'M'}${x} ${y}`).join(' ');
  const area = `${line} L${shown[shown.length - 1][0]} 420 L330 420 Z`;
  const [hx, hy] = shown[shown.length - 1];
  return (
    <svg width={PANEL_W} height={PANEL_H}>
      <defs>
        <clipPath id="screen">
          <rect x={64} y={70} width={196} height={380} rx={14} />
        </clipPath>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BLUE_LIGHT} stopOpacity="0.55" />
          <stop offset="1" stopColor={BLUE_LIGHT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={50} y={40} width={224} height={440} rx={30} fill="#05081a" stroke={WHITE} strokeWidth={4} />
      <g clipPath="url(#screen)">
        <g transform={`translate(0 ${scroll})`}>
          {[0, 1, 2, 3].map((k) => (
            <g key={k} transform={`translate(74 ${82 + k * 150})`}>
              <circle cx={14} cy={12} r={10} fill={k % 2 ? BLUE_LIGHT : WHITE} />
              <rect x={32} y={7} width={90} height={10} rx={5} fill="rgba(232,233,238,0.5)" />
              <rect x={0} y={32} width={176} height={92} rx={8} fill={k % 2 ? BLUE : 'rgba(116,134,242,0.6)'} />
              <path d="M14 136 c-3 -4 -10 -1 -7 4 l7 7 l7 -7 c3 -5 -4 -8 -7 -4 z" fill="#ff5a7a" transform="translate(0 -4)" />
            </g>
          ))}
        </g>
      </g>
      <line x1={330} y1={420} x2={740} y2={420} stroke="rgba(232,233,238,0.3)" strokeWidth={2} />
      <line x1={330} y1={120} x2={330} y2={420} stroke="rgba(232,233,238,0.3)" strokeWidth={2} />
      <path d={area} fill="url(#area)" />
      <path d={line} fill="none" stroke={BLUE_LIGHT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={10} fill={WHITE} stroke={BLUE_LIGHT} strokeWidth={4} />
      {[0, 1, 2, 3, 4].map((k) => {
        const at = 30 + k * 16;
        const p = interpolate(t, [at, at + 6, at + 30], [0, 1, 0], clamp);
        const x = 380 + random(`hx-${k}`) * 320;
        const y = 300 - (t - at) * 3;
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${p * 1.6})`} opacity={p}>
            <circle r={20} fill={k % 2 ? BLUE : '#ff5a7a'} />
            <path d="M0 -2 c-3 -5 -11 -2 -8 4 l8 8 l8 -8 c3 -6 -5 -9 -8 -4 z" fill={WHITE} transform="translate(0 -2)" />
          </g>
        );
      })}
    </svg>
  );
};

const PANELS = [AudiencePanel, StrategyPanel, CreatePanel, LaunchPanel];

/* ------------------------------------------------------------ step layout */

const Step: React.FC<{ f: number; k: number; lang: Lang }> = ({ f, k, lang }) => {
  const start = STEP0 + k * STEP_LEN;
  const t = f - start;
  if (t < 0 || t > STEP_LEN) return null;
  const copy = JOURNEY[lang].steps[k];
  const rtl = lang === 'ar';
  const out = interpolate(t, [STEP_LEN - 12, STEP_LEN], [0, 1], clamp);
  const enter = (d: number) => {
    const p = draw(t, d, d + 16);
    return {
      opacity: p * (1 - out),
      transform: `translate(${(1 - p) * (rtl ? -60 : 60)}px, ${-out * 40}px)`,
      filter: `blur(${(1 - p) * 10 + out * 8}px)`,
    };
  };
  const Panel = PANELS[k];
  const panelP = draw(t, 4, 22);
  return (
    <AbsoluteFill>
      <div
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          position: 'absolute',
          top: 200,
          [rtl ? 'right' : 'left']: 150,
          width: 760,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          textAlign: rtl ? 'right' : 'left',
        }}
      >
        <div
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 800,
            fontSize: 190,
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: `3px ${BLUE_LIGHT}`,
            ...enter(0),
          }}
        >
          0{k + 1}
        </div>
        <div
          style={{
            fontFamily: fontFor(lang),
            fontWeight: rtl ? 900 : 800,
            fontSize: rtl ? 92 : 70,
            lineHeight: 1.2,
            color: WHITE,
            ...enter(6),
          }}
        >
          {copy.title}
        </div>
        <div style={{ height: 4, width: 140 * draw(t, 14, 34), background: BLUE_LIGHT, borderRadius: 2, ...enter(12), filter: undefined }} />
        <div
          style={{
            fontFamily: fontFor(lang),
            fontWeight: 500,
            fontSize: rtl ? 38 : 28,
            letterSpacing: rtl ? undefined : '0.18em',
            textTransform: rtl ? undefined : 'uppercase',
            color: 'rgba(232,233,238,0.75)',
            whiteSpace: 'pre',
            ...enter(14),
          }}
        >
          {copy.sub}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 170,
          [rtl ? 'left' : 'right']: 130,
          width: PANEL_W,
          height: PANEL_H,
          borderRadius: 28,
          overflow: 'hidden',
          background: 'linear-gradient(160deg, rgba(23,36,107,0.75), rgba(5,8,26,0.85))',
          border: '1.5px solid rgba(116,134,242,0.5)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(59,76,192,0.3)',
          opacity: panelP * (1 - out),
          transform: `translateY(${(1 - panelP) * 60 - out * 40}px) scale(${interpolate(panelP, [0, 1], [0.94, 1])})`,
        }}
      >
        <Panel t={t} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ progress track */

const NODES = [360, 760, 1160, 1560];
const TRACK_Y = 965;

const Track: React.FC<{ f: number; lang: Lang }> = ({ f, lang }) => {
  const appear = draw(f, 20, 60);
  const hide = interpolate(f, [END - 10, END + 8], [1, 0], clamp);
  if (hide <= 0) return null;
  let x = NODES[0];
  for (let k = 1; k < 4; k++) {
    const s = STEP0 + k * STEP_LEN - 14;
    x += (NODES[k] - NODES[k - 1]) * ease(f, s, s + 24, [0, 1], Easing.inOut(Easing.cubic));
  }
  const runW = 74;
  return (
    <AbsoluteFill style={{ opacity: hide }}>
      <div style={{ position: 'absolute', left: NODES[0], top: TRACK_Y - 1.5, width: (NODES[3] - NODES[0]) * appear, height: 3, background: 'rgba(232,233,238,0.18)' }} />
      <div
        style={{
          position: 'absolute',
          left: NODES[0],
          top: TRACK_Y - 2.5,
          width: x - NODES[0],
          height: 5,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${BLUE}, ${BLUE_LIGHT})`,
          boxShadow: `0 0 16px ${BLUE_LIGHT}`,
        }}
      />
      {NODES.map((nx, k) => {
        const reached = x >= nx - 1;
        const p = draw(f, 24 + k * 6, 36 + k * 6);
        return (
          <React.Fragment key={k}>
            <div
              style={{
                position: 'absolute',
                left: nx - 13,
                top: TRACK_Y - 13,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: reached ? BLUE_LIGHT : '#05081a',
                border: `3px solid ${reached ? WHITE : 'rgba(232,233,238,0.4)'}`,
                transform: `scale(${p})`,
                boxShadow: reached ? `0 0 18px ${BLUE_LIGHT}` : 'none',
              }}
            />
            <div
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              style={{
                position: 'absolute',
                left: nx - 200,
                width: 400,
                top: TRACK_Y + 26,
                textAlign: 'center',
                fontFamily: fontFor(lang),
                fontSize: lang === 'ar' ? 26 : 20,
                fontWeight: 700,
                letterSpacing: lang === 'en' ? '0.12em' : undefined,
                textTransform: lang === 'en' ? 'uppercase' : undefined,
                color: reached ? WHITE : 'rgba(232,233,238,0.4)',
                opacity: p,
              }}
            >
              {JOURNEY[lang].steps[k].title.replace(/^We /, '')}
            </div>
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: x - runW / 2,
          top: TRACK_Y - 70 + Math.sin(f / 3.5) * 3,
          opacity: appear,
          filter: 'drop-shadow(0 0 12px rgba(90,110,255,0.9))',
        }}
      >
        <PersonSvg width={runW} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ composition */

export const Journey: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const copy = JOURNEY[lang];
  const fadeOut = interpolate(f, [JOURNEY_DURATION - 12, JOURNEY_DURATION - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('audio/journey.wav')} />
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Backdrop
          f={f}
          duration={JOURNEY_DURATION}
          reveal={interpolate(f, [0, 30], [0, 1], clamp)}
          dots={interpolate(f, [0, 40, END - 20, END + 20], [0, 0.18, 0.18, 0.26], clamp)}
        />
        <AnimatedLine
          f={f}
          lang={lang}
          text={copy.title}
          start={8}
          end={STEP0 - 2}
          y={500}
          size={lang === 'ar' ? 110 : 92}
          weight={lang === 'ar' ? 900 : 800}
        />
        {[0, 1, 2, 3].map((k) => (
          <Step key={k} f={f} k={k} lang={lang} />
        ))}
        <Track f={f} lang={lang} />
        <BrandEndCard
          f={f}
          start={END}
          lang={lang}
          services={copy.services}
          tagline={copy.tagline}
          highlight={copy.taglineHighlight}
          taglineAt={40}
        />
        <Vignette />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
