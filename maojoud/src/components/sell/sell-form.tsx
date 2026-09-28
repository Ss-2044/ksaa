"use client";

import { useState } from "react";
import { Field } from "@base-ui/react/field";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Select } from "@base-ui/react/select";
import { AlertTriangle, Check, ChevronDown } from "lucide-react";
import { createProduct } from "@/actions/products";
import { Alert, Button, inputClass, TextField } from "@/components/ui";
import { useFormAction } from "@/components/use-form-action";
import { cn } from "@/lib/cn";
import { BROKEN_CONDITION, BROKEN_WARNING, CONDITIONS, DESCRIPTION_MAX } from "@/lib/constants";
import { ImagesPicker, type PickedImage } from "./images-picker";

const CONDITION_OPTIONS = [...Object.entries(CONDITIONS), [BROKEN_CONDITION, "لا يعمل"]] as [string, string][];

export function SellForm({ categories }: { categories: { value: string; label: string }[] }) {
  const [images, setImages] = useState<PickedImage[]>([]);
  const [condition, setCondition] = useState<string>("");
  const [description, setDescription] = useState("");
  // الصور تُرسل بالترتيب الذي اختاره البائع
  const [state, onSubmit, pending] = useFormAction(createProduct, undefined, (form) => {
    form.delete("images");
    for (const img of images) form.append("images", img.file, img.file.name);
  });
  const fe = state?.fieldErrors ?? {};
  const broken = condition === BROKEN_CONDITION;

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <Field.Root className="flex flex-col gap-1.5" invalid={!!fe.categoryId}>
        <Select.Root items={categories} name="categoryId" required>
          <Select.Label className="text-sm font-semibold text-slate-800">القسم *</Select.Label>
          <Select.Trigger className={cn(inputClass, "flex items-center justify-between text-right")}>
            <Select.Value placeholder="اختر القسم المناسب" className="data-placeholder:text-slate-400" />
            <Select.Icon>
              <ChevronDown className="size-4 text-slate-500" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner sideOffset={6} className="z-50 outline-none" alignItemWithTrigger={false}>
              <Select.Popup className="max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl outline-none">
                <Select.List>
                  {categories.map((c) => (
                    <Select.Item
                      key={c.value}
                      value={c.value}
                      className="flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[15px] outline-none select-none data-highlighted:bg-brand-50 data-highlighted:text-brand-800"
                    >
                      <Select.ItemText>{c.label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="size-4 text-brand-600" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        {fe.categoryId && <p className="text-sm text-red-600">{fe.categoryId}</p>}
      </Field.Root>

      <TextField
        label="اسم السلعة بالكامل *"
        name="title"
        required
        maxLength={120}
        placeholder="مثال: آيفون 17 برو ماكس 512 قيقا لون برتقالي"
        description="اكتب الاسم الكامل: الماركة، الموديل، السعة، اللون"
        error={fe.title}
      />

      <div className="flex flex-col gap-2">
        <span id="cond-label" className="text-sm font-semibold text-slate-800">حالة السلعة *</span>
        <RadioGroup
          name="condition"
          aria-labelledby="cond-label"
          value={condition}
          onValueChange={(v) => setCondition(String(v))}
          className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
        >
          {CONDITION_OPTIONS.map(([value, label]) => (
            <label
              key={value}
              className={cn(
                "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border text-[15px] font-semibold transition",
                value === BROKEN_CONDITION
                  ? "border-slate-200 has-data-checked:border-amber-400 has-data-checked:bg-amber-50 has-data-checked:text-amber-900"
                  : "border-slate-200 has-data-checked:border-brand-500 has-data-checked:bg-brand-50 has-data-checked:text-brand-800",
              )}
            >
              <Radio.Root value={value} className="sr-only" />
              {label}
            </label>
          ))}
        </RadioGroup>
        {broken && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-900">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="font-semibold">{BROKEN_WARNING}</p>
          </div>
        )}
        {fe.condition && !broken && <p className="text-sm text-red-600">{fe.condition}</p>}
      </div>

      <Field.Root className="flex flex-col gap-1.5" invalid={!!fe.description}>
        <Field.Label className="text-sm font-semibold text-slate-800">وصف مختصر *</Field.Label>
        <textarea
          name="description"
          required
          maxLength={DESCRIPTION_MAX}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="اذكر أهم التفاصيل: مدة الاستخدام، صحة البطارية، الملحقات، أي خدوش…"
          className={cn(inputClass, "h-auto resize-y py-3 leading-7")}
        />
        <div className="flex justify-between text-xs">
          <span className="text-red-600">{fe.description}</span>
          <span className={description.length >= DESCRIPTION_MAX ? "text-amber-700" : "text-slate-500"}>
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
      </Field.Root>

      <TextField label="السعر (ريال سعودي) *" name="price" type="number" inputMode="decimal" min="1" step="0.01" required error={fe.price} />

      <ImagesPicker images={images} onChange={setImages} error={fe.images} />

      {state?.error && <Alert>{state.error}</Alert>}
      <Button type="submit" size="lg" disabled={pending || broken || images.length === 0}>
        {pending ? "جارٍ رفع السلعة…" : "اعرض السلعة"}
      </Button>
    </form>
  );
}
