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

export const authenticaEnabled = () => !!process.env.AUTHENTICA_API_KEY;
export const moyasarEnabled = () =>
  !!process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY && !!process.env.MOYASAR_SECRET_KEY;
