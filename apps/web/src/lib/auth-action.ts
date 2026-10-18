import { validateAuth, type AuthField, type AuthFieldErrors, type AuthValues } from "./auth-validation";
import type { ErrorCode } from "./error-copy";

export type AuthMode = "login" | "register";

export const authFieldsByMode: Record<AuthMode, readonly AuthField[]> = {
  login: ["email", "password"],
  register: ["name", "email", "password"],
};

export type AuthFormState = {
  /** "invalid": errores por campo. "error": error de formulario (`formError`, p. ej. INVALID_CREDENTIALS). */
  status: "idle" | "invalid" | "error" | "coming-soon";
  /**
   * Valores enviados, para que los campos no se vacíen después de la acción.
   * Nunca incluye la contraseña: la Server Action real no debe devolverla al cliente.
   */
  values: Omit<AuthValues, "password">;
  fieldErrors: AuthFieldErrors;
  /** Error a nivel formulario según el `code` del servidor. El texto sale de errorCopy, nunca del `message`. */
  formError?: ErrorCode;
};

export const initialAuthState: AuthFormState = { status: "idle", values: {}, fieldErrors: {} };

/**
 * Acción de prueba (stub) hasta tener las Server Actions de BE: valida y responde "próximamente".
 * Misma firma que usará la Server Action real con useActionState.
 */
export function createStubAuthAction(mode: AuthMode, delayMs = 400) {
  return async function stubAuthAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
    const values: AuthValues = Object.fromEntries(
      authFieldsByMode[mode].map((f) => [f, String(formData.get(f) ?? "")]),
    );
    const fieldErrors = validateAuth(values);
    const { password: _password, ...safeValues } = values;
    if (Object.keys(fieldErrors).length > 0) return { status: "invalid", values: safeValues, fieldErrors };
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    return { status: "coming-soon", values: safeValues, fieldErrors: {} };
  };
}

/**
 * Campo que recibe el foco después de un envío fallido: el primero con error, en el orden del formulario.
 * Si ningún campo tiene error (p. ej. un error de formulario como INVALID_CREDENTIALS), la contraseña.
 * Devuelve `null` si el envío no falló (estado inicial o "próximamente").
 */
export function focusTargetAfterSubmit(state: AuthFormState, fields: readonly AuthField[]): AuthField | null {
  if (state.status !== "invalid" && state.status !== "error") return null;
  return fields.find((f) => state.fieldErrors[f]) ?? "password";
}
