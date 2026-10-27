"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics/track";
import { Icon } from "../ui/Icon";

// Route on a stylised street grid (echoing the logo's grid glyph)
const ROUTE = "M60 300 L60 220 L180 220 L180 140 L300 140 L300 60";
const ROUTE_LEN = 80 + 120 + 80 + 120 + 80;

/**
 * Stylised live-tracking card: the pin travels the route while the status
 * timeline advances. Runs once when first seen; "Replay" restarts it.
 * Reduced motion → shows the delivered state.
 */
export function TrackingDemo({
  statuses,
  replay,
  mapLabel,
  etaLabel,
  etaUnit,
  arrived,
  etas,
}: {
  statuses: string[];
  replay: string;
  mapLabel: string;
  etaLabel: string;
  etaUnit: string;
  arrived: string;
  etas: string[];
}) {
  const last = statuses.length - 1;
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const layer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const box = layer.current?.parentElement;
    if (!box) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 360));
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const start = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(last);
      return;
    }
    setStage(0);
    setRun((r) => r + 1);
  }, [last]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || seen.current) return;
      seen.current = true;
      track("order_tracking_viewed", {});
      start();
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [start]);

  useEffect(() => {
    if (run === 0) return;
    const timers = statuses.map((_, i) => setTimeout(() => setStage(i), i * 1500));
    return () => timers.forEach(clearTimeout);
  }, [run, statuses]);

  // Pin progress along the route: moves during "Picked up" → "Delivered"
  const progress = stage <= 1 ? 0 : stage === 2 ? 0.1 : stage === 3 ? 0.6 : 1;
  const done = stage === last;

  return (
    <div ref={ref} className="rounded-[var(--radius-xl)] bg-char p-4 ring-1 ring-line-dark md:p-6">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[#342a24]">
        <svg viewBox="0 0 360 360" className="block h-auto w-full" role="img" aria-label={mapLabel}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#4a3c33" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="360" height="360" fill="url(#grid)" />
          {/* blocks */}
          {[[80, 240, 80, 60], [200, 160, 80, 40], [80, 80, 80, 120], [200, 240, 120, 80], [220, 20, 60, 100]].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill="#3d312a" />
          ))}
          <path d={ROUTE} fill="none" stroke="#4a3c33" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={ROUTE}
            fill="none"
            stroke="#ee9c82"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={ROUTE_LEN}
            strokeDashoffset={ROUTE_LEN * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1.4s var(--ease-arrive)" }}
          />
          {/* store + home */}
          <g transform="translate(60 300)">
            <circle r="16" fill="#8fa58a" />
            <path d="M-7 -2h14v8h-14zM-8 -2l2-6h12l2 6" fill="none" stroke="#231b16" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
          <g transform="translate(300 60)">
            <circle r="18" fill={done ? "#8fa58a" : "#fbf6ee"} style={{ transition: "fill .5s" }} />
            <path d="M-8 1 0-7l8 8M-6 0v8h12V0" fill="none" stroke="#231b16" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        </svg>
        {/* moving courier pin (CSS offset-path follows the same route) */}
        <div
          ref={layer}
          className="pointer-events-none absolute top-0 left-0 h-[360px] w-[360px] origin-top-left"
          style={{ transform: `scale(${scale})` }}
          aria-hidden="true"
        >
          <div
            className="absolute top-0 left-0 size-0"
            style={{
              offsetPath: `path("${ROUTE}")`,
              offsetDistance: `${progress * 100}%`,
              offsetRotate: "0deg",
              transition: "offset-distance 1.4s var(--ease-arrive)",
            }}
          >
            <span className="absolute -translate-x-1/2 -translate-y-full rounded-full bg-terra-btn p-2 text-white shadow-lift">
              <Icon name="scooter" size={18} />
            </span>
          </div>
        </div>
        <div className="absolute end-3 top-3 rounded-full bg-cream px-3 py-1.5 text-sm font-bold text-ink shadow-card" aria-live="polite">
          {done ? arrived : `${etaLabel} ${etas[Math.min(stage, etas.length - 1)]} ${etaUnit}`}
        </div>
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-5">
        {statuses.map((s, i) => {
          const passed = i <= stage;
          return (
            <li key={s} className={`flex items-center gap-2 text-sm transition-colors duration-500 sm:flex-col sm:items-start ${passed ? "text-cream" : "text-stone-soft/60"}`}>
              <span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-500 ${passed ? (i === last ? "bg-sage text-ink" : "bg-terra-btn text-white") : "bg-line-dark"}`}>
                {passed && <Icon name="check" size={14} />}
              </span>
              <span className="font-medium">{s}</span>
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={start} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-terra-soft hover:bg-cream/5">
        <Icon name="replay" size={18} /> {replay}
      </button>
    </div>
  );
}
