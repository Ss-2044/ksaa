import {
  Camera,
  Headphones,
  Laptop,
  Monitor,
  Package,
  Plug,
  Smartphone,
  Tablet,
  Watch,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  phone: { icon: Smartphone, label: "جوال" },
  laptop: { icon: Laptop, label: "لابتوب" },
  tablet: { icon: Tablet, label: "لوحي" },
  watch: { icon: Watch, label: "ساعة" },
  headphones: { icon: Headphones, label: "سماعة" },
  desktop: { icon: Monitor, label: "شاشة/كمبيوتر" },
  camera: { icon: Camera, label: "كاميرا" },
  accessories: { icon: Plug, label: "اكسسوار" },
  other: { icon: Package, label: "صندوق" },
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name]?.icon ?? Package;
  return <Icon className={className} aria-hidden />;
}
