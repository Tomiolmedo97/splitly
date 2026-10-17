import { validateAuth, type AuthField, type AuthFieldErrors, type AuthValues } from "./auth-validation";

export type AuthMode = "login" | "register";

export const authFieldsByMode: Record<AuthMode, readonly AuthField[]> = {
  login: ["email", "password"],
  register: ["name", "email", "password"],
};

export type AuthFormState = {
  status: "idle" | "invalid" | "coming-soon";
  /**
   * Valores enviados, para que los campos no se vacíen después de la acción.
   * Nunca incluye la contraseña: la Server Action real no debe devolverla al cliente.
   */
  values: Omit<AuthValues, "password">;
  fieldErrors: AuthFieldErrors;
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
