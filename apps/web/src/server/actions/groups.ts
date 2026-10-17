"use server";

import type {
  ActionResult,
  CreateGroupInput,
  GetGroupInput,
  GroupDetailDTO,
  GroupSummaryDTO,
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
 * Lista los grupos donde sos integrante, del más reciente al más viejo,
 * con tu saldo en cada uno (myBalanceCents).
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
 *   para no revelar que el grupo existe).
 * - INTERNAL
 */
export async function getGroup(
  _input: GetGroupInput,
): Promise<
  ActionResult<GroupDetailDTO, "UNAUTHENTICATED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL">
> {
  return notImplemented("getGroup");
}
