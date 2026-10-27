# Deliver Me (وصّل لي) — website v1

*Closer than you think. — أقرب مما تتوقع.*

Marketing site, ordering entry point and partner-acquisition funnel. Next.js 16 (App Router, Turbopack),
React 19, TypeScript, Tailwind CSS v4. Bilingual: `/ar/` (RTL, default) and `/en/` (LTR).

```bash
cp .env.example .env.local   # fill in real values; empty = hidden in the UI
npm install
npm run dev                  # http://localhost:3000 → redirects to /ar or /en
npm run build && npm start
npm run lint && npm run typecheck && npm run check:contrast
```

## Before launch — needs real content from Deliver Me

| Item | Where | Until provided |
| --- | --- | --- |
| **Official logo files** | `public/brand/` (see its README) | Plain text name is shown — the mark is never redrawn |
| Favicon / app icons | `public/` (see `public/brand/README.md`) | none |
| WhatsApp, email, phone, socials | `.env` | hidden |
| App Store / Google Play links | `.env` | "Coming soon" + WhatsApp waitlist; QR hidden |
| Verified stats | `src/content/stats.ts` or CMS | Impact section hidden |
| Partner logos, featured partners | `src/content/partners.ts` or CMS | sections hidden |
| Real reviews | `src/content/testimonials.ts` or CMS | section hidden |
| Articles | `src/content/articles.ts` or CMS | Insights shows an honest empty state (noindex) |
| Live cities | `src/content/cities.ts` — **confirm Riyadh/Jeddah** | — |
| Legal copy review, legal name, CR no. | `src/content/legal`, `.env` | drafted, PDPL-aligned; needs counsel review |
| Official store badges | `src/components/home/ClientBits.tsx` | text buttons |

Design review of hidden sections: `NEXT_PUBLIC_CONTENT_PREVIEW=true` shows clearly-badged samples
(banner on every page, robots disallow). Never enable in production.

Photography: Unsplash (free licence), self-hosted in `public/images/`, served as AVIF/WebP. Replace with
Deliver Me / partner shoots over time.

## Architecture

```
src/
  app/[locale]/          pages: home, [vertical], [vertical]/[city], how-it-works,
                         become-a-partner, contact, insights(/[slug]), privacy|terms|cookies, 404
  app/api/               partner-lead, contact, whatsapp-click  (zod-validated, rate-limited, honeypot)
  app/download/          smart app link (iOS → App Store, Android → Play) — used by QR + CTAs
  app/sitemap.ts robots.ts manifest.ts
  proxy.ts               locale redirect (cookie → Accept-Language → ar)
  config/site.ts         all business facts from env
  i18n/                  en.ts / ar.ts dictionaries (ar is type-checked against en)
  lib/cms/               content contract + local & Sanity providers (CMS_PROVIDER)
  lib/crm/               CRM contract + HubSpot / Pipedrive / webhook / log adapters (CRM_PROVIDER)
  lib/analytics/         typed event taxonomy, UTM + session attribution, consent, track()
  lib/seo/               metadata (canonical, hreflang en-SA/ar-SA, OG/Twitter), JSON-LD
  components/            design system (ui/), layout/, home/, sections/, forms/
cms/sanity/schemas.ts    Studio schemas matching the Sanity provider
```

### Design system
Tokens live in `src/app/globals.css` (`@theme`): cream / sand / ink / char, terracotta
(`terra` decorative & large text, `terra-ink` for text — 5.69:1 on cream, `terra-btn` for buttons —
white 5.28:1), sage accents; radii, shadows, one easing (`--ease-arrive`), type scale utilities
(`text-display`, `text-h1..h3`, `text-lead`, `text-label`) with Arabic-specific line-heights.
Fonts: Plus Jakarta Sans (EN) + Readex Pro (AR) via `next/font` (self-hosted).
Logical properties (`ms-`, `ps-`, `start-`) throughout, so RTL mirrors automatically.

Motion (all off under `prefers-reduced-motion`): route line draws in, photo opens from the pin,
distance chip ticks 12 → 6 → Arrived once, How-it-works pin walks the six stops once, tracking demo
moves the courier along the grid, count-up stats. No continuous loops, no animation library.

### Analytics & funnel
Events (`src/lib/analytics/events.ts`): `hero_cta_clicked, whatsapp_clicked, category_viewed,
restaurant_viewed, featured_partner_clicked, app_download_clicked, order_tracking_viewed,
partner_signup_started, partner_signup_step_completed, partner_signup_completed,
language_changed, contact_submitted`. Every event carries page, language, session_id and UTMs,
and is pushed to GTM **only after consent**. WhatsApp clicks get a `DM-XXXXX` reference (in the
prefilled message) and a cookieless first-party log (`/api/whatsapp-click` → CRM adapter) so
support chats can be tied to campaigns. Partner leads carry source/medium/campaign/landing page/
session, lead status and onboarding status for the CRM.

Consumer funnel: Visitor → engaged (category_viewed / order_tracking_viewed) → app_download_clicked
→ order completed & repeat (joined from app data via session/ref IDs).
Partner funnel: partner page → partner_signup_started → step_completed ×3 → completed → onboarded (CRM).

### Security
Headers in `next.config.ts`: CSP, HSTS (preload), nosniff, frame DENY, referrer & permissions policy,
COOP. APIs: same-origin check, zod validation, honeypot + time-to-fill, per-IP rate limit (in-memory —
add Cloudflare rate-limit rules on `/api/*` in production), no secrets in client bundles
(`NEXT_PUBLIC_*` holds only public facts). Add Sentry via `@sentry/nextjs` (hook marked in
`app/[locale]/error.tsx`); enable Dependabot on the repo.

### Page-height bug
Body is a flex column (`min-h-dvh`), `<main>` flexes, the footer is the last in-flow element; the
WhatsApp button and app bar are `position: fixed` with no wrappers, and the app bar hides whenever the
footer or download section is on screen, so no padding hack is needed. Verified: document height ==
footer bottom on 390px and 1440px, no horizontal scroll.

### Phase 2 (prepared, not built)
- Partner growth estimator: add a rules table to the CMS and a `/become-a-partner/estimate` route
  that reuses `PartnerForm` step 1–2 values; post the result through the same CRM adapter.
- Customer / partner portals: reserve `/[locale]/account` and `/[locale]/partner`; auth and data will
  come from the app backend — the marketing site only links and shares the design system.
