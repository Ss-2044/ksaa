import { articles } from "@/content/articles";
import { cities } from "@/content/cities";
import { featuredPartners, partnerLogos } from "@/content/partners";
import { stats } from "@/content/stats";
import { testimonials } from "@/content/testimonials";
import type { CmsSource } from "./source";

export const localSource: CmsSource = {
  async stats() { return stats; },
  async partnerLogos() { return partnerLogos; },
  async featuredPartners() { return featuredPartners; },
  async testimonials() { return testimonials; },
  async articles() { return articles; },
  async cities() { return cities; },
};
