/**
 * Sanity Studio schema types for Deliver Me. Copy into a Studio project
 * (`npm create sanity@latest`) and add them to `schema.types`.
 * Field names match the GROQ projections in src/lib/cms/sanity.ts.
 * Every document has `isPublished` — only published docs reach the live site.
 * Roles: give marketing "Editor", ops "Contributor"; enforce 2FA via the org's SSO.
 */
const localized = (name: string, title: string, type = "string") => ({
  name, title, type: "object",
  fields: [{ name: "en", title: "English", type }, { name: "ar", title: "العربية", type }],
});
const base = [
  { name: "isPublished", title: "Published (visible on live site)", type: "boolean", initialValue: false },
  { name: "order", title: "Order", type: "number" },
];

export const schemaTypes = [
  { name: "stat", title: "Impact stat", type: "document", fields: [
    { name: "value", type: "number", validation: (r: any) => r.required() },
    { name: "decimals", type: "number" }, { name: "prefix", type: "string" },
    localized("suffix", "Suffix"), localized("label", "Label"),
    { name: "source", title: "Verification source (internal)", type: "string", validation: (r: any) => r.required() },
    ...base ] },
  { name: "partnerLogo", title: "Partner logo", type: "document", fields: [
    { name: "name", type: "string" }, { name: "logo", type: "image" }, { name: "url", type: "url" }, ...base ] },
  { name: "featuredPartner", title: "Featured partner", type: "document", fields: [
    localized("name", "Name"),
    { name: "category", type: "string", options: { list: ["restaurants", "cafes", "groceries"] } },
    localized("specialty", "Cuisine / specialty"), localized("blurb", "Why order from them", "text"),
    { name: "image", type: "image", options: { hotspot: true }, fields: [localized("alt", "Alt text")] },
    { name: "storeUrl", title: "In-app storefront / deep link", type: "url" },
    { name: "city", type: "reference", to: [{ type: "city" }] }, ...base ] },
  { name: "testimonial", title: "Customer testimonial (real & permissioned only)", type: "document", fields: [
    { name: "firstName", type: "string" }, localized("city", "City"), { name: "quote", type: "text" },
    { name: "locale", type: "string", options: { list: ["en", "ar"] } },
    { name: "rating", type: "number" }, { name: "ratingSource", type: "string", options: { list: ["App Store", "Google Play"] } },
    localized("ordered", "What they ordered"), ...base ] },
  { name: "city", title: "City", type: "document", fields: [
    { name: "slug", type: "slug" }, localized("name", "Name"), ...base ] },
  { name: "article", title: "Insights article", type: "document", fields: [
    { name: "title", type: "string" }, { name: "slug", type: "slug", options: { source: "title" } },
    { name: "locale", type: "string", options: { list: ["en", "ar"] } },
    { name: "translationKey", title: "Translation key (same for EN & AR versions)", type: "string" },
    { name: "excerpt", type: "text" },
    { name: "category", type: "string", options: { list: ["trends", "partner-tips", "grocery", "culture", "product"] } },
    { name: "cover", type: "image", fields: [{ name: "alt", type: "string" }] },
    { name: "author", type: "string" }, { name: "publishedAt", type: "date" }, { name: "updatedAt", type: "date" },
    { name: "readingMinutes", type: "number" },
    { name: "body", title: "Body blocks ({type:'p'|'h2'|'h3'|'ul'|'quote'|'img'})", type: "array", of: [{ type: "object", fields: [
      { name: "type", type: "string" }, { name: "text", type: "text" }, { name: "items", type: "array", of: [{ type: "string" }] },
      { name: "cite", type: "string" }, { name: "src", type: "url" }, { name: "alt", type: "string" }, { name: "caption", type: "string" } ] }] },
    { name: "seo", type: "object", fields: [{ name: "title", type: "string" }, { name: "description", type: "text" }] },
    { name: "isPublished", type: "boolean", initialValue: false } ] },
];
