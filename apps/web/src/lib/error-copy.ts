import { copy } from "./copy";

export const ERROR_CODES = [
  "EMAIL_TAKEN",
  "INVALID_CREDENTIALS",
  "PASSWORD_TOO_SHORT",
  "RATE_LIMITED",
  "MEMBER_DUPLICATE",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "CURRENCY_LOCKED",
  "INTERNAL",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * Texto a mostrar por código de error de las Server Actions (tabla de docs/design/textos.md, PR #16 @ 39f2747).
 * Nunca se muestra el `message` del servidor.
 */
export const errorCopy: Record<ErrorCode, string> = {
  EMAIL_TAKEN: copy.authErrors.emailTaken,
  INVALID_CREDENTIALS: copy.authErrors.invalidCredentials,
  PASSWORD_TOO_SHORT: copy.authErrors.passwordTooShort,
  RATE_LIMITED: copy.authErrors.rateLimited,
  MEMBER_DUPLICATE: copy.groupErrors.memberDuplicate,
  // FORBIDDEN y NOT_FOUND comparten texto a propósito: no revelamos si un grupo existe cuando no tenés acceso.
  FORBIDDEN: copy.groupErrors.notFound,
  NOT_FOUND: copy.groupErrors.notFound,
  // textos.md: VALIDATION_ERROR se muestra por campo (fieldErrors). Este es solo el respaldo a nivel formulario.
  VALIDATION_ERROR: copy.general.genericError,
  UNAUTHENTICATED: copy.general.sessionExpired,
  CURRENCY_LOCKED: copy.newGroup.currencyLocked,
  INTERNAL: copy.general.genericError,
};

function isErrorCode(code: unknown): code is ErrorCode {
  return typeof code === "string" && (ERROR_CODES as readonly string[]).includes(code);
}

/** Texto para cualquier error recibido. Ignora `message`; códigos desconocidos caen en el genérico. */
export function errorText(error: { code?: unknown } | null | undefined): string {
  return isErrorCode(error?.code) ? errorCopy[error.code] : copy.general.genericError;
}
