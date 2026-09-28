"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../ui/Icon";

const icons: IconName[] = ["pin", "bag", "receipt", "chef", "scooter", "home"];

/**
 * Six stops on one route. Tap/click (or arrow keys) to move the pin; when the
 * section first comes into view it walks through once and stops at "Delivered".
 */
export function HowItWorks({
  steps,
  distance,
  stepNumbers,
  progressLabel,
}: {
  steps: { title: string; body: string }[];
  distance: string[];
  stepNumbers: string[];
  progressLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = steps.length - 1;

  useEffect(() => {
    const el = ref.current;
    if (!el || touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = setInterval(() => setActive((a) => (a >= last ? (clearInterval(timer), a) : a + 1)), 1300);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, [touched, last]);

  const select = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const rtl = document.documentElement.dir === "rtl";
    const next = e.key === (rtl ? "ArrowLeft" : "ArrowRight") || e.key === "ArrowDown";
    const prev = e.key === (rtl ? "ArrowRight" : "ArrowLeft") || e.key === "ArrowUp";
    if (!next && !prev) return;
    e.preventDefault();
    const i = Math.max(0, Math.min(last, active + (next ? 1 : -1)));
    select(i);
    tabs.current[i]?.focus();
  };

  const pct = (active / last) * 100;

  return (
    <div ref={ref} className="mt-14">
      {/* Route + stops */}
      <div className="relative">
        <div className="absolute inset-x-6 top-6 h-0.5 bg-[repeating-linear-gradient(to_right,var(--color-line)_0_4px,transparent_4px_12px)] md:inset-x-[8.33%]" aria-hidden="true" />
        <div
          className="absolute start-6 top-6 h-0.5 bg-terra transition-[width] duration-700 ease-[var(--ease-arrive)] motion-reduce:transition-none md:start-[8.33%]"
          style={{ width: `calc((100% - 3rem) * ${pct / 100})` }}
          aria-hidden="true"
        />
        <div role="tablist" aria-label={progressLabel} className="relative grid grid-cols-6" onKeyDown={onKey}>
          {steps.map((s, i) => {
            const on = i === active;
            const passed = i <= active;
            return (
              <button
                key={s.title}
                ref={(el) => { tabs.current[i] = el; }}
                role="tab"
                id={`how-tab-${i}`}
                aria-selected={on}
                aria-controls="how-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => select(i)}
                className="group flex flex-col items-center gap-3 rounded-lg pb-2 text-center"
              >
                <span
                  className={`relative inline-flex size-12 items-center justify-center rounded-full ring-4 ring-cream transition-colors duration-500 ${
                    on ? "bg-terra-btn text-white" : passed ? "bg-ink text-cream" : "bg-paper text-stone ring-1 ring-line"
                  }`}
                >
                  <Icon name={i === last && passed ? "check" : icons[i]} size={22} />
                </span>
                <span className="hidden text-sm font-semibold md:block">
                  <span className="block text-xs font-medium text-stone tabular-nums">{stepNumbers[i]}</span>
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active step */}
      <div id="how-panel" role="tabpanel" aria-labelledby={`how-tab-${active}`} className="mt-10 grid gap-6 rounded-[var(--radius-xl)] bg-paper p-6 shadow-card md:grid-cols-12 md:items-center md:p-10">
        <p className="text-[clamp(4rem,10vw,7rem)] leading-none font-bold text-terra tabular-nums md:col-span-3" aria-hidden="true">
          {stepNumbers[active]}
        </p>
        <div className="md:col-span-6">
          <h3 className="text-h2">{steps[active].title}</h3>
          <p className="text-lead mt-3 text-stone">{steps[active].body}</p>
        </div>
        <p className="md:col-span-3 md:text-end">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${active === last ? "bg-sage-wash text-sage-ink" : "bg-terra-wash text-terra-ink"}`}>
            <Icon name={active === last ? "check" : "pin"} size={18} />
            {distance[active]}
          </span>
        </p>
      </div>
    </div>
  );
}
