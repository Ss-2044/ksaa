import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card } from "@/components/card";
import { ReviewForm } from "@/components/review-form";
import { requireUser } from "@/lib/auth";
import { ORDER_STATUS, PAYMENT_METHODS, type OrderStatus, type PaymentMethod } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { parseAddress } from "@/lib/orders";
import { displayPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "تفاصيل الطلب" };

const STEPS: OrderStatus[] = ["NEW", "SHIPPING", "DELIVERED"];

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/orders/${id}`);
  const order = await db.order.findFirst({
    where: { id, buyerId: user.id },
    include: { items: { include: { seller: { select: { id: true, name: true } } } }, reviews: { select: { sellerId: true } } },
  });
  if (!order) notFound();

  const address = parseAddress(order.addressJson);
  const stepIndex = STEPS.indexOf(order.status as OrderStatus);
  const sellers = [...new Map(order.items.map((i) => [i.seller.id, i.seller])).values()];
  const reviewed = new Set(order.reviews.map((r) => r.sellerId));

  return (
    <div className="container-page max-w-3xl py-8">
      <Link href={`/users/${user.id}?tab=orders`} className="text-sm text-slate-500 hover:text-brand-700">← طلباتي</Link>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">طلب #{order.number}</h1>
        <span className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</span>
      </div>

      <Card className="mt-6 p-5">
        {stepIndex >= 0 ? (
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-2 text-center">
                <span className={`h-2 w-full rounded-full ${i <= stepIndex ? "bg-brand-600" : "bg-slate-200"}`} />
                <span className={`text-sm font-semibold ${i <= stepIndex ? "text-brand-700" : "text-slate-400"}`}>{ORDER_STATUS[s]}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center font-semibold text-slate-600">{ORDER_STATUS[order.status as OrderStatus]}</p>
        )}
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="mb-3 font-bold">السلع</h2>
        <ul className="divide-y divide-slate-100">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.imageUrl ?? ""} alt="" className="size-16 rounded-xl bg-slate-100 object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={`/products/${i.productId}`} className="line-clamp-2 font-semibold hover:text-brand-700">{i.title}</Link>
                <Link href={`/users/${i.seller.id}`} className="text-sm text-slate-500 hover:text-brand-700">البائع: {i.seller.name}</Link>
              </div>
              <span className="font-semibold">{formatPrice(i.priceHalalas)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-slate-100 pt-3 text-lg font-bold">
          <span>الإجمالي</span>
          <span className="text-brand-700">{formatPrice(order.totalHalalas)}</span>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-2 font-bold">عنوان التوصيل</h2>
          <p className="text-sm leading-7 text-slate-700">
            {address.fullName}
            <br />
            {address.city}، {address.district}، {address.street}
            {address.details && <><br />{address.details}</>}
            <br />
            <span dir="ltr">{displayPhone(address.phone)}</span>
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="mb-2 font-bold">الدفع</h2>
          <p className="text-sm text-slate-700">{PAYMENT_METHODS[order.paymentMethod as PaymentMethod]}</p>
          <p className="mt-1 text-sm text-slate-500">{order.paidAt ? `تم الدفع ${formatDateTime(order.paidAt)}` : "لم يتم الدفع"}</p>
          {order.status === "PENDING_PAYMENT" && (
            <Link href={`/checkout/pay/${order.id}`} className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">أكمل الدفع</Link>
          )}
        </Card>
      </div>

      {order.status === "DELIVERED" && (
        <div className="mt-4 flex flex-col gap-3">
          {sellers.map((s) =>
            reviewed.has(s.id) ? (
              <p key={s.id} className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                شكرًا! قيّمت البائع {s.name}
              </p>
            ) : (
              <ReviewForm key={s.id} orderId={order.id} sellerId={s.id} sellerName={s.name} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
