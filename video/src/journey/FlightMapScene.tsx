import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { colors, fonts } from "../theme";
import { Plane } from "./Plane";
import { departures } from "./DeparturesScene";
import timeline from "./timeline.json";
import { DataCard } from "../cards/DataCard";
import { ProductCard } from "../cards/ProductCard";
import { SocialCard } from "../cards/SocialCard";
import { CampaignCard } from "../cards/CampaignCard";
import { GraphCard } from "../cards/GraphCard";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CW = 2200;
const CH = 3200;
const ROUTE = "M 400 2900 C 900 2800, 300 2300, 800 2100 S 1700 1900, 1500 1500 S 500 1100, 900 800 S 1600 700, 1800 400";
const LEN = getLength(ROUTE);
const cards = [<DataCard key="1" />, <ProductCard key="2" />, <SocialCard key="3" />, <CampaignCard key="4" />, <GraphCard key="5" />];
const lands = [
  { x: 300, y: 2500, rx: 520, ry: 380 },
  { x: 1500, y: 2200, rx: 600, ry: 420 },
  { x: 700, y: 1300, rx: 560, ry: 470 },
  { x: 1700, y: 700, rx: 480, ry: 380 },
  { x: 400, y: 500, rx: 420, ry: 300 },
];
const cities = new Array(70).fill(0).map((_, i) => ({ x: random(`cx${i}`) * CW, y: random(`cy${i}`) * CH, r: 3 + random(`cr${i}`) * 5 }));

const pointAt = (p: number) => getPointAtLength(ROUTE, Math.min(LEN - 0.01, Math.max(0.01, p * LEN)))!;

// Scene 4 — the idea's flight: the plane follows the route and lands on each service.
export const FlightMapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { flyFrom, flyTo, stops } = timeline.map;
  const p = interpolate(frame, [flyFrom, flyTo], [0, 1], clamp);
  const pos = pointAt(p);
  const tan = getTangentAtLength(ROUTE, Math.min(LEN - 0.01, Math.max(0.01, p * LEN)))!;
  const angle = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;

  // camera: overview -> follow the plane -> overview of the finished route
  const zin = interpolate(frame, [0, flyFrom], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const zout = interpolate(frame, [flyTo, durationInFrames - 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const follow = zin * (1 - zout);
  const scale = interpolate(follow, [0, 1], [0.5, 1]);
  const cx = interpolate(follow, [0, 1], [CW / 2, pos.x]);
  const cy = interpolate(follow, [0, 1], [CH / 2 - 80, pos.y]);
  const reached = stops.filter((s) => p >= s).length;
  const current = reached > 0 ? departures[reached - 1] : null;
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ opacity: out, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: CW,
          height: CH,
          left: 0,
          top: 0,
          transformOrigin: "0 0",
          transform: `translate(540px, 1000px) scale(${scale}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <svg width={CW} height={CH} style={{ position: "absolute", inset: 0 }}>
                    {lands.map((l, i) => (
            <ellipse key={i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="#0d1545" style={{ filter: "blur(30px)" }} />
          ))}
          {new Array(12).fill(0).map((_, i) => (
            <line key={`v${i}`} x1={i * 200} x2={i * 200} y1={0} y2={CH} stroke="rgba(228,230,238,0.06)" strokeWidth={2} />
          ))}
          {new Array(17).fill(0).map((_, i) => (
            <line key={`h${i}`} y1={i * 200} y2={i * 200} x1={0} x2={CW} stroke="rgba(228,230,238,0.06)" strokeWidth={2} />
          ))}
          {cities.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="rgba(228,230,238,0.35)" />
          ))}
          <path d={ROUTE} stroke="rgba(228,230,238,0.35)" strokeWidth={6} fill="none" strokeDasharray="16 22" />
          <path
            d={ROUTE}
            stroke={colors.accent}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - p}
            style={{ filter: "drop-shadow(0 0 16px #5E78FF)" }}
          />
          {stops.map((s, i) => {
            const pt = pointAt(s);
            const on = p >= s;
            const ring = on ? ((frame * 2) % 60) / 60 : 0;
            return (
              <g key={i}>
                {on ? <circle cx={pt.x} cy={pt.y} r={30 + ring * 70} fill="none" stroke={colors.accent} strokeWidth={4} opacity={1 - ring} /> : null}
                <circle cx={pt.x} cy={pt.y} r={22} fill={on ? colors.accent : "#1a2150"} stroke={colors.silver} strokeWidth={5} />
              </g>
            );
          })}
          <g transform={`translate(${pos.x} ${pos.y}) rotate(${angle})`} style={{ filter: "drop-shadow(0 0 20px rgba(228,230,238,0.7))" }}>
            <Plane size={2.2} />
          </g>
        </svg>

        {/* service cards pop up as the plane lands on each stop */}
        {stops.map((s, i) => {
          const pt = pointAt(s);
          const reachFrame = Math.round(flyFrom + s * (flyTo - flyFrom));
          const side = pt.x > CW / 2 ? -1 : 1;
          return (
            <Sequence key={i} from={reachFrame} layout="none">
              <StopCard x={pt.x} y={pt.y} side={side} en={departures[i].en} ar={departures[i].ar} fps={fps}>
                {cards[i]}
              </StopCard>
            </Sequence>
          );
        })}
      </div>

      {/* HUD */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 110 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.en, fontWeight: 800, fontSize: 30, color: colors.silver, letterSpacing: 3 }}>
          <span>FLIGHT NC-2026</span>
          <span>{Math.round(p * 100)}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "rgba(228,230,238,0.2)", marginTop: 14 }}>
          <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 4, background: colors.accent, boxShadow: "0 0 16px #5E78FF" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "baseline" }}>
          <span style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 40, color: colors.white }}>{current ? `NOW: ${current.en}` : "TAKING OFF"}</span>
          <span dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 42, color: colors.accent }}>
            {current ? current.ar : "الإقلاع"}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StopCard: React.FC<{ x: number; y: number; side: number; en: string; ar: string; fps: number; children: React.ReactNode }> = ({
  x,
  y,
  side,
  en,
  ar,
  fps,
  children,
}) => {
  const frame = useCurrentFrame();
  const s = spring({ frame, fps, config: { damping: 14 } });
  const w = 808 * 0.4;
  const h = 1148 * 0.4;
  const left = side > 0 ? x + 70 : x - 70 - w;
  return (
    <div style={{ position: "absolute", left, top: y - h / 2 - 40, width: w, transform: `scale(${s})`, transformOrigin: side > 0 ? "left center" : "right center" }}>
      <div style={{ fontFamily: fonts.en, fontWeight: 800, fontSize: 34, color: colors.white, letterSpacing: 2 }}>{en}</div>
      <div dir="rtl" style={{ fontFamily: fonts.ar, fontWeight: 900, fontSize: 36, color: colors.accent, textAlign: "left", marginBottom: 10 }}>
        {ar}
      </div>
      <div style={{ width: w, height: h, borderRadius: 22, overflow: "hidden", border: `4px solid ${colors.silver}`, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 808, height: 1148, transform: "scale(0.4)", transformOrigin: "0 0", position: "relative" }}>{children}</div>
      </div>
    </div>
  );
};
