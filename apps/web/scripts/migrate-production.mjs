// Aplica las migraciones pendientes en los deploys de Vercel. Nunca corre el seed.
// - production: migra la base de producción; si faltan las URLs, el deploy falla.
// - preview: migra la rama de Neon propia de ese preview (la crea la integración de Neon);
//   si el preview no tiene rama, se omite con un aviso.
// - CI y local (sin VERCEL_ENV): no toca ninguna base.
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV;
const hasUrls = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL_UNPOOLED);

if (env !== "production" && env !== "preview") {
  console.log(`[migrate] Se omite: VERCEL_ENV=${env ?? "-"}.`);
  process.exit(0);
}

if (!hasUrls) {
  if (env === "production") {
    console.error("[migrate] Faltan DATABASE_URL o DATABASE_URL_UNPOOLED en producción.");
    process.exit(1);
  }
  console.warn("[migrate] Preview sin rama de Neon: se omite la migración.");
  process.exit(0);
}

console.log(`[migrate] ${env}: prisma migrate deploy`);
execSync("prisma migrate deploy", { stdio: "inherit" });
