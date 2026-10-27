import { PartnerForm } from "@/components/forms/PartnerForm";
import { Faq, PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { type Locale, site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { localePath, stepNumber } from "@/i18n/utils";
import { getCities } from "@/lib/cms";
import { faqSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { hasWhatsApp } from "@/lib/whatsapp";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ type?: string }> };

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const p = getDictionary(locale).partnerPage;
  return buildMetadata({ locale, path: "/become-a-partner", title: p.metaTitle, description: p.metaDescription, image: { url: "/images/restaurant-spread.jpg", width: 1600, height: 1067 } });
}

export default async function PartnerPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { type } = await searchParams;
  const dict = getDictionary(locale);
  const p = dict.partnerPage;
  const home = dict.home.partner;
  const cities = await getCities();
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[{ name: dict.common.breadcrumbHome, path: "/" }, { name: dict.common.nav.partner, path: "/become-a-partner" }]}
        eyebrow={p.eyebrow}
        title={p.title}
        intro={p.intro}
        image={{ src: "/images/restaurant-spread.jpg", alt: dict.home.verticals.items.restaurants.alt }}
      >
        <ButtonLink href="#apply" size="lg">{dict.common.cta.becomePartner}</ButtonLink>
      </PageHero>

      <section className="section-y bg-sand">
        <div className="container-site">
          <h2 className="text-h2">{home.heading}</h2>
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {home.benefits.map((b) => (
              <li key={b.title} className="border-t-2 border-ink pt-5" data-reveal="">
                <h3 className="font-bold">{b.title}</h3>
                <p className="mt-2 text-stone">{b.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-y" id="apply" aria-labelledby="apply-title">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="apply-title" className="text-h2">{p.formHeading}</h2>
            <p className="text-lead mt-4 text-stone">{p.formSub}</p>
            <h3 className="text-label mt-12 text-terra-ink">{p.processHeading}</h3>
            <ol className="relative mt-6 space-y-8 border-s-2 border-dashed border-line ps-8">
              {p.process.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="absolute -start-[2.9rem] top-0 inline-flex size-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-cream tabular-nums">
                    {stepNumber(locale, i + 1)}
                  </span>
                  <h4 className="font-bold">{s.title}</h4>
                  <p className="mt-1 text-stone">{s.body}</p>
                </li>
              ))}
            </ol>
            {hasWhatsApp && (
              <WhatsAppLink number={site.contact.whatsapp} message={dict.common.whatsapp.partnerMessage} location="partner_page" intent="partner" className="mt-10 inline-flex min-h-12 items-center gap-2 font-semibold text-terra-ink hover:underline">
                <Icon name="chat" size={20} /> {dict.common.whatsapp.label}
              </WhatsAppLink>
            )}
          </div>
          <div className="lg:col-span-7">
            <PartnerForm
              locale={locale}
              copy={dict.form.partner}
              errors={dict.form.errors}
              cities={cities.map((c) => ({ slug: c.slug, name: c.name[locale] }))}
              initialType={type}
              privacyHref={localePath(locale, "/privacy")}
            />
          </div>
        </div>
      </section>

      <Faq heading={p.faqHeading} items={p.faq} />
      <JsonLd data={faqSchema(p.faq)} />
    </>
  );
}
