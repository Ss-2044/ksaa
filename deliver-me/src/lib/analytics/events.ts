import type { Vertical } from "@/config/site";

/**
 * Deliver Me analytics taxonomy. Keep this list short and meaningful —
 * every event maps to a step in one of the two funnels (see docs/ANALYTICS.md):
 *
 *   Consumer: Visitor → Engaged → App download / Order started → Order completed → Repeat
 *   Partner:  Partner visitor → Sign-up started → Step completed → Sign-up completed → Onboarded
 *
 * Order-completed / repeat / onboarded happen in the app & back-office and are joined
 * later in the CRM/warehouse via session_id, ref_id and UTM fields.
 */
export type CtaLocation =
  | "nav"
  | "mobile_menu"
  | "hero"
  | "verticals"
  | "how_it_works"
  | "tracking"
  | "featured"
  | "partner_section"
  | "app_section"
  | "closing"
  | "sticky_bar"
  | "footer"
  | "vertical_page"
  | "city_page"
  | "contact_page"
  | "partner_page"
  | "floating";

export interface EventMap {
  hero_cta_clicked: { cta: "download" | "browse" | "order" };
  whatsapp_clicked: { cta_location: CtaLocation; ref_id: string; intent: "support" | "partner" | "app_waitlist" };
  category_viewed: { category: Vertical; city?: string };
  restaurant_viewed: { partner_id: string; category: Vertical };
  featured_partner_clicked: { partner_id: string; category: Vertical };
  app_download_clicked: { store: "app_store" | "google_play" | "qr" | "section"; cta_location: CtaLocation };
  order_tracking_viewed: Record<string, never>;
  partner_signup_started: { business_type?: string; cta_location: CtaLocation };
  partner_signup_step_completed: { step: number; step_name: string };
  partner_signup_completed: { business_type: string; city: string; ref_id: string };
  language_changed: { from: string; to: string };
  contact_submitted: { topic: string; ref_id: string };
}

export type EventName = keyof EventMap;
