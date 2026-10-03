import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { Background } from "../components/Background";
import { Grain } from "../components/Grain";
import { Flash } from "../components/Flash";
import { colors, fonts } from "../theme";
import { EndCard } from "./EndCard";
import series from "./series2.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = series.chat;
type Msg = { who: string; at: number; text: string; kind?: string };
const MSGS = T.msgs as Msg[];
const TYPE_LEAD = 26; // typing indicator / input typing before a message lands
const PLAN = ["هوية بصرية جديدة", "١٢ منشور + ٤ ريلز", "حملة إعلانية على حيّك"];

const Ticks: React.FC<{ read: boolean }> = ({ read }) => (
  <svg width={34} height={20} viewBox="0 0 34 20">
    <path d="M 2 10 L 8 16 L 20 3 M 12 13 L 15 16 L 28 3" fill="none" stroke={read ? "#7fd4ff" : "#cfd5ea"} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const clock = (at: number, later: boolean) => `${later ? 7 : 9}:${String(10 + Math.floor(at / 30)).padStart(2, "0")}`;

const PlanCard: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: 640 }}>
      <div style={{ borderRadius: 18, background: `linear-gradient(135deg, ${colors.royal}, ${colors.accent})`, padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 44, color: "#fff" }}>خطة ٣٠ يوم</span>
        <span dir="ltr" style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: "#DCE4FF", unicodeBidi: "isolate" }}>30-DAY PLAN</span>
      </div>
      {PLAN.map((p, i) => {
        const done = interpolate(frame, [at + 20 + i * 14, at + 28 + i * 14], [0, 1], clamp);
        return (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: 18, padding: "16px 8px", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, border: `3px solid ${colors.accent}`, background: done > 0.5 ? colors.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={28} height={28} viewBox="0 0 28 28">
                <path d="M 5 14 L 12 21 L 24 7" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeDasharray={30} strokeDashoffset={30 * (1 - done)} />
              </svg>
            </div>
            <span style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 38, color: "#eef0f8" }}>{p}</span>
          </div>
        );
      })}
    </div>
  );
};

