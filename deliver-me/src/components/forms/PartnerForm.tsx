"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/config/site";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getAttribution, newRefId } from "@/lib/analytics/context";
import { track } from "@/lib/analytics/track";
import { type ErrorKey, fieldErrors, partnerStep1, partnerStep2, partnerStep3 } from "@/lib/forms/schemas";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Field, Honeypot, inputCls } from "./Field";

type Values = {
  businessType: string;
  businessName: string;
  city: string;
  otherCity: string;
  branches: string;
  estimatedDailyOrders: string;
  contactName: string;
  phone: string;
  email: string;
  consent: boolean;
};

const schemas = [partnerStep1, partnerStep2, partnerStep3];
const stepNames = ["business", "location", "contact"];

/** Three short steps instead of one long form. Validates per step, submits once. */
export function PartnerForm({
  locale,
  copy,
  errors: errorCopy,
  cities,
  initialType,
  privacyHref,
}: {
  locale: Locale;
  copy: Dictionary["form"]["partner"];
  errors: Dictionary["form"]["errors"];
  cities: { slug: string; name: string }[];
  initialType?: string;
  privacyHref: string;
}) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState<Values>({
    businessType: ["restaurant", "cafe", "grocery", "other"].includes(initialType ?? "") ? initialType! : "",
    businessName: "",
    city: "",
    otherCity: "",
    branches: "1",
    estimatedDailyOrders: "",
    contactName: "",
    phone: "",
    email: "",
    consent: false,
  });
  const [errs, setErrs] = useState<Record<string, ErrorKey>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error" | "rate">("idle");
  const [refId, setRefId] = useState("");
  const [honey, setHoney] = useState("");
  const started = useRef(0);
  const startedTracked = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    started.current = Date.now();
  }, []);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    if (!startedTracked.current) {
      startedTracked.current = true;
      track("partner_signup_started", { business_type: v.businessType || undefined, cta_location: "partner_page" });
    }
    setV((s) => ({ ...s, [k]: val }));
    setErrs((e) => {
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  const stepData = (i: number) => {
    if (i === 0) return { businessType: v.businessType, businessName: v.businessName };
    if (i === 1)
      return {
        city: v.city === "other" ? v.otherCity : v.city,
        branches: v.branches,
        estimatedDailyOrders: v.estimatedDailyOrders || undefined,
      };
    return { contactName: v.contactName, phone: v.phone, email: v.email, consent: v.consent };
  };

  const validate = (i: number) => {
    const r = schemas[i].safeParse(stepData(i));
    if (r.success) return r.data;
    const fe = fieldErrors(r.error);
    if (i === 1 && fe.city && v.city === "other") {
      fe.otherCity = fe.city;
      delete fe.city;
    }
    setErrs(fe);
    const first = Object.keys(fe)[0];
    document.getElementById(`pf-${first}`)?.focus();
    return null;
  };

  const next = () => {
    if (!validate(step)) return;
    track("partner_signup_step_completed", { step: step + 1, step_name: stepNames[step] });
    setStep(step + 1);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) return next();
    const s3 = validate(2);
    if (!s3) return;
    const id = refId || newRefId();
    setRefId(id);
    setStatus("sending");
    const attr = getAttribution();
    try {
      const res = await fetch("/api/partner-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...stepData(0),
          ...stepData(1),
          ...s3,
          language: locale,
          refId: id,
          startedAt: started.current,
          company_website: honey,
          attribution: { session_id: attr.session_id, utm_source: attr.utm_source, utm_medium: attr.utm_medium, utm_campaign: attr.utm_campaign, landing_page: attr.landing_page },
        }),
      });
      if (res.status === 429) return setStatus("rate");
      if (res.status === 422) {
        const j = (await res.json()) as { fields?: Record<string, ErrorKey> };
        setErrs(j.fields ?? {});
        setStatus("idle");
        return;
      }
      if (!res.ok) return setStatus("error");
      track("partner_signup_step_completed", { step: 3, step_name: stepNames[2] });
      track("partner_signup_completed", { business_type: v.businessType, city: String(stepData(1).city), ref_id: id });
      setStatus("done");
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch {
      setStatus("error");
    }
  };

  const err = (k: string) => (errs[k] ? errorCopy[errs[k]] : undefined);
  const aria = (k: string) => ({ "aria-invalid": errs[k] ? true : undefined, "aria-describedby": errs[k] ? `pf-${k}-error` : undefined });

  if (status === "done") {
    return (
      <div className="rounded-[var(--radius-xl)] bg-paper p-8 text-center shadow-card md:p-12" role="status">
        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-sage-wash text-sage-ink">
          <Icon name="check" size={32} />
        </span>
        <h3 ref={headingRef} tabIndex={-1} className="text-h2 mt-6 outline-none">{copy.successTitle}</h3>
        <p className="text-lead mt-3 text-stone">
          {copy.successBody} <strong dir="ltr" className="text-ink">{refId}</strong>
        </p>
      </div>
    );
  }

  const types = Object.entries(copy.businessTypes) as [string, string][];

  return (
    <form onSubmit={submit} noValidate className="relative rounded-[var(--radius-xl)] bg-paper p-6 shadow-card md:p-10">
      {/* Progress */}
      <div className="flex items-center gap-2" aria-hidden="true">
        {copy.steps.map((_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-terra-btn" : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-4 text-sm text-stone">{copy.stepOf.replace("{n}", String(step + 1)).replace("{total}", "3")}</p>
      <h3 ref={headingRef} tabIndex={-1} className="text-h3 mt-1 outline-none">{copy.steps[step]}</h3>

      <div className="mt-8 space-y-6">
        {step === 0 && (
          <>
            <fieldset>
              <legend className="mb-3 font-semibold">{copy.businessType}</legend>
              <div className="grid grid-cols-2 gap-3" id="pf-businessType" tabIndex={-1}>
                {types.map(([value, label]) => (
                  <label key={value} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 font-semibold transition has-focus-visible:outline-3 has-focus-visible:outline-terra-btn ${v.businessType === value ? "border-terra-btn bg-terra-wash" : "border-line hover:border-ink"}`}>
                    <input type="radio" name="businessType" value={value} checked={v.businessType === value} onChange={() => set("businessType", value)} className="size-5 accent-[var(--color-terra-btn)]" />
                    {label}
                  </label>
                ))}
              </div>
              {errs.businessType && <p className="mt-2 text-sm font-semibold text-terra-ink" role="alert">{err("businessType")}</p>}
            </fieldset>
            <Field id="pf-businessName" label={copy.businessName} error={err("businessName")}>
              <input id="pf-businessName" className={inputCls} value={v.businessName} placeholder={copy.businessNamePlaceholder} autoComplete="organization" maxLength={120} onChange={(e) => set("businessName", e.target.value)} {...aria("businessName")} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field id="pf-city" label={copy.city} error={err("city")}>
              <select id="pf-city" className={inputCls} value={v.city} onChange={(e) => set("city", e.target.value)} {...aria("city")}>
                <option value="">{copy.cityPlaceholder}</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.name}>{c.name}</option>
                ))}
                <option value="other">{copy.otherCity}</option>
              </select>
            </Field>
            {v.city === "other" && (
              <Field id="pf-otherCity" label={copy.otherCityLabel} error={err("otherCity")}>
                <input id="pf-otherCity" className={inputCls} value={v.otherCity} maxLength={60} autoComplete="address-level2" onChange={(e) => set("otherCity", e.target.value)} {...aria("otherCity")} />
              </Field>
            )}
            <fieldset>
              <legend className="mb-3 font-semibold">{copy.branches}</legend>
              <div className="flex flex-wrap gap-3">
                {(Object.entries(copy.branchesOptions) as [string, string][]).map(([value, label]) => (
                  <label key={value} className={`flex min-h-12 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 font-semibold has-focus-visible:outline-3 has-focus-visible:outline-terra-btn ${v.branches === value ? "border-terra-btn bg-terra-wash" : "border-line"}`}>
                    <input type="radio" name="branches" className="sr-only" value={value} checked={v.branches === value} onChange={() => set("branches", value)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field id="pf-estimatedDailyOrders" label={copy.volume}>
              <select id="pf-estimatedDailyOrders" className={inputCls} value={v.estimatedDailyOrders} onChange={(e) => set("estimatedDailyOrders", e.target.value)}>
                <option value="">—</option>
                {(Object.entries(copy.volumeOptions) as [string, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field id="pf-contactName" label={copy.contactName} error={err("contactName")}>
              <input id="pf-contactName" className={inputCls} value={v.contactName} autoComplete="name" maxLength={100} onChange={(e) => set("contactName", e.target.value)} {...aria("contactName")} />
            </Field>
            <Field id="pf-phone" label={copy.phone} error={err("phone")} hint={copy.phoneHint}>
              <input id="pf-phone" className={inputCls} dir="ltr" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} maxLength={20} onChange={(e) => set("phone", e.target.value)} {...aria("phone")} aria-describedby={errs.phone ? "pf-phone-error" : "pf-phone-hint"} />
            </Field>
            <Field id="pf-email" label={copy.email} error={err("email")}>
              <input id="pf-email" className={inputCls} dir="ltr" type="email" inputMode="email" autoComplete="email" value={v.email} maxLength={160} onChange={(e) => set("email", e.target.value)} {...aria("email")} />
            </Field>
            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input id="pf-consent" type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} className="mt-1 size-5 shrink-0 accent-[var(--color-terra-btn)]" {...aria("consent")} />
                <span className="text-[0.9375rem] text-stone">
                  {copy.consent}{" "}
                  <Link href={privacyHref} className="font-semibold text-terra-ink underline" target="_blank">{copy.privacyLink}</Link>.
                </span>
              </label>
              {errs.consent && <p id="pf-consent-error" className="mt-2 text-sm font-semibold text-terra-ink" role="alert">{err("consent")}</p>}
            </div>
          </>
        )}
      </div>

      <Honeypot value={honey} onChange={setHoney} />

      {(status === "error" || status === "rate") && (
        <p className="mt-6 rounded-md bg-terra-wash p-4 font-semibold text-terra-ink" role="alert">
          {status === "rate" ? copy.errorRate : copy.errorGeneric}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
            {copy.back}
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" icon="arrow" disabled={status === "sending"}>
          {status === "sending" ? copy.submitting : step < 2 ? copy.next : copy.submit}
        </Button>
      </div>
    </form>
  );
}
