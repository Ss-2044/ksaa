import type { ReactNode } from "react";

export function Eyebrow({ children, tone = "light", className = "" }: { children: ReactNode; tone?: "light" | "dark"; className?: string }) {
  return (
    <p className={`text-label flex items-center gap-3 ${tone === "dark" ? "text-terra-soft" : "text-terra-ink"} ${className}`}>
      <span aria-hidden="true" className="inline-block h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}

/** Standard section heading block. `as` keeps the heading hierarchy correct per page. */
export function SectionHeader({
  eyebrow,
  title,
  sub,
  tone = "light",
  align = "start",
  as: As = "h2",
  className = "",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  tone?: "light" | "dark";
  align?: "start" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}) {
  const center = align === "center";
  return (
    <header className={`${center ? "mx-auto text-center" : ""} max-w-3xl ${className}`} data-reveal="">
      {eyebrow && <Eyebrow tone={tone} className={`mb-5 ${center ? "justify-center" : ""}`}>{eyebrow}</Eyebrow>}
      <As id={id} className={`${As === "h1" ? "text-h1" : "text-h2"} ${tone === "dark" ? "text-cream" : "text-ink"}`}>
        {title}
      </As>
      {sub && <p className={`text-lead mt-5 ${tone === "dark" ? "text-stone-soft" : "text-stone"} ${center ? "mx-auto" : ""} max-w-2xl`}>{sub}</p>}
    </header>
  );
}

export function SampleBadge({ label }: { label: string }) {
  return (
    <span className="absolute top-3 start-3 z-10 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-cream">{label}</span>
  );
}
