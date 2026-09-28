import type { CrmAdapter } from "./types";

/**
 * Pipedrive adapter (API token). Creates a person, an organization and a lead.
 * Env: PIPEDRIVE_API_TOKEN, PIPEDRIVE_COMPANY_DOMAIN (e.g. "delivermesa").
 * Optional custom-field keys for lead metadata: PIPEDRIVE_FIELD_* (see README).
 */
function base() {
  return `https://${process.env.PIPEDRIVE_COMPANY_DOMAIN}.pipedrive.com/api/v1`;
}

async function pd<T = { data: { id: number } }>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}?api_token=${process.env.PIPEDRIVE_API_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Pipedrive ${path} ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const pipedriveAdapter: CrmAdapter = {
  name: "pipedrive",
  async createPartnerLead(lead) {
    const org = await pd("/organizations", { name: lead.businessName });
    const person = await pd("/persons", {
      name: lead.contactName,
      email: [{ value: lead.email, primary: true }],
      phone: [{ value: lead.phone, primary: true }],
      org_id: org.data.id,
    });
    await pd("/leads", {
      title: `${lead.businessName} — ${lead.businessType} (${lead.city}) ${lead.refId}`,
      person_id: person.data.id,
      organization_id: org.data.id,
    });
    await pd("/notes", {
      org_id: org.data.id,
      content: [
        `Ref: ${lead.refId}`,
        `Type: ${lead.businessType}`,
        `City: ${lead.city}`,
        `Branches: ${lead.branches}`,
        `Daily orders: ${lead.estimatedDailyOrders ?? "—"}`,
        `Language: ${lead.language}`,
        `Source/medium/campaign: ${lead.source ?? "—"} / ${lead.medium ?? "—"} / ${lead.campaign ?? "—"}`,
        `Landing page: ${lead.landingPage ?? "—"}`,
        `Session: ${lead.sessionId ?? "—"}`,
      ].join("<br>"),
    });
  },
  async createContactMessage(msg) {
    const person = await pd("/persons", { name: msg.name, email: [{ value: msg.email, primary: true }] });
    await pd("/notes", { person_id: person.data.id, content: `[${msg.topic}] ${msg.refId}<br>${msg.message}` });
  },
  async logWhatsAppClick() {
    /* anonymous — not stored in Pipedrive */
  },
};
