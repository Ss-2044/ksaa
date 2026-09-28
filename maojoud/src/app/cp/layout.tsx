import type { Metadata } from "next";

export const metadata: Metadata = { title: "لوحة التحكم", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function CpRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-slate-50">{children}</div>;
}
