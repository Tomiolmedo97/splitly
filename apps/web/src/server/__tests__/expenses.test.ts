/**
 * Integración del soft delete de gastos (Expense.deletedAt).
 * Contrato y helpers en ./contrato.ts. Se verifica error.code, nunca el message.
 *
 * PENDIENTE: it.todo hasta que BE agregue deletedAt y deleteExpense({ expenseId }).
 * Los saldos se calculan con computeBalances de @splitly/core sobre los gastos
 * no borrados.
 */
import { describe, it } from "vitest";

describe("borrar gasto (soft delete con Expense.deletedAt)", () => {
  it.todo("borrar un gasto le pone deletedAt con fecha y no borra la fila");
  it.todo("un gasto borrado no cuenta para los saldos del grupo");
  it.todo("después del borrado, los saldos de los miembros de ese gasto se actualizan (pagador y participantes)");
  it.todo("los saldos del grupo siguen sumando 0 después del borrado");
  it.todo("el gasto borrado NO aparece en la pestaña Gastos ni en el historial (queda en la base solo para auditoría)");
  it.todo("el gasto borrado sigue en la base con deletedAt (auditoría), sin exponerse en ninguna acción de lectura del MVP");
  it.todo("deleteExpense({ expenseId }) sobre un gasto ya borrado devuelve NOT_FOUND y no cambia los saldos");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("efectos del soft delete en otras reglas", () => {
  // CURRENCY_LOCKED cuenta SOLO gastos activos (deletedAt null). Ver también groups.test.ts.
  it.todo("un grupo con todos sus gastos borrados puede volver a cambiar la moneda con updateGroup");
  it.todo("un grupo con al menos un gasto activo devuelve CURRENCY_LOCKED en updateGroup");
  it.todo("un miembro cuyo saldo queda en 0 por borrar un gasto se puede quitar (removeMember)");
});

describe("monto máximo por gasto (columnas BigInt, number en la app)", () => {
  // Máximo del MVP: $ 999.999.999,99 = 99999999999 centavos (AM-07).
  // Texto de FE (no se fija acá): "El monto máximo por gasto es {monto}", con
  // {monto} = formatMoney(99999999999, moneda del grupo) ($ o US$). Acá solo error.code.
  it.todo("un gasto de 99999999999 centavos se acepta");
  it.todo("un gasto de 100000000000 centavos devuelve VALIDATION_ERROR con fieldErrors.amount");
  it.todo("el CHECK de la base rechaza un monto mayor al máximo aunque se saltee Zod (insert directo)");
  it.todo("los montos llegan a las acciones y al cliente como number, nunca como bigint (typeof === 'number')");
  it.todo("la suma de saldos con muchos gastos del máximo queda dentro de Number.MAX_SAFE_INTEGER y es exacta");
  it.todo("las partes de un split de un gasto máximo son enteros exactos (Number.isSafeInteger)");
});

describe("pagador y participantes válidos (validación en el servicio; la FK compuesta de #20 es respaldo)", () => {
  it.todo("un pagador que es miembro de otro grupo devuelve VALIDATION_ERROR con fieldErrors.paidByMemberId");
  it.todo("un participante (split) de otro grupo devuelve VALIDATION_ERROR con fieldErrors.splits");
  it.todo("un pagador quitado (removedAt) devuelve VALIDATION_ERROR con fieldErrors.paidByMemberId");
  it.todo("un participante quitado (removedAt) devuelve VALIDATION_ERROR con fieldErrors.splits");
  it.todo("nunca llega a la FK: el rechazo es VALIDATION_ERROR, no INTERNAL");
});
