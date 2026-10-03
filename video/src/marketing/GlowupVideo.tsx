import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { Logo } from "../components/Logo";
import { colors, fonts } from "../theme";
import { Words } from "./Words";
import { EndCard } from "./EndCard";
import series from "./series2.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = series.glowup;
const PW = 620; // phone screen width
const PH = 1160;
const IMG = PW - 40;

const Icons: React.FC<{ liked: boolean; pop: number }> = ({ liked, pop }) => (
  <svg width={300} height={64} viewBox="0 0 300 64">
    <g transform={`translate(32 32) scale(${1 + pop * 0.35}) translate(-32 -32)`}>
      <path d="M 32 54 C 10 38 6 28 6 20 C 6 11 13 6 20 6 C 26 6 30 10 32 14 C 34 10 38 6 44 6 C 51 6 58 11 58 20 C 58 28 54 38 32 54 Z" fill={liked ? "#ff3b5c" : "none"} stroke={liked ? "#ff3b5c" : "#d8dbe6"} strokeWidth={5} strokeLinejoin="round" />
    </g>
    <path d="M 108 50 L 98 58 L 100 46 A 24 24 0 1 1 108 50 Z" fill="none" stroke="#d8dbe6" strokeWidth={5} strokeLinejoin="round" />
    <path d="M 160 12 L 214 12 L 182 56 L 178 32 Z M 178 32 L 214 12" fill="none" stroke="#d8dbe6" strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

const Cup: React.FC<{ fancy: boolean; frame: number }> = ({ fancy, frame }) => (
  <svg width={IMG} height={IMG} viewBox="0 0 580 580">
    {fancy ? (
      <>
        <ellipse cx={290} cy={440} rx={200} ry={46} fill="#f3ece4" />
        <ellipse cx={290} cy={436} rx={150} ry={30} fill="#e2d6c8" />
        <path d="M 170 250 L 410 250 L 390 420 Q 290 452 190 420 Z" fill="#fbf8f4" />
        <path d="M 405 285 Q 470 290 462 340 Q 455 385 395 380" fill="none" stroke="#fbf8f4" strokeWidth={22} />
        <ellipse cx={290} cy={250} rx={120} ry={30} fill="#6b3a1f" />
        <path d="M 290 268 C 250 245 262 228 280 236 C 286 238 290 244 290 248 C 290 244 294 238 300 236 C 318 228 330 245 290 268 Z" fill="#f2dcc0" />
        {[0, 1, 2].map((i) => {
          const y = ((frame * 1.2 + i * 40) % 120) / 120;
          return <path key={i} d={`M ${250 + i * 40} ${215 - y * 90} q -18 -25 0 -50 q 18 -25 0 -50`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.5 * Math.sin(y * Math.PI)} />;
        })}
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={`b${i}`} cx={70 + i * 110} cy={510 + (i % 2) * 20} rx={26} ry={14} fill="#4a2512" transform={`rotate(${i * 37} ${70 + i * 110} ${510 + (i % 2) * 20})`} />
        ))}
      </>
    ) : (
      <>
        <path d="M 200 280 L 380 280 L 365 430 L 215 430 Z" fill="#8e929c" transform="rotate(-8 290 350)" />
        <rect x={140} y={430} width={300} height={14} fill="#7c808a" transform="rotate(-8 290 350)" />
      </>
    )}
  </svg>
);

