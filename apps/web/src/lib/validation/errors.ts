/**
 * Formato de error de la API REST: { error: { code, message, details? } }.
 * Ver components.schemas.Error en docs/api/openapi.yaml.
 *
 * El FE elige el texto visible por `code` + `details.reason` (docs/design/textos.md);
 * `message` es solo para logs/debug.
 */
export const API_ERROR_CODES = [
  "VALIDATION_ERROR", // 400: el body o los parámetros no pasan Zod (details.fieldErrors)
  "UNAUTHENTICATED", // 401: no hay sesión
  "FORBIDDEN", // 403: sos integrante, pero la acción no está permitida (details.reason)
  "NOT_FOUND", // 404: no existe, o no sos integrante del grupo (no revela si existe)
  "CONFLICT", // 409: choca con el estado actual (details.reason)
  "RATE_LIMITED", // 429: demasiados intentos
  "INTERNAL", // 500: error inesperado
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/**
 * Motivos en error.details.reason. Los nombres coinciden con los códigos de las
 * Server Actions (src/server/actions/contracts.ts) cuando existen en ambos lados.
 */
export const ERROR_REASONS = {
  /** 409: registro con un email ya usado. */
  EMAIL_TAKEN: "CONFLICT",
  /** 409: ya hay un integrante con ese nombre en el grupo. */
  MEMBER_DUPLICATE: "CONFLICT",
  /** 409: cambio de moneda en un grupo que ya tiene gastos. */
  CURRENCY_LOCKED: "CONFLICT",
  /** 409: borrar un integrante con saldo distinto de 0. */
  MEMBER_HAS_BALANCE: "CONFLICT",
  /** 403: borrar un integrante con saldo 0 que aparece en gastos (se conserva el historial). */
  MEMBER_HAS_EXPENSES: "FORBIDDEN",
  /** 403: borrar un integrante con cuenta (en Sprint 1 solo se borran invitados). */
  MEMBER_LINKED_TO_USER: "FORBIDDEN",
} as const satisfies Record<string, ApiErrorCode>;
export type ErrorReason = keyof typeof ERROR_REASONS;

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: { reason?: ErrorReason; fieldErrors?: Record<string, string[]> } & Record<string, unknown>;
  };
}
