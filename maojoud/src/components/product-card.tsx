import Link from "next/link";
import { CONDITIONS, type Condition } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: string;
  title: string;
  priceHalalas: number;
  condition: string;
  images: { thumbUrl: string }[];
};

export function ProductCard({ product, action }: { product: ProductCardData; action?: React.ReactNode }) {
  const img = product.images[0]?.thumbUrl;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <Link href={`/products/${product.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square bg-slate-100">
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={product.title} loading="lazy" className="size-full object-cover" />
          )}
          <span className="absolute top-2.5 right-2.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">
            {CONDITIONS[product.condition as Condition] ?? product.condition}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <h3 className="line-clamp-2 text-[15px] leading-6 font-semibold text-slate-900">{product.title}</h3>
          <p className="mt-auto text-lg font-bold text-brand-700">{formatPrice(product.priceHalalas)}</p>
        </div>
      </Link>
      {action && <div className="absolute top-2.5 left-2.5">{action}</div>}
    </div>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}
