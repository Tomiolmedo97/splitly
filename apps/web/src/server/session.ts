import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

/**
 * Sesiones en la base (tabla Session de Auth.js): la cookie lleva un token opaco
 * aleatorio y en la base se guarda SOLO su SHA-256. Si alguien lee la tabla, no
 * puede armar cookies válidas. Cerrar sesión borra la fila: la cookie deja de
 * servir al instante, en todos lados.
 *
 * No usamos el provider de credenciales de Auth.js porque fuerza sesiones JWT;
 * con esto mantenemos sesiones revocables y el mismo esquema para sumar OAuth después.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

const isProd = process.env.NODE_ENV === "production";
/** En producción, prefijo __Host-: obliga Secure, Path=/ y sin Domain (no la pisa un subdominio). */
export const SESSION_COOKIE = isProd ? "__Host-splitly.session" : "splitly.session";

export type SessionUser = { id: string; email: string; name: string };

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await db.session.create({ data: { sessionToken: hashSessionToken(token), userId, expires } });
  // Limpieza oportunista de sesiones vencidas de esta persona.
  await db.session.deleteMany({ where: { userId, expires: { lt: new Date() } } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

/** Usuario de la sesión actual, o null si no hay cookie, no existe o venció. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { sessionToken: hashSessionToken(token) },
    select: { expires: true, user: { select: { id: true, email: true, name: true } } },
  });
  if (!session || session.expires.getTime() <= Date.now()) return null;
  return session.user;
}

/** Borra la sesión actual (fila y cookie). Sin sesión no hace nada. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { sessionToken: hashSessionToken(token) } });
  store.delete(SESSION_COOKIE);
}
