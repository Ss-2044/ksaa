import "server-only";
import { cache } from "react";
import type { Locale, Vertical } from "@/config/site";
import { site } from "@/config/site";
import {
  sampleArticles,
  sampleFeatured,
  samplePartnerLogos,
  sampleStats,
  sampleTestimonials,
} from "@/content/samples";
import { localSource } from "./local";
import { sanitySource } from "./sanity";
import type { CmsSource } from "./source";
import type { ArticleCategory, PublishStatus } from "./types";

const source: CmsSource = process.env.CMS_PROVIDER === "sanity" ? sanitySource : localSource;
const preview = site.contentPreview;

/** Production shows published items only. Preview adds clearly-badged samples. */
function visible<T extends { status: PublishStatus }>(items: T[], samples: T[] = []): T[] {
  const published = items.filter((i) => i.status === "published");
  if (!preview) return published;
  return published.length > 0 ? published : samples;
}

async function safe<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    // An unavailable CMS must never break the page: the affected section simply hides.
    console.error("[cms]", err);
    return [];
  }
}

export const getStats = cache(async () => visible(await safe(source.stats), sampleStats));

export const getPartnerLogos = cache(async () => visible(await safe(source.partnerLogos), samplePartnerLogos));

export const getFeaturedPartners = cache(async (vertical?: Vertical) => {
  const all = visible(await safe(source.featuredPartners), sampleFeatured);
  return vertical ? all.filter((p) => p.category === vertical) : all;
});

export const getTestimonials = cache(async (locale: Locale) =>
  visible(await safe(source.testimonials), sampleTestimonials).filter((t) => t.locale === locale),
);

export const getArticles = cache(async (locale: Locale, category?: ArticleCategory) => {
  const all = visible(await safe(source.articles), sampleArticles).filter((a) => a.locale === locale);
  return (category ? all.filter((a) => a.category === category) : all).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
});

export const getArticle = cache(async (locale: Locale, slug: string) =>
  (await getArticles(locale)).find((a) => a.slug === slug),
);

/** The same article in the other language (matched on translationKey), for hreflang. */
export const getArticleTranslation = cache(async (locale: Locale, translationKey?: string) => {
  if (!translationKey) return undefined;
  return (await getArticles(locale)).find((a) => a.translationKey === translationKey);
});

export const getCities = cache(async () =>
  (await safe(source.cities)).filter((c) => c.status === "published").sort((a, b) => a.order - b.order),
);

export const getCity = cache(async (slug: string) => (await getCities()).find((c) => c.slug === slug));
