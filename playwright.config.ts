import { defineConfig, devices } from "@playwright/test";
import { BASE_URL, extraHTTPHeaders } from "./e2e/entorno";
import { TAG_SOLO_LECTURA, activo, asegurarEntornoE2E } from "./e2e/guarda";

/**
 * Configuración de Playwright para las pruebas punta a punta (e2e/).
 *
 * - baseURL: E2E_BASE_URL (por ejemplo, el preview de Vercel del PR);
 *   por defecto http://localhost:3000.
 * - Si existe VERCEL_AUTOMATION_BYPASS_SECRET, se manda el header de bypass
 *   de la protección de despliegues de Vercel.
 * - No levanta un servidor: hay que tenerlo corriendo (pnpm dev) o apuntar a un preview.
 * - Guarda (e2e/guarda.ts, docs/qa/e2e.md): corre al cargar esta config, antes de
 *   cualquier request (también con --list). Se niega con VERCEL_ENV=production, con
 *   el host de producción y con cualquier host remoto sin E2E_ALLOW_REMOTE=1. Con
 *   E2E_READONLY=1 corren solo los specs con el tag @readonly. Los tests crean
 *   usuarios y grupos de verdad.
 */
const guarda = asegurarEntornoE2E(process.env);
const MODO_SOLO_LECTURA = guarda.modo === "solo-lectura" || activo(process.env.E2E_READONLY);

/** axe y la pasada de 360 px corren solo en chromium (son de layout y a11y, no de motor). */
const SOLO_CHROMIUM = /accesibilidad\.spec\.ts$/;

export default defineConfig({
  testDir: "./e2e",
  // En modo solo lectura no corre ningún spec que escriba datos.
  ...(MODO_SOLO_LECTURA ? { grep: new RegExp(TAG_SOLO_LECTURA) } : {}),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Navegadores definidos en docs/qa/estrategia-de-pruebas.md.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: SOLO_CHROMIUM },
    { name: "mobile", use: { ...devices["Pixel 5"] }, testIgnore: SOLO_CHROMIUM },
  ],
});
