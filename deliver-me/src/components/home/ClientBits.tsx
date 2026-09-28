"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale, Vertical } from "@/config/site";
import { track } from "@/lib/analytics/track";
import { Icon, type IconName } from "../ui/Icon";

export function FeaturedCardLink({ id, category, href, external, children }: { id: string; category: Vertical; href: string; external?: boolean; children: ReactNode }) {
  const onClick = () => track("featured_partner_clicked", { partner_id: id, category });
  const cls = "group block rounded-[var(--radius-lg)]";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>{children}</a>
  ) : (
    <Link href={href} className={cls} onClick={onClick}>{children}</Link>
  );
}

export function PartnerQuickStart({ href, types }: { href: string; types: { value: string; label: string; icon: IconName }[] }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {types.map((t) => (
        <Link
          key={t.value}
          href={`${href}?type=${t.value}#apply`}
          onClick={() => track("partner_signup_started", { business_type: t.value, cta_location: "partner_section" })}
          className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md bg-cream p-3 text-center text-sm font-semibold ring-1 ring-line transition hover:ring-terra-btn"
        >
          <Icon name={t.icon} className="text-terra-ink" />
          {t.label}
        </Link>
      ))}
    </div>
  );
}

type StoreLabels = { appStorePre: string; appStore: string; googlePlayPre: string; googlePlay: string; comingSoon: string };

/** Store buttons. Replace with official Apple / Google badge artwork before launch (brand guidelines). */
export function StoreButtons({ locale, labels, appStore, googlePlay }: { locale: Locale; labels: StoreLabels; appStore: string; googlePlay: string }) {
  const btn = ({ href, icon, pre, name, store }: { href: string; icon: IconName; pre: string; name: string; store: "app_store" | "google_play" }) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("app_download_clicked", { store, cta_location: "app_section" })}
        className="inline-flex min-h-14 items-center gap-3 rounded-xl bg-ink px-5 text-cream ring-1 ring-cream/20 transition hover:bg-black"
      >
        <Icon name={icon} size={26} />
        <span className="text-start leading-tight">
          <span className="block text-xs opacity-80">{pre}</span>
          <span className="block text-lg font-semibold" lang="en">{name}</span>
        </span>
      </a>
    ) : (
      <span className="inline-flex min-h-14 items-center gap-3 rounded-xl px-5 text-cream/80 ring-1 ring-cream/25" aria-disabled="true">
        <Icon name={icon} size={26} />
        <span className="text-start leading-tight">
          <span className="block text-xs">{labels.comingSoon}</span>
          <span className="block text-lg font-semibold" lang="en">{name}</span>
        </span>
      </span>
    );
  return (
    <div className="flex flex-wrap gap-3" data-locale={locale}>
      {btn({ href: appStore, icon: "apple", pre: labels.appStorePre, name: labels.appStore, store: "app_store" })}
      {btn({ href: googlePlay, icon: "play", pre: labels.googlePlayPre, name: labels.googlePlay, store: "google_play" })}
    </div>
  );
}
