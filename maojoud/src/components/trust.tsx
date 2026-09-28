import { BadgeCheck, CreditCard, RefreshCcw, ShieldCheck, Stethoscope, Truck } from "lucide-react";

// أيقونات الثقة في صفحة السلعة
const PRODUCT_BADGES = [
  { icon: BadgeCheck, title: "سلع أصلية 100%" },
  { icon: Truck, title: "توصيل سريع" },
  { icon: RefreshCcw, title: "استرجاع واستبدال سهل" },
  { icon: CreditCard, title: "دفع آمن" },
];

export function ProductTrustBadges() {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {PRODUCT_BADGES.map(({ icon: Icon, title }) => (
        <li key={title} className="flex flex-col items-center gap-2 rounded-xl bg-brand-50 px-2 py-3 text-center">
          <Icon className="size-6 text-brand-600" aria-hidden />
          <span className="text-[13px] font-semibold text-slate-800">{title}</span>
        </li>
      ))}
    </ul>
  );
}

// قسم "لما تشتري من موجود؟" في الصفحة الرئيسية
const WHY = [
  { icon: ShieldCheck, title: "الضمان الذهبي", text: "استرجع أموالك في حال عدم مطابقة السلعة للجودة المذكورة" },
  { icon: RefreshCcw, title: "استبدال بدون تعقيد", text: "استبدال بدون تعقيد وبدون شروط" },
  { icon: Stethoscope, title: "جميع الأجهزة مفحوصة", text: "نفحص الأجهزة قبل وصولها إليك" },
  { icon: Truck, title: "توصيل سريع", text: "نوصل طلبك إلى باب بيتك بسرعة" },
  { icon: CreditCard, title: "دفع آمن", text: "Apple Pay ومدى والبطاقات الائتمانية" },
];

export function WhyMaojoud() {
  return (
    <section aria-labelledby="why" className="rounded-3xl bg-gradient-to-bl from-brand-700 to-brand-600 px-5 py-8 text-white sm:px-8 sm:py-10">
      <h2 id="why" className="mb-6 text-center text-2xl font-bold sm:text-3xl">لما تشتري من موجود؟</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {WHY.map(({ icon: Icon, title, text }, i) => (
          <li
            key={title}
            className={`flex items-start gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 lg:flex-col lg:items-center lg:text-center ${
              i === 0 ? "bg-amber-300/20 ring-amber-200/40" : ""
            }`}
          >
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${i === 0 ? "bg-amber-300 text-amber-950" : "bg-white text-brand-700"}`}>
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-white/85">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