const Bubble: React.FC<{ m: Msg; idx: number }> = ({ m, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - m.at, fps, config: { damping: 14, stiffness: 170 } });
  const grow = interpolate(frame - m.at, [0, 8], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (m.who === "sys") {
    return (
      <div style={{ flexShrink: 0, maxHeight: grow * 200, overflow: "hidden", display: "flex", justifyContent: "center", padding: "26px 0" }}>
        <span style={{ fontFamily: fonts.ar, fontWeight: 800, fontSize: 36, color: "#fff", background: "rgba(94,120,255,0.35)", border: `2px solid ${colors.accent}`, padding: "10px 34px", borderRadius: 40, display: "inline-block", transform: `scale(${p})` }}>
          {m.text} <span dir="ltr" style={{ fontFamily: fonts.en, fontSize: 24, opacity: 0.8, unicodeBidi: "isolate" }}>30 DAYS LATER</span>
        </span>
      </div>
    );
  }
  const me = m.who === "me";
  const heart = idx === 7 ? spring({ frame: frame - T.heart, fps, config: { damping: 8 } }) : 0;
  const read = frame > m.at + 30;
  return (
    <div style={{ flexShrink: 0, maxHeight: grow * 700, overflow: "visible", display: "flex", justifyContent: me ? "flex-end" : "flex-start", padding: "8px 0", marginBottom: heart > 0 ? 30 * Math.min(heart, 1) : 0 }}>
      <div
        style={{
          position: "relative",
          maxWidth: 760,
          padding: "18px 26px 12px",
          borderRadius: 30,
          borderTopRightRadius: me ? 30 : 6,
          borderTopLeftRadius: me ? 6 : 30,
          background: me ? colors.royal : "rgba(30,36,70,0.95)",
          border: me ? "none" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          transform: `scale(${0.5 + p * 0.5})`,
          transformOrigin: me ? "top left" : "top right",
          opacity: Math.min(1, p * 2),
        }}
      >
        {m.kind === "plan" ? (
          <PlanCard at={m.at} />
        ) : (
          <div style={{ fontFamily: fonts.ar, fontWeight: 600, fontSize: 42, lineHeight: 1.45, color: "#f4f5fa" }}>{m.text}</div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 8, marginTop: 4, direction: "ltr" }}>
          <span style={{ fontFamily: fonts.en, fontSize: 20, color: "rgba(230,232,240,0.6)" }}>{clock(m.at, idx >= 7)}</span>
          {me ? <Ticks read={read} /> : null}
        </div>
        {heart > 0 ? (
          <div style={{ position: "absolute", bottom: -34, right: 24, width: 56, height: 56, borderRadius: 28, background: "#1e2446", border: "3px solid #0b0f26", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${heart})` }}>
            <svg width={32} height={32} viewBox="0 0 64 64">
              <path d="M 32 54 C 10 38 6 28 6 20 C 6 11 13 6 20 6 C 26 6 30 10 32 14 C 34 10 38 6 44 6 C 51 6 58 11 58 20 C 58 28 54 38 32 54 Z" fill="#ff3b5c" />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Typing: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-start", padding: "8px 0" }}>
      <div style={{ padding: "22px 30px", borderRadius: 30, borderTopRightRadius: 6, background: "rgba(30,36,70,0.95)", display: "flex", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "#aab3d8", transform: `translateY(${Math.sin(frame / 3 - i) * 6}px)` }} />
        ))}
      </div>
    </div>
  );
};

export const ChatVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = MSGS.filter((m) => frame >= m.at);
  const typingNeo = MSGS.some((m) => m.who === "neo" && frame >= m.at - TYPE_LEAD && frame < m.at);
  const draft = MSGS.find((m) => m.who === "me" && frame >= m.at - TYPE_LEAD && frame < m.at);
  const draftText = draft ? draft.text.slice(0, Math.round(interpolate(frame, [draft.at - TYPE_LEAD, draft.at - 6], [0, draft.text.length], clamp))) : "";
  const phoneIn = spring({ frame, fps, config: { damping: 15 } });
  const out = interpolate(frame, [T.end - 16, T.end], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Background intensity={0.6} />
      <AbsoluteFill dir="rtl" style={{ transform: `translateY(${(1 - phoneIn) * 300}px) scale(${1 - out * 0.3})`, opacity: phoneIn * (1 - out) }}>
        {/* chat wallpaper */}
        <div style={{ position: "absolute", inset: "70px 40px", borderRadius: 60, overflow: "hidden", background: "#0b0f26", border: "3px solid rgba(255,255,255,0.08)" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(circle, #fff 0 2px, transparent 3px)", backgroundSize: "34px 34px" }} />
          {/* messages, anchored to the bottom so new ones push old ones up */}
          <div style={{ position: "absolute", left: 30, right: 30, top: 230, bottom: 160, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {shown.map((m) => (
              <Bubble key={m.at} m={m} idx={MSGS.indexOf(m)} />
            ))}
            {typingNeo ? <Typing /> : null}
          </div>
          {/* header */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 210, background: "#151a3a", display: "flex", alignItems: "flex-end", padding: "0 34px 26px", gap: 22 }}>
            <svg width={40} height={40} viewBox="0 0 40 40">
              <path d="M 14 6 L 28 20 L 14 34" fill="none" stroke="#dfe3f5" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ width: 96, height: 96, borderRadius: 48, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: `3px solid ${colors.accent}` }}>
              <Img src={staticFile("neocapta-logo.png")} style={{ width: 84 }} />
            </div>
            <div>
              <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 40, color: "#fff", direction: "ltr", textAlign: "right" }}>NEO CAPTA</div>
              <div style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 28, color: typingNeo ? "#7fd4ff" : "#9aa3c8" }}>{typingNeo ? "يكتب…" : "متصل الآن"}</div>
            </div>
          </div>
          {/* input bar */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 150, background: "#151a3a", display: "flex", alignItems: "center", gap: 18, padding: "0 26px" }}>
            <div style={{ flex: 1, height: 92, borderRadius: 46, background: "#0b0f26", display: "flex", alignItems: "center", padding: "0 30px", overflow: "hidden" }}>
              <span style={{ fontFamily: fonts.ar, fontWeight: 600, fontSize: 34, color: draftText ? "#eef0f8" : "#6c749a", whiteSpace: "nowrap" }}>
                {draftText || "اكتب رسالة"}
                {draftText && frame % 16 < 8 ? "|" : ""}
              </span>
            </div>
            <div style={{ width: 92, height: 92, borderRadius: 46, background: colors.accent, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${draft && frame >= draft.at - 6 ? 0.85 : 1})` }}>
              <svg width={44} height={44} viewBox="0 0 44 44">
                <path d="M 38 22 L 6 6 L 12 22 L 6 38 Z" fill="#fff" transform="rotate(180 22 22)" />
              </svg>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Sequence from={T.end} durationInFrames={T.duration - T.end}>
        <EndCard line="مشروعك يستاهل ينعرف" en="Your business deserves to be known." />
      </Sequence>
      {[MSGS[6].at, T.end].map((f) => (
        <Sequence key={f} from={f - 2} durationInFrames={8}>
          <Flash duration={6} />
        </Sequence>
      ))}
      <Grain />
      <Audio src={staticFile("chat-music.wav")} />
    </AbsoluteFill>
  );
};
