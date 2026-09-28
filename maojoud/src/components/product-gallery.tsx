"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, title }: { images: { url: string; thumbUrl: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return <div className="aspect-square rounded-2xl bg-slate-100" />;
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active].url} alt={`${title} — صورة ${active + 1}`} className="aspect-square w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="صور السلعة">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`صورة ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "size-18 shrink-0 overflow-hidden rounded-xl border-2 bg-white",
                i === active ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.thumbUrl} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
