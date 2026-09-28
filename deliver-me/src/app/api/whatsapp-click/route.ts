import { NextResponse } from "next/server";
import { getCrm } from "@/lib/crm";
import { whatsappClickSchema } from "@/lib/forms/schemas";
import { clientIp, rateLimit } from "@/lib/forms/rate-limit";

/**
 * First-party, anonymous log of WhatsApp clicks (ref ID + CTA location + UTM).
 * Lets support match a "Ref: DM-XXXXX" chat to the campaign that brought the visitor,
 * without cookies or personal data. Always returns 204.
 */
export async function POST(req: Request) {
  if (!rateLimit(`wa:${clientIp(req)}`, 30, 60_000).ok) return new NextResponse(null, { status: 204 });
  try {
    const parsed = whatsappClickSchema.safeParse(await req.json());
    if (parsed.success) {
      const d = parsed.data;
      await getCrm().logWhatsAppClick({
        refId: d.refId,
        ctaLocation: d.ctaLocation,
        intent: d.intent,
        page: d.page,
        language: d.language,
        sessionId: d.attribution?.session_id,
        utmSource: d.attribution?.utm_source,
        utmMedium: d.attribution?.utm_medium,
        utmCampaign: d.attribution?.utm_campaign,
        at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("[whatsapp-click]", err instanceof Error ? err.message : err);
  }
  return new NextResponse(null, { status: 204 });
}
