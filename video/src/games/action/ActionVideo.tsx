import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../theme";
import { SERVICES, Shell } from "../Shell";
import timeline from "./timeline.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const { script, notyet, lights, takes, premiere, outro } = timeline;

// Clapperboard with the scene/take fields; `snap` 0 = open, 1 = shut.
const Clapper: React.FC<{ snap: number; scene: string; take: number }> = ({ snap, scene, take }) => (
  <div style={{ position: "relative", width: 620, height: 470 }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 620, height: 80, transformOrigin: "0 80px", transform: `rotate(${-(1 - snap) * 24}deg)`, background: "repeating-linear-gradient(-45deg, #F4F5FA 0 45px, #0A1033 45px 90px)", borderRadius: 8, border: "4px solid #0A1033" }} />
    <div style={{ position: "absolute", left: 0, top: 84, width: 620, height: 80, background: "repeating-linear-gradient(45deg, #F4F5FA 0 45px, #0A1033 45px 90px)", borderRadius: 4, border: "4px solid #0A1033" }} />
    <div style={{ position: "absolute", left: 0, top: 168, width: 620, height: 300, background: "#0A1033", borderRadius: 10, border: "4px solid #8A90A8", padding: 26, boxSizing: "border-box", fontFamily: fonts.mono, color: "#E4E6EE" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: colors.steel }}>
        <span>PRODUCTION</span>
        <span>NEO CAPTA</span>
      </div>
      <div style={{ display: "flex", gap: 30, marginTop: 24 }}>
        <div>
          <div style={{ fontSize: 20, color: colors.steel }}>SCENE</div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{scene}</div>
        </div>
        <div>
          <div style={{ fontSize: 20, color: colors.steel }}>TAKE</div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{take}</div>
        </div>
      </div>
      <div dir="rtl" style={{ fontFamily: fonts.handAr, fontSize: 44, color: colors.accent, marginTop: 20, textAlign: "left" }}>
        فكرتك · الإعلان
      </div>
    </div>
  </div>
);

