/**
 * Contrato de las Server Actions acordado con BE (Sprint 1).
 *
 * Cada acción (register, login, logout, createGroup, listMyGroups, getGroup,
 * addMember, updateMember, removeMember, listKnownUsers) exporta su esquema Zod de entrada y
 * devuelve ActionResult. Los tests verifican siempre error.code, nunca
 * error.message (el texto lo pone FE según docs/design/textos.md).
 *
 * Reglas:
 * - Quien no es miembro de un grupo recibe NOT_FOUND, nunca FORBIDDEN
 *   (no se revela si el grupo existe).
 * - FORBIDDEN es solo para un miembro que intenta algo que no tiene permitido.
 * - CURRENCY_LOCKED (updateGroup) solo si el grupo tiene gastos ACTIVOS (deletedAt null).
 * - Expense.deletedAt: un gasto borrado no cuenta para saldos y no se muestra
 *   (ni en Gastos ni en el historial); queda en la base solo para auditoría.
 * - removeMember: solo el creador quita a otro miembro, y solo con saldo 0;
 *   con saldo distinto de 0, MEMBER_HAS_BALANCE; otro miembro, FORBIDDEN.
 * - addMember (MVP): { kind: "guest", name } o { kind: "user", userId } de alguien
 *   con un grupo activo en común (si no, NOT_FOUND). Duplicados: MEMBER_DUPLICATE.
 * - Member.removedAt: un miembro quitado no cuenta para permisos, listKnownUsers
 *   ni duplicados.
 * - listKnownUsers(): { userId, name }[], sin emails y sin uno mismo.
 */
import { expect } from "vitest";
import type { ActionErrorCode, ActionResult, KnownUserDTO } from "../actions/contracts";

export type { ActionResult };

export const CODIGOS_DE_ERROR = [
  "VALIDATION_ERROR",
  "UNAUTHENTICATED",
  "EMAIL_TAKEN",
  "INVALID_CREDENTIALS",
  "PASSWORD_TOO_SHORT",
  "RATE_LIMITED",
  "MEMBER_DUPLICATE",
  "MEMBER_HAS_BALANCE",
  "CURRENCY_LOCKED",
  "FORBIDDEN",
  "NOT_FOUND",
  "INTERNAL",
] as const satisfies readonly ActionErrorCode[];

/** Códigos reales de las Server Actions (apps/web/src/server/actions/contracts.ts, #20). */
export type CodigoDeError = ActionErrorCode;

/** Entrada de addMember: la real (con groupId) es AddMemberInput de contracts.ts. */
export type { AddMemberInput } from "../actions/contracts";

/** Item de listKnownUsers: nunca incluye email. */
export type KnownUser = KnownUserDTO;

/** Afirma que la acción falló con ese code (el message no se mira). */
export function esperarError<T>(resultado: ActionResult<T>, code: CodigoDeError) {
  expect(resultado.ok).toBe(false);
  if (resultado.ok) throw new Error("se esperaba un error");
  expect(resultado.error.code).toBe(code);
  return resultado.error;
}

/** Afirma que la acción salió bien y devuelve data tipada. */
export function esperarOk<T>(resultado: ActionResult<T>): T {
  if (!resultado.ok) throw new Error(`se esperaba ok y vino ${resultado.error.code}`);
  return resultado.data;
}
