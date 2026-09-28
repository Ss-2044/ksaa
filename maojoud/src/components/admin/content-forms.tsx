"use client";

import { useEffect, useRef } from "react";
import { adminAddBanner, type AdminFormState } from "@/actions/admin";
import { CATEGORY_ICONS, CategoryIcon } from "@/components/category-icon";
import { Alert, Button, inputClass } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";

export function BannerForm() {
  const [state, action, pending] = useFormAction(adminAddBanner, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} onSubmit={action} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <label className="flex flex-col gap-1 text-sm font-semibold">
        صورة البانر (يُفضّل 2000×670)
        <input type="file" name="image" accept="image/*" required className="text-sm file:me-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:font-semibold file:text-brand-700" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        رابط عند الضغط (اختياري)
        <input name="link" placeholder="/search?category=phones" dir="ltr" className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        وصف الصورة
        <input name="alt" placeholder="عروض الجوالات" className={inputClass} />
      </label>
      <Button type="submit" disabled={pending}>{pending ? "جارٍ الرفع…" : "رفع ونشر"}</Button>
      {state?.error && <div className="sm:col-span-4"><Alert>{state.error}</Alert></div>}
    </form>
  );
}

export function CategoryForm({
  action,
  category,
  productCount,
}: {
  action: (s: AdminFormState, f: FormData) => Promise<AdminFormState>;
  category?: { name: string; slug: string; icon: string; sortOrder: number; active: boolean };
  productCount?: number;
}) {
  const [state, formAction, pending] = useFormAction(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !category) ref.current?.reset();
  }, [state, category]);

  return (
    <form ref={ref} onSubmit={formAction} className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <CategoryIcon name={category?.icon ?? "other"} className="size-5" />
      </span>
      <input name="name" defaultValue={category?.name} placeholder="اسم القسم" required className={`${inputClass} w-36 flex-1`} aria-label="اسم القسم" />
      <input name="slug" defaultValue={category?.slug} placeholder="slug" required dir="ltr" className={`${inputClass} w-32`} aria-label="المعرّف" />
      <select name="icon" defaultValue={category?.icon ?? "other"} className={`${inputClass} w-36`} aria-label="الأيقونة">
        {Object.entries(CATEGORY_ICONS).map(([k, v]) => (
          <option key={k} value={k}>{v.label}</option>
        ))}
      </select>
      <input name="sortOrder" type="number" min={0} defaultValue={category?.sortOrder ?? 50} className={`${inputClass} w-20`} aria-label="الترتيب" />
      {category && (
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" name="active" defaultChecked={category.active} className="size-4" /> مفعل
        </label>
      )}
      {productCount !== undefined && <span className="text-xs text-slate-400">{productCount} سلعة</span>}
      <Button type="submit" size="sm" variant={category ? "secondary" : "primary"} disabled={pending}>
        {category ? "حفظ" : "إضافة"}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
      {state?.ok && category && <p className="w-full text-sm text-emerald-600">تم الحفظ</p>}
    </form>
  );
}