const FilmStrip: React.FC<{ offset: number; filled: number }> = ({ offset, filled }) => (
  <div style={{ position: "absolute", left: -200, right: -200, top: 1400, height: 230, background: "#0b0c10", transform: `translateX(${-offset}px)`, display: "flex", alignItems: "center", gap: 20, padding: "0 20px" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: 18, backgroundImage: "repeating-linear-gradient(90deg, #d8d8d8 0 20px, transparent 20px 44px)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, height: 18, backgroundImage: "repeating-linear-gradient(90deg, #d8d8d8 0 20px, transparent 20px 44px)" }} />
    {new Array(14).fill(0).map((_, i) => {
      const k = i % 5;
      const on = i < filled;
      return (
        <div key={i} style={{ flexShrink: 0, width: 220, height: 150, borderRadius: 6, background: on ? `linear-gradient(135deg, ${[colors.royal, colors.accent, "#1f7a5a", "#b23a48", "#e3a83a"][k]}, #0A1033)` : "#1b1e27", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.handAr, fontSize: 34, color: "#fff" }}>
          {on ? SERVICES[k].ar : ""}
        </div>
      );
    })}
  </div>
);

const Set: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lightsOn = interpolate(frame, [lights.from, lights.from + 10, lights.from + 30, lights.from + 40], [0, 1, 1, 1], clamp);
  const k = Math.min(4, Math.max(0, Math.floor((frame - takes.from) / takes.each)));
  const local = frame >= takes.from ? (frame - takes.from) % takes.each : 0;
  let snap = frame < takes.from ? 0 : interpolate(local, [10, 16], [0, 1], clamp);
  if (frame >= premiere.from && frame < premiere.screen) snap = interpolate(frame, [premiere.from, premiere.action], [0, 1], clamp);
  const filled = SERVICES.filter((_, i) => frame >= takes.from + i * takes.each + 16).length;
  const stripOff = frame * 3;
  const screen = spring({ frame: frame - premiere.screen, fps, config: { damping: 16 } });
  const setOut = interpolate(frame, [premiere.screen - 10, premiere.screen + 10], [1, 0], clamp);
  const cam = interpolate(frame, [0, premiere.screen], [1.0, 1.06]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #1a1c26 0%, #07080c 70%)" }} />
      <AbsoluteFill style={{ opacity: setOut, transform: `scale(${cam})` }}>
        {/* studio lights */}
        {[-1, 1].map((side) => (
          <div key={side} style={{ position: "absolute", left: 540 + side * 360 - 90, top: 520, width: 180, height: 120, borderRadius: 14, background: "#2a2e3a", border: "4px solid #8A90A8", transform: `rotate(${side * -20}deg)` }}>
            <div style={{ position: "absolute", inset: 14, borderRadius: 8, background: lightsOn > 0 ? "#FFF6D8" : "#3a3f4c", boxShadow: lightsOn > 0 ? "0 0 60px #FFF6D8" : "none" }} />
          </div>
        ))}
        {lightsOn > 0 ? <div style={{ position: "absolute", left: 540 - 520, top: 620, width: 1040, height: 900, background: "radial-gradient(ellipse at 50% 30%, rgba(255,246,216,0.25), rgba(0,0,0,0) 70%)", opacity: lightsOn }} /> : null}
        {/* the script page before the shoot */}
        {frame < lights.from ? (
          <div style={{ position: "absolute", left: 540 - 280, top: 700, width: 560, height: 700, background: "#F4F1E8", borderRadius: 6, padding: 50, boxSizing: "border-box", transform: "rotate(-3deg)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 24, color: "#555" }}>FADE IN:</div>
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 64, color: "#111", marginTop: 40, textAlign: "center" }}>
              فكرتك
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 22, color: "#777", textAlign: "center" }}>— draft · مسودة —</div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 12, background: "#d6d2c6", marginTop: 26, width: `${60 + random(`l${i}`) * 40}%` }} />
            ))}
            {frame >= notyet.from ? <div style={{ position: "absolute", right: 30, top: 30, padding: "6px 16px", border: "4px solid #b23a48", color: "#b23a48", fontFamily: fonts.mono, fontWeight: 700, fontSize: 24, transform: "rotate(10deg)" }}>NOT A FILM YET</div> : null}
          </div>
        ) : (
          <div style={{ position: "absolute", left: 540 - 310, top: 760 }}>
            <Clapper snap={snap} scene={frame >= premiere.from ? "FINAL" : `0${k + 1}`} take={frame >= takes.from ? k + 1 : 1} />
          </div>
        )}
        {frame >= takes.from ? <FilmStrip offset={stripOff % 240} filled={filled * 2 + (filled > 0 ? 1 : 0)} /> : null}
        {/* ACTION! */}
        {frame >= premiere.action && frame < premiere.screen ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: fonts.en, fontWeight: 800, fontSize: 150, color: colors.white, textShadow: "0 0 40px rgba(94,120,255,0.9)" }}>
            ACTION!
            <div dir="rtl" style={{ fontFamily: fonts.ar, fontSize: 90, color: colors.accent }}>
              أكشن!
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      {/* premiere: big screen, red carpet, audience, flashes */}
      {frame >= premiere.screen ? (
        <AbsoluteFill style={{ opacity: screen }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 560, height: 640, borderRadius: 16, background: "#0A1033", border: "10px solid #1b1e27", boxShadow: "0 0 120px rgba(94,120,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Img src={staticFile("neocapta-logo.png")} style={{ width: 560, transform: `scale(${0.9 + screen * 0.1})` }} />
          </div>
          <div style={{ position: "absolute", left: 540 - 140, top: 1260, width: 280, height: 700, background: "linear-gradient(180deg, #8a1a24, #5a0f18)", clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)" }} />
          {new Array(18).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: i < 9 ? 40 + i * 42 : 640 + (i - 9) * 42, top: 1320 + (i % 3) * 30, width: 50, height: 50, borderRadius: "50%", background: "#05060a" }} />
          ))}
          {new Array(8).fill(0).map((_, i) => {
            const at = premiere.screen + 8 + i * 6;
            const life = frame - at;
            if (life < 0 || life > 5) return null;
            return <div key={i} style={{ position: "absolute", left: random(`fl${i}`) * 1080 - 150, top: 1250 + random(`ft${i}`) * 300, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(0,0,0,0) 65%)", opacity: 1 - life / 5 }} />;
          })}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// "أكشن! / Action!" — from a draft script, through five takes, to the premiere on the big screen.
export const ActionVideo: React.FC = () => (
  <Shell
    bg="#07080c"
    audio="action-music.wav"
    outro={{ from: outro.from, duration: outro.duration, en: "From idea to premiere.", ar: "نصنع إعلانك من الفكرة للعرض" }}
    flashes={[premiere.screen]}
    captions={[
      { from: script.from + 16, to: script.to, kicker: "ACTION! · أكشن", en: "Every great ad starts as an idea.", ar: "كل إعلان عظيم… يبدأ بفكرة.", enSize: 72, top: 190 },
      { from: notyet.from + 4, to: notyet.to, en: "But an idea isn't a film yet.", ar: "بس الفكرة… مو فيلم للحين.", enSize: 74, top: 190 },
      { from: lights.from + 4, to: takes.from, kicker: "NEO CAPTA", en: "Lights. Camera…", ar: "إضاءة… كاميرا…", top: 190 },
      ...SERVICES.map((s, k) => ({ from: takes.from + k * takes.each + 4, to: k < 4 ? takes.from + (k + 1) * takes.each + 4 : premiere.from, kicker: `TAKE ${k + 1}`, en: s.en, ar: s.ar, enSize: 88, arSize: 76, top: 170 })),
      { from: premiere.screen + 20, to: outro.from, en: "From idea… to premiere.", ar: "من الفكرة… للعرض الأول.", enSize: 76, top: 190 },
    ]}
  >
    <Set />
  </Shell>
);
