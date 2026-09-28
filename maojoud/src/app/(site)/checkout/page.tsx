import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { displayPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "إتمام الطلب" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ buy?: string }> }) {
  const { buy } = await searchParams;
  const user = await requireUser(buy ? `/checkout?buy=${buy}` : "/checkout");

  // شراء سريع لسلعة واحدة، أو كل السلع المتاحة في السلة
  const products = await db.product.findMany({
    where: buy
      ? { id: buy, status: "ACTIVE", sellerId: { not: user.id } }
      : { status: "ACTIVE", sellerId: { not: user.id }, cartItems: { some: { userId: user.id } } },
    select: { id: true, title: true, priceHalalas: true, images: { orderBy: { position: "asc" }, take: 1, select: { thumbUrl: true } } },
  });
  if (products.length === 0) redirect(buy ? `/products/${buy}` : "/cart");

  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="container-page max-w-5xl py-8">
      <h1 className="mb-6 text-2xl font-bold">إتمام الطلب</h1>
      <CheckoutForm
        products={products.map((p) => ({ id: p.id, title: p.title, priceHalalas: p.priceHalalas, image: p.images[0]?.thumbUrl ?? null }))}
        addresses={addresses.map((a) => ({
          id: a.id,
          label: `${a.fullName} — ${a.city}، ${a.district}، ${a.street}${a.details ? `، ${a.details}` : ""}`,
          phone: displayPhone(a.phone),
        }))}
        defaultName={user.name}
        defaultPhone={displayPhone(user.phone)}
      />
    </div>
  );
}
