import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, reveal } from "../anim";
import { useLang } from "../lang";
import { colors, fonts } from "../theme";
import { bentoCopy } from "./copy";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const bg = "#0a0a10";
const card = "#14141d";
const edge = "rgba(241,240,245,0.09)";

const useCopy = () => {
  const l = useLang();
  return { ...l, c: bentoCopy[l.lang] };
};

type Box = { x: number; y: number; w: number; h: number };
/** Mirror a box horizontally for right-to-left layouts. */
const place = (b: Box, rtl: boolean): Box => (rtl ? { ...b, x: 1920 - b.x - b.w } : b);

const Card: React.FC<{ box: Box; delay: number; frame: number; style?: React.CSSProperties; children?: React.ReactNode; dir?: "rtl" | "ltr" }> = ({
  box,
  delay,
  frame,
  style,
  children,
  dir,
}) => {
  const s = spring({ frame: frame - delay, fps: 30, config: { damping: 15, mass: 0.7 } });
  return (
    <div
      dir={dir}
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        borderRadius: 28,
        background: card,
        border: `1.5px solid ${edge}`,
        overflow: "hidden",
        opacity: Math.min(1, s * 1.4),
        transform: `translateY(${(1 - s) * 40}px) scale(${0.88 + s * 0.12})`,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode; lang: string }> = ({ children, lang }) => (
  <div
    style={{
      position: "absolute",
      top: 26,
      insetInlineStart: 30,
      fontFamily: lang === "ar" ? fonts.ar : fonts.mono,
      fontSize: lang === "ar" ? 26 : 18,
      letterSpacing: lang === "ar" ? 0 : "0.25em",
      color: colors.muted,
    }}
  >
    {children}
  </div>
);

/** Arrow cursor with a click ripple. */
const Cursor: React.FC<{ x: number; y: number; clickAt?: number[]; frame: number }> = ({ x, y, clickAt = [], frame }) => {
  const last = clickAt.filter((c) => frame >= c).pop();
  const r = last === undefined ? 0 : progress(frame, last, 14);
  const press = last !== undefined && frame - last < 4 ? 0.85 : 1;
  return (
    <>
      {last !== undefined && r < 1 && (
        <div
          style={{
            position: "absolute",
            left: x - 40 * r,
            top: y - 40 * r,
            width: 80 * r,
            height: 80 * r,
            borderRadius: "50%",
            border: `2px solid ${colors.lavender}`,
            opacity: 1 - r,
          }}
        />
      )}
      <svg width={40} height={48} style={{ position: "absolute", left: x - 4, top: y - 2, transform: `scale(${press})`, transformOrigin: "4px 2px", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))" }}>
        <path d="M4 2 L4 38 L14 29 L21 45 L28 42 L21 26 L35 26 Z" fill="white" stroke={bg} strokeWidth={2.5} strokeLinejoin="round" />
      </svg>
    </>
  );
};

const lerpPath = (frame: number, keys: [number, number, number][]) => {
  const fs = keys.map((k) => k[0]);
  const ease = (x: number) => 1 - (1 - x) ** 3;
  return {
    x: interpolate(frame, fs, keys.map((k) => k[1]), { ...clamp, easing: ease }),
    y: interpolate(frame, fs, keys.map((k) => k[2]), { ...clamp, easing: ease }),
  };
};

// 0–3s: nine cards snap into a grid; the centre one holds the logo.
export const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const W = 360;
  const H = 220;
  const G = 24;
  const x0 = (1920 - (3 * W + 2 * G)) / 2;
  const y0 = (1080 - (3 * H + 2 * G)) / 2;
  const order = [4, 1, 5, 7, 3, 0, 2, 8, 6];
  const zoom = interpolate(frame, [55, 90], [1, 1.9], { ...clamp, easing: (x) => x * x });

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "960px 540px" }}>
      {order.map((cell, k) => {
        const col = cell % 3;
        const row = Math.floor(cell / 3);
        const box = { x: x0 + col * (W + G), y: y0 + row * (H + G), w: W, h: H };
        const center = cell === 4;
        return (
          <Card key={cell} box={box} delay={k * 4} frame={frame} style={{ opacity: center ? undefined : interpolate(frame, [55, 80], [1, 0.25], clamp), background: center ? "black" : card }}>
            {center ? (
              <Img src={staticFile("logo.jpg")} style={{ position: "absolute", width: 300, height: 300, left: 30, top: -40, mixBlendMode: "lighten" }} />
            ) : (
              <>
                <div style={{ position: "absolute", top: 22, left: 26, fontFamily: fonts.mono, fontSize: 16, letterSpacing: "0.2em", color: colors.muted }}>0{k}</div>
                <svg width={W} height={H} style={{ position: "absolute" }}>
                  {cell % 2 === 0
                    ? new Array(6).fill(0).map((_, i) => (
                        <rect key={i} x={30 + i * 50} y={H - 30 - (40 + random(`h${cell}${i}`) * 80) * progress(frame, k * 4 + i * 2, 20)} width={28} height={(40 + random(`h${cell}${i}`) * 80) * progress(frame, k * 4 + i * 2, 20)} rx={6} fill={i === 3 ? colors.lavender : "rgba(241,240,245,0.12)"} />
                      ))
                    : new Array(3).fill(0).map((_, i) => (
                        <rect key={i} x={30} y={80 + i * 36} width={(120 + random(`w${cell}${i}`) * 160) * progress(frame, k * 4 + i * 3, 20)} height={14} rx={7} fill={i === 0 ? colors.indigo : "rgba(241,240,245,0.12)"} />
                      ))}
                </svg>
              </>
            )}
          </Card>
        );
      })}
    </AbsoluteFill>
  );
};

