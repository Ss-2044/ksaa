import type { ReactNode } from "react";

export const inputCls =
  "block w-full min-h-13 rounded-md border border-line bg-paper px-4 py-3 text-base text-ink placeholder:text-stone/70 transition-colors focus:border-ink focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-terra-btn aria-[invalid=true]:border-terra-ink";

export function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold">
        {label}
        {optional && <span className="ms-2 text-sm font-normal text-stone">({optional})</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1.5 text-sm text-stone">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-terra-ink" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input tabIndex={-1} autoComplete="off" name="company_website" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
