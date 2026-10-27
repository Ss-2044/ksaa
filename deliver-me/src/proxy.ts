import { type NextRequest, NextResponse } from "next/server";

const LOCALES = ["ar", "en"] as const;
const DEFAULT = "ar";

function preferredLocale(req: NextRequest): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) return cookie;
  const header = req.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().slice(0, 2), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((r) => (LOCALES as readonly string[]).includes(r.lang))?.lang ?? DEFAULT;
}

/** Sends every un-prefixed URL to /ar/... or /en/... (visitor preference, then Arabic). */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const current = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (current) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip API, Next internals, metadata routes, the /download redirect and any file with an extension.
  matcher: ["/((?!api|_next|download|sitemap.xml|robots.txt|manifest.webmanifest|.*\\..*).*)"],
};
