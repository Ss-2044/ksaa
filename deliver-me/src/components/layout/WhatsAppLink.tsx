"use client";

import type { ReactNode } from "react";
import { getAttribution, newRefId } from "@/lib/analytics/context";
import type { CtaLocation } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/**
 * WhatsApp link that, on click, generates a reference ID (DM-XXXXX), adds it to the
 * prefilled message, tracks the click, and logs it first-party for support attribution.
 */
export function WhatsAppLink({
  number,
  message,
  location,
  intent = "support",
  className,
  children,
  ariaLabel,
}: {
  number: string;
  message: string;
  location: CtaLocation;
  intent?: "support" | "partner" | "app_waitlist";
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const base = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={base}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        const refId = newRefId();
        e.currentTarget.href = `https://wa.me/${number}?text=${encodeURIComponent(`${message} Ref: ${refId}`)}`;
        track("whatsapp_clicked", { cta_location: location, ref_id: refId, intent });
        const attr = getAttribution();
        const payload = JSON.stringify({
          refId,
          ctaLocation: location,
          intent,
          page: window.location.pathname,
          language: document.documentElement.lang,
          attribution: {
            session_id: attr.session_id,
            utm_source: attr.utm_source,
            utm_medium: attr.utm_medium,
            utm_campaign: attr.utm_campaign,
          },
        });
        try {
          navigator.sendBeacon?.("/api/whatsapp-click", new Blob([payload], { type: "application/json" }));
        } catch {
          /* non-blocking */
        }
      }}
    >
      {children}
    </a>
  );
}
