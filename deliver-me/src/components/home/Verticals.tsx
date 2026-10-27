import Image from "next/image";
import Link from "next/link";
import type { Locale, Vertical } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { localePath } from "@/i18n/utils";
import { Icon } from "../ui/Icon";
import { SectionHeader } from "../ui/Section";

const cta = (d: Dictionary, v: Vertical) => ({ restaurants: d.common.cta.browseRestaurants, cafes: d.common.cta.browseCafes, groceries: d.common.cta.browseGroceries })[v];

/** Three "doors" — deliberately different sizes and surfaces, joined by one route line. */
export function Verticals({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const v = dict.home.verticals;
  const it = v.items;
  const chips = (items: string[], dark?: boolean) => (
    <ul className="mt-5 flex flex-wrap gap-2">
      {items.map((c) => (
        <li key={c} className={`rounded-full px-3 py-1 text-sm ${dark ? "bg-cream/10 text-cream" : "bg-cream text-ink ring-1 ring-line"}`}>{c}</li>
      ))}
    </ul>
  );
  const door = (key: Vertical, dark?: boolean) => (
    <Link
      href={localePath(locale, `/${key}`)}
      className={`mt-6 inline-flex min-h-12 items-center gap-2 font-semibold underline-offset-4 hover:underline ${dark ? "text-terra-soft" : "text-terra-ink"}`}
    >
      {cta(dict, key)} <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
    </Link>
  );

  return (
    <section id="order" className="section-y relative" aria-labelledby="verticals-title">
      <div className="container-site">
        <SectionHeader id="verticals-title" eyebrow={v.eyebrow} title={v.heading} sub={v.sub} />

        <div className="mt-14 grid gap-5 md:grid-cols-12 md:gap-6">
          {/* Restaurants — the big door */}
          <article className="group relative overflow-hidden rounded-[var(--radius-xl)] bg-sand md:col-span-7 md:row-span-2" data-reveal="">
            <div className="relative aspect-[4/3] md:aspect-auto md:h-[26rem]">
              <Image src="/images/restaurant-spread.jpg" alt={it.restaurants.alt} fill sizes="(min-width:768px) 58vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
            </div>
            <div className="p-6 md:p-10">
              <p className="text-label text-terra-ink">{it.restaurants.stop}</p>
              <h3 className="text-h2 mt-3">{it.restaurants.title}</h3>
              <p className="text-lead mt-3 max-w-lg text-stone">{it.restaurants.body}</p>
              {chips(it.restaurants.covers)}
              {door("restaurants")}
            </div>
          </article>

          {/* Cafes — dark, compact */}
          <article className="on-dark group relative overflow-hidden rounded-[var(--radius-xl)] bg-ink text-cream md:col-span-5" data-reveal="" style={{ ["--reveal-delay" as string]: "100ms" }}>
            <div className="grid grid-cols-[1fr_40%] items-stretch">
              <div className="p-6 md:p-8">
                <p className="text-label text-terra-soft">{it.cafes.stop}</p>
                <h3 className="text-h3 mt-3 text-cream">{it.cafes.title}</h3>
                <p className="mt-3 text-stone-soft">{it.cafes.body}</p>
                {door("cafes", true)}
              </div>
              <div className="relative min-h-56">
                <Image src="/images/cafe-cheers.jpg" alt={it.cafes.alt} fill sizes="(min-width:768px) 17vw, 40vw" className="object-cover" />
              </div>
            </div>
          </article>

          {/* Groceries — sage band */}
          <article className="group relative overflow-hidden rounded-[var(--radius-lg)] bg-sage-wash md:col-span-5" data-reveal="" style={{ ["--reveal-delay" as string]: "200ms" }}>
            <div className="relative h-40">
              <Image src="/images/grocery-produce.jpg" alt={it.groceries.alt} fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="p-6 md:p-8">
              <p className="text-label text-sage-ink">{it.groceries.stop}</p>
              <h3 className="text-h3 mt-3">{it.groceries.title}</h3>
              <p className="mt-3 text-stone">{it.groceries.body}</p>
              {chips(it.groceries.covers)}
              {door("groceries")}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
