import "server-only";
import { db } from "./db";

export async function getSellerRating(sellerId: string) {
  const agg = await db.review.aggregate({ where: { sellerId }, _avg: { rating: true }, _count: true });
  return { average: agg._avg.rating ?? 0, count: agg._count };
}

export function getSellerReviews(sellerId: string, take = 20) {
  return db.review.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take,
    include: { buyer: { select: { name: true, avatarUrl: true } } },
  });
}

export const productCardSelect = {
  id: true,
  title: true,
  priceHalalas: true,
  condition: true,
  images: { select: { thumbUrl: true }, orderBy: { position: "asc" as const }, take: 1 },
};

export function activeCategories() {
  return db.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}
