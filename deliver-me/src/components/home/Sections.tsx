import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { type Locale, site } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { localePath } from "@/i18n/utils";
import type { Article, FeaturedPartner, Testimonial } from "@/lib/cms/types";
import { hasWhatsApp } from "@/lib/whatsapp";
import { WhatsAppLink } from "../layout/WhatsAppLink";
import { ArticleCard } from "../sections/ArticleCard";
import { ButtonLink } from "../ui/Button";
import { Icon, type IconName } from "../ui/Icon";
import { SampleBadge, SectionHeader } from "../ui/Section";
import { FeaturedCardLink, PartnerQuickStart, StoreButtons } from "./ClientBits";

/* ---------- Featured partners (hidden until real partners are published) ---------- */
export function Featured({ partners, locale, dict }: { partners: FeaturedPartner[]; locale: Locale; dict: Dictionary }) {
  if (partners.length === 0) return null;
  const f = dict.home.featured;
  return (
    <section className="section-y overflow-hidden" aria-labelledby="featured-title">
      <div className="container-site">
        <SectionHeader id="featured-title" eyebrow={f.eyebrow} title={f.heading} sub={f.sub} />
      </div>
      <ul className="rail container-site mt-12 flex gap-5 overflow-x-auto pb-4" tabIndex={0} aria-label={f.heading}>
        {partners.map((p, i) => (
          <li key={p.id} className={`relative shrink-0 snap-start ${i % 3 === 0 ? "w-[85%] sm:w-[28rem]" : "w-[70%] sm:w-[20rem]"}`}>
            {p.sample && <SampleBadge label={dict.common.sampleBadge} />}
            <FeaturedCardLink id={p.id} category={p.category} href={p.storeUrl || localePath(locale, `/${p.category}`)} external={Boolean(p.storeUrl)}>
              <div className={`relative overflow-hidden rounded-[var(--radius-lg)] bg-sand ${i % 3 === 0 ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
                <Image src={p.image.src} alt={p.image.alt[locale]} fill sizes="(min-width:640px) 28rem, 85vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none" />
              </div>
              <p className="text-label mt-4 text-terra-ink">
                {dict.common.verticalSingular[p.category]} · {p.specialty[locale]}
              </p>
              <h3 className="text-h3 mt-2">{p.name[locale]}</h3>
              <p className="mt-1 text-stone">{p.blurb[locale]}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-terra-ink">
                {f.open} <Icon name="arrow" size={16} className="rtl:-scale-x-100" />
              </span>
            </FeaturedCardLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Become a partner ---------- */
const benefitIcons: IconName[] = ["handshake", "dashboard", "bell", "receipt", "chat"];

export function PartnerPitch({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const p = dict.home.partner;
  return (
    <section className="section-y bg-sand" aria-labelledby="partner-title">
      <div className="container-site grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader id="partner-title" eyebrow={p.eyebrow} title={p.heading} sub={p.body} />
          <div className="mt-10 rounded-[var(--radius-lg)] bg-paper p-6 shadow-card" data-reveal="">
            <p className="font-semibold">{p.quickStart}</p>
            <PartnerQuickStart
              href={localePath(locale, "/become-a-partner")}
              types={[
                { value: "restaurant", label: p.types.restaurant, icon: "chef" },
                { value: "cafe", label: p.types.cafe, icon: "bag" },
                { value: "grocery", label: p.types.grocery, icon: "store" },
              ]}
            />
            <ButtonLink href={`${localePath(locale, "/become-a-partner")}#apply`} className="mt-4 w-full">
              {dict.common.cta.becomePartner}
            </ButtonLink>
          </div>
        </div>
        <ol className="lg:col-span-6 lg:col-start-7">
          {p.benefits.map((b, i) => (
            <li key={b.title} className="flex gap-5 border-b border-line py-6 first:pt-0" data-reveal="" style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-cream text-terra-ink ring-1 ring-line">
                <Icon name={benefitIcons[i]} />
              </span>
              <div>
                <h3 className="text-lg font-bold">{b.title}</h3>
                <p className="mt-1 text-stone">{b.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- App download ---------- */
export async function AppDownload({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const a = dict.home.app;
  const live = Boolean(site.app.appStore || site.app.googlePlay);
  const qr = live
    ? await QRCode.toString(`${site.url}/download?hl=${locale}&utm_source=website&utm_medium=qr`, { type: "svg", margin: 0, color: { dark: "#231b16", light: "#ffffff" } })
    : null;

  return (
    <section id="download" className="on-dark relative overflow-hidden bg-terra-deep text-cream" aria-labelledby="download-title">
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-cream/15" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
        <path d="M-5 90 C 25 80, 30 30, 60 40 S 90 10, 105 5" fill="none" stroke="currentColor" strokeWidth=".4" strokeDasharray=".5 1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="container-site section-y relative grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-label text-terra-wash">{a.eyebrow}</p>
          <h2 id="download-title" className="text-h1 mt-5 text-cream">{a.heading}</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {a.highlights.map((h) => (
              <li key={h.title}>
                <h3 className="font-bold text-cream">{h.title}</h3>
                <p className="mt-1 text-terra-wash">{h.body}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            {live ? (
              <StoreButtons locale={locale} labels={dict.common.stores} appStore={site.app.appStore} googlePlay={site.app.googlePlay} />
            ) : (
              <div className="max-w-lg">
                <p className="text-lead text-cream">{a.soon}</p>
                {hasWhatsApp && (
                  <WhatsAppLink
                    number={site.contact.whatsapp}
                    message={dict.common.whatsapp.message}
                    location="app_section"
                    intent="app_waitlist"
                    className="mt-6 inline-flex min-h-14 items-center gap-2 rounded-full bg-cream px-7 font-semibold text-ink hover:bg-white"
                  >
                    <Icon name="chat" size={20} /> {dict.common.whatsapp.label}
                  </WhatsAppLink>
                )}
              </div>
            )}
          </div>
        </div>
        {qr && (
          <div className="hidden justify-self-end rounded-[var(--radius-xl)] bg-white p-6 text-center text-ink shadow-lift lg:col-span-4 lg:col-start-9 lg:block">
            <div className="size-44" role="img" aria-label={a.qrAlt} dangerouslySetInnerHTML={{ __html: qr }} />
            <p className="mt-4 text-sm font-semibold">{a.qrLabel}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Testimonials (real, permissioned reviews only) ---------- */
export function Testimonials({ items, locale, dict }: { items: Testimonial[]; locale: Locale; dict: Dictionary }) {
  if (items.length === 0) return null;
  const t = dict.home.testimonials;
  const [lead, ...rest] = items;
  return (
    <section className="section-y" aria-labelledby="testimonials-title">
      <div className="container-site">
        <SectionHeader id="testimonials-title" eyebrow={t.eyebrow} title={t.heading} />
        <figure className="relative mt-12 max-w-4xl" data-reveal="">
          {lead.sample && <SampleBadge label={dict.common.sampleBadge} />}
          <blockquote className="text-h2 font-semibold">
            <span className="text-terra" aria-hidden="true">“</span>
            {lead.quote}
            <span className="text-terra" aria-hidden="true">”</span>
          </blockquote>
          <figcaption className="mt-6 text-stone">
            <strong className="text-ink">{lead.firstName}</strong> · {lead.city[locale]}
            {lead.ordered && <> · {t.ordered}: {lead.ordered[locale]}</>}
            {lead.rating && lead.ratingSource && (
              <span className="ms-2">
                · {"★".repeat(Math.round(lead.rating))} ({t.source} {lead.ratingSource})
              </span>
            )}
          </figcaption>
        </figure>
        {rest.length > 0 && (
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {rest.map((r) => (
              <figure key={r.id} className="relative border-t border-line pt-6" data-reveal="">
                <blockquote className="text-lg">“{r.quote}”</blockquote>
                <figcaption className="mt-3 text-sm text-stone">
                  <strong className="text-ink">{r.firstName}</strong> · {r.city[locale]}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Insights teaser ---------- */
export function InsightsTeaser({ articles, locale, dict }: { articles: Article[]; locale: Locale; dict: Dictionary }) {
  if (articles.length === 0) return null;
  const i = dict.home.insights;
  return (
    <section className="section-y border-t border-line" aria-labelledby="insights-title">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader id="insights-title" eyebrow={i.eyebrow} title={i.heading} />
          <Link href={localePath(locale, "/insights")} className="inline-flex min-h-12 items-center gap-2 font-semibold text-terra-ink hover:underline">
            {dict.common.cta.allInsights} <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {articles.slice(0, 3).map((a, idx) => (
            <ArticleCard key={a.id} article={a} locale={locale} dict={dict} featured={idx === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final brand moment ---------- */
export function Closing({ dict, ctaHref }: { dict: Dictionary; ctaHref: string }) {
  const c = dict.home.closing;
  return (
    <section className="on-dark draw-on-view relative overflow-hidden bg-ink text-cream" aria-labelledby="closing-title">
      <div className="container-site relative flex flex-col items-center py-24 text-center md:py-36">
        <svg className="h-28 w-full max-w-xl text-terra-soft md:h-36 rtl:-scale-x-100" viewBox="0 0 600 150" fill="none" aria-hidden="true">
          <path className="route-draw" style={{ ["--route-length" as string]: "720" }} d="M0 20 C 150 10, 170 120, 300 110 S 290 40, 300 128" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
          <g className="pin-drop" style={{ ["--pin-delay" as string]: "1.4s", transformOrigin: "300px 140px" }}>
            <path d="M300 146s-15-13-15-25a15 15 0 0 1 30 0c0 12-15 25-15 25Z" fill="#c8553d" />
            <circle cx="300" cy="121" r="5.5" fill="#fbf6ee" />
          </g>
        </svg>
        <h2 id="closing-title" className="text-h1 mt-8 max-w-4xl text-cream">{c.line}</h2>
        <p className="text-lead mt-8 text-stone-soft">{c.question}</p>
        <ButtonLink href={ctaHref} size="lg" className="mt-6">
          {dict.common.cta.download}
        </ButtonLink>
      </div>
    </section>
  );
}
