"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics/track";
import { buttonClasses } from "../ui/Button";
import { Icon } from "../ui/Icon";

const DISMISS_KEY = "dm_appbar_dismissed";

/**
 * Mobile-only "Get the app" bar. Shows after the hero, hides whenever the download
 * section or the footer is on screen — so it never covers the end of the page and
 * never needs extra bottom padding (no phantom space after the footer).
 */
export function StickyAppBar({ href, title, cta, dismiss }: { href: string; title: string; cta: string; dismiss: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const targets = [document.getElementById("download"), document.querySelector("footer")].filter(Boolean) as Element[];
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setBlocked(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const show = pastHero && !blocked && !dismissed;

  useEffect(() => {
    document.documentElement.style.setProperty("--dm-bar-offset", show ? "5rem" : "0px");
  }, [show]);

  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-300 ease-[var(--ease-arrive)] md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container-site flex h-16 items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold">{title}</p>
        <a
          href={href}
          onClick={() => track("app_download_clicked", { store: "section", cta_location: "sticky_bar" })}
          className={buttonClasses("primary", "md", "min-h-11! px-4")}
        >
          {cta}
        </a>
        <button
          type="button"
          aria-label={dismiss}
          onClick={() => {
            setDismissed(true);
            try {
              sessionStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
          }}
          className="-me-2 inline-flex size-11 items-center justify-center rounded-full text-stone hover:bg-ink/5"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
    </div>
  );
}
