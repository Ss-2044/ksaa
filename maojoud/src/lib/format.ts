export function formatPrice(halalas: number) {
  const sar = halalas / 100;
  return `${sar.toLocaleString("ar-SA", { maximumFractionDigits: 2 })} ر.س`;
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(d: Date | string) {
  return new Date(d).toLocaleString("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initialOf(name: string) {
  return name.trim().charAt(0) || "؟";
}
