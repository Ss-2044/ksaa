import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { logout } from "@/actions/auth";
import { Card } from "@/components/card";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { DeleteProductButton } from "@/components/profile/delete-product-button";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { ReviewsList } from "@/components/reviews";
import { Stars } from "@/components/stars";
import { buttonClass } from "@/components/styles";
import { UserAvatar } from "@/components/user-avatar";
import { getCurrentUser } from "@/lib/auth";
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { getSellerRating, getSellerReviews, productCardSelect } from "@/lib/queries";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = await db.user.findUnique({ where: { id: (await params).id }, select: { name: true } });
  return u ? { title: u.name } : {};
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  const profile = await db.user.findUnique({ where: { id }, select: { id: true, name: true, avatarUrl: true, createdAt: true } });
  if (!profile) notFound();

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === profile.id;

  const [rating, reviews, products, orders] = await Promise.all([
    getSellerRating(profile.id),
    getSellerReviews(profile.id, 30),
    db.product.findMany({
      where: { sellerId: profile.id, status: isOwner ? { in: ["ACTIVE", "SOLD"] } : "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: { ...productCardSelect, status: true },
    }),
    isOwner
      ? db.order.findMany({
          where: { buyerId: profile.id, OR: [{ status: { not: "CANCELLED" } }, { paidAt: { not: null } }] },
          orderBy: { createdAt: "desc" },
          include: { items: { select: { title: true, imageUrl: true } } },
        })
      : Promise.resolve([]),
  ]);

  const productsPanel = products.length ? (
    <ProductGrid>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          action={
            isOwner &&
            (p.status === "ACTIVE" ? (
              <DeleteProductButton productId={p.id} title={p.title} />
            ) : (
              <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white">مباعة</span>
            ))
          }
        />
      ))}
    </ProductGrid>
  ) : (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">لا توجد سلع معروضة.</p>
  );

  const ordersPanel = orders.length ? (
    <ul className="flex flex-col gap-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/orders/${o.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-300">
            <div className="flex -space-x-3 space-x-reverse">
              {o.items.slice(0, 3).map((i, k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} src={i.imageUrl ?? ""} alt="" className="size-14 rounded-xl border-2 border-white bg-slate-100 object-cover" />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">طلب #{o.number}</p>
              <p className="truncate text-sm text-slate-500">{o.items.map((i) => i.title).join("، ")}</p>
              <p className="text-xs text-slate-400">{formatDate(o.createdAt)}</p>
            </div>
            <div className="text-left">
              <StatusBadge status={o.status as OrderStatus} />
              <p className="mt-1 font-bold text-brand-700">{formatPrice(o.totalHalalas)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  ) : (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">لا توجد طلبات بعد.</p>
  );

  return (
    <div className="container-page py-8">
      <Card className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:text-right">
        <UserAvatar name={profile.name} src={profile.avatarUrl} className="size-24 text-4xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {rating.count > 0 && (
            <p className="mt-1.5 flex items-center justify-center gap-2 text-slate-600 sm:justify-start">
              <Stars value={rating.average} />
              <span className="font-semibold">{rating.average.toFixed(1)}</span>
              <span className="text-sm">({rating.count.toLocaleString("ar-SA")} تقييم)</span>
            </p>
          )}
          <p className="mt-1 text-sm text-slate-400">عضو منذ {formatDate(profile.createdAt)}</p>
        </div>
        {isOwner && viewer && (
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/sell" className={buttonClass("primary")}>
              <Plus className="size-5" aria-hidden /> اعرض سلعتك
            </Link>
            <EditProfileDialog name={viewer.name} avatarUrl={viewer.avatarUrl} />
            <form action={logout}>
              <button type="submit" className={buttonClass("ghost")}>خروج</button>
            </form>
          </div>
        )}
      </Card>

      <div className="mt-6">
        <ProfileTabs
          defaultTab={isOwner && tab === "orders" ? "orders" : "products"}
          tabs={[
            { value: "products", label: `السلع المعروضة (${products.filter((p) => p.status === "ACTIVE").length})`, panel: productsPanel },
            ...(isOwner ? [{ value: "orders", label: "طلباتي", panel: ordersPanel }] : []),
            {
              value: "reviews",
              label: `المراجعات (${rating.count})`,
              panel: (
                <Card className="p-5">
                  <ReviewsList reviews={reviews} />
                </Card>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const tone: Record<OrderStatus, string> = {
    PENDING_PAYMENT: "bg-amber-100 text-amber-800",
    NEW: "bg-brand-100 text-brand-800",
    SHIPPING: "bg-violet-100 text-violet-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-slate-100 text-slate-600",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone[status]}`}>{ORDER_STATUS[status]}</span>;
}
