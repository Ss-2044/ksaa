"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/config/site";
import { track } from "@/lib/analytics/track";

/** Links to the same page in the other language and remembers the choice. */
export function LanguageSwitch({
  locale,
  label,
  other,
  otherShort,
  tone = "light",
}: {
  locale: Locale;
  label: string;
  other: string;
  otherShort: string;
  tone?: "light" | "dark";
}) {
  const pathname = usePathname() || `/${locale}`;
  const target: Locale = locale === "ar" ? "en" : "ar";
  const href = pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${target}`);

  return (
    <a
      href={href}
      hrefLang={target === "ar" ? "ar-SA" : "en-SA"}
      lang={target}
      aria-label={`${label}: ${other}`}
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=31536000; samesite=lax`;
        track("language_changed", { from: locale, to: target });
      }}
      className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-full px-3 text-[0.9375rem] font-semibold transition-colors ${
        tone === "dark" ? "text-cream hover:bg-cream/10" : "text-ink hover:bg-ink/[0.06]"
      }`}
    >
      <span className="sm:hidden">{otherShort}</span>
      <span className="hidden sm:inline">{other}</span>
    </a>
  );
}
