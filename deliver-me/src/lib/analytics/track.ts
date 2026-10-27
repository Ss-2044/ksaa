import { getAttribution } from "./context";
import { getConsent } from "./consent";
import type { EventMap, EventName } from "./events";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Push a typed event to the GTM dataLayer with page, language and attribution context.
 * Nothing is sent before the visitor accepts analytics cookies.
 */
export function track<E extends EventName>(event: E, params: EventMap[E]) {
  if (typeof window === "undefined") return;
  const attr = getAttribution();
  const payload = {
    event,
    ...params,
    page_path: window.location.pathname,
    language: document.documentElement.lang,
    session_id: attr.session_id,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
  };
  if (process.env.NODE_ENV !== "production") console.debug("[track]", payload);
  if (getConsent() !== "granted") return;
  (window.dataLayer ??= []).push(payload);
}
