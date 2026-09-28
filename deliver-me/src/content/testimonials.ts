import type { Testimonial } from "@/lib/cms/types";

/**
 * Real customer reviews only — quoted verbatim, with the customer's permission.
 * Ratings only when sourced (e.g. App Store / Google Play). Never invent reviews.
 * The Testimonials section is hidden while there are no published items for a locale.
 */
export const testimonials: Testimonial[] = [];
