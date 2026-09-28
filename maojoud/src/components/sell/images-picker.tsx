"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { MAX_IMAGES } from "@/lib/constants";

export type PickedImage = { id: string; file: File; preview: string };

// تصغير مبدئي في المتصفح لتسريع الرفع؛ الضغط النهائي يتم في الخادم
async function downscale(file: File, max = 2400): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 2_500_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

export function ImagesPicker({
  images,
  onChange,
  error,
}: {
  images: PickedImage[];
  onChange: (imgs: PickedImage[]) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const latest = useRef(images);
  latest.current = images;

  useEffect(() => () => latest.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const room = MAX_IMAGES - images.length;
    const picked = await Promise.all(
      [...files].filter((f) => f.type.startsWith("image/")).slice(0, room).map(async (f) => {
        const file = await downscale(f);
        return { id: crypto.randomUUID(), file, preview: URL.createObjectURL(file) };
      }),
    );
    onChange([...latest.current, ...picked]);
    setBusy(false);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (i: number) => {
    URL.revokeObjectURL(images[i].preview);
    onChange(images.filter((_, j) => j !== i));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-800">صور السلعة *</span>
        <span className="text-xs text-slate-500">{images.length}/{MAX_IMAGES} · أول صورة هي الصورة الرئيسية · اسحب لإعادة الترتيب</span>
      </div>
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {images.map((img, i) => (
          <li
            key={img.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-100",
              i === 0 ? "border-brand-500" : "border-transparent",
              dragIndex === i && "opacity-50",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.preview} alt={`صورة ${i + 1}`} className="size-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
                <Star className="size-3 fill-current" aria-hidden /> الرئيسية
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <div className="flex gap-1">
                <IconBtn label="تقديم الصورة" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ChevronRight className="size-4" />
                </IconBtn>
                <IconBtn label="تأخير الصورة" disabled={i === images.length - 1} onClick={() => move(i, i + 1)}>
                  <ChevronLeft className="size-4" />
                </IconBtn>
              </div>
              <IconBtn label="حذف الصورة" onClick={() => remove(i)} danger>
                <Trash2 className="size-4" />
              </IconBtn>
            </div>
          </li>
        ))}
        {images.length < MAX_IMAGES && (
          <li>
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
            >
              <ImagePlus className="size-7" aria-hidden />
              <span className="text-xs font-semibold">{busy ? "جارٍ التجهيز…" : "أضف صور"}</span>
            </button>
          </li>
        )}
      </ul>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          add(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg bg-white/90 text-slate-800 disabled:opacity-30",
        danger && "text-red-600",
      )}
    >
      {children}
    </button>
  );
}
