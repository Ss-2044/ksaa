import type { MetadataRoute } from "next";
import { hreflang, locales, site, verticals } from "@/config/site";
import { localePath } from "@/i18n/utils";
import { getArticles, getCities } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = await getCities();
  const paths = [
    "/",
    ...verticals.map((v) => `/${v}`),
    ...verticals.flatMap((v) => cities.map((c) => `/${v}/${c.slug}`)),
    "/how-it-works",
    "/become-a-partner",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];
  const entry = (path: string, priority: number): MetadataRoute.Sitemap =>
    locales.map((l) => ({
      url: `${site.url}${localePath(l, path)}`,
      changeFrequency: "weekly",
      priority,
      alternates: { languages: Object.fromEntries(locales.map((x) => [hreflang[x], `${site.url}${localePath(x, path)}`])) },
    }));

  const out = paths.flatMap((p) => entry(p, p === "/" ? 1 : p.split("/").length > 2 ? 0.6 : 0.8));

  for (const l of locales) {
    const articles = (await getArticles(l)).filter((a) => !a.sample);
    if (articles.length) out.push({ url: `${site.url}${localePath(l, "/insights")}`, changeFrequency: "weekly", priority: 0.6 });
    for (const a of articles) {
      out.push({ url: `${site.url}${localePath(l, `/insights/${a.slug}`)}`, lastModified: a.updatedAt ?? a.publishedAt, priority: 0.5 });
    }
  }
  return out;
}
