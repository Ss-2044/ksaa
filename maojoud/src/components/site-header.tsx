import Link from "next/link";
import { Plus, Search, ShoppingCart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "./logo";
import { UserAvatar } from "./user-avatar";
import { buttonClass } from "@/components/styles";

export async function SiteHeader({ query = "" }: { query?: string }) {
  const user = await getCurrentUser();
  const cartCount = user ? await db.cartItem.count({ where: { userId: user.id, product: { status: "ACTIVE" } } }) : 0;

  const search = (
    <form action="/search" role="search" className="relative w-full">
      <label htmlFor="q" className="sr-only">ابحث في موجود</label>
      <Search className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="ابحث عن جوال، لابتوب، ساعة…"
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-[15px] placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand-500/15"
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-1 sm:h-18 sm:gap-5">
        <Logo className="h-8 sm:h-10" />
        <div className="hidden flex-1 md:block">{search}</div>
        <div className="ms-auto flex items-center gap-1 sm:gap-2 md:ms-0">
          <Link
            href="/cart"
            className="relative inline-flex size-10 items-center sm:size-11 justify-center rounded-xl text-slate-700 hover:bg-slate-100"
            aria-label={`السلة${cartCount ? ` (${cartCount})` : ""}`}
          >
            <ShoppingCart className="size-6" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute top-1 left-1 flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/sell" className={buttonClass("primary", "sm", "h-10 gap-1 sm:h-11 sm:gap-2 sm:rounded-xl sm:px-5 sm:text-[15px]")}>
            <Plus className="size-4 sm:size-5" aria-hidden />
            <span>أضف سلعتك</span>
          </Link>
          {user ? (
            <Link href={`/users/${user.id}`} aria-label="ملفي الشخصي" className="rounded-full focus-visible:outline-2 focus-visible:outline-brand-500">
              <UserAvatar name={user.name} src={user.avatarUrl} className="size-9 sm:size-10" />
            </Link>
          ) : (
            <Link href="/login" className={buttonClass("ghost", "sm", "h-10 px-2 sm:h-11 sm:px-3 sm:text-[15px]")}>
              دخول
            </Link>
          )}
        </div>
      </div>
      <div className="container-page pb-3 md:hidden">{search}</div>
    </header>
  );
}
