import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { isProd, sessionSecret } from "./env";

type Kind = "user" | "signup" | "admin";

const COOKIE: Record<Kind, string> = {
  user: "mj_session",
  signup: "mj_signup",
  admin: "mj_admin",
};

const TTL_SECONDS: Record<Kind, number> = {
  user: 60 * 60 * 24 * 30,
  signup: 60 * 15,
  admin: 60 * 60 * 8,
};

async function sign(kind: Kind, sub: string) {
  return new SignJWT({ kind })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS[kind]}s`)
    .sign(sessionSecret());
}

export async function setSession(kind: Kind, sub: string) {
  const store = await cookies();
  store.set(COOKIE[kind], await sign(kind, sub), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS[kind],
  });
}

export async function clearSession(kind: Kind) {
  const store = await cookies();
  store.delete(COOKIE[kind]);
}

/** يعيد subject الجلسة (معرّف المستخدم / الجوال / معرّف المسؤول) أو null */
export async function readSession(kind: Kind): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE[kind])?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
    if (payload.kind !== kind || !payload.sub) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
