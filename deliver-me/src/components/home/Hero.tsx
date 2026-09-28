import Image from "next/image";
import type { Locale } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { formatNumber } from "@/i18n/utils";
import { HeroCtas } from "./HeroCtas";
import { HeroStatus } from "./HeroStatus";

/**
 * "far → closing the gap → arrived": a dotted route draws in from the far corner,
 * passes two stops (coffee, groceries) and lands on a pin where the food photo
 * opens up from the pin outward.
 */
export function Hero({ locale, dict, primaryHref, browseHref }: { locale: Locale; dict: Dictionary; primaryHref: string; browseHref: string }) {
  const h = dict.home.hero;
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="container-site grid items-center gap-10 pt-6 pb-16 md:pt-10 lg:grid-cols-12 lg:gap-8 lg:pb-24">
        <div className="lg:col-span-7">
          <p className="hero-rise text-label text-terra-ink">{h.eyebrow}</p>
          <h1 id="hero-title" className="text-display hero-rise mt-5" style={{ ["--rise-delay" as string]: "80ms" }}>
            <span className="text-terra">{h.titleLead}</span>
            <br />
            {h.titleRest}
          </h1>
          <p className="text-lead hero-rise mt-6 max-w-xl text-stone" style={{ ["--rise-delay" as string]: "160ms" }}>
            {h.sub}
          </p>
          <div className="hero-rise mt-8" style={{ ["--rise-delay" as string]: "240ms" }}>
            <HeroCtas primaryHref={primaryHref} primary={dict.common.cta.download} browseHref={browseHref} browse={dict.common.cta.browseNear} />
          </div>
          <ul className="hero-rise mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[0.9375rem] text-stone" aria-label={h.supportingLabel} style={{ ["--rise-delay" as string]: "320ms" }}>
            {h.supporting.map((s, i) => (
              <li key={s} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-terra" />}
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-5">
          {/* Route from "far" (top-start corner) to the pin on the photo */}
          <svg className="pointer-events-none absolute -top-10 -start-6 z-10 h-[70%] w-[80%] text-terra rtl:-scale-x-100" viewBox="0 0 400 400" fill="none" aria-hidden="true">
            <path
              className="route-draw"
              style={{ ["--route-length" as string]: "700", ["--route-delay" as string]: "300ms" }}
              d="M10 20 C 120 30, 60 160, 180 190 S 300 260, 330 370"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
          </svg>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-xl)] bg-sand shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/restaurant-wraps.jpg"
              alt={h.photoAlt}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="hero-photo object-cover"
              style={{ ["--pin-x" as string]: "72%", ["--pin-y" as string]: "80%" }}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/50 to-transparent" aria-hidden="true" />
            <div className="absolute bottom-4 start-4 pin-drop" style={{ ["--pin-delay" as string]: "1.2s" }}>
              <HeroStatus label={h.statusLabel} away={h.statusAway} arrived={h.statusArrived} digits={[formatNumber(locale, 12), formatNumber(locale, 6), ""]} />
            </div>
          </div>
          {/* Stops along the way */}
          <div className="pin-drop absolute -top-4 end-6 size-20 overflow-hidden rounded-full border-4 border-cream shadow-card sm:size-24" style={{ ["--pin-delay" as string]: "500ms" }}>
            <Image src="/images/cafe-pour.jpg" alt={h.stopCoffeeAlt} fill sizes="96px" className="object-cover" />
          </div>
          <div className="pin-drop absolute top-1/3 -start-3 size-16 overflow-hidden rounded-full border-4 border-cream shadow-card sm:size-20 lg:-start-8" style={{ ["--pin-delay" as string]: "800ms" }}>
            <Image src="/images/grocery-market.jpg" alt={h.stopGroceryAlt} fill sizes="80px" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
