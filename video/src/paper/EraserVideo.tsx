import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts } from "../components/useFonts";
import { fonts } from "../theme";
import { CornerLogo, Line, P, PaperBg, PaperEnd, clamp } from "./kit";
import TL from "./timelines.json";

// «الممحاة»: an ad crammed with everything says nothing; an eraser clears the noise until one clear message is left.
const T = TL.eraser;
const CARD = { x: 100, y: 440, w: 880, h: 1160 };

type Junk = { x: number; y: number; rot: number; node: React.ReactNode };
const J: Junk[] = [
  { x: 40, y: 40, rot: -8, node: <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 120, color: "#e0262f" }}>خصم!!!</span> },
  { x: 560, y: 40, rot: 6, node: <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 120, background: "#ffd400", padding: "0 18px" }}>%50</span> },
  { x: 60, y: 250, rot: -3, node: <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 60, color: "#fff", background: "#1aa34a", padding: "4px 30px", borderRadius: 40 }}>جديد</span> },
  { x: 360, y: 250, rot: 2, node: <span style={{ fontFamily: fonts.punch, fontSize: 72, color: "#7a2fd0" }}>اتصل الآن</span> },
  { x: 650, y: 210, rot: 12, node: <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 70, color: "#c9a227", border: "5px solid #c9a227", padding: "0 14px" }}>VIP</span> },
  { x: 70, y: 420, rot: 4, node: <span style={{ fontFamily: fonts.handAr, fontSize: 80, color: "#e06a1a" }}>أفضل جودة</span> },
  { x: 520, y: 430, rot: -5, node: <span style={{ fontSize: 64, color: "#ffb300", letterSpacing: 4 }}>★★★★★</span> },
  { x: 60, y: 760, rot: -6, node: <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 66, color: "#d0247a" }}>عروض لا تفوتك</span> },
  { x: 620, y: 700, rot: 18, node: <svg width={180} height={120}><path d="M 10 60 L 120 60 M 90 20 L 140 60 L 90 100" stroke="#e0262f" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { x: 380, y: 880, rot: -4, node: <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 64, color: "transparent", WebkitTextStroke: "3px #e0262f" }}>لفترة محدودة</span> },
  { x: 640, y: 960, rot: 10, node: <svg width={200} height={200} viewBox="-100 -100 200 200"><polygon points={new Array(16).fill(0).map((_, i) => { const r = i % 2 ? 60 : 95; const a = (i / 16) * Math.PI * 2; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(" ")} fill="#ffd400" /><text y={26} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={80}>!</text></svg> },
  { x: 60, y: 990, rot: 3, node: <span style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 52, color: "#1a5fd0" }}>05X XXX XXXX</span> },
  { x: 90, y: 600, rot: 0, node: <span style={{ fontFamily: fonts.serif, fontStyle: "italic", fontSize: 60, color: "#2a8f8f" }}>الأصلي فقط</span> },
  { x: 560, y: 590, rot: -9, node: <span style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 52, color: "#fff", background: "#111", padding: "6px 22px" }}>تابعنا @@@</span> },
];
const KEEP = { x: 300, y: 1090 }; // the one line worth keeping starts small and lost in the noise

const eraseAt = (y: number) => T.erase[0] + ((y + 60) / CARD.h) * (T.erase[1] - T.erase[0]);
const ROWS = 6;
const eraserPos = (frame: number) => {
  const p = interpolate(frame, [T.erase[0], T.erase[1]], [0, 1], clamp);
  const r = Math.min(ROWS - 1, Math.floor(p * ROWS));
  const within = p * ROWS - r;
  const xFrac = r % 2 === 0 ? within : 1 - within;
  return { x: CARD.x + 40 + xFrac * (CARD.w - 80), y: CARD.y + 60 + (p * (CARD.h - 120)), p };
};

