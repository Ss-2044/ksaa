const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** يحوّل رقم جوال سعودي بأي صيغة شائعة إلى E.164: +9665XXXXXXXX — أو null إن كان غير صالح */
export function normalizeSaudiPhone(input: string): string | null {
  const ascii = input.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
  let digits = ascii.replace(/[^\d]/g, "");
  if (digits.startsWith("00966")) digits = digits.slice(5);
  else if (digits.startsWith("966")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^5\d{8}$/.test(digits)) return null;
  return `+966${digits}`;
}

export function displayPhone(e164: string) {
  return e164.replace(/^\+966/, "0");
}
