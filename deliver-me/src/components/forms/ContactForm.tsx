"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getAttribution, newRefId } from "@/lib/analytics/context";
import { track } from "@/lib/analytics/track";
import { contactSchema, type ErrorKey, fieldErrors } from "@/lib/forms/schemas";
import { Button } from "../ui/Button";
import { Field, Honeypot, inputCls } from "./Field";

export function ContactForm({
  locale,
  copy,
  errors: errorCopy,
  partnerCopy,
  privacyHref,
}: {
  locale: Locale;
  copy: Dictionary["form"]["contact"];
  errors: Dictionary["form"]["errors"];
  partnerCopy: Dictionary["form"]["partner"];
  privacyHref: string;
}) {
  const [v, setV] = useState({ name: "", email: "", phone: "", topic: "", orderRef: "", message: "", consent: false });
  const [errs, setErrs] = useState<Record<string, ErrorKey>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error" | "rate">("idle");
  const [refId, setRefId] = useState("");
  const [honey, setHoney] = useState("");
  const started = useRef(0);
  const doneRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    started.current = Date.now();
  }, []);

  const set = (k: keyof typeof v, val: string | boolean) => {
    setV((s) => ({ ...s, [k]: val }));
    setErrs((e) => ({ ...e, [k]: undefined as unknown as ErrorKey }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = refId || newRefId();
    setRefId(id);
    const attr = getAttribution();
    const payload = {
      ...v,
      language: locale,
      refId: id,
      startedAt: started.current || 1,
      company_website: honey,
      attribution: { session_id: attr.session_id, utm_source: attr.utm_source, utm_medium: attr.utm_medium, utm_campaign: attr.utm_campaign },
    };
    const r = contactSchema.safeParse(payload);
    if (!r.success) {
      const fe = fieldErrors(r.error);
      setErrs(fe);
      document.getElementById(`cf-${Object.keys(fe)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.status === 429) return setStatus("rate");
      if (!res.ok) return setStatus("error");
      track("contact_submitted", { topic: v.topic, ref_id: id });
      setStatus("done");
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("error");
    }
  };

  const err = (k: string) => (errs[k] ? errorCopy[errs[k]] : undefined);
  const aria = (k: string) => ({ "aria-invalid": errs[k] ? true : undefined, "aria-describedby": errs[k] ? `cf-${k}-error` : undefined });

  if (status === "done") {
    return (
      <div className="rounded-[var(--radius-xl)] bg-paper p-8 shadow-card" role="status">
        <h3 ref={doneRef} tabIndex={-1} className="text-h3 outline-none">{copy.successTitle}</h3>
        <p className="mt-2 text-stone">
          {copy.successBody} <strong dir="ltr" className="text-ink">{refId}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-6 rounded-[var(--radius-xl)] bg-paper p-6 shadow-card md:p-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="cf-name" label={copy.name} error={err("name")}>
          <input id="cf-name" className={inputCls} value={v.name} autoComplete="name" maxLength={100} onChange={(e) => set("name", e.target.value)} {...aria("name")} />
        </Field>
        <Field id="cf-email" label={copy.email} error={err("email")}>
          <input id="cf-email" dir="ltr" type="email" className={inputCls} value={v.email} autoComplete="email" maxLength={160} onChange={(e) => set("email", e.target.value)} {...aria("email")} />
        </Field>
        <Field id="cf-phone" label={copy.phone} error={err("phone")}>
          <input id="cf-phone" dir="ltr" type="tel" className={inputCls} value={v.phone} autoComplete="tel" maxLength={20} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} />
        </Field>
        <Field id="cf-topic" label={copy.topic} error={err("topic")}>
          <select id="cf-topic" className={inputCls} value={v.topic} onChange={(e) => set("topic", e.target.value)} {...aria("topic")}>
            <option value="">—</option>
            {(Object.entries(copy.topics) as [string, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </div>
      {(v.topic === "order" || v.topic === "account") && (
        <Field id="cf-orderRef" label={copy.orderRef}>
          <input id="cf-orderRef" dir="ltr" className={inputCls} value={v.orderRef} maxLength={40} onChange={(e) => set("orderRef", e.target.value)} />
        </Field>
      )}
      <Field id="cf-message" label={copy.message} error={err("message")}>
        <textarea id="cf-message" rows={5} className={inputCls} value={v.message} maxLength={3000} onChange={(e) => set("message", e.target.value)} {...aria("message")} />
      </Field>
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input id="cf-consent" type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--color-terra-btn)]" {...aria("consent")} />
          <span className="text-[0.9375rem] text-stone">
            {copy.consent} <Link href={privacyHref} target="_blank" className="font-semibold text-terra-ink underline">{partnerCopy.privacyLink}</Link>.
          </span>
        </label>
        {errs.consent && <p id="cf-consent-error" className="mt-2 text-sm font-semibold text-terra-ink" role="alert">{err("consent")}</p>}
      </div>
      <Honeypot value={honey} onChange={setHoney} />
      {(status === "error" || status === "rate") && (
        <p className="rounded-md bg-terra-wash p-4 font-semibold text-terra-ink" role="alert">
          {status === "rate" ? partnerCopy.errorRate : partnerCopy.errorGeneric}
        </p>
      )}
      <Button type="submit" icon="arrow" disabled={status === "sending"}>
        {status === "sending" ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
