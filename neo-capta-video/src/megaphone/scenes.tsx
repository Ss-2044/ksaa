import { AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { progress } from "../anim";
import { useLang } from "../lang";
import { colors, fonts } from "../theme";
import { Blob, Heart, inkLine, Megaphone, Mood, Neo, Tumbleweed } from "./characters";
import { megaCopy } from "./copy";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const paper = "#f6f3ff";
const GROUND = 880;
const crowdColors = ["#c9c2ff", "#ffd35c", "#9be3c8", "#ffb3c7", "#8fd3ff"];

const useCopy = () => {
  const l = useLang();
  return { ...l, c: megaCopy[l.lang] };
};

/** Tilted black sticker label. */
const Sticker: React.FC<{ text: string; x: number; y: number; rot: number; frame: number; start: number; size?: number; bg?: string; fg?: string }> = ({
  text,
  x,
  y,
  rot,
  frame,
  start,
  size = 56,
  bg = inkLine,
  fg = "white",
}) => {
  const { lang } = useLang();
  const s = spring({ frame: frame - start, fps: 30, config: { damping: 9, mass: 0.6 } });
  if (frame < start) return null;
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`,
        background: bg,
        color: fg,
        padding: "14px 34px",
        borderRadius: 18,
        fontFamily: lang === "ar" ? fonts.ar : fonts.display,
        fontWeight: lang === "ar" ? 700 : 900,
        fontSize: size,
        letterSpacing: lang === "ar" ? 0 : "-0.02em",
        whiteSpace: "nowrap",
        boxShadow: `8px 8px 0 ${colors.lavender}`,
      }}
    >
      {text}
    </div>
  );
};

/** Spiky comic shout bubble. */
const ShoutBubble: React.FC<{ text: string; x: number; y: number; frame: number; start: number; len: number; size: number }> = ({ text, x, y, frame, start, len, size }) => {
  const { lang } = useLang();
  const local = frame - start;
  if (local < 0 || local > len) return null;
  const s = spring({ frame: local, fps: 30, config: { damping: 8, mass: 0.5 } }) * interpolate(local, [len - 5, len], [1, 0], clamp);
  const pts = new Array(24).fill(0).map((_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 === 0 ? 1 : 0.78;
    return `${(Math.cos(a) * r * 50 + 50).toFixed(1)}% ${(Math.sin(a) * r * 50 + 50).toFixed(1)}%`;
  });
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s}) rotate(${Math.sin(local) * 3}deg)`,
        padding: "80px 110px",
        background: "#ffd35c",
        clipPath: `polygon(${pts.join(",")})`,
        fontFamily: lang === "ar" ? fonts.ar : fonts.display,
        fontWeight: 900,
        fontSize: size,
        color: inkLine,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// 0–3s: the logo drops in as a bouncy sticker, with confetti.
export const LogoDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const fall = spring({ frame, fps: 30, config: { damping: 7, mass: 0.9, stiffness: 120 } });
  const y = interpolate(fall, [0, 1], [-700, 0]);
  const impact = Math.max(0, 1 - Math.abs(frame - 12) / 6);
  const exit = interpolate(frame, [76, 90], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ background: paper }}>
      {frame > 11 &&
        new Array(40).fill(0).map((_, i) => {
          const a = random(`a${i}`) * Math.PI * 2;
          const v = 12 + random(`v${i}`) * 22;
          const tt = frame - 12;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 960 + Math.cos(a) * v * tt,
                top: 540 + Math.sin(a) * v * tt + 0.9 * tt * tt,
                width: 18,
                height: 10,
                background: [colors.lavender, colors.indigo, "#ffd35c", "#ff9fb8", "#9be3c8"][i % 5],
                transform: `rotate(${tt * 20 + i * 30}deg)`,
              }}
            />
          );
        })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exit }}>
        <div
          style={{
            transform: `translateY(${y}px) scale(${1 + impact * 0.18}, ${1 - impact * 0.18}) rotate(${-4 + fall * 4}deg)`,
            border: "14px solid white",
            borderRadius: 60,
            boxShadow: `16px 16px 0 ${colors.lavender}, 0 30px 60px rgba(0,0,0,0.2)`,
            overflow: "hidden",
            width: 520,
            height: 520,
            background: "black",
          }}
        >
          <Img src={staticFile("logo.jpg")} style={{ width: 520, height: 520 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 3–25s: the whole comedy plays out on one stage.
export const Stage: React.FC = () => {
  const f = useCurrentFrame();
  const { c, lang } = useCopy();
  const rtl = lang === "ar";
  // Stage directions are written left-to-right; mirror x for Arabic so the story reads right-to-left.
  const X = (x: number) => (rtl ? 1920 - x : x);

  // megaphone
  const rage = interpolate(f, [180, 260], [0, 1], clamp);
  const deflate = interpolate(f, [375, 400], [0, 1], clamp);
  const megaScale = interpolate(f, [180, 260], [1, 1.35], clamp) * interpolate(deflate, [0, 1], [1, 0.6]);
  const shoutTimes = [15, 60, 105, 150];
  const louderTimes = [186, 210, 234];
  const shouting = [...shoutTimes, ...louderTimes].some((s) => f >= s && f < s + 30);

  // crowd
  const crowd = [0, 1, 2, 3, 4].map((i) => {
    const home = 1180 + i * 150;
    const leaveAt = 240 + i * 15;
    const backAt = 435 + i * 9;
    let x = home;
    let mood: Mood = i === 3 ? "sleep" : "bored";
    if (f >= leaveAt && f < backAt) x = home + progress(f, leaveAt, 25) * 900;
    if (f >= backAt) {
      x = home + (1 - progress(f, backAt, 14)) * 900;
      mood = f < 480 ? "curious" : "happy";
    }
    const hop = f >= leaveAt && f < leaveAt + 25 ? Math.abs(Math.sin((f - leaveAt) / 3)) * 50 : f >= backAt && f < backAt + 14 ? Math.abs(Math.sin((f - backAt) / 2.5)) * 60 : 0;
    return { i, x, y: GROUND - hop, mood, backAt };
  });

  // tumbleweed
  const tw = interpolate(f, [290, 335], [-150, 2100], clamp);

  // Neo
  const neoX = interpolate(f, [330, 360], [-250, 820], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 });
  const neoOn = f >= 330;
  const party = f >= 510;

  return (
    <AbsoluteFill style={{ background: paper }}>
      {/* sky doodles */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <line x1={0} y1={GROUND + 6} x2={1920} y2={GROUND + 6} stroke={inkLine} strokeWidth={6} />
        {new Array(12).fill(0).map((_, i) => (
          <line key={i} x1={80 + i * 160} y1={GROUND + 40} x2={120 + i * 160} y2={GROUND + 40} stroke={inkLine} strokeWidth={4} opacity={0.2} />
        ))}
        {/* sun */}
        <circle cx={X(1700)} cy={170} r={60} fill="#ffd35c" stroke={inkLine} strokeWidth={5} />
      </svg>

      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g transform={rtl ? "translate(1920 0) scale(-1 1)" : undefined}>
          <Megaphone x={430} y={GROUND - 150 * megaScale} frame={f} rage={rage} deflate={deflate} scale={megaScale} shouting={shouting && deflate === 0} />
          {crowd.map((p) => (
            <Blob key={p.i} x={p.x} y={p.y} color={crowdColors[p.i]} mood={party ? "happy" : p.mood} frame={f} seed={p.i * 1.7} flip />
          ))}
          {f >= 285 && f < 345 && <Tumbleweed x={tw} y={GROUND - 45 - Math.abs(Math.sin(f / 4)) * 50} rot={f * 12} />}
          {neoOn && <Neo x={neoX} y={GROUND} frame={f} happy={party} />}
          {/* skateboard while rolling in */}
          {f >= 330 && f < 372 && (
            <g transform={`translate(${neoX} ${GROUND + 10})`}>
              <rect x={-90} y={-10} width={180} height={16} rx={8} fill={inkLine} />
              <circle cx={-60} cy={12} r={10} fill={colors.indigo} />
              <circle cx={60} cy={12} r={10} fill={colors.indigo} />
            </g>
          )}
          {/* sleeping Zs */}
          {f < 240 &&
            [0, 1, 2].map((k) => {
              const p = ((f + k * 20) % 60) / 60;
              return (
                <text key={k} x={1180 + 3 * 150 + 40 + p * 60} y={GROUND - 200 - p * 90} fontFamily={fonts.display} fontWeight={900} fontSize={30 + p * 20} fill={inkLine} opacity={1 - p} transform={rtl ? `scale(-1 1) translate(${-2 * (1180 + 3 * 150 + 40 + p * 60)} 0)` : undefined}>
                  Z
                </text>
              );
            })}
          {/* question marks and hearts over the crowd */}
          {crowd.map((p) => {
            if (f < p.backAt + 10) return null;
            if (f < 480)
              return (
                <text key={p.i} x={p.x} y={GROUND - 210} fontFamily={fonts.display} fontWeight={900} fontSize={70} fill={colors.indigo} textAnchor="middle" transform={rtl ? `translate(${2 * p.x} 0) scale(-1 1)` : undefined}>
                  ?
                </text>
              );
            const pop = spring({ frame: f - 480 - p.i * 4, fps: 30, config: { damping: 8 } });
            const float = party ? ((f - 510 + p.i * 13) % 50) * 3 : 0;
            return <Heart key={p.i} x={p.x} y={GROUND - 230 - float} s={pop} />;
          })}
          {party && f >= 600 && <Heart x={560} y={GROUND - 250} s={spring({ frame: f - 600, fps: 30, config: { damping: 8 } }) * 0.7} color={colors.lavender} />}
        </g>
      </svg>

      {/* words */}
      {f < 330 && <Sticker text={c.sticker} x={X(520)} y={170} rot={-4} frame={f} start={4} />}
      {shoutTimes.map((s, i) => (
        <ShoutBubble key={s} text={c.shouts[i]} x={X(880)} y={420} frame={f} start={s} len={32} size={i === 1 ? 50 : 60} />
      ))}
      {louderTimes.map((s, i) => (
        <ShoutBubble key={s} text={c.louder[i]} x={X(900 + i * 60)} y={380 - i * 30} frame={f} start={s} len={26} size={70 + i * 12} />
      ))}
      {f >= 280 && f < 330 && <Sticker text={c.nobody} x={960} y={330} rot={3} frame={f} start={280} size={80} />}
      {f >= 405 && f < 510 && (
        <div
          dir={rtl ? "rtl" : "ltr"}
          style={{
            position: "absolute",
            left: X(820),
            top: 470,
            transform: `translate(-50%, -100%) scale(${spring({ frame: f - 405, fps: 30, config: { damping: 10 } })})`,
            background: "white",
            border: `6px solid ${inkLine}`,
            borderRadius: 40,
            padding: "22px 40px",
            fontFamily: rtl ? fonts.ar : fonts.display,
            fontWeight: rtl ? 700 : 800,
            fontSize: 50,
            color: inkLine,
            whiteSpace: "nowrap",
          }}
        >
          {c.ask}
        </div>
      )}
      {party && (
        <>
          <Sticker text={c.listen[0]} x={960 + (rtl ? 170 : -170)} y={250} rot={-3} frame={f} start={516} size={96} />
          <Sticker text={c.listen[1]} x={960 + (rtl ? -200 : 200)} y={390} rot={2} frame={f} start={530} size={96} bg={colors.lavender} fg={inkLine} />
          {new Array(50).fill(0).map((_, i) => {
            const tt = f - 510;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: random(`cx${i}`) * 1920 + Math.sin(tt / 10 + i) * 20,
                  top: -40 + ((tt * (4 + random(`cv${i}`) * 5) + random(`cy${i}`) * 1080) % 1120),
                  width: 16,
                  height: 9,
                  background: [colors.lavender, colors.indigo, "#ffd35c", "#ff9fb8", "#9be3c8"][i % 5],
                  transform: `rotate(${tt * 15 + i * 40}deg)`,
                }}
              />
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};

// 25–30s: logo sticker, Neo peeks and winks, official line.
export const MegaOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { t, c, dir, display, scale, lang } = useCopy();
  const pop = spring({ frame, fps: 30, config: { damping: 8, mass: 0.7 } });
  const peek = spring({ frame: frame - 30, fps: 30, config: { damping: 10 } });
  const wink = frame >= 128 && frame < 142;
  const toWhite = interpolate(frame, [durationInFrames - 10, durationInFrames], [0, 1], clamp);
  const neoX = lang === "ar" ? 610 : 1310;

  return (
    <AbsoluteFill dir={dir} style={{ background: paper }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g transform={`translate(${neoX} 540) scale(${peek}) translate(${-neoX} -540)`}>
          <Neo x={neoX} y={540} frame={frame} wink={wink} scale={1.1} />
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 960 - 200,
          top: 120,
          width: 400,
          height: 400,
          borderRadius: 48,
          border: "12px solid white",
          boxShadow: `14px 14px 0 ${colors.lavender}, 0 24px 50px rgba(0,0,0,0.18)`,
          overflow: "hidden",
          background: "black",
          transform: `scale(${pop}) rotate(${(1 - pop) * -10 - 2}deg)`,
        }}
      >
        <Img src={staticFile("logo.jpg")} style={{ width: 400, height: 400 }} />
      </div>
      <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", ...display, color: inkLine, fontSize: 104 * scale, whiteSpace: "nowrap", transform: `scale(${spring({ frame: frame - 10, fps: 30, config: { damping: 9 } })})` }}>
        {t.tagline[0]} {t.tagline[1]}
        <span style={{ color: colors.indigo }}>{t.tagline[2]}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 800,
          width: "100%",
          textAlign: "center",
          fontFamily: lang === "ar" ? fonts.ar : fonts.display,
          fontWeight: lang === "ar" ? 500 : 700,
          fontSize: lang === "ar" ? 46 : 40,
          color: colors.indigo,
          opacity: progress(frame, 40, 14),
          transform: `rotate(-2deg)`,
        }}
      >
        {c.wink}
      </div>
      <div style={{ position: "absolute", bottom: 60, width: "100%", textAlign: "center", fontFamily: lang === "ar" ? fonts.ar : fonts.mono, fontSize: lang === "ar" ? 30 : 22, letterSpacing: lang === "ar" ? 0 : "0.3em", color: "#6b6880", opacity: progress(frame, 50, 14) }}>
        {t.footer}
      </div>
      <AbsoluteFill style={{ background: paper, opacity: toWhite }} />
    </AbsoluteFill>
  );
};
