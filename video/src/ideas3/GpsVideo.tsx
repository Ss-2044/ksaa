import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { useFonts } from "../components/useFonts";
import { LOGO_RATIO } from "../components/Logo";
import { fonts } from "../theme";
import TL from "./timelines.json";

// «وين رايح؟»: a navigation app. Lost, recalculating… then NEO CAPTA sets a route to growth.
const T = TL.gps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const M = { bg: "#1A1F2B", block: "#232A39", road: "#3A4357", roadEdge: "#4C5670", park: "#1F3B2E", route: "#4D8DFF", text: "#E8ECF5", muted: "#8B93A7", green: "#1E9E62", red: "#D64545" };
const GRID = 320;
const N = 10;
const CAR_SCREEN = { x: 540, y: 1250 };

const LOST = "M 1120 1760 L 1120 1440 L 1440 1440 L 1440 1760 L 1120 1760 L 1120 2080 L 800 2080 L 800 1760 L 1120 1760 L 1120 1440 L 1440 1440";
const LOST_LEN = getLength(LOST);
const ROUTE = "M 1120 1760 L 1120 1120 L 2080 1120 L 2080 480";
const ROUTE_LEN = getLength(ROUTE);

const STEPS = [
  { ar: "انعطف يمين… نحو جمهورك", dist: "٢٠٠ م", arrow: "right" },
  { ar: "استمر على طريق المحتوى", dist: "١ كم", arrow: "up" },
  { ar: "الوجهة: النمو… على يسارك", dist: "٣٠٠ م", arrow: "left" },
];

const Arrow: React.FC<{ dir: string }> = ({ dir }) => (
  <svg width={110} height={110} viewBox="0 0 100 100" style={{ transform: `rotate(${dir === "right" ? 90 : dir === "left" ? -90 : 0}deg)` }}>
    <path d="M 50 10 L 85 50 L 62 50 L 62 90 L 38 90 L 38 50 L 15 50 Z" fill="#FFFFFF" />
  </svg>
);

const MapLayer: React.FC = () => (
  <g>
    <rect x={-400} y={-400} width={GRID * N + 800} height={GRID * N + 800} fill={M.bg} />
    {new Array(N).fill(0).map((_, i) =>
      new Array(N).fill(0).map((__, j) => (
        <rect key={`${i}-${j}`} x={i * GRID + 30} y={j * GRID + 30} width={GRID - 60} height={GRID - 60} rx={14} fill={(i * 7 + j * 3) % 11 === 0 ? M.park : M.block} />
      )),
    )}
    {new Array(N + 1).fill(0).map((_, k) => (
      <g key={k}>
        <path d={`M -400 ${k * GRID} L ${GRID * N + 400} ${k * GRID}`} stroke={M.road} strokeWidth={44} />
        <path d={`M ${k * GRID} -400 L ${k * GRID} ${GRID * N + 400}`} stroke={M.road} strokeWidth={44} />
      </g>
    ))}
  </g>
);

