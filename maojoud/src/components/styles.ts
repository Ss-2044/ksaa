import { cn } from "@/lib/cn";

// أنماط مشتركة قابلة للاستخدام في مكونات الخادم والمتصفح
export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:not-data-disabled:bg-brand-700 active:not-data-disabled:bg-brand-800",
  secondary:
    "border border-brand-200 bg-white text-brand-700 hover:not-data-disabled:bg-brand-50 active:not-data-disabled:bg-brand-100",
  ghost: "text-slate-700 hover:not-data-disabled:bg-slate-100",
  danger: "bg-red-600 text-white hover:not-data-disabled:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-5 text-[15px] rounded-xl",
  lg: "h-13 px-6 text-base rounded-xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex select-none items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
    "data-disabled:opacity-50 data-disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    extra,
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 " +
  "focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-500/15 data-invalid:border-red-400";

