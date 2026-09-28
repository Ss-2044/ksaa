import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { SectionTitle } from "@/components/card";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { WhyMaojoud } from "@/components/trust";
import { db } from "@/lib/db";
import { activeCategories, productCardSelect } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [banner, categories, recent] = await Promise.all([
    db.banner.findFirst({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    activeCategories(),
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: productCardSelect,
    }),
  ]);

  const bannerImg = banner && (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={banner.imageUrl} alt={banner.alt || "عرض موجود"} className="aspect-[5/2] w-full object-cover sm:aspect-[3/1]" />
  );

  return (
    <div className="container-page flex flex-col gap-10 pt-5 sm:gap-12 sm:pt-6">
      {/* البانر الترويجي — يُدار من لوحة التحكم */}
      <section aria-label="عروض" className="overflow-hidden rounded-3xl bg-brand-600">
        {banner ? (
          banner.link ? <Link href={banner.link}>{bannerImg}</Link> : bannerImg
        ) : (
          <div className="flex aspect-[5/2] flex-col items-start justify-center gap-3 bg-gradient-to-bl from-brand-700 via-brand-600 to-brand-500 px-6 text-white sm:aspect-[3/1] sm:px-12">
            <p className="text-2xl font-bold sm:text-4xl">بيع واشترِ أجهزتك بأمان</p>
            <p className="text-white/85 sm:text-lg">مستعمل أو جديد — كل شيء موجود</p>
          </div>
        )}
      </section>

      <section aria-labelledby="cats">
        <SectionTitle>
          <span id="cats">الأقسام</span>
        </SectionTitle>
        <ul className="grid grid-cols-4 gap-2.5 sm:gap-4 md:grid-cols-8">
          {categories
            .filter((c) => c.slug !== "other")
            .map((c) => (
              <li key={c.id}>
                <Link
                  href={`/search?category=${c.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-2 text-center focus-visible:outline-2 focus-visible:outline-brand-500"
                >
                  <span className="flex size-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-brand-600 transition group-hover:border-brand-300 group-hover:bg-brand-50 sm:size-20">
                    <CategoryIcon name={c.icon} className="size-8 sm:size-9" />
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800 sm:text-sm">{c.name}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="recent">
        <SectionTitle action={<Link href="/search" className="text-sm font-semibold text-brand-700 hover:underline">عرض الكل</Link>}>
          <span id="recent">أضيفت مؤخرًا</span>
        </SectionTitle>
        {recent.length ? (
          <ProductGrid>
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            لا توجد سلع بعد — كن أول من يعرض سلعته!
          </p>
        )}
      </section>

      <WhyMaojoud />
    </div>
  );
}
