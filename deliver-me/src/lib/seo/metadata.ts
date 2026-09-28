import type { Metadata } from "next";
import { hreflang, type Locale, site } from "@/config/site";
import { localePath } from "@/i18n/utils";

interface BuildMetadataInput {
  locale: Locale;
  /** Locale-independent path, e.g. "/restaurants" or "/" */
  path: string;
  title: string;
  description: string;
  /** Use the title as-is (skip the " — Deliver Me" suffix) */
  absoluteTitle?: boolean;
  image?: { url: string; width?: number; height?: number; alt?: string };
  type?: "website" | "article";
  publishedTime?: string;
  /** Override alternates when a page doesn't exist in both languages (e.g. articles) */
  alternatePaths?: Partial<Record<Locale, string>>;
  noindex?: boolean;
}

export function buildMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle,
  image,
  type = "website",
  publishedTime,
  alternatePaths,
  noindex,
}: BuildMetadataInput): Metadata {
  const brand = site.name[locale];
  const fullTitle = absoluteTitle ? title : `${title} — ${brand}`;
  const paths: Partial<Record<Locale, string>> = alternatePaths ?? { en: path, ar: path };
  const languages: Record<string, string> = {};
  for (const l of ["en", "ar"] as const) {
    const p = paths[l];
    if (p) languages[hreflang[l]] = `${site.url}${localePath(l, p)}`;
  }
  if (paths.ar) languages["x-default"] = `${site.url}${localePath("ar", paths.ar)}`;

  const canonical = `${site.url}${localePath(locale, path)}`;
  const ogImage = image ?? { url: "/images/og-default.jpg", width: 1200, height: 630, alt: brand };

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical, languages },
    openGraph: {
      type,
      url: canonical,
      title: fullTitle,
      description,
      siteName: brand,
      locale: locale === "ar" ? "ar_SA" : "en_SA",
      alternateLocale: locale === "ar" ? ["en_SA"] : ["ar_SA"],
      images: [ogImage],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage.url],
      ...(site.social.x ? { site: "@" + site.social.x.replace(/^.*\//, "").replace(/^@/, "") } : {}),
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
