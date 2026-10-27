import type { Article, FeaturedPartner, PartnerLogo, Stat, Testimonial } from "@/lib/cms/types";

/**
 * DESIGN-REVIEW SAMPLES — only loaded when NEXT_PUBLIC_CONTENT_PREVIEW=true.
 *
 * These exist so the team can review sections that stay hidden until real content
 * arrives. Every item is flagged `sample: true`, rendered with a visible "Sample"
 * badge, and never shown with preview mode off. Names are deliberately generic.
 */

export const sampleStats: Stat[] = [
  { id: "s-orders", value: 12500, suffix: { en: "+", ar: "+" }, label: { en: "orders delivered", ar: "طلب وصل لأصحابه" }, source: "sample", order: 1, status: "draft", sample: true },
  { id: "s-time", value: 24, suffix: { en: " min", ar: " دقيقة" }, label: { en: "average delivery time", ar: "متوسط وقت التوصيل" }, source: "sample", order: 2, status: "draft", sample: true },
  { id: "s-partners", value: 180, suffix: { en: "+", ar: "+" }, label: { en: "restaurants, cafes & stores", ar: "مطعم وكافيه ومتجر" }, source: "sample", order: 3, status: "draft", sample: true },
  { id: "s-rating", value: 4.8, decimals: 1, suffix: { en: "★", ar: "★" }, label: { en: "average app rating", ar: "متوسط تقييم التطبيق" }, source: "sample", order: 4, status: "draft", sample: true },
];

export const samplePartnerLogos: PartnerLogo[] = ["Sample Kitchen", "Sample Roasters", "Sample Market", "Sample Bakery", "Sample Grill"].map(
  (name, i) => ({ id: `s-logo-${i}`, name, logo: { src: "", width: 160, height: 48 }, order: i, status: "draft", sample: true }),
);

export const sampleFeatured: FeaturedPartner[] = [
  {
    id: "s-f1",
    name: { en: "Sample Kitchen", ar: "مطبخ تجريبي" },
    category: "restaurants",
    specialty: { en: "Wraps & grills", ar: "لفائف ومشويات" },
    blurb: { en: "Placeholder copy for layout review only.", ar: "نص تجريبي لمراجعة التصميم فقط." },
    image: { src: "/images/restaurant-wraps.jpg", alt: { en: "Chicken wraps", ar: "لفائف دجاج" } },
    order: 1,
    status: "draft",
    sample: true,
  },
  {
    id: "s-f2",
    name: { en: "Sample Roasters", ar: "محمصة تجريبية" },
    category: "cafes",
    specialty: { en: "Specialty coffee", ar: "قهوة مختصة" },
    blurb: { en: "Placeholder copy for layout review only.", ar: "نص تجريبي لمراجعة التصميم فقط." },
    image: { src: "/images/cafe-cheers.jpg", alt: { en: "Two lattes", ar: "كوبين لاتيه" } },
    order: 2,
    status: "draft",
    sample: true,
  },
  {
    id: "s-f3",
    name: { en: "Sample Market", ar: "سوق تجريبي" },
    category: "groceries",
    specialty: { en: "Fresh produce", ar: "خضار وفواكه" },
    blurb: { en: "Placeholder copy for layout review only.", ar: "نص تجريبي لمراجعة التصميم فقط." },
    image: { src: "/images/grocery-market.jpg", alt: { en: "Produce stall", ar: "بسطة خضار" } },
    order: 3,
    status: "draft",
    sample: true,
  },
  {
    id: "s-f4",
    name: { en: "Sample Burger Co.", ar: "برقر تجريبي" },
    category: "restaurants",
    specialty: { en: "Burgers", ar: "برقر" },
    blurb: { en: "Placeholder copy for layout review only.", ar: "نص تجريبي لمراجعة التصميم فقط." },
    image: { src: "/images/restaurant-burger.jpg", alt: { en: "Burger", ar: "برقر" } },
    order: 4,
    status: "draft",
    sample: true,
  },
];

export const sampleTestimonials: Testimonial[] = [
  { id: "s-t-en", firstName: "Sample", city: { en: "Riyadh", ar: "الرياض" }, quote: "Placeholder review for layout review only — replace with a real, permissioned customer quote.", locale: "en", order: 1, status: "draft", sample: true },
  { id: "s-t-ar", firstName: "تجريبي", city: { en: "Jeddah", ar: "جدة" }, quote: "مراجعة تجريبية لمراجعة التصميم فقط — تُستبدل بتقييم حقيقي من عميل بعد موافقته.", locale: "ar", order: 1, status: "draft", sample: true },
];

export const sampleArticles: Article[] = (["en", "ar"] as const).map((locale) => ({
  id: `s-a-${locale}`,
  slug: "sample-article",
  locale,
  translationKey: "sample-article",
  title: locale === "en" ? "Sample article title for layout review" : "عنوان مقال تجريبي لمراجعة التصميم",
  excerpt: locale === "en" ? "Placeholder excerpt. Real articles are written and reviewed before publishing." : "مقتطف تجريبي. المقالات الحقيقية تُكتب وتُراجع قبل النشر.",
  category: "culture",
  cover: { src: "/images/cafe-beans.jpg", alt: locale === "en" ? "Coffee beans" : "حبوب قهوة" },
  publishedAt: "2026-01-01",
  readingMinutes: 4,
  body: [
    { type: "p", text: locale === "en" ? "Placeholder body text for layout review only." : "نص تجريبي لمراجعة التصميم فقط." },
    { type: "h2", text: locale === "en" ? "A sample subheading" : "عنوان فرعي تجريبي" },
    { type: "ul", items: locale === "en" ? ["Sample point one", "Sample point two"] : ["نقطة تجريبية أولى", "نقطة تجريبية ثانية"] },
  ],
  status: "draft",
  sample: true,
}));
