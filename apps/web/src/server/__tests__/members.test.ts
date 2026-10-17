/**
 * Integración de las Server Actions de miembros: addMember, updateMember, removeMember.
 * Contrato y helpers en ./contrato.ts. Se verifica error.code, nunca el message.
 *
 * PENDIENTE: it.todo hasta que BE publique las acciones.
 */
import { describe, it } from "vitest";

describe("addMember", () => {
  it.todo("solo con nombre crea un Member sin userId (userId null)");
  it.todo("por email de alguien con cuenta crea un Member vinculado a su userId");
  it.todo("busca el email normalizado (mayúsculas y espacios no importan)");
  it.todo("el mismo email dos veces devuelve MEMBER_DUPLICATE");
  it.todo("agregarse a uno mismo por email devuelve MEMBER_DUPLICATE (ya es miembro)");
  it.todo("un nombre repetido de un Member sin cuenta devuelve MEMBER_DUPLICATE (SUPUESTO: BE confirma)");
  it.todo("un nombre vacío devuelve VALIDATION_ERROR con fieldErrors.name");
  it.todo("un email sin cuenta en Splitly devuelve el code que defina BE (SUPUESTO: no hay invitaciones en el MVP)");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND (no FORBIDDEN)");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("updateMember", () => {
  it.todo("un miembro puede renombrar a un Member sin cuenta");
  it.todo("renombrar a un nombre ya usado en el grupo devuelve MEMBER_DUPLICATE");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("removeMember", () => {
  it.todo("quita a un miembro con saldo 0");
  it.todo("un miembro con saldo distinto de 0 no se puede quitar: MEMBER_HAS_BALANCE");
  it.todo("los gastos anteriores del miembro quitado quedan en el historial");
  it.todo("un miembro sin permiso para quitar a otro recibe FORBIDDEN (SUPUESTO: BE define quién puede)");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});
