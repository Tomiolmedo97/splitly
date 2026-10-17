import { copy } from "./copy";

export const ERROR_CODES = [
  "EMAIL_TAKEN",
  "INVALID_CREDENTIALS",
  "PASSWORD_TOO_SHORT",
  "RATE_LIMITED",
  "MEMBER_DUPLICATE",
  "MEMBER_HAS_BALANCE",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "CURRENCY_LOCKED",
  "INTERNAL",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/**
 * Texto a mostrar por código de error de las Server Actions (tabla de docs/design/textos.md, main @ 076ed72).
 * Nunca se muestra el `message` del servidor.
 */
export const errorCopy: Record<ErrorCode, string> = {
  EMAIL_TAKEN: copy.authErrors.emailTaken,
  INVALID_CREDENTIALS: copy.authErrors.invalidCredentials,
  PASSWORD_TOO_SHORT: copy.authErrors.passwordTooShort,
  RATE_LIMITED: copy.authErrors.rateLimited,
  MEMBER_DUPLICATE: copy.groupErrors.memberDuplicate,
  // Un no miembro recibe NOT_FOUND (no revelamos si el grupo existe); FORBIDDEN es solo para miembros.
  FORBIDDEN: copy.groupErrors.forbidden,
  NOT_FOUND: copy.groupErrors.notFound,
  MEMBER_HAS_BALANCE: copy.groupErrors.memberHasBalance,
  // textos.md: VALIDATION_ERROR se muestra por campo (fieldErrors). Este es solo el respaldo a nivel formulario.
  VALIDATION_ERROR: copy.general.genericError,
  UNAUTHENTICATED: copy.general.sessionExpired,
  CURRENCY_LOCKED: copy.groupErrors.currencyLocked,
  INTERNAL: copy.general.genericError,
};

function isErrorCode(code: unknown): code is ErrorCode {
  return typeof code === "string" && (ERROR_CODES as readonly string[]).includes(code);
}

export type ErrorTextParams = { nombre?: string };

/**
 * Texto para cualquier error recibido. Ignora `message`; códigos desconocidos caen en el genérico.
 * `{nombre}` se completa con `params.nombre` (lo pone el FE, nunca sale del servidor).
 */
export function errorText(error: { code?: unknown } | null | undefined, params: ErrorTextParams = {}): string {
  if (!isErrorCode(error?.code)) return copy.general.genericError;
  const template = errorCopy[error.code];
  if (!template.includes("{nombre}")) return template;
  // Sin nombre no podemos armar la frase de textos.md: mejor el genérico que un "{nombre}" literal.
  return params.nombre ? template.replace("{nombre}", params.nombre) : copy.general.genericError;
}
