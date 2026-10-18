import type { AuthFormState, AuthMode } from "./auth-action";
import { authFieldsByMode, authStateFromResult } from "./auth-action";
import type { AuthValues } from "./auth-validation";
import type { ActionResult } from "@/server/actions/contracts";

/** Valores del FormData para el modo dado (solo strings; los archivos se ignoran). */
export function readAuthValues(mode: AuthMode, formData: FormData): AuthValues {
  return Object.fromEntries(
    authFieldsByMode[mode].map((f) => {
      const v = formData.get(f);
      return [f, typeof v === "string" ? v : ""];
    }),
  );
}

/** Valores para devolver al cliente: NUNCA la contraseña. */
export function safeValues(values: AuthValues): AuthFormState["values"] {
  const { password: _password, ...rest } = values;
  return rest;
}

/**
 * Traduce el resultado de register/login al estado del formulario de FE (ver authStateFromResult):
 * - register: EMAIL_TAKEN y PASSWORD_TOO_SHORT van al campo.
 * - login: INVALID_CREDENTIALS es siempre de formulario, sin pistas por campo.
 * - VALIDATION_ERROR va por campo (con código), el resto (RATE_LIMITED, INTERNAL…) a formError.
 * El texto lo elige FE por código; el `message` nunca llega al estado.
 */
export function failureToFormState(
  mode: AuthMode,
  result: Extract<ActionResult<unknown>, { ok: false }>,
  values: AuthValues,
): AuthFormState {
  return authStateFromResult(mode, values, result);
}
