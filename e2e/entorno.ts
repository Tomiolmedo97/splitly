/**
 * Valores de entorno compartidos entre playwright.config.ts y los fixtures.
 * Se usan también al crear contextos a mano con browser.newContext().
 */
export const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/** Headers extra: solo el bypass de Vercel cuando está configurado. */
export const extraHTTPHeaders: Record<string, string> = bypass
  ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
  : {};
