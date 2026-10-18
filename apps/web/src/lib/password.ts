import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Hash de contraseñas con argon2id (@node-rs/argon2: binario precompilado, sin
 * compilar nada en Vercel). Formato PHC estándar: $argon2id$v=19$m=...,t=...,p=...$sal$hash.
 *
 * Parámetros: 19 MiB, 2 iteraciones, 1 hilo (mínimo recomendado por OWASP para argon2id).
 * Quedan dentro del hash, así que se pueden subir más adelante sin romper los viejos.
 *
 * `verifyPassword` también acepta el formato scrypt anterior (scrypt$N$r$p$sal$hash),
 * que solo usó el seed local antes de este cambio.
 */
const ARGON2_OPTIONS = { algorithm: 2 /* Argon2id */, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export async function hashPassword(password: string): Promise<string> {
  return argon2Hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (stored.startsWith("$argon2")) return await argon2Verify(stored, password);
    if (stored.startsWith("scrypt$")) return await verifyLegacyScrypt(password, stored);
    return false;
  } catch {
    return false;
  }
}

/**
 * Hash de una contraseña que nadie tiene, con los mismos parámetros que los reales.
 * Se verifica contra él cuando el email no existe, para que ese caso tarde lo mismo
 * que una contraseña equivocada y no se pueda saber qué emails tienen cuenta.
 */
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword("splitly-dummy-password-que-nadie-usa");
  return dummyHash;
}

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

async function verifyLegacyScrypt(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6) return false;
  const [, n, r, p, saltB64, keyB64] = parts as [string, string, string, string, string, string];
  const expected = Buffer.from(keyB64, "base64url");
  if (expected.length === 0) return false;
  const key = await scrypt(password, Buffer.from(saltB64, "base64url"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(key, expected);
}
