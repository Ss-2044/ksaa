import type { FeaturedPartner, PartnerLogo } from "@/lib/cms/types";

/**
 * Real partner logos only (with written permission from each partner).
 * The trust strip is hidden while this list has no published items.
 * Put logo files in /public/partners/ and reference them as "/partners/name.svg".
 */
export const partnerLogos: PartnerLogo[] = [];

/**
 * Real featured restaurants, cafes and stores only. Each needs its own photography
 * (supplied by the partner or shot for Deliver Me) and a working storefront link.
 * The Featured section is hidden while this list has no published items.
 */
export const featuredPartners: FeaturedPartner[] = [];
