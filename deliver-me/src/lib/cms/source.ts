import type { Article, City, FeaturedPartner, PartnerLogo, Stat, Testimonial } from "./types";

/** Every CMS provider implements this contract; the rest of the app never talks to a CMS directly. */
export interface CmsSource {
  stats(): Promise<Stat[]>;
  partnerLogos(): Promise<PartnerLogo[]>;
  featuredPartners(): Promise<FeaturedPartner[]>;
  testimonials(): Promise<Testimonial[]>;
  articles(): Promise<Article[]>;
  cities(): Promise<City[]>;
}
