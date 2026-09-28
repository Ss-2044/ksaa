import type { Locale } from "@/config/site";

/** Replace `{key}` tokens in a copy template. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** Build a locale-prefixed path: localePath("ar", "/restaurants") → "/ar/restaurants" */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Strip the locale prefix from a pathname: "/ar/cafes" → "/cafes" */
export function stripLocale(pathname: string): string {
  const stripped = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");
  return stripped || "/";
}

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

/** Locale-aware number formatting. Arabic pages use Arabic-Indic digits to match the
 *  Arabic copy; phone numbers and codes stay Latin. */
export function formatNumber(locale: Locale, value: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", opts).format(value);
}

/** Two-digit step index: 1 → "01" / "٠١" */
export function stepNumber(locale: Locale, n: number): string {
  return formatNumber(locale, n, { minimumIntegerDigits: 2, useGrouping: false });
}

export function formatDate(locale: Locale, iso: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}
