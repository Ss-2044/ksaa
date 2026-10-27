import { site } from "@/config/site";

export const hasWhatsApp = Boolean(site.contact.whatsapp);

/** wa.me link with a prefilled message and a reference ID support can search for. */
export function whatsappUrl(message: string, refId: string): string {
  const text = `${message} Ref: ${refId}`;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
}
