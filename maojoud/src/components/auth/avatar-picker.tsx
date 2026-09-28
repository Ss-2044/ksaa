"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

export function AvatarPicker({
  name,
  current,
  displayName = "",
  error,
}: {
  name: string;
  current?: string | null;
  displayName?: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current ?? null);

  useEffect(() => () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        aria-label="اختر صورة شخصية"
      >
        <UserAvatar name={displayName || "؟"} src={preview} className="size-24 text-3xl" />
        <span className="absolute -bottom-1 -left-1 flex size-9 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white">
          <Camera className="size-4" aria-hidden />
        </span>
      </button>
      <span className="text-xs text-slate-500">الصورة الشخصية (اختياري)</span>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) setPreview(URL.createObjectURL(f));
        }}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