const Post: React.FC<{ after: boolean }> = ({ after }) => {
  const frame = useCurrentFrame();
  const likeP = interpolate(frame, [T.likes, T.punch - 20], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const likes = after ? Math.round(12 + likeP * 4800) : 12;
  const pop = after ? Math.max(0, Math.sin(Math.min(1, (frame - T.likes) / 10) * Math.PI)) * (frame >= T.likes ? 1 : 0) : 0;
  const comments = ["وين موقعكم؟", "طلبت الحين!", "شكلها تجنن"];
  return (
    <div dir="rtl" style={{ position: "absolute", inset: 0, background: after ? "#0d1022" : "#1a1b20", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, height: 70 }}>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: after ? "linear-gradient(135deg,#f9a03f,#e1306c,#5E78FF)" : "#555", padding: 4 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 30, background: after ? "#6b3a1f" : "#777" }} />
        </div>
        <div style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: 30, color: "#e8eaf2" }}>{after ? "بُن الحي" : "مقهى_البن"}</div>
        {after ? <div style={{ fontFamily: fonts.en, fontSize: 22, color: colors.accent, fontWeight: 800 }}>• Sponsored</div> : null}
      </div>
      <div style={{ position: "relative", width: IMG, height: IMG, borderRadius: 18, overflow: "hidden", background: after ? "radial-gradient(circle at 50% 40%, #e9a96a 0%, #a5582a 45%, #3b1d0e 100%)" : "#5d6069" }}>
        <Cup fancy={after} frame={frame} />
        {after ? (
          <div style={{ position: "absolute", top: 34, left: 0, right: 0, textAlign: "center" }}>
            <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24, letterSpacing: 4, color: "#3b1d0e", background: "#fff", padding: "6px 18px", borderRadius: 30 }}>اليوم فقط</span>
            <div style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 74, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,0.45)", marginTop: 8 }}>أول كوب علينا</div>
          </div>
        ) : null}
      </div>
      <div style={{ direction: "ltr", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ transform: "scaleX(-1)" }}>
          <Icons liked={after && frame >= T.likes} pop={pop} />
        </div>
      </div>
      <div style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: 30, color: "#e8eaf2" }}>
        <span style={{ fontFamily: fonts.en }}>{likes.toLocaleString("en-US")}</span> إعجاب
      </div>
      <div style={{ fontFamily: fonts.ar, fontWeight: 600, fontSize: 28, lineHeight: 1.5, color: after ? "#d5d9ea" : "#9a9da6" }}>
        {after ? (
          <>
            <b>بُن الحي</b> صباحك يبدأ من هنا… جرّب قهوتنا المختصة والكوب الأول علينا.{" "}
            <span style={{ color: colors.accent, fontWeight: 900 }}>اطلب الحين من الرابط</span>
          </>
        ) : (
          <>
            <b>مقهى_البن</b> متوفر قهوة. السعر 20 ريال. للطلب كلمونا.
          </>
        )}
      </div>
      {after
        ? comments.map((c, i) => {
            const p = spring({ frame: frame - (T.likes + 60 + i * 45), fps: 30, config: { damping: 12 } });
            return (
              <div key={c} style={{ fontFamily: fonts.ar, fontSize: 26, color: "#c9cde0", opacity: p, transform: `translateX(${(1 - p) * -60}px)` }}>
                <b style={{ color: "#fff" }}>{["نوف", "عبدالله", "ريم"][i]}</b> {c}
              </div>
            );
          })
        : null}
    </div>
  );
};

const Hearts: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {new Array(26).fill(0).map((_, i) => {
        const s = T.likes + i * 8;
        const t = frame - s;
        if (t < 0 || t > 70 || s > T.punch) return null;
        const x = 740 + (random(`hx${i}`) - 0.5) * 200 + Math.sin(t / 6 + i) * 20;
        return (
          <svg key={i} width={60} height={60} viewBox="0 0 64 64" style={{ position: "absolute", left: x, top: 1060 - t * 9, opacity: 1 - t / 70, transform: `scale(${0.6 + random(`hs${i}`) * 0.8})` }}>
            <path d="M 32 54 C 10 38 6 28 6 20 C 6 11 13 6 20 6 C 26 6 30 10 32 14 C 34 10 38 6 44 6 C 51 6 58 11 58 20 C 58 28 54 38 32 54 Z" fill="#ff3b5c" />
          </svg>
        );
      })}
    </>
  );
};

const CALLOUTS = [
  { ar: "صورة توقف السكرول", y: 830, left: true },
  { ar: "عرض واضح يغري", y: 455, left: false },
  { ar: "دعوة واضحة للطلب", y: 1360, left: false },
];

