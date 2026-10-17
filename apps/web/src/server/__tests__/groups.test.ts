/**
 * Integración de las Server Actions de grupos: createGroup, listMyGroups, getGroup.
 * Contrato y helpers en ./contrato.ts. Se verifica error.code, nunca el message.
 *
 * PENDIENTE: it.todo hasta que BE publique las acciones.
 */
import { describe, it } from "vitest";

describe("createGroup", () => {
  it.todo("sin moneda, el grupo queda en ARS (default)");
  it.todo("acepta USD como moneda");
  it.todo("una moneda que no es ARS ni USD devuelve VALIDATION_ERROR con fieldErrors.currency");
  it.todo("el nombre es obligatorio: vacío devuelve VALIDATION_ERROR con fieldErrors.name");
  it.todo("un nombre solo con espacios devuelve VALIDATION_ERROR (trim)");
  it.todo("un nombre de más de 40 caracteres devuelve VALIDATION_ERROR");
  it.todo("quien crea el grupo queda como miembro, vinculado a su userId");
  it.todo("sin sesión devuelve UNAUTHENTICATED y no crea nada");
});

describe("listMyGroups", () => {
  it.todo("devuelve solo los grupos donde soy miembro");
  it.todo("no incluye grupos de otros usuarios aunque existan");
  it.todo("incluye un grupo al que me agregaron por userId");
  it.todo("no incluye un grupo del que me quitaron (removedAt)");
  it.todo("no incluye grupos borrados (soft delete)");
  it.todo("un usuario sin grupos recibe una lista vacía");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("getGroup", () => {
  it.todo("un miembro recibe el grupo con su moneda y sus miembros");
  it.todo("quien no es miembro recibe NOT_FOUND (nunca FORBIDDEN: no se revela si existe)");
  it.todo("un id inexistente devuelve NOT_FOUND (igual que un grupo ajeno)");
  it.todo("un usuario quitado del grupo (removedAt) recibe NOT_FOUND");
  it.todo("los miembros quitados no aparecen entre los miembros activos, pero su nombre sigue en los gastos");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("updateGroup({ groupId, name?, currency? }): cambio de moneda", () => {
  // CURRENCY_LOCKED cuenta SOLO gastos activos (Expense.deletedAt null).
  it.todo("cambiar la moneda de un grupo sin gastos se permite");
  it.todo("cambiar la moneda con al menos un gasto activo devuelve CURRENCY_LOCKED");
  it.todo("con el seed: cambiar la moneda de Bariloche (2 gastos activos) devuelve CURRENCY_LOCKED");
  it.todo("con todos los gastos borrados (deletedAt) se puede volver a cambiar la moneda");
  it.todo("borrar el último gasto activo desbloquea el cambio de moneda; cargar uno nuevo lo vuelve a bloquear");
  it.todo("una moneda que no es ARS ni USD devuelve VALIDATION_ERROR");
  it.todo("quien no es miembro recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
  // Copy (main): ayuda de moneda y texto de CURRENCY_LOCKED están en textos.md y
  // en TEXTOS (e2e/fixtures.ts). Acá se mira solo error.code.
});
