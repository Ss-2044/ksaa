import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { TrackCategoryView } from "@/components/sections/TrackView";
import { isLocale, isVertical, locales, verticals } from "@/config/site";
import { getDictionary } from "@/i18n";
import { getCities, getFeaturedPartners } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo/metadata";
import { VerticalBody, verticalImage } from "./VerticalBody";

type Props = { params: Promise<{ locale: string; vertical: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => verticals.map((vertical) => ({ locale, vertical })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, vertical } = await params;
  if (!isLocale(locale) || !isVertical(vertical)) return {};
  const v = getDictionary(locale).verticalPages[vertical];
  return buildMetadata({ locale, path: `/${vertical}`, title: v.metaTitle, description: v.metaDescription, image: { url: verticalImage[vertical], width: 1600, height: 1067 } });
}

export default async function VerticalPage({ params }: Props) {
  const { locale, vertical } = await params;
  if (!isLocale(locale) || !isVertical(vertical)) notFound();
  const dict = getDictionary(locale);
  const v = dict.verticalPages[vertical];
  const [cities, featured] = await Promise.all([getCities(), getFeaturedPartners(vertical)]);
  return (
    <>
      <TrackCategoryView category={vertical} />
      <PageHero
        locale={locale}
        crumbs={[{ name: dict.common.breadcrumbHome, path: "/" }, { name: dict.common.verticalNames[vertical], path: `/${vertical}` }]}
        eyebrow={v.eyebrow}
        title={v.title}
        intro={v.intro}
        image={{ src: verticalImage[vertical], alt: v.imageAlt }}
      />
      <VerticalBody locale={locale} dict={dict} vertical={vertical} cities={cities} featured={featured} />
    </>
  );
}
