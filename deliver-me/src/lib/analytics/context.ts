/**
 * Client-side attribution context: session ID + first-touch UTM parameters.
 * Stored in sessionStorage only (no cross-session tracking, no personal data),
 * and attached to analytics events, WhatsApp clicks and form submissions.
 */

export interface Attribution {
  session_id: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_page?: string;
  referrer?: string;
}

const KEY = "dm_attr";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function randomId(len = 12): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

function read(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

let memory: Attribution | null = null;

/** Call once on page load. Captures UTMs on first touch within the session. */
export function initAttribution(): Attribution {
  const existing = read() ?? memory;
  const params = new URLSearchParams(window.location.search);
  const hasUtm = UTM_KEYS.some((k) => params.has(k));

  const attr: Attribution = existing && !hasUtm
    ? existing
    : {
        session_id: existing?.session_id ?? randomId(),
        landing_page: window.location.pathname,
        referrer: document.referrer ? new URL(document.referrer).hostname : undefined,
        ...Object.fromEntries(UTM_KEYS.map((k) => [k, params.get(k)?.slice(0, 100) || undefined])),
      };

  memory = attr;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    /* storage unavailable (private mode) — keep in memory */
  }
  return attr;
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return { session_id: "" };
  return read() ?? memory ?? initAttribution();
}

/** Short human-readable reference: DM-7K3Q. Shared with support over WhatsApp. */
export function newRefId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return "DM-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
