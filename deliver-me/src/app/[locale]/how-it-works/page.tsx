import { HowItWorks } from "@/components/home/HowItWorks";
import { Faq, PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { hasAppLinks, type Locale } from "@/config/site";
import { getDictionary } from "@/i18n";
import { localePath, stepNumber } from "@/i18n/utils";
import { faqSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const p = getDictionary(locale).howItWorksPage;
  return buildMetadata({ locale, path: "/how-it-works", title: p.metaTitle, description: p.metaDescription });
}

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const p = dict.howItWorksPage;
  const how = dict.home.how;
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ name: dict.common.breadcrumbHome, path: "/" }, { name: dict.common.nav.howItWorks, path: "/how-it-works" }]}
        eyebrow={p.eyebrow}
        title={p.title}
        intro={p.intro}
      >
        <ButtonLink href={hasAppLinks ? `/download?hl=${locale}` : `${localePath(locale)}#download`} size="lg">{dict.common.cta.download}</ButtonLink>
      </PageHero>
      <section className="pb-20">
        <div className="container-site">
          <HowItWorks steps={how.steps} distance={how.distance} progressLabel={how.progressLabel} stepNumbers={how.steps.map((_, i) => stepNumber(locale, i + 1))} />
          <ol className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {how.steps.map((s, i) => (
              <li key={s.title} className="border-t border-line pt-5" data-reveal="">
                <span className="text-sm font-semibold text-terra-ink tabular-nums">{stepNumber(locale, i + 1)}</span>
                <h2 className="text-h3 mt-2">{s.title}</h2>
                <p className="mt-2 text-stone">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Faq heading={p.faqHeading} items={p.faq} />
      <JsonLd data={faqSchema(p.faq)} />
    </>
  );
}
