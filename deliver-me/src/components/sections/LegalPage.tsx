import { legal, type LegalDoc } from "@/content/legal";
import { type Locale, site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { formatDate } from "@/i18n/utils";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "./PageHero";

export function legalMetadata(locale: Locale, doc: LegalDoc) {
  const d = legal[locale][doc];
  return buildMetadata({ locale, path: `/${doc}`, title: d.title, description: d.description });
}

export function LegalPage({ locale, doc }: { locale: Locale; doc: LegalDoc }) {
  const d = legal[locale][doc];
  const dict = getDictionary(locale);
  return (
    <article className="container-site max-w-3xl pt-6 pb-24 md:pt-10">
      <Breadcrumbs locale={locale} items={[{ name: dict.common.breadcrumbHome, path: "/" }, { name: d.title, path: `/${doc}` }]} />
      <h1 className="text-h1 mt-10">{d.title}</h1>
      <p className="mt-4 text-stone">
        <time dateTime={d.updated}>{formatDate(locale, d.updated)}</time>
        {site.legalName && <> · {site.legalName}</>}
        {site.commercialRegistration && <> · {dict.footer.cr} <span dir="ltr">{site.commercialRegistration}</span></>}
      </p>
      <div className="mt-12 space-y-10">
        {d.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-h3">{s.h}</h2>
            {s.p.map((para) => (
              <p key={para.slice(0, 32)} className="mt-3 text-stone">{para}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
