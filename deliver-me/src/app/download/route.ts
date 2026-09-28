import { NextResponse } from "next/server";
import { site } from "@/config/site";

/**
 * Smart download link used by QR codes, the nav and the sticky bar:
 * iOS → App Store, Android → Google Play, otherwise the site's download section.
 * UTM parameters are forwarded to the store listing where supported.
 */
export function GET(req: Request) {
  const url = new URL(req.url);
  const ua = req.headers.get("user-agent") || "";
  const hl = url.searchParams.get("hl") === "en" ? "en" : "ar";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  let target = `${site.url}/${hl}#download`;
  if (isIOS && site.app.appStore) target = site.app.appStore;
  else if (isAndroid && site.app.googlePlay) {
    const gp = new URL(site.app.googlePlay);
    const src = url.searchParams.get("utm_source");
    if (src) gp.searchParams.set("referrer", `utm_source=${src}&utm_medium=${url.searchParams.get("utm_medium") ?? ""}`);
    target = gp.toString();
  }
  return NextResponse.redirect(target, 302);
}
