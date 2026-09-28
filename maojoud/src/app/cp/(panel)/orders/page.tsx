import { adminSetOrderStatus } from "@/actions/admin";
import { DateFilter } from "@/components/admin/date-filter";
import { inputClass } from "@/components/styles";
import { parseRange, requireAdmin } from "@/lib/admin";
import { ADMIN_ORDER_STATUSES, ORDER_STATUS, PAYMENT_METHODS, type OrderStatus, type PaymentMethod } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { parseAddress } from "@/lib/orders";
import { displayPhone } from "@/lib/phone";

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const { fromStr, toStr, gte, lte } = parseRange(sp.from, sp.to, 90);
  const status = (ADMIN_ORDER_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;

  const orders = await db.order.findMany({
    where: { paidAt: { not: null }, createdAt: { gte, lte }, ...(status && { status }) },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { buyer: { select: { name: true } }, items: { select: { title: true, seller: { select: { name: true } } } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
      <DateFilter from={fromStr} to={toStr}>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          الحالة
          <select name="status" defaultValue={status ?? ""} className={inputClass}>
            <option value="">الكل</option>
            {ADMIN_ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS[s]}</option>
            ))}
          </select>
        </label>
      </DateFilter>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-right font-semibold">الطلب</th>
              <th className="p-3 text-right font-semibold">المشتري / التوصيل</th>
              <th className="p-3 text-right font-semibold">السلع</th>
              <th className="p-3 text-right font-semibold">المبلغ</th>
              <th className="p-3 text-right font-semibold">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 align-top">
            {orders.map((o) => {
              const a = parseAddress(o.addressJson);
              return (
                <tr key={o.id}>
                  <td className="p-3">
                    <p className="font-bold">#{o.number}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(o.createdAt)}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">{o.buyer.name}</p>
                    <p className="text-xs text-slate-500">{a.fullName} · <span dir="ltr">{displayPhone(a.phone)}</span></p>
                    <p className="text-xs text-slate-500">{a.city}، {a.district}، {a.street}{a.details ? `، ${a.details}` : ""}</p>
                  </td>
                  <td className="p-3">
                    <ul className="flex flex-col gap-1">
                      {o.items.map((i, k) => (
                        <li key={k}>{i.title} <span className="text-xs text-slate-500">— البائع: {i.seller.name}</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">{formatPrice(o.totalHalalas)}</p>
                    <p className="text-xs text-slate-500">{PAYMENT_METHODS[o.paymentMethod as PaymentMethod]}</p>
                  </td>
                  <td className="p-3">
                    <form action={adminSetOrderStatus.bind(null, o.id)} className="flex gap-2">
                      <select name="status" defaultValue={o.status} className="h-9 rounded-lg border border-slate-200 bg-white px-2" aria-label="حالة الطلب">
                        {ADMIN_ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{ORDER_STATUS[s]}</option>
                        ))}
                        {!(ADMIN_ORDER_STATUSES as readonly string[]).includes(o.status) && (
                          <option value={o.status} disabled>{ORDER_STATUS[o.status as OrderStatus]}</option>
                        )}
                      </select>
                      <button className="h-9 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700">حفظ</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-slate-500">لا توجد طلبات</p>}
      </div>
    </div>
  );
}
