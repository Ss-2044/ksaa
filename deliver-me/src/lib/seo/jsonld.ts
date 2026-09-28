import { type Locale, site } from "@/config/site";
import { localePath } from "@/i18n/utils";

type Json = Record<string, unknown>;

const sameAs = () => [site.social.instagram, site.social.tiktok, site.social.x].filter(Boolean);

export function organizationSchema(locale: Locale): Json {
  const contactPoint = [] as Json[];
  if (site.contact.phone || site.contact.email) {
    contactPoint.push({
      "@type": "ContactPoint",
      contactType: "customer support",
      areaServed: "SA",
      availableLanguage: ["Arabic", "English"],
      ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
      ...(site.contact.email ? { email: site.contact.email } : {}),
    });
  }
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name.en,
    alternateName: site.name.ar,
    ...(site.legalName ? { legalName: site.legalName } : {}),
    url: `${site.url}${localePath(locale)}`,
    slogan: locale === "ar" ? "أقرب مما تتوقع." : "Closer than you think.",
    areaServed: { "@type": "Country", name: "Saudi Arabia" },
    ...(sameAs().length ? { sameAs: sameAs() } : {}),
    ...(contactPoint.length ? { contactPoint } : {}),
  };
}

export function websiteSchema(locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name[locale],
    url: `${site.url}${localePath(locale)}`,
    inLanguage: locale === "ar" ? "ar-SA" : "en-SA",
    publisher: { "@id": `${site.url}/#organization` },
  };
}

/** Only emitted once a real registered address is configured. */
export function localBusinessSchema(locale: Locale): Json | null {
  const a = site.address;
  if (!a.street || !a.city) return null;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: site.name[locale],
    url: `${site.url}${localePath(locale)}`,
    parentOrganization: { "@id": `${site.url}/#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.city,
      ...(a.postalCode ? { postalCode: a.postalCode } : {}),
      addressCountry: a.country,
    },
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[], locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${localePath(locale, item.path)}`,
    })),
  };
}

export function faqSchema(faq: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleSchema(input: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: input.locale === "ar" ? "ar-SA" : "en-SA",
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    mainEntityOfPage: `${site.url}${localePath(input.locale, input.path)}`,
    ...(input.image ? { image: input.image.startsWith("http") ? input.image : `${site.url}${input.image}` } : {}),
    author: input.author ? { "@type": "Person", name: input.author } : { "@id": `${site.url}/#organization` },
    publisher: { "@id": `${site.url}/#organization` },
  };
}
