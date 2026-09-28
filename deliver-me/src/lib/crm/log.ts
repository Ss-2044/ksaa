import type { CrmAdapter } from "./types";

/** Development adapter: logs payloads (redacting contact details) instead of sending them. */
const redact = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k, /email|phone|name/i.test(k) && k !== "businessName" ? "[redacted]" : v]));

export const logAdapter: CrmAdapter = {
  name: "log",
  async createPartnerLead(lead) {
    console.info("[crm:log] partner lead", redact(lead));
  },
  async createContactMessage(msg) {
    console.info("[crm:log] contact message", redact(msg));
  },
  async logWhatsAppClick(click) {
    console.info("[crm:log] whatsapp click", click);
  },
};
