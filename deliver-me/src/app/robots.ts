import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";
  return {
    // Preview deployments are never indexed.
    rules: isProd && !site.contentPreview ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/download"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
