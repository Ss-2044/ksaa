"use client";

import { useEffect, useState } from "react";

/** Distance chip that ticks 12 → 6 → Arrived once, then stops (no continuous motion). */
export function HeroStatus({ label, away, arrived, digits }: { label: string; away: string; arrived: string; digits: string[] }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(2);
      return;
    }
    const a = setTimeout(() => setStep(1), 1600);
    const b = setTimeout(() => setStep(2), 3200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);
  const done = step === 2;
  return (
    <div className="flex items-center gap-3 rounded-full bg-paper/95 py-2 ps-2 pe-4 shadow-card backdrop-blur" role="status" aria-live="polite">
      <span className={`inline-flex size-9 items-center justify-center rounded-full transition-colors duration-500 ${done ? "bg-sage-ink text-white" : "bg-terra-btn text-white"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {done ? <path d="m5 12.5 4.5 4.5L19 7.5" /> : <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />}
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-xs text-stone">{label}</span>
        <span className="block font-bold tabular-nums">{done ? arrived : `${digits[step]} ${away}`}</span>
      </span>
    </div>
  );
}
