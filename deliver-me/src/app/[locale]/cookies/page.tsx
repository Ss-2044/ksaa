import { LegalPage, legalMetadata } from "@/components/sections/LegalPage";
import type { Locale } from "@/config/site";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props) {
  return legalMetadata((await params).locale, "cookies");
}

export default async function Page({ params }: Props) {
  return <LegalPage locale={(await params).locale} doc="cookies" />;
}
