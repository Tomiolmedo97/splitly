"use server";

/**
 * STUB temporal de las Server Actions de formulario `registerForm` y `loginForm` (BE).
 * Misma firma y mismo estado que las reales; no guarda nada ni inicia sesión.
 * Se reemplaza cambiando una sola línea en ./auth-forms.ts.
 *
 * Para probar la UI sin BE (preview/QA), con datos válidos:
 * - register con ocupado@ejemplo.com → EMAIL_TAKEN (fieldErrors.email).
 * - login con noexiste@ejemplo.com, o con la contraseña "incorrecta" → INVALID_CREDENTIALS
 *   (mismo estado en los dos casos: no se filtra si el email existe).
 * - limite@ejemplo.com en cualquiera de los dos → RATE_LIMITED.
 * - cualquier otro → aviso "próximamente".
 */
import {
  authStateFromResult,
  invalidAuthState,
  readAuthValues,
  type AuthFormState,
  type AuthMode,
} from "@/lib/auth-action";
import type { AuthValues } from "@/lib/auth-validation";
import type { ActionResult } from "./contracts";

const DELAY_MS = process.env.NODE_ENV === "test" ? 0 : 400;

function fail(code: "EMAIL_TAKEN" | "INVALID_CREDENTIALS" | "RATE_LIMITED"): ActionResult<never> {
  // El message es solo para logs: la UI nunca lo muestra.
  return { ok: false, error: { code, message: `stub: ${code}` } };
}

function simulate(mode: AuthMode, values: AuthValues): ActionResult<never> | null {
  const email = (values.email ?? "").trim().toLowerCase();
  if (email === "limite@ejemplo.com") return fail("RATE_LIMITED");
  if (mode === "register" && email === "ocupado@ejemplo.com") return fail("EMAIL_TAKEN");
  if (mode === "login" && (email === "noexiste@ejemplo.com" || values.password === "incorrecta")) {
    return fail("INVALID_CREDENTIALS");
  }
  return null;
}

async function run(mode: AuthMode, formData: FormData): Promise<AuthFormState> {
  const values = readAuthValues(mode, formData);
  const invalid = invalidAuthState(mode, values);
  if (invalid) return invalid;
  if (DELAY_MS > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
  const result = simulate(mode, values);
  if (result) return authStateFromResult(mode, values, result);
  // La real redirige en el servidor; el stub avisa "próximamente".
  return { ...authStateFromResult(mode, values, { ok: true, data: null }), notice: "COMING_SOON" };
}

export async function registerForm(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  return run("register", formData);
}

export async function loginForm(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  return run("login", formData);
}
