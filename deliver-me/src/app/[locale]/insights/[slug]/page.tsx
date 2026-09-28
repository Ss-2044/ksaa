import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, type Locale, locales } from "@/config/site";
import { getDictionary } from "@/i18n";
import { formatDate, formatNumber, localePath } from "@/i18n/utils";
import { getArticle, getArticles, getArticleTranslation } from "@/lib/cms";
import type { ArticleBlock } from "@/lib/cms/types";
import { articleSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const all = await Promise.all(locales.map(async (locale) => (await getArticles(locale)).map((a) => ({ locale, slug: a.slug }))));
  return all.flat();
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const a = await getArticle(locale, slug);
  if (!a) return {};
  const other: Locale = locale === "ar" ? "en" : "ar";
  const t = await getArticleTranslation(other, a.translationKey);
  return buildMetadata({
    locale,
    path: `/insights/${slug}`,
    title: a.seo?.title || a.title,
    description: a.seo?.description || a.excerpt,
    type: "article",
    publishedTime: a.publishedAt,
    image: a.cover ? { url: a.cover.src, alt: a.cover.alt } : undefined,
    alternatePaths: { [locale]: `/insights/${slug}`, ...(t ? { [other]: `/insights/${t.slug}` } : {}) },
    noindex: a.sample,
  });
}

function Block({ b }: { b: ArticleBlock }) {
  switch (b.type) {
    case "p": return <p>{b.text}</p>;
    case "h2": return <h2 className="text-h3 mt-12">{b.text}</h2>;
    case "h3": return <h3 className="mt-8 text-xl font-bold">{b.text}</h3>;
    case "ul": return <ul className="list-disc space-y-2 ps-6 marker:text-terra">{b.items.map((i) => <li key={i}>{i}</li>)}</ul>;
    case "quote": return <blockquote className="border-s-4 border-terra ps-6 text-xl font-semibold">{b.text}{b.cite && <cite className="mt-2 block text-base font-normal text-stone not-italic">— {b.cite}</cite>}</blockquote>;
    case "img": return <figure><Image src={b.src} alt={b.alt} width={1600} height={1000} className="rounded-[var(--radius-lg)]" />{b.caption && <figcaption className="mt-2 text-sm text-stone">{b.caption}</figcaption>}</figure>;
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const a = await getArticle(locale, slug);
  if (!a) {
    // Switched language on an article that isn't translated yet → that language's hub.
    const other: Locale = locale === "ar" ? "en" : "ar";
    if (await getArticle(other, slug)) redirect(localePath(locale, "/insights"));
    notFound();
  }
  const dict = getDictionary(locale);
  return (
    <article className="pb-24">
      <div className="container-site max-w-3xl pt-6 md:pt-10">
        <Breadcrumbs locale={locale} items={[{ name: dict.common.breadcrumbHome, path: "/" }, { name: dict.common.nav.insights, path: "/insights" }, { name: a.title, path: `/insights/${a.slug}` }]} />
        <p className="text-label mt-10 text-terra-ink">{dict.insightsPage.categories[a.category]}</p>
        <h1 className="text-h1 mt-4">{a.title}</h1>
        <p className="text-lead mt-5 text-stone">{a.excerpt}</p>
        <p className="mt-5 text-sm text-stone">
          {a.author && <>{a.author} · </>}
          <time dateTime={a.publishedAt}>{formatDate(locale, a.publishedAt)}</time> · {formatNumber(locale, a.readingMinutes)} {dict.insightsPage.minRead}
        </p>
      </div>
      {a.cover?.src && (
        <div className="container-site mt-10 max-w-5xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[var(--radius-xl)] bg-sand">
            <Image src={a.cover.src} alt={a.cover.alt} fill priority sizes="(min-width:1024px) 64rem, 100vw" className="object-cover" />
          </div>
        </div>
      )}
      <div className="container-site mt-12 max-w-3xl space-y-6 text-lg leading-relaxed">
        {a.body.map((b, i) => <Block key={i} b={b} />)}
      </div>
      <JsonLd data={articleSchema({ locale, path: `/insights/${a.slug}`, title: a.title, description: a.excerpt, image: a.cover?.src, publishedAt: a.publishedAt, updatedAt: a.updatedAt, author: a.author })} />
    </article>
  );
}
