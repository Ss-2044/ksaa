"use client";

import { useEffect } from "react";

const copy = {
  en: { title: "Something went wrong.", body: "Please try again. If it keeps happening, reach us on WhatsApp.", retry: "Try again" },
  ar: { title: "صار خطأ.", body: "جرّب مرة ثانية. وإذا تكرر، كلّمنا واتساب.", retry: "جرّب مرة ثانية" },
};

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Hook for Sentry: Sentry.captureException(error)
    console.error(error);
  }, [error]);
  const c = typeof document !== "undefined" && document.documentElement.lang === "en" ? copy.en : copy.ar;
  return (
    <section className="container-site py-24">
      <h1 className="text-h1">{c.title}</h1>
      <p className="text-lead mt-4 text-stone">{c.body}</p>
      <button type="button" onClick={reset} className="mt-8 min-h-12 rounded-full bg-terra-btn px-6 font-semibold text-white hover:bg-terra-deep">
        {c.retry}
      </button>
    </section>
  );
}