// 3–8s: the cursor clicks into a search field and types the real question.
export const Search: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, lang } = useCopy();
  const rtl = dir === "rtl";
  const box = { x: 310, y: 440, w: 1300, h: 170 };
  const typed = Math.floor(interpolate(frame, [30, 110], [0, c.question.length], clamp));
  const caret = Math.floor(frame / 8) % 2 === 0 && frame < 120;
  const sent = frame >= 120;
  const load = progress(frame, 120, 30);
  const fieldX = rtl ? 1400 : 520;
  const cur = lerpPath(frame, [
    [0, rtl ? 400 : 1520, 920],
    [22, fieldX, 540],
    [120, fieldX, 540],
    [150, fieldX + (rtl ? -60 : 60), 700],
  ]);

  return (
    <AbsoluteFill>
      <div
        dir={dir}
        style={{
          ...reveal(frame, 0, 14),
          position: "absolute",
          top: 360,
          left: 310,
          right: 310,
          fontFamily: lang === "ar" ? fonts.ar : fonts.mono,
          fontSize: lang === "ar" ? 30 : 20,
          letterSpacing: lang === "ar" ? 0 : "0.3em",
          color: colors.lavender,
        }}
      >
        {c.ask}
      </div>
      <Card box={box} delay={0} frame={frame} dir={dir} style={{ borderColor: sent ? colors.lavender : edge, boxShadow: sent ? `0 0 60px ${colors.lavender}44` : "none", display: "flex", alignItems: "center", gap: 30, padding: "0 50px" }}>
        <svg width={56} height={56} style={{ flexShrink: 0 }}>
          <circle cx={24} cy={24} r={17} fill="none" stroke={colors.lavender} strokeWidth={5} />
          <line x1={37} y1={37} x2={51} y2={51} stroke={colors.lavender} strokeWidth={5} strokeLinecap="round" />
        </svg>
        <div style={{ fontFamily: lang === "ar" ? fonts.ar : fonts.display, fontWeight: lang === "ar" ? 500 : 800, fontSize: lang === "ar" ? 62 : 56, color: colors.white, whiteSpace: "nowrap", letterSpacing: lang === "ar" ? 0 : "-0.02em" }}>
          {c.question.slice(0, typed)}
          <span style={{ opacity: caret ? 1 : 0, color: colors.lavender, fontWeight: 400 }}>|</span>
        </div>
        {sent && (
          <div style={{ position: "absolute", bottom: 0, insetInlineStart: 0, height: 5, width: `${load * 100}%`, background: `linear-gradient(90deg, ${colors.indigo}, ${colors.lavender})` }} />
        )}
      </Card>
      <Cursor x={cur.x} y={cur.y} clickAt={[25, 120]} frame={frame} />
    </AbsoluteFill>
  );
};

