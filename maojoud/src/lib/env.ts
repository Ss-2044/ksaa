import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}`);
  return v;
}

export const isProd = process.env.NODE_ENV === "production";

export function sessionSecret() {
  const s = required("SESSION_SECRET");
  if (s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(s);
}

export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function adminPath() {
  return (process.env.ADMIN_PATH || "").replace(/^\/+|\/+$/g, "");
}

/**
 * وضع العرض التجريبي (DEMO_MODE=true): يسمح برمز تحقق يظهر على الشاشة ودفع تجريبي
 * عند عدم ضبط مفاتيح Authentica ومُيسر. لا تفعّله في الإطلاق الفعلي — أي شخص يستطيع الدخول بأي رقم.
 */
export const demoMode = () => process.env.DEMO_MODE === "true";

/** بدائل التطوير (رمز محلي، دفع تجريبي) مسموحة في بيئة التطوير أو وضع العرض التجريبي فقط */
export const allowFallbacks = () => !isProd || demoMode();

// عدد أرقام رمز التحقق — يجب أن يطابق قالب Authentica (يُقرأ وقت التشغيل)
export const otpLength = () => Number(process.env.OTP_LENGTH || 4);

export const authenticaEnabled = () => !!process.env.AUTHENTICA_API_KEY;
export const moyasarEnabled = () =>
  !!process.env.MOYASAR_PUBLISHABLE_KEY && !!process.env.MOYASAR_SECRET_KEY;
