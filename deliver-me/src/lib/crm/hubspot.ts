import type { CrmAdapter } from "./types";

/**
 * HubSpot adapter (private app token, CRM v3 objects API).
 * Env: HUBSPOT_ACCESS_TOKEN, optional HUBSPOT_PARTNER_PIPELINE / HUBSPOT_PARTNER_STAGE.
 * Custom contact properties expected (create them in HubSpot first):
 *   dm_ref_id, dm_business_type, dm_business_name, dm_city, dm_branches, dm_daily_orders,
 *   dm_language, dm_landing_page, dm_session_id, dm_onboarding_status
 */
const API = "https://api.hubapi.com";

async function hs(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HubSpot ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

export const hubspotAdapter: CrmAdapter = {
  name: "hubspot",
  async createPartnerLead(lead) {
    const [firstname, ...rest] = lead.contactName.split(" ");
    await hs("/crm/v3/objects/contacts", {
      properties: {
        firstname,
        lastname: rest.join(" "),
        email: lead.email,
        phone: lead.phone,
        company: lead.businessName,
        city: lead.city,
        hs_lead_status: "NEW",
        lifecyclestage: "lead",
        hs_analytics_source_data_1: lead.source,
        dm_ref_id: lead.refId,
        dm_business_type: lead.businessType,
        dm_business_name: lead.businessName,
        dm_city: lead.city,
        dm_branches: lead.branches,
        dm_daily_orders: lead.estimatedDailyOrders,
        dm_language: lead.language,
        dm_landing_page: lead.landingPage,
        dm_session_id: lead.sessionId,
        dm_utm_campaign: lead.campaign,
        dm_utm_medium: lead.medium,
        dm_onboarding_status: lead.onboardingStatus,
      },
    });
  },
  async createContactMessage(msg) {
    await hs("/crm/v3/objects/contacts", {
      properties: { firstname: msg.name, email: msg.email, phone: msg.phone, message: `[${msg.topic}] ${msg.message}`, dm_ref_id: msg.refId, dm_language: msg.language },
    });
  },
  async logWhatsAppClick() {
    /* Clicks are anonymous; keep them in analytics/warehouse, not as HubSpot contacts. */
  },
};
