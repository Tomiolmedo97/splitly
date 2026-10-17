import { defineConfig, devices } from "@playwright/test";
import { BASE_URL, extraHTTPHeaders } from "./e2e/entorno";

/**
 * Configuración de Playwright para las pruebas punta a punta (e2e/).
 *
 * - baseURL: E2E_BASE_URL (por ejemplo, el preview de Vercel del PR);
 *   por defecto http://localhost:3000.
 * - Si existe VERCEL_AUTOMATION_BYPASS_SECRET, se manda el header de bypass
 *   de la protección de despliegues de Vercel.
 * - No levanta un servidor: hay que tenerlo corriendo (pnpm dev) o apuntar a un preview.
 * - Nunca contra la base de producción: ver docs/qa/e2e.md. Los tests crean
 *   usuarios y grupos de verdad.
 */
if (process.env.VERCEL_ENV === "production") {
  throw new Error("Los e2e no corren contra producción (VERCEL_ENV=production). Ver docs/qa/e2e.md.");
}

/** axe y la pasada de 360 px corren solo en chromium (son de layout y a11y, no de motor). */
const SOLO_CHROMIUM = /accesibilidad\.spec\.ts$/;

export default defineConfig({
  testDir: "./e2e",
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
