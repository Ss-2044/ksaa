import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts, light } from "../theme";
import { EditorialTitle, InkSplat } from "./Editorial";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PW = 600; // page width
const PH = 840; // page height

export const stamps = [
  { en: "STRATEGY", ar: "استراتيجية", shape: "circle", color: light.royal, x: 40, y: 70, rot: -12 },
  { en: "BRANDING", ar: "هوية بصرية", shape: "rect", color: "#B23A48", x: 330, y: 140, rot: 8 },
  { en: "CONTENT", ar: "محتوى", shape: "octagon", color: light.ink, x: 90, y: 440, rot: 6 },
  { en: "CAMPAIGNS", ar: "حملات إعلانية", shape: "ticket", color: "#1F7A5A", x: 700, y: 360, rot: -8 },
  { en: "GROWTH", ar: "نمو", shape: "circle", color: light.accent, x: 860, y: 90, rot: 14 },
] as const;

// Fine wavy security lines, like a real passport page.
const Guilloche: React.FC<{ color: string }> = ({ color }) => (
  <svg width={PW} height={PH} style={{ position: "absolute", inset: 0 }}>
    {new Array(26).fill(0).map((_, i) => {
      const y0 = 30 + i * 32;
      let d = `M 0 ${y0}`;
      for (let x = 0; x <= PW; x += 20) d += ` L ${x} ${(y0 + Math.sin(x / 38 + i * 0.7) * 10).toFixed(1)}`;
      return <path key={i} d={d} stroke={color} strokeWidth={1.2} fill="none" opacity={0.35} />;
    })}
  </svg>
);

const Cover: React.FC<{ inside?: boolean }> = ({ inside }) => (
  <div
    style={{
      width: PW,
      height: PH,
      borderRadius: "10px 26px 26px 10px",
      background: inside ? "#D8DBE9" : `radial-gradient(circle at 30% 20%, #2B3690 0%, ${light.cover} 60%, #121848 100%)`,
      boxShadow: inside ? "none" : "inset 0 0 0 3px rgba(255,255,255,0.06), inset 16px 0 30px rgba(0,0,0,0.35)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "70px 0",
      boxSizing: "border-box",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {inside ? (
      <Guilloche color={light.royal} />
    ) : (
      <>
        <div style={{ textAlign: "center", color: "#D9DCE8" }}>
          <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 52 }}>
            جواز سفر الأفكار
          </div>
          <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 32, letterSpacing: 10 }}>IDEA PASSPORT</div>
        </div>
        <div style={{ width: 300, height: 300, borderRadius: "50%", border: "4px solid #C9CEE0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("neocapta-logo.png")} style={{ width: 230, filter: "grayscale(1) brightness(1.5) sepia(0.2)" }} />
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 30, letterSpacing: 12, color: "#D9DCE8" }}>NEO CAPTA</div>
      </>
    )}
  </div>
);

const DataPage: React.FC = () => (
  <div style={{ width: PW, height: PH, background: "#F7F6F1", borderRadius: "4px 20px 20px 4px", position: "relative", overflow: "hidden", padding: 44, boxSizing: "border-box" }}>
    <Guilloche color={light.accent} />
    <div style={{ position: "relative", display: "flex", justifyContent: "space-between", fontFamily: fonts.en, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: light.royal }}>
      <span>PASSPORT · P</span>
      <span dir="rtl" style={{ fontFamily: fonts.ar, letterSpacing: 0, fontSize: 26 }}>
        جواز سفر
      </span>
    </div>
    <div style={{ position: "relative", display: "flex", gap: 30, marginTop: 34 }}>
      <div style={{ width: 190, height: 240, borderRadius: 12, background: light.paperDeep, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130 }}>💡</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          ["HOLDER · الحامل", "YOUR IDEA"],
          ["ORIGIN · الأصل", "DRAFT · مسودة"],
          ["DESTINATION · الوجهة", "—"],
          ["ISSUED BY · صادر من", "NEO CAPTA"],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: fonts.ar, fontWeight: 700, fontSize: 20, color: light.muted }}>{k}</div>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34, color: light.ink }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", left: 44, right: 44, bottom: 50, fontFamily: "monospace", fontSize: 29, letterSpacing: 3, color: light.ink, lineHeight: 1.5 }}>
      P&lt;NCP&lt;YOUR&lt;&lt;IDEA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
      <br />
      2026&lt;&lt;DIRECTION&lt;&lt;NEO&lt;CAPTA&lt;&lt;&lt;
    </div>
  </div>
);

