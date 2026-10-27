import { PageHero } from "@/components/sections/PageHero";
import { ArticleCard } from "@/components/sections/ArticleCard";
import type { Locale } from "@/config/site";
import { getDictionary } from "@/i18n";
import { getArticles } from "@/lib/cms";
import { articleCategories } from "@/lib/cms/types";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const p = getDictionary(locale).insightsPage;
  const articles = await getArticles(locale);
  // Keep the empty hub out of search results until there is something to read.
  return buildMetadata({ locale, path: "/insights", title: p.metaTitle, description: p.metaDescription, noindex: articles.length === 0 });
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const p = dict.insightsPage;
  const articles = await getArticles(locale);
  return (
    <>
      <PageHero locale={locale} crumbs={[{ name: dict.common.breadcrumbHome, path: "/" }, { name: dict.common.nav.insights, path: "/insights" }]} eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <section className="pb-24">
        <div className="container-site">
          <ul className="flex flex-wrap gap-2 border-b border-line pb-6" aria-label={p.eyebrow}>
            {articleCategories.map((c) => {
              const count = articles.filter((a) => a.category === c).length;
              return (
                <li key={c} className="rounded-full bg-paper px-4 py-2 text-sm font-medium ring-1 ring-line">
                  {p.categories[c]}
                  {count > 0 && <span className="ms-2 text-stone">{count}</span>}
                </li>
              );
            })}
          </ul>
          {articles.length === 0 ? (
            <div className="py-20 text-center">
              <h2 className="text-h2">{p.emptyTitle}</h2>
              <p className="text-lead mx-auto mt-4 max-w-xl text-stone">{p.emptyBody}</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {articles.map((a, i) => (
                <ArticleCard key={a.id} article={a} locale={locale} dict={dict} featured={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
