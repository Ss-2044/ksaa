import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { cn } from "@/lib/cn";
import { db } from "@/lib/db";
import { activeCategories, productCardSelect } from "@/lib/queries";

export const metadata: Metadata = { title: "تصفح السلع" };

const PAGE_SIZE = 30;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q = "", category = "", page = "1" } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);
  const categories = await activeCategories();
  const cat = categories.find((c) => c.slug === category);
  const terms = q.trim().split(/\s+/).filter(Boolean).slice(0, 6);

  const where = {
    status: "ACTIVE",
    ...(cat && { categoryId: cat.id }),
    ...(terms.length && { AND: terms.map((t) => ({ OR: [{ title: { contains: t } }, { description: { contains: t } }] })) }),
  };
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
      select: productCardSelect,
    }),
    db.product.count({ where }),
  ]);

  const href = (params: Record<string, string>) => {
    const sp = new URLSearchParams({ ...(q && { q }), ...(category && { category }), ...params });
    for (const [k, v] of [...sp.entries()]) if (!v) sp.delete(k);
    return `/search?${sp}`;
  };

  return (
    <div className="container-page py-6">
      <h1 className="text-2xl font-bold">{q ? `نتائج البحث عن «${q}»` : cat ? cat.name : "جميع السلع"}</h1>
      <p className="mt-1 text-sm text-slate-500">{total.toLocaleString("ar-SA")} سلعة</p>

      <nav aria-label="الأقسام" className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
        {[{ slug: "", name: "الكل" }, ...categories].map((c) => (
          <Link
            key={c.slug || "all"}
            href={href({ category: c.slug, page: "" })}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold",
              (cat?.slug ?? "") === c.slug ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
            )}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="mt-4">
        {products.length ? (
          <ProductGrid>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">لا توجد سلع مطابقة.</p>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="mt-8 flex justify-center gap-3">
          {pageNum > 1 && <Link className="rounded-xl border bg-white px-4 py-2" href={href({ page: String(pageNum - 1) })}>السابق</Link>}
          {pageNum * PAGE_SIZE < total && <Link className="rounded-xl border bg-white px-4 py-2" href={href({ page: String(pageNum + 1) })}>التالي</Link>}
        </div>
      )}
    </div>
  );
}
