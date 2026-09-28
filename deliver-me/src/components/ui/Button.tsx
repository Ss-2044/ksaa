import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outlineLight";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-arrive)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none";

const variants: Record<Variant, string> = {
  // white on terra-btn = 5.28:1
  primary: "bg-terra-btn text-white shadow-[0_8px_20px_-8px_rgb(184_71_47/0.55)] hover:bg-terra-deep",
  secondary: "bg-transparent text-ink ring-1 ring-inset ring-ink/25 hover:ring-ink hover:bg-ink/[0.04]",
  ghost: "bg-transparent text-terra-ink underline-offset-4 hover:underline px-0!",
  light: "bg-cream text-ink hover:bg-white",
  outlineLight: "bg-transparent text-cream ring-1 ring-inset ring-cream/35 hover:ring-cream hover:bg-cream/5",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-[0.9375rem]",
  lg: "min-h-14 px-7 text-base md:text-[1.0625rem]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

function Arrow({ icon }: { icon?: IconName | false }) {
  if (icon === false) return null;
  return (
    <Icon
      name={icon ?? "arrow"}
      size={18}
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
    />
  );
}

type Common = { variant?: Variant; size?: Size; icon?: IconName | false; iconStart?: IconName; children: ReactNode; className?: string };

export function ButtonLink({
  href,
  variant,
  size,
  icon,
  iconStart,
  children,
  className = "",
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<ComponentProps<"a">, "href" | "children" | "className">) {
  const cls = buttonClasses(variant, size, className);
  const inner = (
    <>
      {iconStart && <Icon name={iconStart} size={20} className="shrink-0" />}
      <span>{children}</span>
      <Arrow icon={iconStart ? false : icon} />
    </>
  );
  if (external || href.startsWith("http")) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  );
}

export function Button({
  variant,
  size,
  icon = false,
  iconStart,
  children,
  className = "",
  ...rest
}: Common & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {iconStart && <Icon name={iconStart} size={20} className="shrink-0" />}
      <span>{children}</span>
      <Arrow icon={icon} />
    </button>
  );
}

export function IconButton({
  label,
  icon,
  className = "",
  ...rest
}: { label: string; icon: IconName; className?: string } & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      aria-label={label}
      className={`inline-flex size-12 items-center justify-center rounded-full transition-colors hover:bg-ink/[0.06] ${className}`}
      {...rest}
    >
      <Icon name={icon} size={22} />
    </button>
  );
}
