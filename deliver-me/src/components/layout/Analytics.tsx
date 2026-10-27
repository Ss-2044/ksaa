"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { initAttribution } from "@/lib/analytics/context";
import { type ConsentState, getConsent, onConsentChange, setConsent } from "@/lib/analytics/consent";

function loadGtm(id: string) {
  if (document.getElementById("gtm-script")) return;
  window.dataLayer = window.dataLayer || [];
  // Google Consent Mode v2 — analytics only, no ad storage/personalisation.
  // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-unused-vars
  function gtag(..._args: unknown[]) { window.dataLayer!.push(arguments as unknown as Record<string, unknown>); }
  gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

/**
 * Captures attribution (UTM + session) on every visit, shows the consent notice when
 * analytics is configured, and only loads GTM after an explicit "accept".
 */
export function Analytics({
  gtmId,
  copy,
  cookiePolicyHref,
}: {
  gtmId: string;
  copy: { title: string; body: string; accept: string; reject: string; learnMore: string };
  cookiePolicyHref: string;
}) {
  const [consent, setState] = useState<ConsentState>("granted"); // avoid flashing the banner before we know

  useEffect(() => {
    initAttribution();
    const current = getConsent();
    setState(current);
    if (current === "granted" && gtmId) loadGtm(gtmId);
    return onConsentChange((v) => {
      setState(v);
      if (v === "granted" && gtmId) loadGtm(gtmId);
    });
  }, [gtmId]);

  if (!gtmId || consent !== "unset") return null;

  return (
    <section
      aria-label={copy.title}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-lg bg-paper p-5 shadow-lift ring-1 ring-line sm:inset-x-auto sm:end-6 sm:bottom-6"
    >
      <h2 className="text-base font-bold">{copy.title}</h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
        {copy.body}{" "}
        <Link href={cookiePolicyHref} className="font-semibold text-terra-ink underline underline-offset-2">
          {copy.learnMore}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setConsent("granted")} className="min-h-11 rounded-full bg-ink px-5 text-[0.9375rem] font-semibold text-cream hover:bg-char">
          {copy.accept}
        </button>
        <button type="button" onClick={() => setConsent("denied")} className="min-h-11 rounded-full px-5 text-[0.9375rem] font-semibold text-ink ring-1 ring-inset ring-ink/25 hover:ring-ink">
          {copy.reject}
        </button>
      </div>
    </section>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={async () => (await import("@/lib/analytics/consent")).resetConsent()}
      className="underline-offset-4 hover:text-cream hover:underline"
    >
      {label}
    </button>
  );
}