export const EraserVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const er = eraserPos(frame);
  const erasing = frame >= T.erase[0] - 10 && frame < T.erase[1] + 12;
  const eraserIn = interpolate(frame, [T.erase[0] - 12, T.erase[0]], [0, 1], clamp);
  const eraserOut = interpolate(frame, [T.erase[1], T.erase[1] + 12], [0, 1], clamp);
  const clean = spring({ frame: frame - T.clean, fps, config: { damping: 14 } });
  const cardIn = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <PaperBg />
      <Sequence from={0} durationInFrames={T.says} layout="none">
        <Line ar="إعلانك يقول كل شي…" en="Your ad says everything…" top={150} from={4} hl={2} size={80} />
      </Sequence>
      <Sequence from={T.says} durationInFrames={T.clean - T.says} layout="none">
        <Line ar="…وما يقول شي." en="…and says nothing." top={150} from={2} hl={2} size={80} hlColor="#e0262f" />
      </Sequence>
      <Sequence from={T.clean} durationInFrames={T.end - T.clean} layout="none">
        <Line ar="أقل كلام. أوضح رسالة." en="Less noise. A clearer message." top={150} from={8} hl={3} size={80} />
      </Sequence>
      {/* the ad card */}
      <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, background: P.white, border: `4px solid ${P.ink}`, boxShadow: "14px 14px 0 rgba(18,18,18,0.9)", transform: `translateY(${(1 - cardIn) * 900}px)`, overflow: "hidden" }}>
        {J.map((j, i) => {
          const at = T.clutter + i * T.every;
          const p = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 220 } });
          const gone = frame >= eraseAt(j.y);
          if (frame < at || gone) return null;
          return (
            <div key={i} dir="rtl" style={{ position: "absolute", left: j.x, top: j.y, transform: `rotate(${j.rot}deg) scale(${p})`, transformOrigin: "center", whiteSpace: "nowrap" }}>
              {j.node}
            </div>
          );
        })}
        {/* eraser crumbs */}
        {erasing
          ? new Array(60).fill(0).map((_, i) => {
              const y = 60 + random(`cy${i}`) * (CARD.h - 120);
              const t = frame - eraseAt(y);
              if (t < 0 || t > 40) return null;
              return <div key={i} style={{ position: "absolute", left: 40 + random(`cx${i}`) * (CARD.w - 80), top: y + t * 1.5, width: 10, height: 6, borderRadius: 3, background: "#e9a3b4", opacity: 1 - t / 40, transform: `rotate(${i * 40}deg)` }} />;
            })
          : null}
        {/* the keeper */}
        <div
          dir="rtl"
          style={{
            position: "absolute",
            left: interpolate(clean, [0, 1], [KEEP.x, 0]),
            right: interpolate(clean, [0, 1], [CARD.w - KEEP.x - 330, 0]),
            top: interpolate(clean, [0, 1], [KEEP.y, 430]),
            textAlign: "center",
            opacity: frame >= T.clutter + 4 * T.every ? 1 : 0,
          }}
        >
          <div style={{ fontFamily: frame < T.clean ? fonts.serif : fonts.display, fontWeight: 900, fontSize: interpolate(clean, [0, 1], [46, 104]), color: frame < T.clean ? "#3c8f3c" : P.ink, lineHeight: 1.2, whiteSpace: "nowrap" }}>توصيل مجاني.</div>
          <div style={{ marginTop: 20, fontFamily: fonts.display, fontWeight: 700, fontSize: 48, color: P.blue, opacity: interpolate(frame, [T.clean + 16, T.clean + 30], [0, 1], clamp) }}>اطلب الحين ←</div>
        </div>
      </div>
      {/* the eraser */}
      {erasing ? (
        <div style={{ position: "absolute", left: er.x - 130, top: er.y - 70 - eraserOut * 900 - (1 - eraserIn) * 900, width: 260, height: 130, transform: `rotate(${-18 + Math.sin(frame) * 3}deg)`, filter: "drop-shadow(8px 10px 0 rgba(18,18,18,0.85))" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#ef9fb3", border: `4px solid ${P.ink}` }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 150, width: 110, borderRadius: "0 18px 18px 0", background: P.blue, border: `4px solid ${P.ink}` }} />
        </div>
      ) : null}
      <Sequence from={T.end}>
        <AbsoluteFill style={{ backgroundColor: P.paper }}>
          <PaperBg />
          <PaperEnd line="نشيل الزايد… وتوصل رسالتك." en="We cut the noise. Your message lands." hl={1} />
        </AbsoluteFill>
      </Sequence>
      {frame < T.end ? <CornerLogo /> : null}
      <Audio src={staticFile("eraser-music.wav")} />
    </AbsoluteFill>
  );
};
