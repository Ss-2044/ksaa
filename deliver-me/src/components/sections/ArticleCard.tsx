import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { formatDate, formatNumber, localePath } from "@/i18n/utils";
import type { Article } from "@/lib/cms/types";
import { SampleBadge } from "../ui/Section";

export function ArticleCard({ article: a, locale, dict, featured }: { article: Article; locale: Locale; dict: Dictionary; featured?: boolean }) {
  const cat = dict.insightsPage.categories[a.category];
  return (
    <article className={`group relative ${featured ? "md:col-span-2" : ""}`}>
      {a.sample && <SampleBadge label={dict.common.sampleBadge} />}
      <Link href={localePath(locale, `/insights/${a.slug}`)} className="block rounded-[var(--radius-lg)]">
        {a.cover?.src && (
          <div className={`relative overflow-hidden rounded-[var(--radius-lg)] bg-sand ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
            <Image src={a.cover.src} alt={a.cover.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
          </div>
        )}
        <p className="text-label mt-5 text-terra-ink">{cat}</p>
        <h3 className={`mt-2 ${featured ? "text-h2" : "text-h3"} group-hover:underline decoration-2 underline-offset-4`}>{a.title}</h3>
        <p className="mt-2 text-stone">{a.excerpt}</p>
        <p className="mt-3 text-sm text-stone">
          <time dateTime={a.publishedAt}>{formatDate(locale, a.publishedAt)}</time> · {formatNumber(locale, a.readingMinutes)} {dict.insightsPage.minRead}
        </p>
      </Link>
    </article>
  );
}
