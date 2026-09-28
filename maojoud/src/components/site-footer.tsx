export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-8 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} موجود — جميع الحقوق محفوظة</p>
        <p>دفع آمن عبر مُيسر · Apple Pay · مدى · فيزا · ماستركارد</p>
      </div>
    </footer>
  );
}
