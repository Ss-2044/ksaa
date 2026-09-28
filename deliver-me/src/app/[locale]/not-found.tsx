"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";

// Small inline copy so the 404 stays a static client component (no request headers).
const copy = {
  en: { eyebrow: "404", title: "This one's a little too far.", body: "We couldn't find the page you were looking for. It may have moved — but everything else is closer than you think.", cta: "Back to home" },
  ar: { eyebrow: "٤٠٤", title: "هذي بعيدة شوي.", body: "ما لقينا الصفحة اللي تدوّرها. يمكن انتقلت — بس كل شي ثاني أقرب مما تتوقع.", cta: "ارجع للرئيسية" },
};

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "en" ? "en" : "ar";
  const d = copy[locale];
  return (
    <section>
      <title>{d.title}</title>
      <div className="container-site flex flex-col items-start py-24 md:py-36">
        <p className="text-label text-terra-ink">{d.eyebrow}</p>
        <h1 className="text-h1 mt-5 max-w-3xl">{d.title}</h1>
        <p className="text-lead mt-5 max-w-xl text-stone">{d.body}</p>
        <Link href={`/${locale}`} className={buttonClasses("primary", "lg", "mt-10")}>{d.cta}</Link>
      </div>
    </section>
  );
}
