/**
 * Business facts that appear across the site.
 *
 * Everything here is read from environment variables so the site never ships
 * invented contact details. Anything left empty is simply hidden in the UI.
 * See `.env.example` for the full list.
 */

const env = (key: string) => process.env[key]?.trim() || "";

export const site = {
  name: { en: "Deliver Me", ar: "وصّل لي" },
  url: (env("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000").replace(/\/$/, ""),

  /** Registered legal entity — shown in legal pages and Organization schema once provided. */
  legalName: env("NEXT_PUBLIC_LEGAL_NAME"),
  commercialRegistration: env("NEXT_PUBLIC_CR_NUMBER"),

  contact: {
    email: env("NEXT_PUBLIC_CONTACT_EMAIL"),
    partnersEmail: env("NEXT_PUBLIC_PARTNERS_EMAIL"),
    phone: env("NEXT_PUBLIC_CONTACT_PHONE"),
    /** International format, digits only, e.g. 9665XXXXXXXX */
    whatsapp: env("NEXT_PUBLIC_WHATSAPP_NUMBER").replace(/\D/g, ""),
  },

  /** Physical address — only emitted as LocalBusiness schema when set. */
  address: {
    street: env("NEXT_PUBLIC_ADDRESS_STREET"),
    city: env("NEXT_PUBLIC_ADDRESS_CITY"),
    postalCode: env("NEXT_PUBLIC_ADDRESS_POSTAL_CODE"),
    country: "SA",
  },

  social: {
    instagram: env("NEXT_PUBLIC_SOCIAL_INSTAGRAM"),
    tiktok: env("NEXT_PUBLIC_SOCIAL_TIKTOK"),
    x: env("NEXT_PUBLIC_SOCIAL_X"),
  },

  app: {
    appStore: env("NEXT_PUBLIC_APP_STORE_URL"),
    googlePlay: env("NEXT_PUBLIC_GOOGLE_PLAY_URL"),
    /** When set, the primary nav CTA becomes "Order Now" and points here. */
    webOrdering: env("NEXT_PUBLIC_WEB_ORDERING_URL"),
  },

  analytics: {
    gtmId: env("NEXT_PUBLIC_GTM_ID"),
  },

  /** Shows draft/sample CMS content with a visible banner. Never enable in production. */
  contentPreview: env("NEXT_PUBLIC_CONTENT_PREVIEW") === "true",
} as const;

export const hasAppLinks = Boolean(site.app.appStore || site.app.googlePlay);

export type Locale = "en" | "ar";
export const locales: readonly Locale[] = ["ar", "en"] as const;
export const defaultLocale: Locale = "ar";

export const hreflang: Record<Locale, string> = { en: "en-SA", ar: "ar-SA" };

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "ar";
}

export const verticals = ["restaurants", "cafes", "groceries"] as const;
export type Vertical = (typeof verticals)[number];

export function isVertical(value: string): value is Vertical {
  return (verticals as readonly string[]).includes(value);
}
