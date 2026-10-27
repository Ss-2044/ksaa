import Link from "next/link";
import { Featured } from "@/components/home/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { hasAppLinks, type Locale, type Vertical, verticals } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { fill, localePath } from "@/i18n/utils";
import type { City, FeaturedPartner } from "@/lib/cms/types";

export function VerticalBody({
  locale,
  dict,
  vertical,
  cities,
  featured,
  city,
}: {
  locale: Locale;
  dict: Dictionary;
  vertical: Vertical;
  cities: City[];
  featured: FeaturedPartner[];
  city?: City;
}) {
  const v = dict.verticalPages[vertical];
  const names = dict.common.verticalNames;
  const downloadHref = hasAppLinks ? `/download?hl=${locale}` : `${localePath(locale)}#download`;
  return (
    <>
      <section className="section-y bg-sand">
        <div className="container-site">
          <h2 className="text-h2 max-w-2xl" data-reveal="">{v.highlightsHeading}</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {v.highlights.map((h, i) => (
              <li key={h.title} className="border-t-2 border-ink pt-5" data-reveal="" style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
                <h3 className="text-h3">{h.title}</h3>
                <p className="mt-3 text-stone">{h.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Featured partners={featured} locale={locale} dict={dict} />

      {!city && cities.length > 0 && (
        <section className="section-y">
          <div className="container-site">
            <h2 className="text-h2">{dict.verticalPages.citiesHeading}</h2>
            <p className="text-lead mt-3 text-stone">{dict.verticalPages.citiesSub}</p>
            <ul className="mt-10 flex flex-wrap gap-3">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={localePath(locale, `/${vertical}/${c.slug}`)} className="inline-flex min-h-14 items-center gap-2 rounded-full bg-paper px-6 text-lg font-semibold ring-1 ring-line transition hover:ring-terra-btn">
                    <Icon name="pin" size={20} className="text-terra-ink" /> {c.name[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {city && (
        <section className="section-y">
          <div className="container-site">
            <h2 className="text-h3">{fill(dict.cityPage.otherVerticals, { city: city.name[locale] })}</h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {verticals.filter((x) => x !== vertical).map((x) => (
                <li key={x}>
                  <Link href={localePath(locale, `/${x}/${city.slug}`)} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-paper px-5 font-semibold ring-1 ring-line hover:ring-terra-btn">
                    {names[x]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="on-dark bg-ink text-cream">
        <div className="container-site flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <h2 className="text-h2 text-cream">{dict.verticalPages.ctaHeading}</h2>
          <ButtonLink href={downloadHref} size="lg">{dict.common.cta.download}</ButtonLink>
        </div>
      </section>
    </>
  );
}

export const verticalImage: Record<Vertical, string> = {
  restaurants: "/images/restaurant-grill.jpg",
  cafes: "/images/cafe-cheers.jpg",
  groceries: "/images/grocery-aisle.jpg",
};