const VisaPage: React.FC<{ side: "left" | "right" }> = ({ side }) => (
  <div
    style={{
      width: PW,
      height: PH,
      background: "#F7F6F1",
      borderRadius: side === "left" ? "20px 4px 4px 20px" : "4px 20px 20px 4px",
      position: "relative",
      overflow: "hidden",
      boxShadow: side === "left" ? "inset -20px 0 30px rgba(0,0,0,0.12)" : "inset 20px 0 30px rgba(0,0,0,0.12)",
    }}
  >
    <Guilloche color={light.accent} />
    <div style={{ position: "absolute", bottom: 26, [side === "left" ? "left" : "right"]: 34, fontFamily: fonts.en, fontWeight: 800, fontSize: 20, letterSpacing: 4, color: light.muted }}>
      VISAS · تأشيرات · {side === "left" ? "04" : "05"}
    </div>
  </div>
);

const Stamp: React.FC<{ s: (typeof stamps)[number]; start: number }> = ({ s, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 220 } });
  if (frame < start) return null;
  const radius = s.shape === "circle" ? "50%" : s.shape === "ticket" ? 30 : 8;
  const clip = s.shape === "octagon" ? "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)" : undefined;
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, width: 280, height: s.shape === "rect" || s.shape === "ticket" ? 200 : 280 }}>
      <InkSplat seed={s.en} color={s.color} t={interpolate(frame - start, [0, 6], [0, 1], clamp)} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          clipPath: clip,
          border: `8px ${s.shape === "rect" ? "double" : "solid"} ${s.color}`,
          background: clip ? `${s.color}14` : "transparent",
          color: s.color,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${interpolate(p, [0, 1], [2.4, 1])}) rotate(${s.rot}deg)`,
          opacity: Math.min(1, p * 1.8) * 0.9,
          mixBlendMode: "multiply",
        }}
      >
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 18, letterSpacing: 4 }}>NEO CAPTA</div>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 38 }}>{s.en}</div>
        <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 34 }}>
          {s.ar}
        </div>
        <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 18, letterSpacing: 3 }}>✓ 2026</div>
      </div>
    </div>
  );
};

// Scene 2 — the idea's passport: cover, data page, then a stamp for every NEO CAPTA service.
export const PassportScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { openAt, flipAt, stampsFrom, stampGap, fullAt } = timeline.passport;
  const ease = Easing.bezier(0.6, 0, 0.25, 1);
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const open = interpolate(frame, [openAt, openAt + 24], [0, 1], { ...clamp, easing: ease });
  const flip = interpolate(frame, [flipAt, flipAt + 22], [0, 1], { ...clamp, easing: ease });
  const full = spring({ frame: frame - fullAt, fps, config: { damping: 10, stiffness: 200 } });
  const exit = interpolate(frame, [durationInFrames - 22, durationInFrames], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const lastImpact = [...stamps.map((_, i) => stampsFrom + i * stampGap), fullAt].filter((f) => f <= frame).pop();
  const shake = lastImpact !== undefined ? Math.exp(-(frame - lastImpact) / 3) : 0;
  const count = stamps.filter((_, i) => frame >= stampsFrom + i * stampGap).length;
  const scale = 0.8;

  return (
    <AbsoluteFill>
      {/* huge outlined word behind */}
      <div style={{ position: "absolute", top: 120, left: interpolate(frame, [0, durationInFrames], [40, -260]), fontFamily: fonts.en, fontWeight: 800, fontSize: 300, letterSpacing: -12, color: "transparent", WebkitTextStroke: `3px ${light.paperDeep}`, whiteSpace: "nowrap" }}>
        PASSPORT
      </div>

      {/* the book: two pages wide, starts closed (right half centred) */}
      <div
        style={{
          position: "absolute",
          left: 540 - PW,
          top: 330,
          width: PW * 2,
          height: PH,
          transformOrigin: "50% 50%",
          transform: `translateX(${(1 - open) * (-PW / 2) * scale}px) translateY(${(1 - enter) * 1400 - exit * 1500 + shake * 10}px) scale(${scale}) rotate(${(1 - enter) * 12 - 2 + shake * 0.8}deg)`,
          perspective: 2600,
        }}
      >
        {/* left side: inside of cover, later the back of the data page */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: open > 0.5 ? 1 : 0 }}>{flip < 0.5 ? <Cover inside /> : <VisaPage side="left" />}</div>
        {/* right side: data page, later a visa page */}
        <div style={{ position: "absolute", left: PW, top: 0 }}>{flip < 0.5 ? <DataPage /> : <VisaPage side="right" />}</div>
        {/* turning data page */}
        {flip > 0 && flip < 1 ? (
          <div style={{ position: "absolute", left: PW, top: 0, transformOrigin: "0 50%", transform: `rotateY(${-flip * 180}deg)`, backfaceVisibility: "hidden" }}>
            {flip < 0.5 ? <DataPage /> : <div style={{ transform: "scaleX(-1)" }}><VisaPage side="left" /></div>}
          </div>
        ) : null}
        {/* the cover swinging open */}
        <div style={{ position: "absolute", left: PW, top: 0, transformOrigin: "0 50%", transform: `rotateY(${-open * 180}deg)`, opacity: open < 0.5 ? 1 : 0 }}>
          <Cover />
        </div>
        {/* stamps across the spread */}
        {stamps.map((s, i) => (
          <Stamp key={s.en} s={s} start={stampsFrom + i * stampGap} />
        ))}
        {/* final diagonal stamp */}
        {frame >= fullAt ? (
          <div
            style={{
              position: "absolute",
              left: PW - 330,
              top: PH - 250,
              width: 660,
              padding: "14px 0",
              border: `10px solid ${light.royal}`,
              borderRadius: 16,
              color: light.royal,
              textAlign: "center",
              transform: `scale(${interpolate(full, [0, 1], [2.2, 1])}) rotate(-16deg)`,
              opacity: Math.min(1, full * 1.6) * 0.92,
              mixBlendMode: "multiply",
              background: "rgba(94,120,255,0.08)",
            }}
          >
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 64, letterSpacing: 6 }}>COMPLETE</div>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 54 }}>
              اكتملت الرحلة
            </div>
          </div>
        ) : null}
      </div>

      {/* stamp counter */}
      {frame >= stampsFrom - 10 ? (
        <div style={{ position: "absolute", top: 1130, left: 70, right: 70, display: "flex", gap: 14, alignItems: "center", opacity: 1 - exit }}>
          {stamps.map((s, i) => (
            <div key={s.en} style={{ flex: 1, height: 12, borderRadius: 6, background: i < count ? s.color : light.paperDeep }} />
          ))}
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 30, color: light.ink, marginLeft: 10 }}>{count}/5</span>
        </div>
      ) : null}

      {/* captions */}
      <Sequence from={20} durationInFrames={openAt - 20} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 170 }}>
          <EditorialTitle label="02 — THE QUESTION · السؤال" lines={[{ text: "But not every idea" }, { text: "knows where to go.", color: light.royal }]} ar="لكن ليست كل فكرة تعرف إلى أين تذهب." size={84} arSize={48} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={openAt + 12} durationInFrames={stampsFrom - openAt - 16} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 170 }}>
          <EditorialTitle label="03 — THE ANSWER · الجواب" lines={[{ text: "We give every idea" }, { text: "a direction.", color: light.royal }]} ar="نحن نمنح كل فكرة وجهتها." size={88} arSize={52} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={stampsFrom + 10} layout="none">
        <AbsoluteFill style={{ justifyContent: "flex-end", paddingBottom: 170, opacity: 1 - exit }}>
          <EditorialTitle lines={[{ text: "Every stamp," }, { text: "a step forward.", color: light.royal }]} ar="كل ختم… خطوة للأمام." size={92} arSize={54} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
