import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Locale } from "@/config/site";
import { site } from "@/config/site";

/**
 * Deliver Me logo — renders the supplied brand files from /public/brand exactly as provided.
 * The mark is never redrawn in code. See public/brand/README.md for the expected files.
 *
 *   variant  horizontal → nav bar lockup
 *            compact    → icon + wordmark for footers / small spaces
 *            icon       → icon only (app-icon tile)
 *   tone     onLight → dark charcoal lockup for cream/white backgrounds
 *            onDark  → cream wordmark + terracotta icon for charcoal backgrounds
 */
type Variant = "horizontal" | "compact" | "icon";
type Tone = "onLight" | "onDark";

const files: Record<Variant, Record<Tone, string>> = {
  horizontal: { onLight: "logo-horizontal-dark", onDark: "logo-horizontal-light" },
  compact: { onLight: "logo-compact-dark", onDark: "logo-compact-light" },
  icon: { onLight: "logo-icon", onDark: "logo-icon-dark-bg" },
};

const EXTS = ["svg", "png", "webp"];

function resolveAsset(name: string): { src: string; width: number; height: number } | null {
  const dir = path.join(process.cwd(), "public", "brand");
  for (const ext of EXTS) {
    const file = path.join(dir, `${name}.${ext}`);
    if (!fs.existsSync(file)) continue;
    let width = 0;
    let height = 0;
    if (ext === "svg") {
      const svg = fs.readFileSync(file, "utf8");
      const vb = svg.match(/viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/);
      if (vb) [width, height] = [Number(vb[1]), Number(vb[2])];
    } else if (ext === "png") {
      const buf = fs.readFileSync(file);
      width = buf.readUInt32BE(16);
      height = buf.readUInt32BE(20);
    }
    return { src: `/brand/${name}.${ext}`, width: width || 200, height: height || 60 };
  }
  return null;
}

export function Logo({
  locale,
  variant = "horizontal",
  tone = "onLight",
  className = "",
  height = 36,
  priority = false,
}: {
  locale: Locale;
  variant?: Variant;
  tone?: Tone;
  className?: string;
  /** Rendered height in px; width follows the file's aspect ratio */
  height?: number;
  priority?: boolean;
}) {
  const label = locale === "ar" ? `${site.name.ar} — ${site.name.en}` : site.name.en;
  const asset = resolveAsset(files[variant][tone]);

  if (asset) {
    const width = Math.round((asset.width / asset.height) * height);
    return (
      // Plain <img>: brand SVGs must render pixel-exact and uncompressed.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={asset.src}
        alt={label}
        width={width}
        height={height}
        className={className}
        style={{ height, width: "auto" }}
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }

  // Temporary text fallback until the official files are added to /public/brand.
  // Intentionally plain — it does NOT imitate the logotype.
  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight ${tone === "onDark" ? "text-cream" : "text-ink"} ${className}`}
      style={{ fontSize: Math.round(height * 0.55) }}
      data-logo-fallback=""
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{variant === "icon" ? site.name[locale].slice(0, 1) : site.name[locale]}</span>
    </span>
  );
}
