"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { cn } from "@/lib/cn";
import { buttonClass, inputClass, type Size, type Variant } from "./styles";

export { buttonClass, inputClass };

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<typeof BaseButton> & { variant?: Variant; size?: Size; className?: string }) {
  return <BaseButton className={buttonClass(variant, size, className)} {...props} />;
}

export function TextField({
  label,
  description,
  error,
  className,
  ...props
}: React.ComponentProps<typeof Field.Control> & {
  label: string;
  description?: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <Field.Root className="flex flex-col gap-1.5" invalid={!!error}>
      <Field.Label className="text-sm font-semibold text-slate-800">{label}</Field.Label>
      <Field.Control className={cn(inputClass, className)} {...props} />
      {description && <Field.Description className="text-xs text-slate-500">{description}</Field.Description>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </Field.Root>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "warning" | "success" | "info"; children: React.ReactNode }) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-brand-200 bg-brand-50 text-brand-800",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm", tones[tone])}>
      {children}
    </div>
  );
}
