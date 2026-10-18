/**
 * Valores de entorno compartidos entre playwright.config.ts y los fixtures.
 * Se usan también al crear contextos a mano con browser.newContext().
 */
import { URL_POR_DEFECTO } from "./guarda";

/** La valida e2e/guarda.ts al cargar playwright.config.ts. */
export const BASE_URL = process.env.E2E_BASE_URL?.trim() || URL_POR_DEFECTO;

const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/** Headers extra: solo el bypass de Vercel cuando está configurado. */
export const extraHTTPHeaders: Record<string, string> = bypass
  ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
  : {};
