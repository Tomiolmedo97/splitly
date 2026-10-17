// Aplica las migraciones pendientes SOLO en el deploy de producción de Vercel.
// En previews, CI y local no toca ninguna base. Nunca corre el seed.
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV;

if (env !== "production") {
  console.log(`[migrate] Se omite: VERCEL_ENV=${env ?? "-"} (solo corre en producción).`);
  process.exit(0);
}

if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error("[migrate] Faltan DATABASE_URL o DIRECT_URL en el entorno de producción de Vercel.");
  process.exit(1);
}

console.log("[migrate] Producción: prisma migrate deploy");
execSync("prisma migrate deploy", { stdio: "inherit" });
