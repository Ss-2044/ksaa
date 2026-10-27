"use client";

import { Icon } from "../ui/Icon";
import { WhatsAppLink } from "./WhatsAppLink";

/**
 * Persistent, on-brand WhatsApp entry point: a charcoal pill that sits bottom-end,
 * lifts above the mobile app bar when it shows (via --dm-bar-offset), and never
 * adds height to the document (fixed, no wrapper).
 */
export function FloatingWhatsApp({ number, message, label, short }: { number: string; message: string; label: string; short: string }) {
  return (
    <WhatsAppLink
      number={number}
      message={message}
      location="floating"
      ariaLabel={label}
      className="on-dark group fixed end-4 bottom-[calc(1rem+var(--dm-bar-offset,0px)+env(safe-area-inset-bottom))] z-30 inline-flex h-14 items-center gap-2 rounded-full bg-ink ps-4 pe-4 text-cream shadow-lift ring-1 ring-cream/10 transition-[transform,bottom,background-color] duration-300 ease-[var(--ease-arrive)] hover:-translate-y-0.5 hover:bg-char md:end-6 md:bottom-6 md:pe-5"
    >
      <span className="relative inline-flex">
        <Icon name="chat" size={24} />
        <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-sage ring-2 ring-ink" aria-hidden="true" />
      </span>
      <span className="hidden text-[0.9375rem] font-semibold md:inline">{short}</span>
    </WhatsAppLink>
  );
}
