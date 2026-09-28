import "server-only";
import { hubspotAdapter } from "./hubspot";
import { logAdapter } from "./log";
import { pipedriveAdapter } from "./pipedrive";
import type { CrmAdapter } from "./types";
import { webhookAdapter } from "./webhook";

const adapters: Record<string, CrmAdapter> = {
  hubspot: hubspotAdapter,
  pipedrive: pipedriveAdapter,
  webhook: webhookAdapter,
  log: logAdapter,
};

/** Selected with CRM_PROVIDER=hubspot|pipedrive|webhook|log (default: log). */
export function getCrm(): CrmAdapter {
  const name = process.env.CRM_PROVIDER || "log";
  const adapter = adapters[name];
  if (!adapter) throw new Error(`Unknown CRM_PROVIDER "${name}"`);
  if (name === "log" && process.env.NODE_ENV === "production") {
    console.warn("[crm] CRM_PROVIDER is not configured — leads are only being logged.");
  }
  return adapter;
}

export type { ContactMessage, PartnerLead, WhatsAppClick } from "./types";
