import Link from "next/link";
import { BarChart3, LayoutTemplate, LogOut, Package, Users } from "lucide-react";
import { adminLogout } from "@/actions/admin";
import { adminBase, requireAdmin } from "@/lib/admin";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const base = adminBase();
  const nav = [
    { href: base, label: "التقارير", icon: BarChart3 },
    { href: `${base}/users`, label: "المستخدمون", icon: Users },
    { href: `${base}/orders`, label: "الطلبات", icon: Package },
    { href: `${base}/content`, label: "محتوى المنصة", icon: LayoutTemplate },
  ];
  return (
    <div className="lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-l">
        <div className="flex items-center justify-between p-4 lg:block">
          <p className="text-lg font-bold text-brand-700">موجود · الإدارة</p>
          <p className="text-xs text-slate-500 lg:mt-1">{admin.username}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              <Icon className="size-4.5" aria-hidden /> {label}
            </Link>
          ))}
          <form action={adminLogout} className="lg:mt-4">
            <button type="submit" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">
              <LogOut className="size-4.5" aria-hidden /> خروج
            </button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