export const GlowupVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame: frame - T.phone, fps, config: { damping: 14 } });
  const phoneOut = interpolate(frame, [T.punch, T.punch + 16], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const wipe = interpolate(frame, [T.wipe, T.wipeEnd], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const isAfter = frame >= (T.wipe + T.wipeEnd) / 2;
  const tag = spring({ frame: frame - (isAfter ? T.wipeEnd : T.before), fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Background intensity={isAfter ? 1.3 : 0.5} />
      {/* hook */}
      <Sequence from={0} durationInFrames={T.before} layout="none">
        <div style={{ position: "absolute", top: 120, left: 0, right: 0, opacity: interpolate(frame, [T.phone, T.before], [1, 0], clamp) }}>
          <Words text="نفس المنتج…" size={96} color={colors.white} />
          <div style={{ marginTop: 10 }}>
            <Words text="بس تسويق مختلف" size={96} color={colors.white} highlight={[1, 2]} delay={20} />
          </div>
        </div>
      </Sequence>
      {/* before / after tag */}
      <Sequence from={T.before} durationInFrames={T.punch - T.before} layout="none">
        <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 40px", borderRadius: 60, background: isAfter ? colors.accent : "#c8303a", transform: `scale(${tag}) rotate(${isAfter ? 3 : -3}deg)` }}>
            <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 64, color: "#fff" }}>{isAfter ? "بعد" : "قبل"}</span>
            <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: "#fff" }}>{isAfter ? "AFTER" : "BEFORE"}</span>
          </div>
        </div>
      </Sequence>
      {/* the phone */}
      <div style={{ position: "absolute", left: 540 - PW / 2 - 18, top: 360, width: PW + 36, height: PH + 36, borderRadius: 70, background: "#05060c", border: "4px solid #3a3f55", boxShadow: isAfter ? "0 0 90px rgba(94,120,255,0.55)" : "0 30px 60px rgba(0,0,0,0.6)", opacity: frame < T.phone ? 0 : 1, transform: `translateY(${(1 - phoneIn) * 1700 + phoneOut * 1600}px) rotate(${phoneOut * -12}deg)` }}>
        <div style={{ position: "absolute", left: 18, top: 18, width: PW, height: PH, borderRadius: 54, overflow: "hidden" }}>
          <Post after={false} />
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)` }}>
            <Post after />
          </div>
          {wipe > 0 && wipe < 1 ? <div style={{ position: "absolute", top: 0, bottom: 0, left: (1 - wipe) * PW - 6, width: 12, background: "#fff", boxShadow: `0 0 40px 10px ${colors.accent}` }} /> : null}
        </div>
      </div>
      <Hearts />
      {/* callouts */}
      {CALLOUTS.map((c, i) => {
        const p = spring({ frame: frame - T.callouts[i], fps, config: { damping: 11 } });
        if (frame < T.callouts[i] || frame > T.punch) return null;
        return (
          <div key={c.ar} style={{ position: "absolute", top: c.y, [c.left ? "left" : "right"]: 30, transform: `scale(${p}) rotate(${c.left ? -4 : 4}deg)`, padding: "14px 26px", borderRadius: 20, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", fontFamily: fonts.ar, fontWeight: 900, fontSize: 38, color: colors.royal }} dir="rtl">
            {c.ar} ✓
          </div>
        );
      })}
      {/* verdict line under the phone */}
      <Sequence from={T.before + 30} durationInFrames={T.punch - T.before - 30} layout="none">
        <div style={{ position: "absolute", top: 1590, left: 0, right: 0 }} key={isAfter ? "a" : "b"}>
          {isAfter ? (
            <Words text="بعد: الكل يسأل عنه" size={62} color={colors.white} highlight={[2, 3]} delay={T.wipeEnd - T.before - 30} />
          ) : (
            <Words text="قبل: محد وقف عنده" size={62} color={colors.steel} />
          )}
        </div>
      </Sequence>
      {/* punch line */}
      <Sequence from={T.punch + 10} durationInFrames={T.end - T.punch - 10} layout="none">
        <div style={{ position: "absolute", top: 760, left: 0, right: 0 }}>
          <Words text="الفرق؟" size={130} color={colors.steel} />
          <div style={{ marginTop: 20 }}>
            <Words text="تسويق صح." size={150} color={colors.white} highlight={[0]} delay={14} />
          </div>
        </div>
      </Sequence>
      <Sequence from={T.end} durationInFrames={T.duration - T.end}>
        <EndCard line="نسوّي لمنتجك نفس الفرق" en="Give your product the glow-up." />
      </Sequence>
      <Sequence from={0} durationInFrames={T.end}>
        <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: 0.8 }}>
          <Logo width={150} />
        </div>
      </Sequence>
      {[T.wipeEnd - 4, T.punch + 8, T.end].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={8}>
          <Flash duration={6} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("glowup-music.wav")} />
    </AbsoluteFill>
  );
};
