import { NextResponse } from "next/server";
import { getCrm } from "@/lib/crm";
import { contactSchema, fieldErrors } from "@/lib/forms/schemas";
import { clientIp, MIN_FILL_MS, rateLimit, sameOrigin } from "@/lib/forms/rate-limit";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const limit = rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;
  if (d.company_website || Date.now() - d.startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true, refId: d.refId });
  }

  const now = new Date().toISOString();
  try {
    await getCrm().createContactMessage({
      refId: d.refId,
      name: d.name,
      email: d.email,
      phone: d.phone || undefined,
      topic: d.topic,
      orderRef: d.orderRef || undefined,
      message: d.message,
      language: d.language,
      sessionId: d.attribution?.session_id,
      source: d.attribution?.utm_source,
      campaign: d.attribution?.utm_campaign,
      consentAt: now,
      createdAt: now,
    });
  } catch (err) {
    console.error("[contact] CRM error", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "server" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, refId: d.refId });
}
