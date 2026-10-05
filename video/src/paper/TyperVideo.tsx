import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «الآلة الكاتبة»: weak ad lines get typed and crossed out until the one that sells.
const T = TL.typer;
const RED = "#d22f3c";
const LINES = [
  { text: "منتجنا ممتاز وبسعر مناسب.", note: "عام… مثل الكل" },
  { text: "أفضل قهوة في المدينة!", note: "كلام بدون دليل" },
  { text: "قهوتك قبل الدوام… جاهزة في دقيقتين.", note: "واضح ويحل مشكلة" },
];
const SHEET = { x: 70, y: 470, w: 940, h: 1120 };

export const TyperVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sheetIn = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <Sequence from={0} durationInFrames={T.lines[2][0]} layout="none">
        <Line ar="وش تكتب في إعلانك؟" en="What does your ad say?" top={150} from={4} hl={1} size={92} />
      </Sequence>
      <Sequence from={T.lines[2][0]} durationInFrames={T.line - T.lines[2][0]} layout="none">
        <Line ar="الكلمة الصح…" en="The right words…" top={150} from={4} hl={1} size={92} />
      </Sequence>
      <Sequence from={T.line} durationInFrames={T.end - T.line} layout="none">
        <Line ar="…تبيع عنك." en="…sell for you." top={150} from={2} hl={0} size={96} />
      </Sequence>
      {/* the sheet */}
      <div style={{ position: "absolute", left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h, background: P.white, border: `4px solid ${P.ink}`, boxShadow: "14px 14px 0 rgba(18,18,18,0.9)", transform: `translateY(${(1 - sheetIn) * 900}px)` }}>
        {/* ruled lines */}
        {new Array(9).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 50, right: 50, top: 150 + i * 110, height: 2, background: "rgba(52,68,153,0.15)" }} />
        ))}
        {LINES.map((l, i) => {
          const [a, b] = T.lines[i];
          if (frame < a) return null;
          const n = Math.round(interpolate(frame, [a, b], [0, l.text.length], clamp));
          const typing = frame < b;
          const cross = i < 2 ? interpolate(frame, [T.cross[i], T.cross[i] + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
          const good = i === 2 && frame >= T.check;
          const noteP = i < 2 ? interpolate(frame, [T.cross[i] + 8, T.cross[i] + 18], [0, 1], clamp) : interpolate(frame, [T.check + 6, T.check + 18], [0, 1], clamp);
          const top = 90 + i * 330;
          return (
            <div key={i} dir="rtl" style={{ position: "absolute", right: 60, left: 60, top }}>
              <div style={{ position: "relative", display: "inline-block", fontFamily: fonts.display, fontWeight: 700, fontSize: i === 2 ? 62 : 52, lineHeight: 1.45, whiteSpace: i < 2 ? "nowrap" : "normal", color: i < 2 && cross > 0 ? "rgba(18,18,18,0.45)" : P.ink }}>
                {l.text.slice(0, n)}
                {typing && frame % 14 < 8 ? <span style={{ color: P.blue }}>|</span> : null}
                {i < 2 && cross > 0 ? <div style={{ position: "absolute", top: "50%", right: 0, width: `${cross * 100}%`, height: 8, background: RED, borderRadius: 4, transform: "rotate(-2deg)" }} /> : null}
                {good ? <div style={{ position: "absolute", bottom: -6, right: 0, width: `${interpolate(frame, [T.check, T.check + 12], [0, 100], clamp)}%`, height: 10, background: P.blue, borderRadius: 5 }} /> : null}
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 14, opacity: noteP, transform: `translateY(${(1 - noteP) * 16}px)` }}>
                <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 44, color: i < 2 ? RED : P.blue }}>{i < 2 ? "✕" : "✓"}</span>
                <span style={{ fontFamily: fonts.handAr, fontSize: 56, color: i < 2 ? RED : P.blue }}>{l.note}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="نكتب لك كلام يبيع." en="Copy that sells." hl={2} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("typer-music.wav")} />
    </AbsoluteFill>
  );
};
