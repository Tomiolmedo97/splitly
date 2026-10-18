/**
 * Guarda de entorno de los e2e (ver docs/qa/e2e.md, "Guarda contra producción").
 *
 * La importa playwright.config.ts y corre al cargar la config, antes de que
 * Playwright lance un navegador o haga un request (también con --list).
 * Es una función pura sobre el env para poder probarla con Vitest
 * (apps/web/src/lib/e2e-guard.test.ts).
 *
 * Reglas:
 * 1. VERCEL_ENV=production: nunca.
 * 2. Host de producción (splitly-iota.vercel.app y los alias *.vercel.app del
 *    deploy de producción): nunca, tampoco con opt-in ni en modo solo lectura.
 * 3. localhost, 127.0.0.1 o ::1: siempre (es la base local).
 * 4. Cualquier otro host (un preview): solo con E2E_ALLOW_REMOTE=1 (corrida que
 *    escribe: registra usuarios y crea grupos) o con E2E_READONLY=1 (corren solo
 *    los specs con el tag @readonly).
 *
 * El host se normaliza antes de comparar: minúsculas, sin el punto final, sin
 * puerto y en su forma ASCII (punycode/IDN, lo que hace el parser WHATWG de URL).
 */
import { domainToASCII } from "node:url";

/** Hosts *.vercel.app que apuntan al deploy de producción del proyecto splitly. */
export const HOSTS_DE_PRODUCCION: readonly string[] = [
  "splitly-iota.vercel.app",
  "splitly-tomiolmedo97s-projects.vercel.app",
  "splitly-git-main-tomiolmedo97s-projects.vercel.app",
  "splitly-tomiolmedo97-tomiolmedo97s-projects.vercel.app",
];

const HOSTS_LOCALES: readonly string[] = ["localhost", "127.0.0.1", "::1"];

/** Tag de los specs que solo leen (no registran usuarios ni crean datos). */
export const TAG_SOLO_LECTURA = "@readonly";

/**
 * Detalles de test para marcar un spec como solo lectura: test("…", SOLO_LECTURA, async …).
 * Solo para specs que no registran usuarios, no ingresan, no crean datos y no
 * mandan formularios (solo navegan y miran).
 */
export const SOLO_LECTURA = { tag: TAG_SOLO_LECTURA };

export const URL_POR_DEFECTO = "http://localhost:3000";

export type EnvDeGuarda = Readonly<Record<string, string | undefined>>;

export type ResultadoGuarda =
  | { ok: true; modo: "local" | "remoto" | "solo-lectura"; host: string }
  | { ok: false; motivo: string };

/**
 * Host normalizado de una URL, o null si no se puede parsear o no es http(s).
 * "HTTPS://Splitly-IOTA.vercel.app.:443/x" → "splitly-iota.vercel.app";
 * "http://[::1]:3000" → "::1".
 */
export function normalizarHost(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  // hostname ya viene sin puerto, en minúsculas y en punycode (WHATWG URL).
  let host = parsed.hostname.toLowerCase();
  if (host.startsWith("[") && host.endsWith("]")) return host.slice(1, -1);
  host = host.replace(/\.+$/, "");
  if (!host) return null;
  // Segunda pasada IDN por las dudas (por ejemplo, un U-label que se haya colado).
  const ascii = domainToASCII(host);
  return ascii ? ascii.toLowerCase() : null;
}

export const activo = (valor: string | undefined) => valor === "1" || valor?.toLowerCase() === "true";

const VER_DOCS = "Ver docs/qa/e2e.md (Guarda contra producción).";

export function evaluarGuarda(env: EnvDeGuarda): ResultadoGuarda {
  if (env.VERCEL_ENV === "production") {
    return { ok: false, motivo: `Los e2e no corren con VERCEL_ENV=production. ${VER_DOCS}` };
  }
  const url = env.E2E_BASE_URL?.trim() || URL_POR_DEFECTO;
  const host = normalizarHost(url);
  if (!host) {
    return {
      ok: false,
      motivo: `E2E_BASE_URL no es una URL http(s) válida ("${url}"). Usá algo como http://localhost:3000. ${VER_DOCS}`,
    };
  }
  if (HOSTS_DE_PRODUCCION.includes(host)) {
    return {
      ok: false,
      motivo: `E2E_BASE_URL apunta a producción (${host}). Los e2e nunca corren contra producción, ni con E2E_ALLOW_REMOTE ni con E2E_READONLY. ${VER_DOCS}`,
    };
  }
  if (HOSTS_LOCALES.includes(host)) return { ok: true, modo: "local", host };
  if (activo(env.E2E_ALLOW_REMOTE)) return { ok: true, modo: "remoto", host };
  if (activo(env.E2E_READONLY)) return { ok: true, modo: "solo-lectura", host };
  return {
    ok: false,
    motivo:
      `E2E_BASE_URL apunta a un host remoto (${host}) y los e2e escriben datos (registran usuarios y crean grupos). ` +
      `Si es un preview, confirmalo con E2E_ALLOW_REMOTE=1, o corré solo los specs ${TAG_SOLO_LECTURA} con E2E_READONLY=1. ${VER_DOCS}`,
  };
}

/** Tira un Error con el motivo (en castellano) si el entorno no es seguro. */
export function asegurarEntornoE2E(env: EnvDeGuarda): Extract<ResultadoGuarda, { ok: true }> {
  const resultado = evaluarGuarda(env);
  if (!resultado.ok) throw new Error(`Guarda de e2e: ${resultado.motivo}`);
  return resultado;
}
