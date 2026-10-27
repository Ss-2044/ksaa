import Link from "next/link";
import { type Locale, site } from "@/config/site";
import type { Dictionary } from "@/i18n";
import { localePath } from "@/i18n/utils";
import type { City } from "@/lib/cms/types";
import { hasWhatsApp } from "@/lib/whatsapp";
import { Icon } from "../ui/Icon";
import { Logo } from "../ui/Logo";
import { CookieSettingsButton } from "./Analytics";
import { LanguageSwitch } from "./LanguageSwitch";
import { WhatsAppLink } from "./WhatsAppLink";

export function Footer({ locale, dict, cities }: { locale: Locale; dict: Dictionary; cities: City[] }) {
  const { nav } = dict.common;
  const f = dict.footer;
  const lp = (p: string) => localePath(locale, p);
  const year = new Date().getFullYear();
  const list = new Intl.ListFormat(locale === "ar" ? "ar" : "en", { style: "long", type: "conjunction" });

  const socials = [
    { key: "instagram", href: site.social.instagram, label: "Instagram" },
    { key: "tiktok", href: site.social.tiktok, label: "TikTok" },
    { key: "x", href: site.social.x, label: "X" },
  ].filter((s) => s.href) as { key: "instagram" | "tiktok" | "x"; href: string; label: string }[];

  const linkCls = "inline-flex min-h-11 items-center text-stone-soft transition-colors hover:text-cream md:min-h-9";

  return (
    <footer className="on-dark bg-ink text-cream">
      <div className="container-site pt-16 pb-10 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo locale={locale} variant="compact" tone="onDark" height={40} />
            <p className="mt-5 text-h3 text-cream">{dict.common.tagline}</p>
            {cities.length > 0 && (
              <p className="mt-4 flex items-start gap-2 text-stone-soft">
                <Icon name="pin" size={20} className="mt-1 shrink-0 text-terra-soft" />
                <span>
                  {f.coveragePrefix} {list.format(cities.map((c) => c.name[locale]))} — {f.coverageSuffix}
                </span>
              </p>
            )}
          </div>

          <nav aria-label={f.explore} className="md:col-span-2">
            <h2 className="text-label text-cream/70">{f.explore}</h2>
            <ul className="mt-4 space-y-1">
              <li><Link className={linkCls} href={lp("/restaurants")}>{nav.restaurants}</Link></li>
              <li><Link className={linkCls} href={lp("/cafes")}>{nav.cafes}</Link></li>
              <li><Link className={linkCls} href={lp("/groceries")}>{nav.groceries}</Link></li>
              <li><Link className={linkCls} href={lp("/how-it-works")}>{nav.howItWorks}</Link></li>
            </ul>
          </nav>

          <nav aria-label={f.company} className="md:col-span-2">
            <h2 className="text-label text-cream/70">{f.company}</h2>
            <ul className="mt-4 space-y-1">
              <li><Link className={linkCls} href={lp("/become-a-partner")}>{nav.partner}</Link></li>
              <li><Link className={linkCls} href={lp("/insights")}>{nav.insights}</Link></li>
              <li><Link className={linkCls} href={lp("/contact")}>{nav.contact}</Link></li>
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="text-label text-cream/70">{f.reach}</h2>
            <ul className="mt-4 space-y-1">
              {hasWhatsApp && (
                <li>
                  <WhatsAppLink number={site.contact.whatsapp} message={dict.common.whatsapp.message} location="footer" className={`${linkCls} gap-2`}>
                    <Icon name="chat" size={18} /> {dict.common.whatsapp.short}
                  </WhatsAppLink>
                </li>
              )}
              {site.contact.email && (
                <li>
                  <a className={`${linkCls} gap-2`} href={`mailto:${site.contact.email}`}>
                    <Icon name="mail" size={18} /> <span dir="ltr">{site.contact.email}</span>
                  </a>
                </li>
              )}
              {site.contact.phone && (
                <li>
                  <a className={`${linkCls} gap-2`} href={`tel:${site.contact.phone.replace(/\s/g, "")}`}>
                    <Icon name="phone" size={18} /> <span dir="ltr">{site.contact.phone}</span>
                  </a>
                </li>
              )}
              {!hasWhatsApp && !site.contact.email && !site.contact.phone && (
                <li><Link className={linkCls} href={lp("/contact")}>{dict.common.cta.contactUs}</Link></li>
              )}
            </ul>
            {socials.length > 0 && (
              <>
                <h2 className="text-label mt-8 text-cream/70">{f.follow}</h2>
                <ul className="mt-3 flex gap-2">
                  {socials.map((s) => (
                    <li key={s.key}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="inline-flex size-11 items-center justify-center rounded-full ring-1 ring-cream/20 transition-colors hover:bg-cream hover:text-ink"
                      >
                        <Icon name={s.key} size={20} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line-dark pt-6 text-sm text-stone-soft md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.legalName || site.name[locale]}. {f.rights}
            {site.commercialRegistration && (
              <span className="ms-2">
                {f.cr} <span dir="ltr">{site.commercialRegistration}</span>
              </span>
            )}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href={lp("/privacy")}>{f.privacy}</Link></li>
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href={lp("/terms")}>{f.terms}</Link></li>
            <li><Link className="underline-offset-4 hover:text-cream hover:underline" href={lp("/cookies")}>{f.cookies}</Link></li>
            {site.analytics.gtmId && <li><CookieSettingsButton label={f.cookieSettings} /></li>}
            <li>
              <LanguageSwitch locale={locale} label={dict.common.language.switchLabel} other={dict.common.language.other} otherShort={dict.common.language.other} tone="dark" />
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
