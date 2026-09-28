import type { CrmAdapter } from "./types";

/**
 * Generic webhook adapter — POSTs JSON to CRM_WEBHOOK_URL (Make, Zapier, n8n, an internal
 * ops service…). Signs the body with HMAC-SHA256 in `X-DM-Signature` when CRM_WEBHOOK_SECRET is set.
 */
async function post(kind: string, data: unknown) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) throw new Error("CRM_WEBHOOK_URL is not set");
  const body = JSON.stringify({ kind, data });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (secret) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
    headers["X-DM-Signature"] = Buffer.from(sig).toString("hex");
  }
  const res = await fetch(url, { method: "POST", headers, body, cache: "no-store" });
  if (!res.ok) throw new Error(`Webhook ${res.status}`);
}

export const webhookAdapter: CrmAdapter = {
  name: "webhook",
  createPartnerLead: (lead) => post("partner_lead", lead),
  createContactMessage: (msg) => post("contact_message", msg),
  logWhatsAppClick: (click) => post("whatsapp_click", click),
};
