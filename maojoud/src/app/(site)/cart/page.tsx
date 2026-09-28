import Link from "next/link";
import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import { Card } from "@/components/card";
import { RemoveCartButton } from "@/components/remove-cart-button";
import { buttonClass } from "@/components/styles";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "السلة" };

export default async function CartPage() {
  const user = await requireUser("/cart");
  const items = await db.cartItem.findMany({
    where: { userId: user.id, product: { status: { not: "DELETED" } } },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { id: true, title: true, priceHalalas: true, status: true, images: { orderBy: { position: "asc" }, take: 1 } },
      },
    },
  });
  const available = items.filter((i) => i.product.status === "ACTIVE");
  const total = available.reduce((s, i) => s + i.product.priceHalalas, 0);

  return (
    <div className="container-page max-w-4xl py-8">
      <h1 className="mb-6 text-2xl font-bold">السلة</h1>
      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <ShoppingCart className="size-12 text-slate-300" aria-hidden />
          <p className="text-slate-500">سلتك فارغة</p>
          <Link href="/" className={buttonClass()}>تصفح السلع</Link>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ul className="flex flex-col gap-3">
            {items.map(({ product: p }) => (
              <li key={p.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3">
                <Link href={`/products/${p.id}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]?.thumbUrl ?? ""} alt="" className="size-20 rounded-xl bg-slate-100 object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${p.id}`} className="line-clamp-2 font-semibold hover:text-brand-700">{p.title}</Link>
                  {p.status === "ACTIVE" ? (
                    <p className="mt-1 font-bold text-brand-700">{formatPrice(p.priceHalalas)}</p>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-red-600">لم تعد متاحة</p>
                  )}
                </div>
                <RemoveCartButton productId={p.id} />
              </li>
            ))}
          </ul>
          <Card className="h-fit p-5">
            <div className="flex justify-between text-slate-600">
              <span>عدد السلع</span>
              <span>{available.length}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-brand-700">{formatPrice(total)}</span>
            </div>
            {available.length > 0 ? (
              <Link href="/checkout" className={buttonClass("primary", "lg", "mt-5 w-full")}>إتمام الشراء</Link>
            ) : (
              <p className="mt-5 text-center text-sm text-slate-500">لا توجد سلع متاحة للشراء</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
