import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-bold">الصفحة غير موجودة</h1>
      <Link href="/" className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white">العودة للرئيسية</Link>
    </div>
  );
}
