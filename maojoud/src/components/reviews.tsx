import { formatDate } from "@/lib/format";
import { Stars } from "./stars";
import { UserAvatar } from "./user-avatar";

export type ReviewData = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  buyer: { name: string; avatarUrl: string | null };
};

export function ReviewsList({ reviews }: { reviews: ReviewData[] }) {
  if (reviews.length === 0) return <p className="text-sm text-slate-500">لا توجد مراجعات بعد.</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <UserAvatar name={r.buyer.name} src={r.buyer.avatarUrl} className="size-9 text-sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-slate-900">{r.buyer.name}</span>
              <Stars value={r.rating} size={14} />
              <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
            </div>
            {r.comment && <p className="mt-1.5 text-sm leading-6 text-slate-700">{r.comment}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
