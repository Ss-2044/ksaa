import type { CmsSource } from "./source";

/**
 * Sanity provider — plain HTTP (GROQ) so the site ships no CMS SDK.
 * Schemas live in /cms/sanity. GROQ projections return the exact shapes in ./types.
 *
 * Env: SANITY_PROJECT_ID, SANITY_DATASET (default "production"),
 *      SANITY_API_VERSION (default "2025-01-01"), SANITY_READ_TOKEN (optional, for drafts).
 */

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2025-01-01";
const token = process.env.SANITY_READ_TOKEN;

async function groq<T>(query: string): Promise<T> {
  if (!projectId) throw new Error("SANITY_PROJECT_ID is not set");
  const host = token ? "api.sanity.io" : "apicdn.sanity.io";
  const url = `https://${projectId}.${host}/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    // Re-fetch at most every 5 minutes; wire a Sanity webhook to revalidateTag("cms") for instant updates.
    next: { revalidate: 300, tags: ["cms"] },
  });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  const json = (await res.json()) as { result: T };
  return json.result;
}

const status = `"status": select(isPublished == true => "published", "draft")`;
const loc = (f: string) => `"${f}": {"en": ${f}.en, "ar": ${f}.ar}`;

export const sanitySource: CmsSource = {
  stats: () =>
    groq(`*[_type == "stat"] | order(order asc){ "id": _id, value, decimals, prefix, ${loc("suffix")}, ${loc("label")}, source, order, ${status} }`),
  partnerLogos: () =>
    groq(`*[_type == "partnerLogo"] | order(order asc){ "id": _id, name, url, order, ${status},
      "logo": {"src": logo.asset->url, "width": logo.asset->metadata.dimensions.width, "height": logo.asset->metadata.dimensions.height} }`),
  featuredPartners: () =>
    groq(`*[_type == "featuredPartner"] | order(order asc){ "id": _id, ${loc("name")}, category, ${loc("specialty")}, ${loc("blurb")},
      storeUrl, "citySlug": city->slug.current, order, ${status},
      "image": {"src": image.asset->url, "alt": {"en": image.alt.en, "ar": image.alt.ar},
        "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height} }`),
  testimonials: () =>
    groq(`*[_type == "testimonial"] | order(order asc){ "id": _id, firstName, ${loc("city")}, quote, locale, rating, ratingSource, ${loc("ordered")}, order, ${status} }`),
  articles: () =>
    groq(`*[_type == "article"] | order(publishedAt desc){ "id": _id, "slug": slug.current, locale, translationKey, title, excerpt, category,
      "cover": {"src": cover.asset->url, "alt": cover.alt, "width": cover.asset->metadata.dimensions.width, "height": cover.asset->metadata.dimensions.height},
      author, publishedAt, updatedAt, readingMinutes, body, seo, ${status} }`),
  cities: () => groq(`*[_type == "city"] | order(order asc){ "slug": slug.current, ${loc("name")}, order, ${status} }`),
};
