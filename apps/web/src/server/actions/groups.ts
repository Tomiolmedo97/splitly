"use server";

import type {
  ActionResult,
  CreateGroupInput,
  GetGroupInput,
  GroupDetailDTO,
  GroupSummaryDTO,
  UpdateGroupInput,
} from "./contracts";
import { notImplemented } from "./contracts";

/**
 * Crea un grupo (moneda por defecto ARS). Quien lo crea queda como primer integrante,
 * vinculado a su usuario.
 *
 * Errores posibles:
 * - UNAUTHENTICATED: no hay sesión.
 * - VALIDATION_ERROR: nombre vacío o muy largo, moneda distinta de ARS/USD.
 * - INTERNAL
 */
export async function createGroup(
  _input: CreateGroupInput,
): Promise<ActionResult<GroupDetailDTO, "UNAUTHENTICATED" | "VALIDATION_ERROR" | "INTERNAL">> {
  return notImplemented("createGroup");
}

/**
 * Lista los grupos donde sos integrante ACTIVO, del más reciente al más viejo,
 * con tu saldo en cada uno (myBalanceCents). Los grupos de los que te quitaron
 * (removedAt) no aparecen.
 *
 * Errores posibles:
 * - UNAUTHENTICATED: no hay sesión.
 * - INTERNAL
 */
export async function listMyGroups(): Promise<ActionResult<GroupSummaryDTO[], "UNAUTHENTICATED" | "INTERNAL">> {
  return notImplemented("listMyGroups");
}

/**
 * Detalle de un grupo con integrantes y balances.
 *
 * Errores posibles:
 * - UNAUTHENTICATED: no hay sesión.
 * - VALIDATION_ERROR: groupId vacío.
 * - NOT_FOUND: el grupo no existe o no sos integrante (mismo error a propósito,
 *   para no revelar que el grupo existe). Si te quitaron del grupo (removedAt),
 *   también NOT_FOUND.
 * - INTERNAL
 */
export async function getGroup(
  _input: GetGroupInput,
): Promise<
  ActionResult<GroupDetailDTO, "UNAUTHENTICATED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL">
> {
  return notImplemented("getGroup");
}

/**
 * Edita nombre y/o moneda de un grupo. Cualquier integrante puede hacerlo.
 *
 * Moneda: solo se puede cambiar si el grupo NO tiene gastos activos
 * (Expense.deletedAt IS NULL). Los gastos borrados no cuentan: quedan en la base
 * solo para auditoría (no aparecen en la lista ni en los balances) y conservan la
 * moneda con la que se cargaron.
 *
 * Errores posibles:
 * - UNAUTHENTICATED, VALIDATION_ERROR (sin campos, nombre inválido, moneda distinta de ARS/USD).
 * - NOT_FOUND: el grupo no existe o no sos integrante.
 * - CURRENCY_LOCKED: cambio de moneda con gastos activos.
 * - INTERNAL
 */
export async function updateGroup(
  _input: UpdateGroupInput,
): Promise<
  ActionResult<GroupDetailDTO, "UNAUTHENTICATED" | "VALIDATION_ERROR" | "NOT_FOUND" | "CURRENCY_LOCKED" | "INTERNAL">
> {
  return notImplemented("updateGroup");
}
