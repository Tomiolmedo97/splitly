import type { ActionResult } from "@/server/actions/contracts";
import {
  validateAuth,
  type AuthField,
  type AuthFieldErrorCode,
  type AuthFieldErrors,
  type AuthMode,
  type AuthValues,
} from "./auth-validation";
import type { ErrorCode } from "./error-copy";
import { LIMITS } from "./validation/limits";

export type { AuthMode };

export const authFieldsByMode: Record<AuthMode, readonly AuthField[]> = {
  login: ["email", "password"],
  register: ["name", "email", "password"],
};

/**
 * Estado que devuelven `registerForm` y `loginForm` (firma `(prevState, formData)` para useActionState).
 * Un login (o registro) exitoso redirige en el servidor, así que no hay estado de éxito.
 */
export type AuthFormState = {
  /**
   * Valores enviados, para que los campos no se vacíen después de la acción.
   * Nunca incluye la contraseña: no vuelve al cliente.
   */
  values: Omit<AuthValues, "password">;
  /** Un código por campo; el texto sale de `fieldErrorCopy`. */
  fieldErrors: AuthFieldErrors;
  /** Error de formulario según el `code` de BE (INVALID_CREDENTIALS, RATE_LIMITED, INTERNAL…). Texto vía `errorText`, nunca el `message`. */
  formError: ErrorCode | null;
};

export type AuthFormAction = (prevState: AuthFormState, formData: FormData) => Promise<AuthFormState>;

export const initialAuthState: AuthFormState = { values: {}, fieldErrors: {}, formError: null };

function withoutPassword(values: AuthValues): Omit<AuthValues, "password"> {
  const { password: _password, ...safe } = values;
  return safe;
}

/** Errores de formato (antes de llamar a BE). `null` si los valores son válidos. */
export function invalidAuthState(mode: AuthMode, values: AuthValues): AuthFormState | null {
  const fieldErrors = validateAuth(values, mode);
  if (Object.keys(fieldErrors).length === 0) return null;
  return { values: withoutPassword(values), fieldErrors, formError: null };
}

/**
 * Código por campo para un VALIDATION_ERROR de zod (ignora los mensajes; decide por el valor enviado).
 * `null` = sin pista por campo (en login, una contraseña rechazada termina en INVALID_CREDENTIALS).
 */
function codeForInvalidField(mode: AuthMode, field: AuthField, value: string): AuthFieldErrorCode | null {
  if (field === "password") {
    if (value === "") return "REQUIRED";
    if (mode === "login") return null;
    return value.length > LIMITS.passwordMax ? "PASSWORD_TOO_LONG" : "PASSWORD_TOO_SHORT";
  }
  const trimmed = value.trim();
  if (trimmed === "") return "REQUIRED";
  if (field === "email") return trimmed.length > LIMITS.email ? "EMAIL_TOO_LONG" : "INVALID_EMAIL";
  return trimmed.length > LIMITS.userName ? "NAME_TOO_LONG" : "REQUIRED";
}

/**
 * Traduce el ActionResult de `register`/`login` (contracts.ts) al estado del formulario.
 * Lo usan registerForm/loginForm (vía failureToFormState de auth-form-state.ts).
 * - register: EMAIL_TAKEN → fieldErrors.email; PASSWORD_TOO_SHORT → fieldErrors.password.
 * - login: INVALID_CREDENTIALS es siempre de formulario: mail inexistente y contraseña
 *   incorrecta dan exactamente el mismo estado (no se filtra si el email existe).
 * - RATE_LIMITED, INTERNAL y el resto → formError.
 * El `message` del servidor nunca pasa al estado.
 */
export function authStateFromResult(mode: AuthMode, values: AuthValues, result: ActionResult<unknown>): AuthFormState {
  const base = { values: withoutPassword(values), fieldErrors: {}, formError: null } satisfies AuthFormState;
  if (result.ok) return base;
  const { code } = result.error;
  if (mode === "register" && code === "EMAIL_TAKEN") return { ...base, fieldErrors: { email: "EMAIL_TAKEN" } };
  if (mode === "register" && code === "PASSWORD_TOO_SHORT") return { ...base, fieldErrors: { password: "PASSWORD_TOO_SHORT" } };
  if (code === "VALIDATION_ERROR") {
    const fieldErrors: AuthFieldErrors = {};
    for (const field of authFieldsByMode[mode]) {
      if (!result.error.fieldErrors?.[field]?.length) continue;
      const fieldCode = codeForInvalidField(mode, field, values[field] ?? "");
      if (fieldCode) fieldErrors[field] = fieldCode;
    }
    if (Object.keys(fieldErrors).length > 0) return { ...base, fieldErrors };
    if (mode === "login") return { ...base, formError: "INVALID_CREDENTIALS" };
  }
  return sanitizeAuthState(mode, { ...base, formError: code });
}

/** Únicos errores por campo que puede mostrar el login: de formato, nunca sobre la cuenta. */
const LOGIN_FIELD_CODES: Partial<Record<AuthField, readonly AuthFieldErrorCode[]>> = {
  email: ["REQUIRED", "INVALID_EMAIL", "EMAIL_TOO_LONG"],
  password: ["REQUIRED"],
};

/**
 * Defensa en la UI: en login solo se muestran errores por campo de formato (vacío, email mal escrito
 * o demasiado largo; la contraseña, solo vacía). Cualquier otro código por campo (p. ej. EMAIL_TAKEN,
 * PASSWORD_TOO_SHORT o PASSWORD_TOO_LONG) se descarta y, si no
 * queda ningún error, se muestra el genérico INVALID_CREDENTIALS: nada distingue "no existe el mail"
 * de "contraseña incorrecta". En login, EMAIL_TAKEN/PASSWORD_TOO_SHORT como formError también pasan
 * a INVALID_CREDENTIALS.
 */
export function sanitizeAuthState(mode: AuthMode, state: AuthFormState): AuthFormState {
  if (mode !== "login") return state;
  const fieldErrors: AuthFieldErrors = {};
  let dropped = false;
  for (const [field, code] of Object.entries(state.fieldErrors) as [AuthField, AuthFieldErrorCode][]) {
    if (LOGIN_FIELD_CODES[field]?.includes(code)) fieldErrors[field] = code;
    else dropped = true;
  }
  let formError = state.formError;
  if (formError === "EMAIL_TAKEN" || formError === "PASSWORD_TOO_SHORT") formError = "INVALID_CREDENTIALS";
  if (dropped && Object.keys(fieldErrors).length === 0 && !formError) formError = "INVALID_CREDENTIALS";
  if (!dropped && formError === state.formError) return state;
  return { ...state, fieldErrors, formError };
}

/** Envío fallido: hay algún error por campo o de formulario. */
export function isFailedSubmit(state: AuthFormState): boolean {
  return state.formError !== null || Object.keys(state.fieldErrors).length > 0;
}

/**
 * Campo que recibe el foco después de un envío fallido: el primero con error, en el orden del formulario.
 * Si ningún campo tiene error (error de formulario como INVALID_CREDENTIALS o RATE_LIMITED), la contraseña.
 * Devuelve `null` si el envío no falló (estado inicial).
 */
export function focusTargetAfterSubmit(state: AuthFormState, fields: readonly AuthField[]): AuthField | null {
  if (!isFailedSubmit(state)) return null;
  return fields.find((f) => state.fieldErrors[f]) ?? "password";
}