export const GpsVideo: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lostP = interpolate(frame, [T.lost[0], T.lost[1]], [0, 1], clamp);
  const driveP = interpolate(frame, [T.drive[0], T.drive[1]], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const routeDraw = interpolate(frame, [T.route, T.drive[0]], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const driving = frame >= T.drive[0];
  const lost = frame < T.lost[1];
  const pt = (lost ? getPointAtLength(LOST, Math.max(0.01, LOST_LEN * lostP)) : driving ? getPointAtLength(ROUTE, Math.max(0.01, ROUTE_LEN * driveP)) : null) ?? { x: 1440, y: 1440 };
  const tan = (lost ? getTangentAtLength(LOST, Math.max(1, LOST_LEN * lostP)) : getTangentAtLength(ROUTE, Math.max(1, ROUTE_LEN * driveP))) ?? { x: 0, y: -1 };
  const heading = (Math.atan2(tan.y, tan.x) * 180) / Math.PI + 90;
  // smooth camera: during search the car sits still and the camera eases to the route start
  const cam = frame < T.lost[1] ? pt : frame < T.drive[0] ? { x: interpolate(frame, [T.lost[1], T.drive[0]], [1440, 1120], clamp), y: interpolate(frame, [T.lost[1], T.drive[0]], [1440, 1760], clamp) } : pt;
  const carPos = frame >= T.lost[1] && frame < T.drive[0] ? { x: interpolate(frame, [T.lost[1], T.lost[1] + 30], [1440, 1120], clamp), y: interpolate(frame, [T.lost[1], T.lost[1] + 30], [1440, 1760], clamp) } : pt;
  const stepIdx = T.steps.filter((s) => frame >= s).length - 1;
  const arrived = frame >= T.arrive;
  const recalcBlink = lost && Math.floor(frame / 12) % 2 === 0;
  const searchP = interpolate(frame, [T.search[0], T.search[0] + 10], [0, 1], clamp) * (1 - interpolate(frame, [T.search[1], T.search[1] + 8], [0, 1], clamp));
  const typed = "نيو كابتا".slice(0, Math.round(interpolate(frame, [T.search[0] + 8, T.search[0] + 28], [0, 9], clamp)));
  const remaining = Math.max(0, 2.2 * (1 - driveP));
  const endP = interpolate(frame, [T.end, T.end + 16], [0, 1], clamp);
  const pin = spring({ frame: frame - T.route, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: M.bg, overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${CAR_SCREEN.x - cam.x} ${CAR_SCREEN.y - cam.y})`}>
          <MapLayer />
          {/* map labels */}
          <text x={1600} y={1100} textAnchor="middle" fontFamily={fonts.display} fontWeight={700} fontSize={34} fill={M.muted}>طريق المحتوى</text>
          <text x={1280} y={1290} textAnchor="middle" fontFamily={fonts.display} fontWeight={700} fontSize={36} fill={M.text} opacity={0.75}>الجمهور</text>
          {/* lost trail */}
          {frame < T.drive[0] ? <path d={LOST} fill="none" stroke={M.red} strokeWidth={10} strokeDasharray={`${LOST_LEN * lostP} ${LOST_LEN}`} opacity={0.45} /> : null}
          {/* route */}
          {frame >= T.route ? (
            <>
              <path d={ROUTE} fill="none" stroke="#2A5BBF" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${ROUTE_LEN * routeDraw} ${ROUTE_LEN}`} />
              <path d={ROUTE} fill="none" stroke={M.route} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${ROUTE_LEN * routeDraw} ${ROUTE_LEN}`} />
              {/* destination pin */}
              <g transform={`translate(2080 480) scale(${pin * (arrived ? 1 + 0.1 * Math.sin(frame / 4) : 1)})`}>
                <circle r={60 + (arrived ? ((frame - T.arrive) % 30) * 4 : 0)} fill={M.green} opacity={arrived ? 0.25 : 0} />
                <path d="M 0 0 C -14 -24, -44 -40, -44 -76 A 44 44 0 1 1 44 -76 C 44 -40, 14 -24, 0 0 Z" fill={M.green} stroke="#FFFFFF" strokeWidth={6} />
                <circle cx={0} cy={-76} r={16} fill="#FFFFFF" />
                <text x={0} y={-150} textAnchor="middle" fontFamily={fonts.display} fontWeight={900} fontSize={54} fill={M.text}>النمو</text>
              </g>
            </>
          ) : null}
          {/* the car puck */}
          <g transform={`translate(${carPos.x} ${carPos.y}) rotate(${frame >= T.lost[1] && frame < T.drive[0] ? 0 : heading})`}>
            <circle r={70} fill={M.route} opacity={0.18} />
            <circle r={40} fill="#FFFFFF" />
            <path d="M 0 -30 L 22 22 L 0 10 L -22 22 Z" fill={lost ? M.red : M.route} />
          </g>
        </g>
      </svg>
      {/* top navigation banner */}
      <div dir="rtl" style={{ position: "absolute", left: 30, right: 30, top: 150, height: 220, borderRadius: 34, background: lost ? (recalcBlink ? M.red : "#A83434") : arrived ? M.green : driving ? "#1F6B4A" : "#2B3242", display: "flex", alignItems: "center", gap: 30, padding: "0 40px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        {driving && !arrived && stepIdx >= 0 ? (
          <>
            <Arrow dir={STEPS[stepIdx].arrow} />
            <div>
              <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.8)" }}>{STEPS[stepIdx].dist}</div>
              <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 56, color: "#FFFFFF", lineHeight: 1.2 }}>{STEPS[stepIdx].ar}</div>
            </div>
          </>
        ) : (
          <div style={{ width: "100%", textAlign: "center" }}>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 64, color: "#FFFFFF" }}>{lost ? "بدون وجهة…" : arrived ? "وصلت إلى وجهتك" : "ابحث عن وجهة"}</div>
            <div style={{ fontFamily: fonts.en, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{lost ? "RECALCULATING…" : arrived ? "YOU HAVE ARRIVED" : "WHERE TO?"}</div>
          </div>
        )}
      </div>
      {lost ? (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: fonts.display, fontWeight: 700, fontSize: 44, color: M.text, opacity: recalcBlink ? 1 : 0.4 }}>إعادة التوجيه…</div>
      ) : null}
      {/* search sheet */}
      {searchP > 0 ? (
        <div dir="rtl" style={{ position: "absolute", left: 40, right: 40, top: 420, borderRadius: 30, background: "#2B3242", padding: 30, opacity: searchP, transform: `translateY(${(1 - searchP) * 40}px)`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ height: 100, borderRadius: 50, background: M.bg, display: "flex", alignItems: "center", padding: "0 36px", gap: 20 }}>
            <svg width={44} height={44} viewBox="0 0 44 44"><circle cx={18} cy={18} r={13} fill="none" stroke={M.muted} strokeWidth={5} /><path d="M 28 28 L 40 40" stroke={M.muted} strokeWidth={5} strokeLinecap="round" /></svg>
            <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 46, color: M.text }}>{typed}<span style={{ color: M.route }}>{frame % 14 < 8 ? "|" : ""}</span></span>
          </div>
          {frame >= T.search[0] + 30 ? (
            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 24, padding: "18px 20px", borderRadius: 22, background: frame >= T.search[1] - 6 ? "#3A4560" : "transparent" }}>
              <div style={{ width: 110, height: 110, borderRadius: 24, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Img src={staticFile("neocapta-logo-dark.png")} style={{ width: 96, height: 96 * LOGO_RATIO }} />
              </div>
              <div>
                <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 48, color: M.text }}>نيو كابتا</div>
                <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 30, color: M.muted }}>وكالة تسويق · تحدد لك الوجهة</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {/* bottom ETA sheet */}
      {frame >= T.route ? (
        <div dir="rtl" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, borderRadius: "40px 40px 0 0", background: "#232A39", padding: "40px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", transform: `translateY(${(1 - pin) * 300}px)` }}>
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 60, color: M.text }}>الوجهة: النمو</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 34, color: M.green, marginTop: 8 }}>المسار واضح ✓ بإشراف نيو كابتا</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 72, color: M.text, direction: "ltr" }}>{remaining.toFixed(1)}</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 28, color: M.muted }}>كم</div>
          </div>
        </div>
      ) : null}
      <Img src={staticFile("neocapta-logo-white.png")} style={{ position: "absolute", top: 22, left: 34, width: 140, height: 140 * LOGO_RATIO, opacity: 0.9 }} />
      {/* end card */}
      {frame >= T.end ? (
        <AbsoluteFill style={{ background: M.bg, opacity: endP * interpolate(frame, [T.duration - 12, T.duration], [1, 0], clamp) }}>
          <div style={{ position: "absolute", top: 520, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${0.7 + 0.3 * spring({ frame: frame - T.end, fps, config: { damping: 12 } })})` }}>
            <Img src={staticFile("neocapta-logo-white.png")} style={{ width: 600, height: 600 * LOGO_RATIO }} />
          </div>
          <div dir="rtl" style={{ position: "absolute", top: 1040, left: 0, right: 0, textAlign: "center" }}>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 96, color: M.text }}>لكل فكرة وجهة.</div>
            <div style={{ fontFamily: fonts.en, fontWeight: 700, fontSize: 32, letterSpacing: 6, color: M.route, marginTop: 14 }}>EVERY IDEA, A DIRECTION.</div>
            <div style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 36, color: M.muted, marginTop: 70 }}>استراتيجية · هوية · محتوى · حملات</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Audio src={staticFile("idea-gps-music.wav")} />
    </AbsoluteFill>
  );
};
