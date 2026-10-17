/**
 * Integración del soft delete de gastos (Expense.deletedAt).
 * Contrato y helpers en ./contrato.ts. Se verifica error.code, nunca el message.
 *
 * PENDIENTE: it.todo hasta que BE agregue deletedAt y la acción de borrar gasto
 * (SUPUESTO: deleteExpense; BE confirma el nombre). Los saldos se calculan con
 * computeBalances de @splitly/core sobre los gastos no borrados.
 */
import { describe, it } from "vitest";

describe("borrar gasto (soft delete con Expense.deletedAt)", () => {
  it.todo("borrar un gasto le pone deletedAt con fecha y no borra la fila");
  it.todo("un gasto borrado no cuenta para los saldos del grupo");
  it.todo("después del borrado, los saldos de los miembros de ese gasto se actualizan (pagador y participantes)");
  it.todo("los saldos del grupo siguen sumando 0 después del borrado");
  it.todo("el gasto borrado sigue en el historial, marcado como borrado");
  it.todo("borrar un gasto ya borrado no cambia los saldos (SUPUESTO: devuelve NOT_FOUND, BE confirma)");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("efectos del soft delete en otras reglas", () => {
  it.todo("un grupo cuyos gastos están todos borrados permite cambiar la moneda (CURRENCY_LOCKED solo con gastos activos, SUPUESTO: BE confirma)");
  it.todo("un miembro cuyo saldo queda en 0 por borrar un gasto se puede quitar (removeMember)");
});
