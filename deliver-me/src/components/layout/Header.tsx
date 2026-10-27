"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/config/site";
import { localePath } from "@/i18n/utils";
import { track } from "@/lib/analytics/track";
import { buttonClasses } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { LanguageSwitch } from "./LanguageSwitch";

export interface NavItem {
  href: string;
  label: string;
}

interface Props {
  locale: Locale;
  logo: ReactNode;
  logoOnDark: ReactNode;
  items: NavItem[];
  cta: { label: string; href: string; external?: boolean };
  labels: { open: string; close: string; menu: string; home: string; switchLabel: string; other: string; otherShort: string };
}

export function Header({ locale, logo, logoOnDark, items, cta, labels }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu on navigation (derived during render, no effect needed)
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    const first = menuRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>("a,button");
        const [a, z] = [f[0], f[f.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      root.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const ctaProps = cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled ? "bg-cream/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href={localePath(locale)} className="shrink-0 rounded-md" aria-label={labels.home}>
          {logo}
        </Link>

        <nav aria-label={labels.menu} className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="relative rounded-full px-3 py-2 text-[0.9375rem] font-medium text-ink/80 transition-colors hover:text-ink aria-[current=page]:text-terra-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSwitch locale={locale} label={labels.switchLabel} other={labels.other} otherShort={labels.otherShort} />
          <a
            href={cta.href}
            {...ctaProps}
            onClick={() => track("app_download_clicked", { store: "section", cta_location: "nav" })}
            className={buttonClasses("primary", "md", "max-sm:hidden")}
          >
            {cta.label}
          </a>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? labels.close : labels.open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex size-12 items-center justify-center rounded-full text-ink hover:bg-ink/[0.06] lg:hidden"
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {/* Portal: the header's backdrop-filter would otherwise trap this fixed overlay */}
      {open && createPortal(
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
          className="on-dark fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink text-cream lg:hidden"
        >
          <div className="container-site flex h-16 shrink-0 items-center justify-between">
            <Link href={localePath(locale)} aria-label={labels.home} onClick={() => setOpen(false)}>
              {logoOnDark}
            </Link>
            <button
              type="button"
              aria-label={labels.close}
              onClick={() => setOpen(false)}
              className="inline-flex size-12 items-center justify-center rounded-full hover:bg-cream/10"
            >
              <Icon name="close" />
            </button>
          </div>
          <nav className="container-site flex flex-1 flex-col pt-6 pb-10">
            <ul className="flex flex-col">
              {items.map((item, i) => (
                <li key={item.href} className="border-b border-line-dark">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 text-2xl font-semibold aria-[current=page]:text-terra-soft"
                  >
                    <span>{item.label}</span>
                    <span className="text-sm font-medium text-stone-soft tabular-nums" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={cta.href}
              {...ctaProps}
              onClick={() => {
                track("app_download_clicked", { store: "section", cta_location: "mobile_menu" });
                setOpen(false);
              }}
              className={buttonClasses("primary", "lg", "mt-10 w-full")}
            >
              {cta.label}
            </a>
          </nav>
        </div>,
        document.body,
      )}
    </header>
  );
}
