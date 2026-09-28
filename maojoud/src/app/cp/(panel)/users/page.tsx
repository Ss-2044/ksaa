import Link from "next/link";
import { inputClass } from "@/components/styles";
import { UserAvatar } from "@/components/user-avatar";
import { adminBase, requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { displayPhone, normalizeSaudiPhone } from "@/lib/phone";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q = "" } = await searchParams;
  const term = q.trim();
  const phone = normalizeSaudiPhone(term);
  const users = await db.user.findMany({
    where: term ? { OR: [{ name: { contains: term } }, { email: { contains: term } }, ...(phone ? [{ phone }] : [])] } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { products: { where: { status: "ACTIVE" } }, orders: { where: { paidAt: { not: null } } } } } },
  });
  const base = adminBase();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="ابحث بالاسم أو الجوال أو البريد" className={`${inputClass} max-w-md`} />
        <button className="h-11 rounded-xl bg-brand-600 px-5 font-semibold text-white">بحث</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-right font-semibold">المستخدم</th>
              <th className="p-3 text-right font-semibold">الجوال</th>
              <th className="p-3 text-right font-semibold">سلع معروضة</th>
              <th className="p-3 text-right font-semibold">طلبات</th>
              <th className="p-3 text-right font-semibold">التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-3">
                  <Link href={`${base}/users/${u.id}`} className="flex items-center gap-2.5 font-semibold hover:text-brand-700">
                    <UserAvatar name={u.name} src={u.avatarUrl} className="size-8 text-xs" />
                    {u.name}
                  </Link>
                </td>
                <td className="p-3" dir="ltr">{displayPhone(u.phone)}</td>
                <td className="p-3">{u._count.products}</td>
                <td className="p-3">{u._count.orders}</td>
                <td className="p-3">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="p-6 text-center text-slate-500">لا يوجد مستخدمون</p>}
      </div>
    </div>
  );
}
