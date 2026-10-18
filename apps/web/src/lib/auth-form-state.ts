import type { AuthFormState, AuthMode } from "./auth-action";
import { authFieldsByMode } from "./auth-action";
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
 * Traduce el resultado de register/login al estado del formulario de FE.
 * - EMAIL_TAKEN y PASSWORD_TOO_SHORT van al campo (status "invalid").
 * - El resto (INVALID_CREDENTIALS, RATE_LIMITED, VALIDATION_ERROR, INTERNAL) va a
 *   formError (status "error"). El texto lo elige FE por código.
 */
export function failureToFormState(
  result: Extract<ActionResult<unknown>, { ok: false }>,
  values: AuthValues,
): AuthFormState {
  const base = { values: safeValues(values), fieldErrors: {} };
  switch (result.error.code) {
    case "EMAIL_TAKEN":
      return { ...base, status: "invalid", fieldErrors: { email: "EMAIL_TAKEN" } };
    case "PASSWORD_TOO_SHORT":
      return { ...base, status: "invalid", fieldErrors: { password: "PASSWORD_TOO_SHORT" } };
    default:
      return { ...base, status: "error", formError: result.error.code };
  }
}
