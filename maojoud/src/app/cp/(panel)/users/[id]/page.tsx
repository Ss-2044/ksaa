import Link from "next/link";
import { notFound } from "next/navigation";
import { adminUpdateUser } from "@/actions/admin";
import { AdminUserForm } from "@/components/admin/user-form";
import { UserAvatar } from "@/components/user-avatar";
import { adminBase, requireAdmin } from "@/lib/admin";
import { CONDITIONS, type Condition } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { displayPhone } from "@/lib/phone";
import { getSellerRating } from "@/lib/queries";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      products: { where: { status: { not: "DELETED" } }, orderBy: { createdAt: "desc" }, take: 50 },
      orders: { where: { paidAt: { not: null } }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!user) notFound();
  const rating = await getSellerRating(user.id);
  const base = adminBase();

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <Link href={`${base}/users`} className="text-sm text-slate-500 hover:text-brand-700">← المستخدمون</Link>
      <div className="flex items-center gap-4">
        <UserAvatar name={user.name} src={user.avatarUrl} className="size-16 text-2xl" />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-sm text-slate-500">
            عضو منذ {formatDate(user.createdAt)}
            {rating.count > 0 && ` · التقييم ${rating.average.toFixed(1)} (${rating.count})`}
          </p>
        </div>
        <Link href={`/users/${user.id}`} target="_blank" className="ms-auto text-sm font-semibold text-brand-700 hover:underline">الملف العام ↗</Link>
      </div>

      <AdminUserForm
        action={adminUpdateUser.bind(null, user.id)}
        user={{ name: user.name, gender: user.gender, email: user.email ?? "", phone: displayPhone(user.phone), hasAvatar: !!user.avatarUrl }}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-bold">السلع ({user.products.length})</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {user.products.map((p) => (
            <li key={p.id} className="flex justify-between gap-3 py-2">
              <Link href={`/products/${p.id}`} target="_blank" className="hover:text-brand-700">{p.title}</Link>
              <span className="shrink-0 text-slate-500">
                {CONDITIONS[p.condition as Condition]} · {formatPrice(p.priceHalalas)} · {p.status === "SOLD" ? "مباعة" : "معروضة"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-bold">المشتريات ({user.orders.length})</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {user.orders.map((o) => (
            <li key={o.id} className="flex justify-between py-2">
              <span>طلب #{o.number}</span>
              <span className="text-slate-500">{formatDate(o.createdAt)} · {formatPrice(o.totalHalalas)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
