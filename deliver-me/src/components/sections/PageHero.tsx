import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/config/site";
import { localePath } from "@/i18n/utils";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { JsonLd } from "../seo/JsonLd";
import { Eyebrow } from "../ui/Section";

export function Breadcrumbs({ locale, items }: { locale: Locale; items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-stone">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-ink">{it.name}</span>
              ) : (
                <Link href={localePath(locale, it.path)} className="hover:text-ink hover:underline">{it.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(items, locale)} />
    </>
  );
}

/** Interior page hero: big type, optional photo that sits on the route's "arrival" side. */
export function PageHero({
  locale,
  crumbs,
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  locale: Locale;
  crumbs: { name: string; path: string }[];
  eyebrow: string;
  title: string;
  intro: string;
  image?: { src: string; alt: string };
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div className={`container-site grid gap-10 pt-6 pb-14 md:pt-10 md:pb-20 ${image ? "lg:grid-cols-12 lg:items-end" : ""}`}>
        <div className={image ? "lg:col-span-7" : "max-w-4xl"}>
          <Breadcrumbs locale={locale} items={crumbs} />
          <Eyebrow className="mt-10">{eyebrow}</Eyebrow>
          <h1 className="text-h1 mt-5">{title}</h1>
          <p className="text-lead mt-6 max-w-2xl text-stone">{intro}</p>
          {children && <div className="mt-8">{children}</div>}
        </div>
        {image && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] bg-sand shadow-card lg:col-span-5 lg:aspect-[4/5]">
            <Image src={image.src} alt={image.alt} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="hero-photo object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

export function Faq({ heading, items }: { heading: string; items: { q: string; a: string }[] }) {
  return (
    <section className="section-y border-t border-line" aria-labelledby="faq-title">
      <div className="container-site grid gap-10 lg:grid-cols-12">
        <h2 id="faq-title" className="text-h2 lg:col-span-4">{heading}</h2>
        <div className="lg:col-span-7 lg:col-start-6">
          {items.map((f) => (
            <details key={f.q} className="group border-b border-line py-2">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="text-2xl text-terra-ink transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 text-stone">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
