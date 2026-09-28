import { inputClass } from "@/components/styles";

// نموذج GET بسيط للفرز بالتاريخ (وأي حقول إضافية)
export function DateFilter({
  from,
  to,
  children,
}: {
  from: string;
  to: string;
  children?: React.ReactNode;
}) {
  return (
    <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">
        من
        <input type="date" name="from" defaultValue={from} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        إلى
        <input type="date" name="to" defaultValue={to} className={inputClass} />
      </label>
      {children}
      <button type="submit" className="h-11 rounded-xl bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700">تطبيق</button>
    </form>
  );
}
