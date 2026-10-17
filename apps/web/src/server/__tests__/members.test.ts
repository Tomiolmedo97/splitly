/**
 * Integración de las Server Actions de miembros: addMember, updateMember, removeMember.
 * Contrato y helpers en ./contrato.ts. Se verifica error.code, nunca el message.
 *
 * PENDIENTE: it.todo hasta que BE publique las acciones.
 */
import { describe, it } from "vitest";

describe("addMember", () => {
  // Alcance MVP (PM): solo nombre (Member sin cuenta) o userId de alguien que ya
  // comparte otro grupo con quien agrega. Agregar por email queda en backlog.
  it.todo("con solo un nombre crea un Member sin userId (userId null)");
  it.todo("con el userId de alguien que comparte otro grupo conmigo crea un Member vinculado a ese userId");
  it.todo(
    "con un userId con el que no comparto ningún grupo se rechaza (SUPUESTO: NOT_FOUND o VALIDATION_ERROR, BE confirma)",
  );
  it.todo("con un userId que no existe se rechaza con el mismo code que el caso anterior (no se revela si existe)");
  it.todo("el mismo userId dos veces en el grupo devuelve MEMBER_DUPLICATE");
  it.todo("agregarse a uno mismo por userId devuelve MEMBER_DUPLICATE (ya es miembro)");
  it.todo("un nombre repetido de un Member sin cuenta devuelve MEMBER_DUPLICATE (SUPUESTO: sin distinguir mayúsculas)");
  it.todo("un nombre vacío o solo con espacios devuelve VALIDATION_ERROR con fieldErrors.name");
  it.todo("mandar nombre y userId a la vez, o ninguno, devuelve VALIDATION_ERROR");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND (no FORBIDDEN)");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
  // BACKLOG (fuera del MVP): agregar por email, y el caso "email sin cuenta".
});

describe("updateMember", () => {
  it.todo("un miembro puede renombrar a un Member sin cuenta");
  it.todo("renombrar a un nombre ya usado en el grupo devuelve MEMBER_DUPLICATE");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("removeMember", () => {
  // Regla (PM): solo quien creó el grupo puede quitar a otro miembro, y solo si
  // su saldo es 0. Salir del grupo uno mismo queda fuera de alcance.
  it.todo("el creador quita a un miembro con saldo 0");
  it.todo("el creador intenta quitar a un miembro con saldo distinto de 0: MEMBER_HAS_BALANCE");
  it.todo("un miembro que no es el creador intenta quitar a otro: FORBIDDEN (aunque el saldo sea 0)");
  it.todo("los gastos anteriores del miembro quitado quedan en el historial");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND (no FORBIDDEN)");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});
