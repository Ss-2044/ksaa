import { DateFilter } from "@/components/admin/date-filter";
import { parseRange, requireAdmin, riyadhDay } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const { fromStr, toStr, gte, lte } = parseRange(sp.from, sp.to);

  const [orders, users, products] = await Promise.all([
    db.order.findMany({ where: { paidAt: { gte, lte } }, select: { paidAt: true, totalHalalas: true } }),
    db.user.findMany({ where: { createdAt: { gte, lte } }, select: { createdAt: true } }),
    db.product.findMany({ where: { createdAt: { gte, lte } }, select: { createdAt: true } }),
  ]);

  type Row = { sales: number; orders: number; users: number; products: number };
  const days = new Map<string, Row>();
  const row = (d: string) => days.get(d) ?? days.set(d, { sales: 0, orders: 0, users: 0, products: 0 }).get(d)!;
  for (const o of orders) {
    const r = row(riyadhDay(o.paidAt!));
    r.sales += o.totalHalalas;
    r.orders++;
  }
  for (const u of users) row(riyadhDay(u.createdAt)).users++;
  for (const p of products) row(riyadhDay(p.createdAt)).products++;
  const sorted = [...days.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  const totals = {
    sales: orders.reduce((s, o) => s + o.totalHalalas, 0),
    orders: orders.length,
    users: users.length,
    products: products.length,
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">التقارير العامة</h1>
      <DateFilter from={fromStr} to={toStr} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["المبيعات", formatPrice(totals.sales)],
          ["الطلبات المدفوعة", totals.orders.toLocaleString("ar-SA")],
          ["التسجيلات الجديدة", totals.users.toLocaleString("ar-SA")],
          ["السلع المضافة", totals.products.toLocaleString("ar-SA")],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-right font-semibold">اليوم</th>
              <th className="p-3 text-right font-semibold">المبيعات</th>
              <th className="p-3 text-right font-semibold">الطلبات</th>
              <th className="p-3 text-right font-semibold">التسجيلات</th>
              <th className="p-3 text-right font-semibold">السلع المضافة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 tabular-nums">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">لا توجد بيانات في هذه الفترة</td>
              </tr>
            )}
            {sorted.map(([day, r]) => (
              <tr key={day}>
                <td className="p-3" dir="ltr">{day}</td>
                <td className="p-3">{formatPrice(r.sales)}</td>
                <td className="p-3">{r.orders}</td>
                <td className="p-3">{r.users}</td>
                <td className="p-3">{r.products}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
