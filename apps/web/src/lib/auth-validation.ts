import { copy } from "./copy";
import { LIMITS } from "./validation/limits";

export const PASSWORD_MIN_LENGTH = LIMITS.passwordMin;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthMode = "login" | "register";
export type AuthField = "name" | "email" | "password";
export type AuthValues = Partial<Record<AuthField, string>>;

/**
 * Códigos de error por campo. El texto se resuelve en la UI con `fieldErrorCopy`.
 * EMAIL_TAKEN lo manda BE como `fieldErrors.email`, y solo en /registro.
 */
export type AuthFieldErrorCode =
  | "REQUIRED"
  | "INVALID_EMAIL"
  | "PASSWORD_TOO_SHORT"
  | "EMAIL_TAKEN"
  | "NAME_TOO_LONG"
  | "EMAIL_TOO_LONG"
  | "PASSWORD_TOO_LONG";
export type AuthFieldErrors = Partial<Record<AuthField, AuthFieldErrorCode>>;

/** Textos de docs/design/textos.md (vía copy.ts). */
export const fieldErrorCopy: Record<AuthFieldErrorCode, string> = {
  REQUIRED: copy.authErrors.required,
  INVALID_EMAIL: copy.authErrors.invalidEmail,
  PASSWORD_TOO_SHORT: copy.authErrors.passwordTooShort,
  EMAIL_TAKEN: copy.authErrors.emailTaken,
  NAME_TOO_LONG: copy.authErrors.nameTooLong,
  EMAIL_TOO_LONG: copy.authErrors.emailTooLong,
  PASSWORD_TOO_LONG: copy.authErrors.passwordTooLong,
};

/**
 * Validación de formato. Valida únicamente los campos presentes en `values`.
 * En login la contraseña solo es obligatoria: el largo mínimo es regla de registro
 * (igual que CredentialsSchema de BE), y en login no se da ninguna pista por campo
 * más allá de "vacío" o "email mal escrito".
 */
export function validateAuth(values: AuthValues, mode: AuthMode = "register"): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (values.name !== undefined) {
    const name = values.name.trim();
    if (name === "") errors.name = "REQUIRED";
    else if (name.length > LIMITS.userName) errors.name = "NAME_TOO_LONG";
  }
  if (values.email !== undefined) {
    const email = values.email.trim();
    if (email === "") errors.email = "REQUIRED";
    else if (email.length > LIMITS.email) errors.email = "EMAIL_TOO_LONG";
    else if (!EMAIL_RE.test(email)) errors.email = "INVALID_EMAIL";
  }
  if (values.password !== undefined) {
    if (values.password === "") errors.password = "REQUIRED";
    // En login, ni corta ni larga: termina en INVALID_CREDENTIALS (sin pista por campo).
    else if (mode === "register" && values.password.length < PASSWORD_MIN_LENGTH) errors.password = "PASSWORD_TOO_SHORT";
    else if (mode === "register" && values.password.length > LIMITS.passwordMax) errors.password = "PASSWORD_TOO_LONG";
  }
  return errors;
}
