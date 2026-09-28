import Link from "next/link";

// شعار المنصة يُستخدم كما هو دون إضافات. الملف الحالي public/brand/logo.svg مؤقت:
// استبدله بالشعار الرسمي، أو ضع ملفك (مثل logo.png) واضبط NEXT_PUBLIC_LOGO_URL=/brand/logo.png
const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || "/brand/logo.svg";

export function Logo({ className = "h-10" }: { className?: string }) {
  return (
    <Link href="/" aria-label="موجود — الصفحة الرئيسية" className="shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_URL} alt="موجود" className={`${className} w-auto`} />
    </Link>
  );
}
