import { copy } from "./copy";

export const PASSWORD_MIN_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthField = "name" | "email" | "password";
export type AuthValues = Partial<Record<AuthField, string>>;
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

/** Validación solo en el cliente. Valida únicamente los campos presentes en `values`. */
export function validateAuth(values: AuthValues): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (values.name !== undefined && values.name.trim() === "") errors.name = copy.authErrors.required;
  if (values.email !== undefined) {
    const email = values.email.trim();
    if (email === "") errors.email = copy.authErrors.required;
    else if (!EMAIL_RE.test(email)) errors.email = copy.authErrors.invalidEmail;
  }
  if (values.password !== undefined) {
    if (values.password === "") errors.password = copy.authErrors.required;
    else if (values.password.length < PASSWORD_MIN_LENGTH) errors.password = copy.authErrors.passwordTooShort;
  }
  return errors;
}
