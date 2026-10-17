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
  it.todo("incluye un grupo al que me agregaron por email");
  it.todo("un usuario sin grupos recibe una lista vacía");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("getGroup", () => {
  it.todo("un miembro recibe el grupo con su moneda y sus miembros");
  it.todo("quien no es miembro recibe NOT_FOUND (nunca FORBIDDEN: no se revela si existe)");
  it.todo("un id inexistente devuelve NOT_FOUND (igual que un grupo ajeno)");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("cambio de moneda del grupo", () => {
  // SUPUESTO: BE define qué acción lo hace (no está en la lista del Sprint 1).
  it.todo("cambiar la moneda de un grupo sin gastos se permite");
  it.todo("cambiar la moneda de un grupo con gastos devuelve CURRENCY_LOCKED");
});
