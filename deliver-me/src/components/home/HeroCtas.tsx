"use client";

import { ButtonLink } from "../ui/Button";
import { track } from "@/lib/analytics/track";

export function HeroCtas({ primaryHref, primary, browseHref, browse }: { primaryHref: string; primary: string; browseHref: string; browse: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <ButtonLink href={primaryHref} size="lg" onClick={() => track("hero_cta_clicked", { cta: "download" })}>
        {primary}
      </ButtonLink>
      <ButtonLink href={browseHref} size="lg" variant="secondary" icon="pin" onClick={() => track("hero_cta_clicked", { cta: "browse" })}>
        {browse}
      </ButtonLink>
    </div>
  );
}
