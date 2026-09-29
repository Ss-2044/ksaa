import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { demoMode } from "@/lib/env";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {demoMode() && (
        <p className="bg-amber-400 px-4 py-1.5 text-center text-sm font-semibold text-amber-950">
          نسخة تجريبية — لا تُرسل رسائل حقيقية ولا تُخصم أي مبالغ
        </p>
      )}
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}
