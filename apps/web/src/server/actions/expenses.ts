"use server";

import type { ActionResult, DeleteExpenseInput } from "./contracts";
import { notImplemented } from "./contracts";

/**
 * Borra un gasto (baja lógica: Expense.deletedAt = ahora). Cualquier integrante del
 * grupo del gasto puede hacerlo. El gasto deja de aparecer en la lista y en los
 * balances; queda en la base solo para auditoría.
 *
 * Errores posibles:
 * - UNAUTHENTICATED, VALIDATION_ERROR.
 * - NOT_FOUND: el gasto no existe, ya estaba borrado, o no sos integrante de su grupo
 *   (mismo error, para no revelar nada).
 * - INTERNAL
 */
export async function deleteExpense(
  _input: DeleteExpenseInput,
): Promise<ActionResult<{ expenseId: string }, "UNAUTHENTICATED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL">> {
  return notImplemented("deleteExpense");
}
