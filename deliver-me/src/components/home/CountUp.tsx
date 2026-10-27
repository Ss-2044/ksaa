"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ value, decimals = 0, locale }: { value: number; decimals?: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  const fmt = (v: number) => new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1400);
        setN(value * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref} className="tabular-nums">{fmt(n)}</span>;
}
