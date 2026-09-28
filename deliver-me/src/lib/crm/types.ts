import type { Locale } from "@/config/site";

/** Partner (restaurant / cafe / grocery) lead as stored in the CRM. */
export interface PartnerLead {
  refId: string;
  businessType: "restaurant" | "cafe" | "grocery" | "other";
  businessName: string;
  city: string;
  branches: "1" | "2-5" | "6+";
  estimatedDailyOrders?: "lt20" | "20-50" | "50-150" | "150+" | "unknown";
  contactName: string;
  phone: string;
  email: string;
  language: Locale;
  // Attribution
  source?: string;
  medium?: string;
  campaign?: string;
  landingPage?: string;
  sessionId?: string;
  // Pipeline — set by sales/ops in the CRM, initialised here
  leadStatus: "new";
  assignedRep?: string;
  onboardingStatus: "not_started";
  consentAt: string;
  createdAt: string;
}

export interface ContactMessage {
  refId: string;
  name: string;
  email: string;
  phone?: string;
  topic: "order" | "account" | "partner" | "press" | "other";
  orderRef?: string;
  message: string;
  language: Locale;
  sessionId?: string;
  source?: string;
  campaign?: string;
  consentAt: string;
  createdAt: string;
}

export interface WhatsAppClick {
  refId: string;
  ctaLocation: string;
  intent: string;
  page: string;
  language: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  at: string;
}

/** Every CRM integration implements this. Swap providers with CRM_PROVIDER — no code changes. */
export interface CrmAdapter {
  name: string;
  createPartnerLead(lead: PartnerLead): Promise<void>;
  createContactMessage(msg: ContactMessage): Promise<void>;
  logWhatsAppClick(click: WhatsAppClick): Promise<void>;
}
