import type { Metadata } from "next";
import { SellForm } from "@/components/sell/sell-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "أضف سلعتك" };

export default async function SellPage() {
  await requireUser("/sell");
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
  // خيار "أخرى" دائمًا في آخر القائمة
  categories.sort((a, b) => Number(a.slug === "other") - Number(b.slug === "other"));

  return (
    <div className="container-page max-w-2xl py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">اعرض سلعتك</h1>
      <p className="mt-1 text-slate-500">املأ التفاصيل وسنعرض سلعتك للمشترين مباشرة</p>
      <SellForm categories={categories.map((c) => ({ value: c.id, label: c.name }))} />
    </div>
  );
}
