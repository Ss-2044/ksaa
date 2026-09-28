import { z } from "zod";

/**
 * Shared validation — the same schema runs in the browser (instant feedback)
 * and on the server (the only check that counts). Error messages are keys into
 * the dictionary's `form.errors`, so both languages stay in sync.
 */

/** Saudi mobile: 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX, 009665XXXXXXXX (spaces/dashes allowed). */
export const saudiMobile = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))))
  .refine((v) => /^(?:\+?966|00966|0)?5\d{8}$/.test(v), { message: "phone" })
  .transform((v) => "+966" + v.replace(/^(?:\+?966|00966|0)/, ""));

const text = (max: number) => z.string().trim().min(1, { message: "required" }).max(max, { message: "required" });

export const businessTypes = ["restaurant", "cafe", "grocery", "other"] as const;
export const branchOptions = ["1", "2-5", "6+"] as const;
export const volumeOptions = ["lt20", "20-50", "50-150", "150+", "unknown"] as const;

export const partnerStep1 = z.object({
  businessType: z.enum(businessTypes, { message: "choose" }),
  businessName: text(120),
});

export const partnerStep2 = z.object({
  city: text(60),
  branches: z.enum(branchOptions, { message: "choose" }),
  estimatedDailyOrders: z.enum(volumeOptions).optional(),
});

export const partnerStep3 = z.object({
  contactName: text(100),
  phone: saudiMobile,
  email: z.string().trim().max(160).email({ message: "email" }),
  consent: z.literal(true, { message: "consent" }),
});

export const attributionSchema = z
  .object({
    session_id: z.string().max(40).optional(),
    utm_source: z.string().max(100).optional(),
    utm_medium: z.string().max(100).optional(),
    utm_campaign: z.string().max(100).optional(),
    landing_page: z.string().max(200).optional(),
  })
  .partial();

export const spamGuard = z.object({
  /** Honeypot — must stay empty */
  company_website: z.string().max(0).optional(),
  /** ms timestamp when the form was rendered — bots submit instantly */
  startedAt: z.number().int().positive(),
});

export const partnerLeadSchema = partnerStep1
  .merge(partnerStep2)
  .merge(partnerStep3)
  .merge(spamGuard)
  .extend({
    language: z.enum(["en", "ar"]),
    refId: z.string().regex(/^DM-[A-Z0-9]{5}$/),
    attribution: attributionSchema.optional(),
  });

export const contactTopics = ["order", "account", "partner", "press", "other"] as const;

export const contactSchema = z
  .object({
    name: text(100),
    email: z.string().trim().max(160).email({ message: "email" }),
    phone: z.union([z.literal(""), saudiMobile]).optional(),
    topic: z.enum(contactTopics, { message: "choose" }),
    orderRef: z.string().trim().max(40).optional(),
    message: z.string().trim().min(10, { message: "tooShort" }).max(3000),
    consent: z.literal(true, { message: "consent" }),
    language: z.enum(["en", "ar"]),
    refId: z.string().regex(/^DM-[A-Z0-9]{5}$/),
    attribution: attributionSchema.optional(),
  })
  .merge(spamGuard);

export const whatsappClickSchema = z.object({
  refId: z.string().regex(/^DM-[A-Z0-9]{5}$/),
  ctaLocation: z.string().max(40),
  intent: z.string().max(20),
  page: z.string().max(200),
  language: z.enum(["en", "ar"]),
  attribution: attributionSchema.optional(),
});

export type ErrorKey = "required" | "email" | "phone" | "consent" | "tooShort" | "choose";

/** Flatten a zod error into { field: errorKey } */
export function fieldErrors(error: z.ZodError): Record<string, ErrorKey> {
  const out: Record<string, ErrorKey> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (out[key]) continue;
    const msg = issue.message as ErrorKey;
    out[key] = ["required", "email", "phone", "consent", "tooShort", "choose"].includes(msg) ? msg : "required";
  }
  return out;
}
