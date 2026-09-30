import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { note, lost, answer, steps, viral, outro } = timeline;
const PHONE = { x: 540 - 250, y: 640, w: 500, h: 1000 };

const NOTIFS = [
  { icon: "❤️", en: "12.4K likes", ar: "إعجاب" },
  { icon: "🔁", en: "3.1K shares", ar: "مشاركة" },
  { icon: "💬", en: "860 comments", ar: "تعليق" },
  { icon: "📈", en: "Trending #1", ar: "ترند" },
  { icon: "📩", en: "New client request", ar: "طلب عميل جديد" },
  { icon: "🔥", en: "1.2M views", ar: "مشاهدة" },
  { icon: "⭐", en: "Brand of the week", ar: "علامة الأسبوع" },
];

// The five screens the idea goes through (one per service).
const Screen: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const box: React.CSSProperties = { position: "absolute", inset: 0, padding: 34, boxSizing: "border-box", color: colors.white, fontFamily: fonts.en };
  if (k === 0)
    return (
      <div style={{ ...box, background: "#0f1433" }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 3, color: colors.accent }}>STRATEGY</div>
        {["Audience · الجمهور", "Message · الرسالة", "Channels · القنوات"].map((l, i) => (
          <div key={l} style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14, opacity: interpolate(t, [i * 0.2, i * 0.2 + 0.2], [0, 1], clamp) }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✓</div>
            <span style={{ fontSize: 26 }}>{l}</span>
          </div>
        ))}
      </div>
    );
  if (k === 1)
    return (
      <div style={{ ...box, background: "#0f1433", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <div style={{ width: 300, transform: `scale(${0.6 + t * 0.4})` }}>
          <Img src={staticFile("neocapta-logo.png")} style={{ width: "100%" }} />
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[colors.royal, colors.accent, colors.silver, "#0A1033"].map((c, i) => (
            <div key={c} style={{ width: 56, height: 56, borderRadius: 12, background: c, border: "2px solid #fff", transform: `scale(${interpolate(t, [i * 0.15, i * 0.15 + 0.2], [0, 1], clamp)})` }} />
          ))}
        </div>
      </div>
    );
  if (k === 2)
    return (
      <div style={{ ...box, background: "#fff", color: "#0A1033", padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: 25, background: colors.royal }} />
          <div style={{ fontWeight: 800, fontSize: 24 }}>neocapta</div>
        </div>
        <div style={{ height: 420, background: `linear-gradient(135deg, ${colors.royal}, #0A1033)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 90, color: "#fff", opacity: t }}>
            فكرتك هنا
          </div>
        </div>
        <div style={{ padding: 20, fontSize: 40 }}>❤️ 💬 📤</div>
      </div>
    );
  if (k === 3)
    return (
      <div style={{ ...box, background: "#0f1433" }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 3, color: colors.accent }}>CAMPAIGN · LIVE</div>
        {["Instagram", "TikTok", "Snapchat", "X"].map((p, i) => (
          <div key={p} style={{ marginTop: 22 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{p}</div>
            <div style={{ height: 16, borderRadius: 8, background: "#2a3052" }}>
              <div style={{ width: `${Math.min(1, t * 1.4 - i * 0.1) * (70 + i * 7)}%`, height: "100%", borderRadius: 8, background: colors.accent }} />
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <div style={{ ...box, background: "#0f1433" }}>
      <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 3, color: colors.accent }}>GROWTH</div>
      <div style={{ fontWeight: 800, fontSize: 96, marginTop: 20 }}>+{Math.round(t * 240)}%</div>
      <svg width={430} height={300} style={{ marginTop: 20 }}>
        <path d="M 0 280 L 70 250 L 140 260 L 210 180 L 280 190 L 350 90 L 430 20" stroke={colors.accent} strokeWidth={8} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />
      </svg>
    </div>
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15 } });
  const typed = "فكرة؟".slice(0, Math.floor(interpolate(frame, [12, 50], [0, 5], clamp)));
  const cur = Math.min(4, Math.floor((frame - steps.from) / steps.each));
  const local = (frame - steps.from - cur * steps.each) / 40;
  const shake = frame >= viral.from ? Math.sin(frame * 1.9) * 4 * interpolate(frame, [viral.from, viral.from + 60], [0, 1], clamp) : 0;
  const lonely = frame >= lost.from && frame < answer.from;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #141a3a 0%, #05060d 70%)" }} />
      <div style={{ position: "absolute", left: PHONE.x + shake, top: PHONE.y + (1 - enter) * 1200, width: PHONE.w, height: PHONE.h, borderRadius: 70, background: "#0b0d14", border: "10px solid #8A90A8", boxShadow: "0 50px 120px rgba(0,0,0,0.8)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "50%", top: 16, width: 120, height: 30, marginLeft: -60, borderRadius: 15, background: "#000", zIndex: 5 }} />
        {frame < steps.from ? (
          // notes app
          <div style={{ position: "absolute", inset: 0, background: "#fdf8e8", padding: "80px 40px" }}>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 24, color: "#b48a2c" }}>Notes · ملاحظات</div>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 96, color: "#1c1c1c", marginTop: 40, textAlign: "right" }}>
              {typed}
              <span style={{ opacity: frame % 16 < 8 ? 1 : 0, color: "#b48a2c" }}>|</span>
            </div>
            <div style={{ position: "absolute", bottom: 60, left: 40, right: 40, fontFamily: fonts.en, fontSize: 26, color: lonely ? "#c8263b" : "#999", fontWeight: 700 }}>👁 0 views · ٠ مشاهدة</div>
          </div>
        ) : (
          <Screen k={cur} t={Math.min(1, Math.max(0, local))} />
        )}
      </div>
      {/* notifications raining in */}
      {frame >= viral.from
        ? NOTIFS.concat(NOTIFS).map((n, i) => {
            const at = viral.from + i * 7;
            const p = spring({ frame: frame - at, fps, config: { damping: 14 } });
            if (frame < at) return null;
            const side = i % 2 === 0 ? -1 : 1;
            const x = 540 + side * (140 + random(`nx${i}`) * 180) - 230;
            const y = 520 + ((i * 97) % 1150);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: 460, padding: "16px 22px", borderRadius: 26, background: "rgba(240,242,250,0.95)", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", transform: `translateY(${(1 - p) * -200}px) scale(${p})`, opacity: p }}>
                <span style={{ fontSize: 46 }}>{n.icon}</span>
                <div>
                  <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 26, color: "#0A1033" }}>{n.en}</div>
                  <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 22, color: colors.royal, textAlign: "left" }}>
                    {n.ar}
                  </div>
                </div>
              </div>
            );
          })
        : null}
    </AbsoluteFill>
  );
};

// "الإشعار / The Notification" — an unseen note becomes strategy, brand, post, campaign and growth, then goes viral.
export const NotifyVideo: React.FC = () => (
  <Shell
    bg="#05060d"
    audio="notify-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "From a note to a trend.", ar: "من ملاحظة… إلى ترند" }}
    flashes={[viral.from]}
    captions={[
      { from: note.from + 30, to: note.to, kicker: "THE NOTIFICATION · الإشعار", en: "Every idea starts as a note.", ar: "كل فكرة تبدأ ملاحظة.", top: 170 },
      { from: lost.from + 4, to: lost.to, en: "But nobody sees it.", ar: "بس محد يشوفها.", top: 170 },
      { from: answer.from + 4, to: steps.from, kicker: "NEO CAPTA", en: "We bring it to life.", ar: "نحن نطلّعها للنور.", top: 170 },
      ...SERVICES.map((s, k) => ({ from: steps.from + k * steps.each + 4, to: k < 4 ? steps.from + (k + 1) * steps.each + 4 : viral.from, kicker: `STEP ${k + 1}`, en: s.en, ar: s.ar, enSize: 84, arSize: 72, top: 150 })),
      { from: viral.from + 70, to: outro.from, en: "From a note… to a trend.", ar: "من ملاحظة… إلى ترند.", enSize: 78, top: 170 },
    ]}
  >
    <Phone />
  </Shell>
);