// 8–14s: the answer arrives as a bento of insight cards.
export const Answer: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale, lang } = useCopy();
  const rtl = dir === "rtl";
  const A = place({ x: 140, y: 140, w: 1000, h: 440 }, rtl);
  const B = place({ x: 1164, y: 140, w: 616, h: 440 }, rtl);
  const C = place({ x: 140, y: 604, w: 480, h: 336 }, rtl);
  const D = place({ x: 644, y: 604, w: 560, h: 336 }, rtl);
  const E = place({ x: 1228, y: 604, w: 552, h: 336 }, rtl);

  let line = "";
  for (let i = 0; i <= 40; i++) {
    const x = 40 + i * 13.4;
    const y = 330 - (i / 40) * 170 - 40 * Math.sin(i / 4) - 20 * Math.sin(i / 1.7);
    line += `${i ? "L" : "M"} ${rtl ? 616 - x : x} ${y.toFixed(1)} `;
  }
  const draw = progress(frame, 16, 60);
  const ring = progress(frame, 24, 60) * 0.78;
  const pulse = (frame % 40) / 40;

  return (
    <AbsoluteFill>
      <Card box={A} delay={0} frame={frame} dir={dir} style={{ padding: "90px 50px 0" }}>
        <Label lang={lang}>{c.insightLabel}</Label>
        <div style={{ ...display, fontSize: 80 * scale, lineHeight: 1.15, whiteSpace: "nowrap" }}>
          <div style={reveal(frame, 10)}>{c.insight[0]}</div>
          <div style={{ ...reveal(frame, 24), color: colors.lavender }}>{c.insight[1]}</div>
        </div>
      </Card>
      <Card box={B} delay={8} frame={frame} dir={dir}>
        <Label lang={lang}>{c.chartLabel}</Label>
        <svg width={616} height={440} style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={colors.lavender} stopOpacity={0.35} />
              <stop offset="1" stopColor={colors.lavender} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`${line} L ${rtl ? 40 : 576} 400 L ${rtl ? 576 : 40} 400 Z`} fill="url(#area)" opacity={draw} />
          <path d={line} fill="none" stroke={colors.lavender} strokeWidth={5} strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - draw)} />
        </svg>
      </Card>
      <Card box={C} delay={16} frame={frame} dir={dir}>
        <Label lang={lang}>{c.focusLabel}</Label>
        <svg width={480} height={336} style={{ position: "absolute" }}>
          <circle cx={240} cy={190} r={95} fill="none" stroke="rgba(241,240,245,0.1)" strokeWidth={26} />
          <circle cx={240} cy={190} r={95} fill="none" stroke={colors.lavender} strokeWidth={26} strokeLinecap="round" strokeDasharray={`${ring * 597} 597`} transform="rotate(-90 240 190)" />
          <circle cx={240} cy={190} r={22} fill={colors.indigo} />
        </svg>
      </Card>
      <Card box={D} delay={24} frame={frame} dir={dir}>
        <Label lang={lang}>{c.signalsLabel}</Label>
        <div style={{ position: "absolute", top: 100, left: 30, right: 30, display: "flex", flexWrap: "wrap", gap: 16 }}>
          {c.chips.map((chip, i) => (
            <div
              key={chip}
              style={{
                ...reveal(frame, 34 + i * 6, 12),
                padding: "12px 26px",
                borderRadius: 999,
                background: i === 0 ? colors.lavender : "rgba(241,240,245,0.08)",
                color: i === 0 ? bg : colors.white,
                fontFamily: lang === "ar" ? fonts.ar : fonts.display,
                fontWeight: 700,
                fontSize: lang === "ar" ? 36 : 32,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </Card>
      <Card box={E} delay={32} frame={frame} dir={dir}>
        <Label lang={lang}>{c.city}</Label>
        <svg width={552} height={336} style={{ position: "absolute" }}>
          {new Array(14 * 7).fill(0).map((_, i) => {
            const gx = 50 + (i % 14) * 34;
            const gy = 90 + Math.floor(i / 14) * 34;
            return <circle key={i} cx={gx} cy={gy} r={3} fill="rgba(241,240,245,0.18)" />;
          })}
          <circle cx={rtl ? 220 : 322} cy={192} r={10 + pulse * 50} fill="none" stroke={colors.lavender} strokeWidth={3} opacity={1 - pulse} />
          <circle cx={rtl ? 220 : 322} cy={192} r={10} fill={colors.lavender} />
        </svg>
      </Card>
    </AbsoluteFill>
  );
};

/** Line icons for the five services. */
const Icon: React.FC<{ i: number }> = ({ i }) => {
  switch (i) {
    case 0: // strategy: target
      return (
        <g>
          <circle cx={40} cy={40} r={30} />
          <circle cx={40} cy={40} r={17} />
          <circle cx={40} cy={40} r={5} fill="currentColor" />
        </g>
      );
    case 1: // creators: person with a spark
      return (
        <g>
          <circle cx={34} cy={26} r={12} />
          <path d="M12 68 C12 48 56 48 56 68" />
          <path d="M64 10 L64 26 M56 18 L72 18" />
        </g>
      );
    case 2: // content: play button
      return (
        <g>
          <rect x={10} y={14} width={60} height={52} rx={10} />
          <path d="M34 28 L52 40 L34 52 Z" fill="currentColor" />
        </g>
      );
    case 3: // performance: rising arrow
      return (
        <g>
          <path d="M10 64 L32 40 L46 52 L70 20" />
          <path d="M54 20 L70 20 L70 36" />
        </g>
      );
    default: // intelligence: sparkle
      return <path d="M40 8 C44 30 50 36 72 40 C50 44 44 50 40 72 C36 50 30 44 8 40 C30 36 36 30 40 8 Z" />;
  }
};

// 14–20s: one team, five superpowers — the cursor lights each card.
export const Services: React.FC = () => {
  const frame = useCurrentFrame();
  const { t, c, dir, display, scale, lang } = useCopy();
  const rtl = dir === "rtl";
  const W = (1640 - 4 * 24) / 5;
  const boxes = t.pillars.map((_, i) => place({ x: 140 + i * (W + 24), y: 380, w: W, h: 460 }, rtl));
  const clicks = boxes.map((_, i) => 30 + i * 25);
  const keys: [number, number, number][] = [[0, rtl ? 300 : 1620, 980]];
  boxes.forEach((b, i) => {
    keys.push([clicks[i] - 6, b.x + b.w / 2, b.y + b.h / 2 + 40]);
    keys.push([clicks[i] + 4, b.x + b.w / 2, b.y + b.h / 2 + 40]);
  });
  const cur = lerpPath(frame, keys);

  return (
    <AbsoluteFill>
      <Card box={{ x: 140, y: 140, w: 1640, h: 200 }} delay={0} frame={frame} dir={dir} style={{ display: "flex", alignItems: "center", padding: "0 50px" }}>
        <div style={{ ...display, fontSize: 96 * scale, whiteSpace: "nowrap" }}>
          {c.team[0]}
          <span style={{ color: colors.lavender }}>{c.team[1]}</span>
        </div>
      </Card>
      {t.pillars.map((name, i) => {
        const on = frame >= clicks[i];
        return (
          <Card
            key={name}
            box={boxes[i]}
            delay={6 + i * 4}
            frame={frame}
            dir={dir}
            style={{ background: on ? colors.lavender : card, borderColor: on ? colors.lavender : edge, color: on ? bg : colors.white, transition: "none" }}
          >
            <div style={{ position: "absolute", top: 28, insetInlineStart: 30, fontFamily: fonts.mono, fontSize: 20, letterSpacing: "0.2em", opacity: 0.7 }}>0{i + 1}</div>
            <svg width={80} height={80} style={{ position: "absolute", top: 110, insetInlineStart: 30, color: on ? bg : colors.lavender }} fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
              <Icon i={i} />
            </svg>
            <div style={{ position: "absolute", bottom: 34, insetInlineStart: 30, insetInlineEnd: 20, fontFamily: lang === "ar" ? fonts.ar : fonts.display, fontWeight: lang === "ar" ? 700 : 800, fontSize: lang === "ar" ? 44 : 38, letterSpacing: lang === "ar" ? 0 : "-0.02em", lineHeight: 1.1 }}>
              {name}
            </div>
          </Card>
        );
      })}
      <Cursor x={cur.x} y={cur.y} clickAt={clicks} frame={frame} />
    </AbsoluteFill>
  );
};

// 20–25s: everything collapses into one card that becomes the whole frame.
export const Collapse: React.FC = () => {
  const frame = useCurrentFrame();
  const { c, dir, display, scale } = useCopy();
  const gather = progress(frame, 0, 12);
  const grow = interpolate(frame, [12, 30], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const w = interpolate(grow, [0, 1], [300, 1920]);
  const h = interpolate(grow, [0, 1], [300, 1080]);

  return (
    <AbsoluteFill dir={dir}>
      {frame < 14 &&
        new Array(5).fill(0).map((_, i) => {
          const sx = 140 + i * 332 + 154;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: interpolate(gather, [0, 1], [sx, 960]) - 150,
                top: interpolate(gather, [0, 1], [610, 540]) - 150,
                width: 300,
                height: 300,
                borderRadius: 28,
                background: colors.lavender,
                opacity: 0.9,
                transform: `rotate(${(i - 2) * 6 * (1 - gather)}deg)`,
              }}
            />
          );
        })}
      {frame >= 12 && (
        <div style={{ position: "absolute", left: 960 - w / 2, top: 540 - h / 2, width: w, height: h, borderRadius: 28 * (1 - grow), background: colors.lavender }} />
      )}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ ...display, color: bg, fontSize: 170 * scale, textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={reveal(frame, 36)}>{c.smarter[0]}</div>
          <div style={{ ...reveal(frame, 52), color: "white" }}>{c.smarter[1]}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 25–30s: the lavender frame shrinks into the logo card; official line below.
export const BentoOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, dir, display, scale, small, lang } = useCopy();
  const s = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const w = interpolate(s, [0, 1], [1920, 460]);
  const h = interpolate(s, [0, 1], [1080, 460]);
  const cy = interpolate(s, [0, 1], [540, 380]);
  const toBlack = interpolate(frame, [durationInFrames - 18, durationInFrames], [0, 1], clamp);

  return (
    <AbsoluteFill dir={dir}>
      <div
        style={{
          position: "absolute",
          left: 960 - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: 36 * s,
          background: `color-mix(in srgb, black ${Math.round(s * 100)}%, ${colors.lavender})`,
          border: `1.5px solid ${edge}`,
          overflow: "hidden",
        }}
      >
        <Img src={staticFile("logo.jpg")} style={{ position: "absolute", width: 520, height: 520, left: w / 2 - 260, top: h / 2 - 270, mixBlendMode: "lighten", opacity: progress(frame, 14, 16) }} />
      </div>
      <div style={{ ...reveal(frame, 22), position: "absolute", top: 680, width: "100%", textAlign: "center", ...display, fontSize: 100 * scale, whiteSpace: "nowrap" }}>
        {t.tagline[0]} {t.tagline[1]}
        <span style={{ color: colors.lavender }}>{t.tagline[2]}</span>
      </div>
      <div style={{ ...reveal(frame, 36), ...small, position: "absolute", bottom: 90, width: "100%", textAlign: "center", letterSpacing: lang === "ar" ? 0 : "0.3em" }}>{t.footer}</div>
      <AbsoluteFill style={{ background: "black", opacity: toBlack }} />
    </AbsoluteFill>
  );
};
