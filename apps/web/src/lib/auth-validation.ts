import { copy } from "./copy";

export const PASSWORD_MIN_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthField = "name" | "email" | "password";
export type AuthValues = Partial<Record<AuthField, string>>;

/** Códigos de error por campo. El texto se resuelve en la UI con `fieldErrorCopy`. */
/** EMAIL_TAKEN lo devuelve solo el servidor (registerForm), en el campo email. */
export type AuthFieldErrorCode = "REQUIRED" | "INVALID_EMAIL" | "PASSWORD_TOO_SHORT" | "EMAIL_TAKEN";
export type AuthFieldErrors = Partial<Record<AuthField, AuthFieldErrorCode>>;

export const fieldErrorCopy: Record<AuthFieldErrorCode, string> = {
  REQUIRED: copy.authErrors.required,
  INVALID_EMAIL: copy.authErrors.invalidEmail,
  PASSWORD_TOO_SHORT: copy.authErrors.passwordTooShort,
  EMAIL_TAKEN: copy.authErrors.emailTaken,
};

/** Validación solo en el cliente. Valida únicamente los campos presentes en `values`. */
export function validateAuth(values: AuthValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (values.name !== undefined && values.name.trim() === "") errors.name = "REQUIRED";
  if (values.email !== undefined) {
    const email = values.email.trim();
    if (email === "") errors.email = "REQUIRED";
    else if (!EMAIL_RE.test(email)) errors.email = "INVALID_EMAIL";
  }
  if (values.password !== undefined) {
    if (values.password === "") errors.password = "REQUIRED";
    else if (values.password.length < PASSWORD_MIN_LENGTH) errors.password = "PASSWORD_TOO_SHORT";
  }
  return errors;
}
