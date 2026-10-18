import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";

/**
 * Rate limit de ingreso y registro, con contadores en Postgres (tabla AuthRateLimit):
 * funciona igual con varias instancias de funciones en Vercel, sin Redis.
 *
 * Ámbitos separados: producción usa "prod" y todo lo demás (preview, local, E2E)
 * usa "test", con claves y límites propios. Así las suites no bloquean a nadie en
 * producción, y el límite por email sigue bajo en test para poder probar RATE_LIMITED.
 */
export type RateLimitAction = "login" | "register";
export type RateLimitBy = "ip" | "email";
type Rule = { limit: number; windowSeconds: number };

const FIFTEEN_MIN = 15 * 60;
const ONE_HOUR = 60 * 60;

export const RATE_LIMITS: Record<"prod" | "test", Record<`${RateLimitAction}:${RateLimitBy}`, Rule>> = {
  prod: {
    "login:ip": { limit: 30, windowSeconds: FIFTEEN_MIN },
    "login:email": { limit: 8, windowSeconds: FIFTEEN_MIN },
    "register:ip": { limit: 10, windowSeconds: ONE_HOUR },
    "register:email": { limit: 5, windowSeconds: ONE_HOUR },
  },
  test: {
    "login:ip": { limit: 1000, windowSeconds: FIFTEEN_MIN },
    "login:email": { limit: 8, windowSeconds: FIFTEEN_MIN },
    "register:ip": { limit: 1000, windowSeconds: ONE_HOUR },
    "register:email": { limit: 5, windowSeconds: ONE_HOUR },
  },
};

export function rateLimitScope(env: Record<string, string | undefined> = process.env): "prod" | "test" {
  return env.VERCEL_ENV === "production" ? "prod" : "test";
}

/** Clave hasheada: en la base no quedan emails ni IPs en claro. */
export function rateLimitKey(scope: string, action: RateLimitAction, by: RateLimitBy, value: string): string {
  return createHash("sha256").update(`${scope}:${action}:${by}:${value.toLowerCase()}`).digest("hex");
}

/** IP de quien llama. En Vercel, x-forwarded-for lo pone la plataforma (el cliente no lo puede falsear). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Suma un intento y devuelve true si todavía está dentro del límite. Atómico (un solo UPSERT). */
export async function consumeRateLimit(action: RateLimitAction, by: RateLimitBy, value: string): Promise<boolean> {
  const scope = rateLimitScope();
  const rule = RATE_LIMITS[scope][`${action}:${by}`];
  const key = rateLimitKey(scope, action, by, value);
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "AuthRateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, (now() AT TIME ZONE 'UTC'))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "AuthRateLimit"."windowStart" < (now() AT TIME ZONE 'UTC') - make_interval(secs => ${rule.windowSeconds}::int)
        THEN 1 ELSE "AuthRateLimit"."count" + 1 END,
      "windowStart" = CASE
        WHEN "AuthRateLimit"."windowStart" < (now() AT TIME ZONE 'UTC') - make_interval(secs => ${rule.windowSeconds}::int)
        THEN (now() AT TIME ZONE 'UTC') ELSE "AuthRateLimit"."windowStart" END
    RETURNING "count"`;
  return Number(rows[0]?.count ?? 0) <= rule.limit;
}

/** Reinicia un contador (p. ej. el del email después de un ingreso correcto). */
export async function resetRateLimit(action: RateLimitAction, by: RateLimitBy, value: string): Promise<void> {
  const key = rateLimitKey(rateLimitScope(), action, by, value);
  await db.authRateLimit.deleteMany({ where: { key } });
}
