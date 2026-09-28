import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BuyButtons } from "@/components/buy-buttons";
import { Card } from "@/components/card";
import { ProductGallery } from "@/components/product-gallery";
import { ReviewsList } from "@/components/reviews";
import { Stars } from "@/components/stars";
import { ProductTrustBadges } from "@/components/trust";
import { UserAvatar } from "@/components/user-avatar";
import { getCurrentUser } from "@/lib/auth";
import { CONDITIONS, type Condition } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { getSellerRating, getSellerReviews } from "@/lib/queries";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  return db.product.findFirst({
    where: { id, status: { not: "DELETED" } },
    include: {
      images: { orderBy: { position: "asc" } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      category: { select: { name: true, slug: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).id);
  return p ? { title: p.title, description: p.description } : {};
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await load(id);
  if (!product) notFound();

  const [user, rating, reviews] = await Promise.all([
    getCurrentUser(),
    getSellerRating(product.sellerId),
    getSellerReviews(product.sellerId, 10),
  ]);
  const inCart = user
    ? !!(await db.cartItem.findUnique({ where: { userId_productId: { userId: user.id, productId: product.id } } }))
    : false;
  const isOwner = user?.id === product.sellerId;

  return (
    <div className="container-page py-6">
      <nav aria-label="مسار التنقل" className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href={`/search?category=${product.category.slug}`} className="hover:text-brand-700">{product.category.name}</Link>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery images={product.images} title={product.title} />

        <div className="flex flex-col gap-5">
          <div>
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              {CONDITIONS[product.condition as Condition]}
            </span>
            <h1 className="mt-3 text-2xl leading-snug font-bold text-slate-900 sm:text-3xl">{product.title}</h1>
            <p className="mt-3 text-3xl font-bold text-brand-700">{formatPrice(product.priceHalalas)}</p>
          </div>

          <p className="leading-7 whitespace-pre-line text-slate-700">{product.description}</p>

          <Link
            href={`/users/${product.seller.id}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-brand-300"
          >
            <UserAvatar name={product.seller.name} src={product.seller.avatarUrl} className="size-12 text-lg" />
            <div className="min-w-0">
              <p className="text-xs text-slate-500">البائع</p>
              <p className="font-bold text-slate-900">{product.seller.name}</p>
              {rating.count > 0 && (
                <p className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
                  <Stars value={rating.average} size={14} />
                  <span>{rating.average.toFixed(1)} ({rating.count.toLocaleString("ar-SA")})</span>
                </p>
              )}
            </div>
          </Link>

          {product.status === "SOLD" ? (
            <p className="rounded-xl bg-slate-100 p-4 text-center font-bold text-slate-600">تم بيع هذه السلعة</p>
          ) : isOwner ? (
            <p className="rounded-xl bg-brand-50 p-4 text-center font-semibold text-brand-800">هذه سلعتك المعروضة للبيع</p>
          ) : (
            <BuyButtons productId={product.id} inCart={inCart} />
          )}

          <ProductTrustBadges />
        </div>
      </div>

      <Card className="mt-10 p-5 sm:p-6">
        <h2 className="mb-4 flex flex-wrap items-center gap-3 text-lg font-bold">
          تقييمات ومراجعات البائع
          {rating.count > 0 && (
            <span className="flex items-center gap-2 text-sm font-normal text-slate-600">
              <Stars value={rating.average} /> {rating.average.toFixed(1)} من 5
            </span>
          )}
        </h2>
        <ReviewsList reviews={reviews} />
      </Card>
    </div>
  );
}
