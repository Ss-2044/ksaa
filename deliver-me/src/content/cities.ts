import type { City } from "@/lib/cms/types";

/**
 * Cities with live coverage. Each published city generates landing pages
 * (/restaurants/riyadh, /cafes/riyadh, …) and appears in the footer coverage note.
 * ⚠️ Confirm coverage with operations before launch; set status "draft" for any
 * city that isn't live yet.
 */
export const cities: City[] = [
  { slug: "riyadh", name: { en: "Riyadh", ar: "الرياض" }, order: 1, status: "published" },
  { slug: "jeddah", name: { en: "Jeddah", ar: "جدة" }, order: 2, status: "published" },
];
