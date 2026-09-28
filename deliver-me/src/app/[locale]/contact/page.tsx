import { ContactForm } from "@/components/forms/ContactForm";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { PageHero } from "@/components/sections/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { type Locale, site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { localBusinessSchema } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { hasWhatsApp } from "@/lib/whatsapp";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const p = getDictionary(locale).contactPage;
  return buildMetadata({ locale, path: "/contact", title: p.metaTitle, description: p.metaDescription });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const p = dict.contactPage;
  return (
    <>
      <PageHero locale={locale} crumbs={[{ name: dict.common.breadcrumbHome, path: "/" }, { name: dict.common.nav.contact, path: "/contact" }]} eyebrow={p.eyebrow} title={p.title} intro={p.intro} />
      <section className="pb-24">
        <div className="container-site grid gap-12 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-4">
            {hasWhatsApp && (
              <div className="on-dark rounded-[var(--radius-lg)] bg-ink p-6 text-cream">
                <h2 className="text-h3 text-cream">{p.whatsappTitle}</h2>
                <p className="mt-2 text-stone-soft">{p.whatsappBody}</p>
                <WhatsAppLink number={site.contact.whatsapp} message={dict.common.whatsapp.message} location="contact_page" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-5 font-semibold text-ink hover:bg-white">
                  <Icon name="chat" size={20} /> {dict.common.whatsapp.label}
                </WhatsAppLink>
              </div>
            )}
            {site.contact.email && (
              <a href={`mailto:${site.contact.email}`} className="block rounded-[var(--radius-lg)] bg-paper p-6 ring-1 ring-line hover:ring-ink">
                <span className="text-label text-terra-ink">{p.emailTitle}</span>
                <span className="mt-2 block text-lg font-semibold" dir="ltr">{site.contact.email}</span>
              </a>
            )}
            {site.contact.phone && (
              <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="block rounded-[var(--radius-lg)] bg-paper p-6 ring-1 ring-line hover:ring-ink">
                <span className="text-label text-terra-ink">{p.phoneTitle}</span>
                <span className="mt-2 block text-lg font-semibold" dir="ltr">{site.contact.phone}</span>
              </a>
            )}
          </div>
          <div className="lg:col-span-8">
            <h2 className="text-h3 mb-6">{p.formTitle}</h2>
            <ContactForm locale={locale} copy={dict.form.contact} errors={dict.form.errors} partnerCopy={dict.form.partner} privacyHref={localePath(locale, "/privacy")} />
          </div>
        </div>
      </section>
      <JsonLd data={localBusinessSchema(locale)} />
    </>
  );
}
