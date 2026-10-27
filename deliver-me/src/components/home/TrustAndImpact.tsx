import Image from "next/image";
import type { Locale } from "@/config/site";
import type { Dictionary } from "@/i18n";
import type { PartnerLogo, Stat } from "@/lib/cms/types";
import { SampleBadge } from "../ui/Section";
import { CountUp } from "./CountUp";

/** Hidden entirely until real partner logos are published in the CMS. */
export function TrustStrip({ logos, dict }: { logos: PartnerLogo[]; dict: Dictionary }) {
  if (logos.length === 0) return null;
  return (
    <section className="border-y border-line py-10" aria-labelledby="trust-title">
      <div className="container-site">
        <h2 id="trust-title" className="text-center text-[0.9375rem] font-medium text-stone">{dict.home.trust.heading}</h2>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((l) => (
            <li key={l.id} className="relative opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0">
              {l.sample || !l.logo.src ? (
                <span className="rounded-md border border-dashed border-stone/40 px-4 py-2 text-sm font-semibold text-stone">{l.name}</span>
              ) : (
                <Image src={l.logo.src} alt={l.name} width={l.logo.width} height={l.logo.height} className="h-8 w-auto md:h-10" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Verified numbers only — the section is hidden while no stat is published. */
export function Impact({ stats, dict, locale }: { stats: Stat[]; dict: Dictionary; locale: Locale }) {
  if (stats.length === 0) return null;
  const im = dict.home.impact;
  return (
    <section className="section-y bg-sand" aria-labelledby="impact-title">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4" data-reveal="">
          <p className="text-label text-terra-ink">{im.eyebrow}</p>
          <h2 id="impact-title" className="text-h2 mt-5">
            {im.heading} <span className="text-terra-ink">{im.headingAccent}</span>
          </h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-8 lg:grid-cols-3">
          {stats.map((s, i) => (
            <div key={s.id} className="relative border-t-2 border-ink pt-5" data-reveal="" style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
              {s.sample && <SampleBadge label={dict.common.sampleBadge} />}
              <dt className="order-2 mt-2 text-[0.9375rem] text-stone">{s.label[locale]}</dt>
              <dd className="text-[clamp(2.5rem,5vw,4rem)] leading-none font-bold tracking-tight">
                {s.prefix}
                <CountUp value={s.value} decimals={s.decimals} locale={locale} />
                <span className="text-terra">{s.suffix?.[locale]}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
