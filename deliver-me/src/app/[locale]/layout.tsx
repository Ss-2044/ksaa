import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Readex_Pro } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";
import { Analytics } from "@/components/layout/Analytics";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PreviewBanner } from "@/components/layout/PreviewBanner";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { StickyAppBar } from "@/components/layout/StickyAppBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Logo } from "@/components/ui/Logo";
import { hasAppLinks, isLocale, locales, site } from "@/config/site";
import { getDictionary } from "@/i18n";
import { dir, localePath } from "@/i18n/utils";
import { getCities } from "@/lib/cms";
import { organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { hasWhatsApp } from "@/lib/whatsapp";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--font-readex",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#fbf6ee",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(site.url),
    title: { default: dict.meta.siteTitle, template: `%s — ${site.name[locale]}` },
    applicationName: site.name[locale],
    formatDetection: { telephone: false },
    ...(site.app.appStore ? { itunes: { appId: site.app.appStore.match(/id(\d+)/)?.[1] ?? "" } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const cities = await getCities();
  const { nav, cta, menu, language } = dict.common;
  const lp = (p: string) => localePath(locale, p);

  const navItems = [
    { href: lp("/restaurants"), label: nav.restaurants },
    { href: lp("/cafes"), label: nav.cafes },
    { href: lp("/groceries"), label: nav.groceries },
    { href: lp("/how-it-works"), label: nav.howItWorks },
    { href: lp("/become-a-partner"), label: nav.partner },
    { href: lp("/insights"), label: nav.insights },
    { href: lp("/contact"), label: nav.contact },
  ];

  const downloadHref = hasAppLinks ? `/download?hl=${locale}` : `${lp("/")}#download`;
  const navCta = site.app.webOrdering
    ? { label: cta.orderNow, href: site.app.webOrdering, external: true }
    : { label: cta.download, href: downloadHref };

  const fontStack = locale === "ar" ? "var(--font-readex), var(--font-jakarta)" : "var(--font-jakarta), var(--font-readex)";

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${jakarta.variable} ${readex.variable}`}
      style={{ ["--font-active" as string]: fontStack }}
      suppressHydrationWarning
    >
      <head>
        {/* Enables scroll-reveal styles only when JS runs; content is never hidden without JS. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');setTimeout(function(){document.querySelectorAll('[data-reveal],.draw-on-view').forEach(function(e){e.setAttribute('data-revealed','')})},6000)",
          }}
        />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="fixed top-2 start-2 z-[60] -translate-y-24 rounded-full bg-ink px-5 py-3 font-semibold text-cream transition-transform focus:translate-y-0"
        >
          {dict.common.skipToContent}
        </a>
        {site.contentPreview && <PreviewBanner text={dict.common.previewBanner} />}
        <Header
          locale={locale}
          logo={<Logo locale={locale} variant="horizontal" tone="onLight" height={34} priority />}
          logoOnDark={<Logo locale={locale} variant="horizontal" tone="onDark" height={34} />}
          items={navItems}
          cta={navCta}
          labels={{ ...menu, menu: menu.label, home: nav.home, switchLabel: language.switchLabel, other: language.other, otherShort: language.otherShort }}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer locale={locale} dict={dict} cities={cities} />

        {hasWhatsApp && (
          <FloatingWhatsApp number={site.contact.whatsapp} message={dict.common.whatsapp.message} label={dict.common.whatsapp.label} short={dict.common.whatsapp.short} />
        )}
        {(hasAppLinks || site.app.webOrdering) && (
          <StickyAppBar
            href={site.app.webOrdering || downloadHref}
            title={dict.common.appBar.title}
            cta={site.app.webOrdering ? cta.orderNow : dict.common.appBar.cta}
            dismiss={dict.common.appBar.dismiss}
          />
        )}
        <Analytics gtmId={site.analytics.gtmId} copy={dict.consent} cookiePolicyHref={lp("/cookies")} />
        <RevealObserver />
        <JsonLd data={[organizationSchema(locale), websiteSchema(locale)]} />
      </body>
    </html>
  );
}
