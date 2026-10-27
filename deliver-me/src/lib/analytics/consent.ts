/** Minimal consent store. Analytics only loads after an explicit "accept". */
export type ConsentState = "granted" | "denied" | "unset";

const KEY = "dm_consent";
const EVENT = "dm:consent";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

export function setConsent(value: Exclude<ConsentState, "unset">) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function resetConsent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: "unset" }));
}

export function onConsentChange(cb: (v: ConsentState) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
