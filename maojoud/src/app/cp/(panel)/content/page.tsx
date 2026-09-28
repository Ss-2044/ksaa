import { adminActivateBanner, adminDeleteBanner, adminSaveCategory } from "@/actions/admin";
import { BannerForm, CategoryForm } from "@/components/admin/content-forms";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export default async function AdminContent() {
  await requireAdmin();
  const [banners, categories] = await Promise.all([
    db.banner.findMany({ orderBy: { createdAt: "desc" } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <h1 className="text-2xl font-bold">محتوى المنصة</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">بانر الصفحة الرئيسية</h2>
        <BannerForm />
        <ul className="grid gap-3 sm:grid-cols-2">
          {banners.map((b) => (
            <li key={b.id} className={`overflow-hidden rounded-2xl border bg-white ${b.active ? "border-brand-500 ring-2 ring-brand-500/20" : "border-slate-200"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt={b.alt} className="aspect-[3/1] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3 text-sm">
                <span className="truncate text-slate-500">{b.active ? "✓ المعروض حاليًا" : b.link || "بدون رابط"}</span>
                <div className="flex gap-2">
                  {!b.active && (
                    <form action={adminActivateBanner.bind(null, b.id)}>
                      <button className="rounded-lg bg-brand-50 px-3 py-1.5 font-semibold text-brand-700">عرض</button>
                    </form>
                  )}
                  <form action={adminDeleteBanner.bind(null, b.id)}>
                    <button className="rounded-lg bg-red-50 px-3 py-1.5 font-semibold text-red-600">حذف</button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">أقسام السلع</h2>
        <p className="text-sm text-slate-500">القسم ذو المعرّف other يظهر للبائع كخيار «أخرى» فقط ولا يظهر في أيقونات الصفحة الرئيسية.</p>
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <CategoryForm
              key={c.id}
              action={adminSaveCategory.bind(null, c.id)}
              category={{ name: c.name, slug: c.slug, icon: c.icon, sortOrder: c.sortOrder, active: c.active }}
              productCount={c._count.products}
            />
          ))}
          <p className="mt-3 text-sm font-semibold">إضافة قسم جديد</p>
          <CategoryForm action={adminSaveCategory.bind(null, null)} />
        </div>
      </section>
    </div>
  );
}
