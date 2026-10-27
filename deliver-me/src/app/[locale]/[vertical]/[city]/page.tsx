import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { TrackCategoryView } from "@/components/sections/TrackView";
import { isLocale, isVertical, locales, verticals } from "@/config/site";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/utils";
import { getCities, getCity, getFeaturedPartners } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo/metadata";
import { VerticalBody, verticalImage } from "../VerticalBody";

type Props = { params: Promise<{ locale: string; vertical: string; city: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const cities = await getCities();
  return locales.flatMap((locale) => verticals.flatMap((vertical) => cities.map((c) => ({ locale, vertical, city: c.slug }))));
}

export async function generateMetadata({ params }: Props) {
  const { locale, vertical, city: slug } = await params;
  const city = await getCity(slug);
  if (!isLocale(locale) || !isVertical(vertical) || !city) return {};
  const d = getDictionary(locale);
  const vars = { vertical: d.common.verticalNames[vertical], verticalLower: d.common.verticalNames[vertical].toLowerCase(), city: city.name[locale] };
  return buildMetadata({ locale, path: `/${vertical}/${slug}`, title: fill(d.cityPage.metaTitle, vars), description: fill(d.cityPage.metaDescription, vars) });
}

export default async function CityPage({ params }: Props) {
  const { locale, vertical, city: slug } = await params;
  const city = await getCity(slug);
  if (!isLocale(locale) || !isVertical(vertical) || !city) notFound();
  const dict = getDictionary(locale);
  const name = dict.common.verticalNames[vertical];
  const vars = { vertical: name, verticalLower: locale === "en" ? name.toLowerCase() : name, city: city.name[locale] };
  const featured = (await getFeaturedPartners(vertical)).filter((p) => !p.citySlug || p.citySlug === slug);
  return (
    <>
      <TrackCategoryView category={vertical} city={slug} />
      <PageHero
        locale={locale}
        crumbs={[
          { name: dict.common.breadcrumbHome, path: "/" },
          { name, path: `/${vertical}` },
          { name: city.name[locale], path: `/${vertical}/${slug}` },
        ]}
        eyebrow={`${name} · ${city.name[locale]}`}
        title={fill(dict.cityPage.title, vars)}
        intro={fill(dict.cityPage.intro, vars)}
        image={{ src: verticalImage[vertical], alt: dict.verticalPages[vertical].imageAlt }}
      />
      <VerticalBody locale={locale} dict={dict} vertical={vertical} cities={[]} featured={featured} city={city} />
    </>
  );
}
