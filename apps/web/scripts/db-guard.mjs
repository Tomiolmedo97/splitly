// Guardas para no tocar la base de producción por accidente.
// Las usan scripts/migrate-production.mjs y prisma/seed.ts. Nunca loguean URLs ni credenciales.
//
// PROD_DB_HOST es una variable NO secreta con el host de la base de producción de Neon
// (con o sin "-pooler", da igual). Si falta, se asume lo peor: ni el seed ni la
// migración de preview corren.

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** Host de una URL de Postgres, en minúsculas, o null si no se puede leer. */
export function dbHost(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase() || null;
  } catch {
    return null;
  }
}

/** Identifica el endpoint de Neon: el host sin el sufijo "-pooler" del primer segmento. */
function endpointKey(host) {
  const [first, ...rest] = host.split(".");
  return [first.replace(/-pooler$/, ""), ...rest].join(".");
}

/** true si alguna de las URLs apunta a la base de producción, o si no se puede descartar. */
export function pointsToProduction(env) {
  const prod = dbHost(env.PROD_DB_HOST?.includes("://") ? env.PROD_DB_HOST : `postgres://${env.PROD_DB_HOST ?? ""}`);
  if (!env.PROD_DB_HOST || !prod) return true;
  const urls = [env.DATABASE_URL, env.DATABASE_URL_UNPOOLED].filter(Boolean);
  return urls.some((u) => {
    const h = dbHost(u);
    return h === null || endpointKey(h) === endpointKey(prod);
  });
}

/** true si todas las URLs presentes apuntan a localhost (y hay al menos DATABASE_URL). */
export function isLocalDatabase(env) {
  if (!env.DATABASE_URL) return false;
  const urls = [env.DATABASE_URL, env.DATABASE_URL_UNPOOLED].filter(Boolean);
  return urls.every((u) => LOCAL_HOSTS.has(dbHost(u) ?? ""));
}

/**
 * El seed corre solo:
 * - con DATABASE_URL a localhost (local o CI), o
 * - con VERCEL_ENV=preview y URLs que seguro no son las de producción.
 * En cualquier otro caso se niega, aunque falte VERCEL_ENV (p. ej. después de `vercel env pull`).
 */
export function canSeed(env) {
  if (env.VERCEL_ENV === "production") return false;
  if (isLocalDatabase(env)) return true;
  return env.VERCEL_ENV === "preview" && !pointsToProduction(env);
}

/** Un preview migra solo si sus URLs seguro no son las de producción. */
export function canMigratePreview(env) {
  return !pointsToProduction(env);
}
