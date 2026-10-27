import { NextResponse } from "next/server";
import { getCrm } from "@/lib/crm";
import { fieldErrors, partnerLeadSchema } from "@/lib/forms/schemas";
import { clientIp, MIN_FILL_MS, rateLimit, sameOrigin } from "@/lib/forms/rate-limit";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const limit = rateLimit(`partner:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = partnerLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;

  // Spam: honeypot filled or impossibly fast. Pretend success so bots learn nothing.
  if (d.company_website || Date.now() - d.startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true, refId: d.refId });
  }

  const now = new Date().toISOString();
  try {
    await getCrm().createPartnerLead({
      refId: d.refId,
      businessType: d.businessType,
      businessName: d.businessName,
      city: d.city,
      branches: d.branches,
      estimatedDailyOrders: d.estimatedDailyOrders,
      contactName: d.contactName,
      phone: d.phone,
      email: d.email,
      language: d.language,
      source: d.attribution?.utm_source,
      medium: d.attribution?.utm_medium,
      campaign: d.attribution?.utm_campaign,
      landingPage: d.attribution?.landing_page,
      sessionId: d.attribution?.session_id,
      leadStatus: "new",
      onboardingStatus: "not_started",
      consentAt: now,
      createdAt: now,
    });
  } catch (err) {
    console.error("[partner-lead] CRM error", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "server" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, refId: d.refId });
}
