import type { Locale, Vertical } from "@/config/site";

/**
 * Content models shared by every CMS provider (local files today, Sanity when
 * CMS_PROVIDER=sanity). Every model carries a `status`; only "published" items
 * ever reach production. Anything else stays hidden until real content exists.
 */

export type Localized<T = string> = { en: T; ar: T };
export type PublishStatus = "published" | "draft";

export interface CmsImage {
  src: string;
  alt: Localized;
  width?: number;
  height?: number;
}

export interface Stat {
  id: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: Localized;
  label: Localized;
  /** Internal note on where the number comes from (ops report, app store, etc.). Not rendered. */
  source: string;
  order: number;
  status: PublishStatus;
  sample?: boolean;
}

export interface PartnerLogo {
  id: string;
  name: string;
  logo: { src: string; width: number; height: number };
  url?: string;
  order: number;
  status: PublishStatus;
  sample?: boolean;
}

export interface FeaturedPartner {
  id: string;
  name: Localized;
  category: Vertical;
  specialty: Localized;
  blurb: Localized;
  image: CmsImage;
  /** In-app storefront deep link or app-store link */
  storeUrl?: string;
  citySlug?: string;
  order: number;
  status: PublishStatus;
  sample?: boolean;
}

export interface Testimonial {
  id: string;
  firstName: string;
  city: Localized;
  quote: string;
  /** Language the quote was written in — shown on that locale only */
  locale: Locale;
  /** Only when genuinely sourced (e.g. from an app-store review) */
  rating?: number;
  ratingSource?: "App Store" | "Google Play";
  ordered?: Localized;
  order: number;
  status: PublishStatus;
  sample?: boolean;
}

export const articleCategories = ["trends", "partner-tips", "grocery", "culture", "product"] as const;
export type ArticleCategory = (typeof articleCategories)[number];

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "img"; src: string; alt: string; caption?: string };

export interface Article {
  id: string;
  slug: string;
  locale: Locale;
  /** Shared key linking the English and Arabic versions of the same article (for hreflang) */
  translationKey?: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  cover?: { src: string; alt: string; width?: number; height?: number };
  author?: string;
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  body: ArticleBlock[];
  seo?: { title?: string; description?: string };
  status: PublishStatus;
  sample?: boolean;
}

export interface City {
  slug: string;
  name: Localized;
  order: number;
  status: PublishStatus;
}
