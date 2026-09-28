import { NextResponse, type NextRequest } from "next/server";

// لوحة التحكم مخفية: تعمل فقط عبر المسار السري ADMIN_PATH، ولا يوجد أي رابط لها داخل المنصة.
// المسار الداخلي /cp يعيد 404 عند طلبه مباشرة.
const INTERNAL = "/cp";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = (process.env.ADMIN_PATH || "").replace(/^\/+|\/+$/g, "");

  if (pathname === INTERNAL || pathname.startsWith(`${INTERNAL}/`)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (secret && (pathname === `/${secret}` || pathname.startsWith(`/${secret}/`))) {
    const url = req.nextUrl.clone();
    url.pathname = INTERNAL + pathname.slice(secret.length + 1);
    const res = NextResponse.rewrite(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|uploads/|brand/|favicon.ico).*)"],
};
