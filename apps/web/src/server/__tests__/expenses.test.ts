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
  it.todo("el gasto borrado NO aparece en la pestaña Gastos ni en el historial (queda en la base solo para auditoría)");
  it.todo("el gasto borrado sigue en la base con deletedAt (auditoría), sin exponerse en ninguna acción de lectura del MVP");
  it.todo("borrar un gasto ya borrado no cambia los saldos (SUPUESTO: devuelve NOT_FOUND, BE confirma)");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("efectos del soft delete en otras reglas", () => {
  // CURRENCY_LOCKED cuenta SOLO gastos activos (deletedAt null). Ver también groups.test.ts.
  it.todo("un grupo con todos sus gastos borrados puede volver a cambiar la moneda con updateGroup");
  it.todo("un grupo con al menos un gasto activo devuelve CURRENCY_LOCKED en updateGroup");
  it.todo("un miembro cuyo saldo queda en 0 por borrar un gasto se puede quitar (removeMember)");
});
