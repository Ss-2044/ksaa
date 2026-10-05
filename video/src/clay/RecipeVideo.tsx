import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { C, ClayBg, ClayEnd, ClayLogo, Say, clamp, clay, sphere } from "./kit";
import TL from "./timelines.json";

// «الوصفة»: strategy + creativity + data + timing, stirred in a bowl → a campaign that works.
const T = TL.recipe;
const BOWL = { x: 540, y: 1330, w: 760 };
const ING = [
  { ar: "استراتيجية", en: "STRATEGY", c: C.peri },
  { ar: "إبداع", en: "CREATIVITY", c: C.pink },
  { ar: "بيانات", en: "DATA", c: C.mint },
  { ar: "توقيت", en: "TIMING", c: C.butter },
];

export const RecipeVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stir = interpolate(frame, [T.stir[0], T.stir[1]], [0, 1], clamp);
  const stirring = frame >= T.stir[0] && frame < T.stir[1];
  const wobble = stirring ? Math.sin(frame / 2.2) * 4 : 0;
  const pop = spring({ frame: frame - T.pop, fps, config: { damping: 8, stiffness: 120 } });
  const bowlIn = spring({ frame: frame - 8, fps, config: { damping: 11 } });
  const landed = T.drops.filter((d) => frame >= d + 26).length;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <ClayBg />
      <Sequence from={0} durationInFrames={T.stir[0]} layout="none">
        <Say ar="وصفة الحملة الناجحة؟" en="The recipe for a winning campaign?" top={150} from={4} hl={1} size={88} />
      </Sequence>
      <Sequence from={T.stir[0]} durationInFrames={T.pop - T.stir[0]} layout="none">
        <Say ar="نخلطها صح…" en="Mix it right…" top={150} from={2} hl={0} size={92} />
      </Sequence>
      <Sequence from={T.pop} durationInFrames={T.end - T.pop} layout="none">
        <Say ar="وتطلع حملة تشتغل." en="…and out comes a campaign that works." top={150} from={6} hl={2} size={88} />
      </Sequence>
      {/* counter */}
      {frame >= T.drops[0] && frame < T.stir[0] ? (
        <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34, color: C.navy, padding: "10px 30px", ...clay(C.white, 30) }}>{landed} / 4</span>
        </div>
      ) : null}
      {/* ingredients */}
      {ING.map((g, i) => {
        const d = T.drops[i];
        if (frame < d - 20) return null;
        const appear = spring({ frame: frame - (d - 20), fps, config: { damping: 10 } });
        const fall = interpolate(frame, [d, d + 24], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
        const inBowl = frame >= d + 26;
        const squash = frame >= d + 24 && frame < d + 32 ? 1 - Math.sin(((frame - d - 24) / 8) * Math.PI) * 0.3 : 1;
        const restX = BOWL.x - 210 + i * 140;
        const x = interpolate(fall, [0, 1], [540, restX]);
        const y = interpolate(fall, [0, 1], [700, BOWL.y - 40]);
        const sinkStir = stir;
        const ox = inBowl ? Math.cos(frame / 6 + i * 1.6) * 180 * sinkStir : 0;
        const oy = inBowl ? Math.sin(frame / 6 + i * 1.6) * 30 * sinkStir + sinkStir * 60 : 0;
        const gone = frame >= T.pop;
        if (gone) return null;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x + ox - 110, top: y + oy - 110, width: 220, height: 220 * squash, transform: `scale(${appear * (1 - sinkStir * 0.35)})`, ...sphere(g.c) }} />
            {!inBowl ? (
              <div dir="rtl" style={{ position: "absolute", left: x - 200, width: 400, top: y - 240, textAlign: "center", opacity: 1 - fall }}>
                <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 68, color: C.navy, padding: "6px 34px", ...clay(C.white, 40) }}>{g.ar}</span>
                <div style={{ marginTop: 12, fontFamily: fonts.en, fontWeight: 800, fontSize: 22, letterSpacing: 5, color: C.muted }}>{g.en}</div>
              </div>
            ) : null}
            {/* splash */}
            {frame >= d + 24 && frame < d + 44
              ? new Array(8).fill(0).map((_, k) => {
                  const t = frame - d - 24;
                  const a = Math.PI + (k / 7) * Math.PI;
                  return <div key={k} style={{ position: "absolute", left: restX + Math.cos(a) * (60 + t * 9) - 14, top: BOWL.y - 60 + Math.sin(a) * (40 + t * 6) + t * t * 0.4, width: 28, height: 28, opacity: 1 - t / 20, ...sphere(g.c) }} />;
                })
              : null}
          </React.Fragment>
        );
      })}
      {/* swirl while stirring */}
      {stirring ? (
        <div style={{ position: "absolute", left: BOWL.x - 300, top: BOWL.y - 70, width: 600, height: 120, borderRadius: "50%", background: `conic-gradient(from ${frame * 12}deg, ${C.peri}, ${C.pink}, ${C.mint}, ${C.butter}, ${C.peri})`, opacity: stir }} />
      ) : null}
      {/* spoon */}
      {stirring ? (
        <div style={{ position: "absolute", left: BOWL.x + Math.cos(frame / 4) * 160 - 18, top: BOWL.y - 380, width: 36, height: 380, borderRadius: 18, ...clay("#E8C49A", 18), transform: `rotate(${Math.cos(frame / 4) * 14}deg)`, transformOrigin: "bottom center" }} />
      ) : null}
      {/* the bowl */}
      <div style={{ position: "absolute", left: BOWL.x - BOWL.w / 2, top: BOWL.y - 40, width: BOWL.w, height: 380, transform: `translateY(${(1 - bowlIn) * 600}px) rotate(${wobble}deg)`, ...clay(C.white, 0), borderRadius: "40px 40px 380px 380px" }}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 18, height: 60, borderRadius: "50%", background: "rgba(124,140,255,0.22)" }} />
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.display, fontWeight: 900, fontSize: 52, color: C.blue }}>نيو كابتا</div>
      </div>
      {/* the result pops out */}
      {frame >= T.pop ? (
        <>
          <div style={{ position: "absolute", left: 540 - 230, top: 640 + (1 - pop) * 500, width: 460, height: 460, transform: `scale(${pop}) rotate(${(1 - pop) * 30}deg)`, ...sphere(C.blue), display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <svg width={170} height={170} viewBox="0 0 100 100"><path d="M 50 8 L 61 37 L 92 38 L 68 57 L 76 88 L 50 70 L 24 88 L 32 57 L 8 38 L 39 37 Z" fill={C.butter} stroke={C.white} strokeWidth={3} strokeLinejoin="round" /></svg>
            <div dir="rtl" style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 56, color: C.white, marginTop: 6 }}>حملة ناجحة</div>
          </div>
          {new Array(36).fill(0).map((_, i) => {
            const t = frame - T.pop;
            const a = random(`ca${i}`) * Math.PI * 2;
            const v = 10 + random(`cv${i}`) * 16;
            return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * v * t - 14, top: 870 + Math.sin(a) * v * t + 0.5 * t * t - 14, width: 28, height: 28, opacity: Math.max(0, 1 - t / 60), ...sphere([C.peri, C.pink, C.mint, C.butter][i % 4]) }} />;
          })}
        </>
      ) : null}
      <Sequence from={T.end}>
        <ClayEnd ar="وصفتنا: فكرة صح، بشكل صح." en="Our recipe: the right idea, done right." />
      </Sequence>
      {frame < T.end ? <ClayLogo /> : null}
      <Audio src={staticFile("clay-recipe-music.wav")} />
    </AbsoluteFill>
  );
};
