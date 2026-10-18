// Guardas para no tocar la base de producción por accidente.
// Las usan scripts/migrate-production.mjs y prisma/seed.ts. Nunca loguean URLs ni credenciales.
//
// PROD_DB_HOST es una variable NO secreta con el host de la base de producción de Neon
// (con o sin "-pooler", da igual). Si falta, se asume lo peor: ni el seed ni la
// migración de preview corren.

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Parámetros con los que libpq o Neon eligen otro host/endpoint que el de la URL:
// si aparecen, la guarda no puede saber a dónde se conecta Prisma y devuelve null.
const HOST_OVERRIDE_PARAMS = new Set(["host", "hostaddr"]);

/** Host de una URL de Postgres, en minúsculas, o null si no se puede leer con certeza. */
export function dbHost(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    for (const [key, value] of parsed.searchParams) {
      const k = key.toLowerCase();
      if (HOST_OVERRIDE_PARAMS.has(k)) return null;
      // Neon acepta el endpoint como options=endpoint%3D... o options=project%3D...
      if (k === "options" && /(endpoint|project)\s*=/i.test(value)) return null;
    }
    // Sin el punto final: "host.neon.tech." resuelve igual que "host.neon.tech".
    return parsed.hostname.toLowerCase().replace(/\.+$/, "") || null;
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
 * El seed corre SOLO contra un Postgres en localhost (local o CI): todas las URLs
 * presentes tienen que tener host localhost, 127.0.0.1 o ::1, leído con new URL(), y sin
 * parámetros que cambien el host. Con cualquier VERCEL_ENV definido se niega (en preview
 * vuelve a correr cuando PROD_DB_HOST esté cargado). Sin VERCEL_ENV y con una base remota
 * también se niega (p. ej. después de `vercel env pull`).
 */
export function canSeed(env) {
  if (env.VERCEL_ENV !== undefined) return false;
  return isLocalDatabase(env);
}

/** Un preview migra solo si sus URLs seguro no son las de producción. */
export function canMigratePreview(env) {
  return !pointsToProduction(env);
}
