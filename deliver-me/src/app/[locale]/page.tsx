import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { AppDownload, Closing, Featured, InsightsTeaser, PartnerPitch, Testimonials } from "@/components/home/Sections";
import { TrackingDemo } from "@/components/home/TrackingDemo";
import { Impact, TrustStrip } from "@/components/home/TrustAndImpact";
import { Verticals } from "@/components/home/Verticals";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/Section";
import { hasAppLinks, isLocale, type Locale } from "@/config/site";
import { getDictionary } from "@/i18n";
import { formatNumber, localePath, stepNumber } from "@/i18n/utils";
import { getArticles, getFeaturedPartners, getPartnerLogos, getStats, getTestimonials } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = (await params) as { locale: Locale };
  const d = getDictionary(locale);
  return buildMetadata({ locale, path: "/", title: d.meta.home.title, description: d.meta.home.description, absoluteTitle: true });
}

const trackIcons: IconName[] = ["pin", "clock", "phone"];

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return null;
  const locale = raw;
  const dict = getDictionary(locale);
  const [logos, stats, featured, testimonials, articles] = await Promise.all([
    getPartnerLogos(),
    getStats(),
    getFeaturedPartners(),
    getTestimonials(locale),
    getArticles(locale),
  ]);
  const downloadHref = hasAppLinks ? `/download?hl=${locale}` : "#download";
  const t = dict.home.tracking;
  const how = dict.home.how;

  return (
    <>
      <Hero locale={locale} dict={dict} primaryHref={downloadHref} browseHref={localePath(locale, "/restaurants")} />
      <TrustStrip logos={logos} dict={dict} />
      <Impact stats={stats} dict={dict} locale={locale} />
      <Verticals locale={locale} dict={dict} />

      <section className="section-y bg-cream" aria-labelledby="how-title">
        <div className="container-site">
          <SectionHeader id="how-title" eyebrow={how.eyebrow} title={how.heading} sub={how.sub} />
          <HowItWorks steps={how.steps} distance={how.distance} progressLabel={how.progressLabel} stepNumbers={how.steps.map((_, i) => stepNumber(locale, i + 1))} />
        </div>
      </section>

      <section className="on-dark section-y bg-ink text-cream" aria-labelledby="tracking-title">
        <div className="container-site grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader id="tracking-title" eyebrow={t.eyebrow} title={t.heading} sub={t.body} tone="dark" />
            <ul className="mt-10 space-y-6">
              {t.points.map((p, i) => (
                <li key={p.title} className="flex gap-4" data-reveal="" style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-char text-terra-soft ring-1 ring-line-dark">
                    <Icon name={trackIcons[i]} size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-cream">{p.title}</h3>
                    <p className="mt-1 text-stone-soft">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <TrackingDemo
              statuses={t.statuses}
              replay={t.replay}
              mapLabel={t.mapLabel}
              etaLabel={t.etaLabel}
              etaUnit={t.etaUnit}
              arrived={t.arrived}
              etas={[18, 15, 11, 6].map((n) => formatNumber(locale, n))}
            />
          </div>
        </div>
      </section>

      <Featured partners={featured} locale={locale} dict={dict} />
      <PartnerPitch locale={locale} dict={dict} />
      <AppDownload locale={locale} dict={dict} />
      <Testimonials items={testimonials} locale={locale} dict={dict} />
      <InsightsTeaser articles={articles} locale={locale} dict={dict} />
      <Closing dict={dict} ctaHref={downloadHref} />
    </>
  );
}
