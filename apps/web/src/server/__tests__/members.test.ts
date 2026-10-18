/**
 * Integración de las Server Actions de miembros: addMember, updateMember,
 * removeMember y listKnownUsers. Contrato y helpers en ./contrato.ts.
 * Se verifica error.code, nunca el message. MEMBER_DUPLICATE trae además el
 * subcódigo en fieldErrors.name (docs/design/textos.md):
 * - USER_ALREADY_MEMBER: la persona con cuenta ya es miembro activo.
 * - GUEST_NAME_TAKEN: ya hay un invitado activo con ese nombre.
 *
 * Reglas (BE/PM):
 * - addMember recibe { kind: "guest", name } o { kind: "user", userId }.
 * - Member tiene removedAt: removeMember siempre hace soft delete.
 * - Un miembro quitado no cuenta como miembro: ni para permisos, ni para
 *   listKnownUsers, ni para los chequeos de duplicados.
 * - Invitar por email queda en BACKLOG (fuera del MVP).
 *
 * PENDIENTE: it.todo hasta que BE publique las acciones.
 */
import { describe, it } from "vitest";

describe("addMember", () => {
  describe("{ kind: 'guest', name }", () => {
    it.todo("crea un Member sin cuenta (userId null, removedAt null)");
    it.todo("un nombre vacío o solo con espacios devuelve VALIDATION_ERROR con fieldErrors.name");
    // Índice único sobre lower(btrim(name)) entre los invitados activos (PR #20).
    it.todo("un nombre repetido entre los miembros sin cuenta activos devuelve MEMBER_DUPLICATE con fieldErrors.name GUEST_NAME_TAKEN");
    it.todo("'Martin' y después 'martin' devuelve MEMBER_DUPLICATE con fieldErrors.name GUEST_NAME_TAKEN (sin distinguir mayúsculas)");
    it.todo("'Martín' y después ' Martín ' devuelve MEMBER_DUPLICATE con fieldErrors.name GUEST_NAME_TAKEN (espacios alrededor)");
    it.todo("'Martín' y después '  MARTÍN  ' devuelve MEMBER_DUPLICATE con fieldErrors.name GUEST_NAME_TAKEN (mayúsculas + espacios, igual que lower(btrim(name)))");
    it.todo("el índice Member_groupId_name_guest_key usa lower(btrim(name)) y solo cubre invitados activos (userId null, removedAt null)");
    it.todo("'Martin' y 'Martín' NO son duplicados: los acentos se distinguen (se crean los dos)");
    it.todo("el mismo nombre que un miembro CON cuenta se permite: el duplicado de nombre se mira solo entre los sin cuenta");
    it.todo("el nombre de un miembro sin cuenta quitado (removedAt) se puede volver a usar");
  });

  describe("{ kind: 'user', userId }", () => {
    it.todo("con el userId de alguien que comparte un grupo activo conmigo crea un Member vinculado a ese userId");
    it.todo("con un userId con el que no comparto ningún grupo devuelve NOT_FOUND");
    it.todo("con un userId que no existe devuelve NOT_FOUND (mismo code: no se revela si existe)");
    it.todo("con un userId con el que solo comparto un grupo borrado (soft delete) devuelve NOT_FOUND");
    it.todo("una persona con cuenta que ya es miembro activo devuelve MEMBER_DUPLICATE con fieldErrors.name USER_ALREADY_MEMBER (deduplica por userId, no por nombre)");
    it.todo("agregarse a uno mismo devuelve MEMBER_DUPLICATE con fieldErrors.name USER_ALREADY_MEMBER (ya es miembro)");
    it.todo("dos personas con cuenta y el mismo nombre se pueden agregar (distinto userId)");
    it.todo("un userId que fue quitado del grupo (removedAt) se puede volver a agregar");
  });

  it.todo("un kind desconocido, o guest sin name / user sin userId, devuelve VALIDATION_ERROR");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND (no FORBIDDEN)");
  it.todo("un miembro quitado (removedAt) que llama addMember recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
  // BACKLOG (fuera del MVP): invitar por email y vincular la cuenta al registrarse.
});

describe("updateMember", () => {
  it.todo("un miembro puede renombrar a un Member sin cuenta");
  it.todo("renombrar a un nombre usado por otro miembro sin cuenta activo devuelve MEMBER_DUPLICATE con fieldErrors.name GUEST_NAME_TAKEN");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("removeMember", () => {
  // Solo quien creó el grupo puede quitar, y solo con saldo 0. Salir del grupo
  // uno mismo queda fuera de alcance.
  it.todo("el creador quita a un miembro con saldo 0: queda removedAt con fecha (soft delete, no se borra la fila)");
  it.todo("un miembro que ya aparece en gastos se puede quitar si su saldo es 0, y su nombre sigue en el historial");
  it.todo("el creador intenta quitar a un miembro con saldo distinto de 0: MEMBER_HAS_BALANCE");
  it.todo("un miembro que no es el creador intenta quitar a otro: FORBIDDEN (aunque el saldo sea 0)");
  it.todo("un miembro con cuenta que no es el creador intenta quitar a un invitado sin cuenta: FORBIDDEN y el invitado sigue activo (removedAt null)");
  it.todo("quien no es miembro del grupo recibe NOT_FOUND (no FORBIDDEN)");
  it.todo("quitar a un miembro ya quitado devuelve NOT_FOUND");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});

describe("listKnownUsers", () => {
  it.todo("devuelve solo personas con cuenta que comparten un grupo activo conmigo");
  it.todo("cada item tiene exactamente { userId, name }: nunca un email");
  it.todo("no me incluye a mí");
  it.todo("no incluye a quien solo comparto un grupo borrado (soft delete)");
  it.todo("no incluye a quien fue quitado (removedAt) del único grupo que compartíamos");
  it.todo("no incluye miembros sin cuenta");
  it.todo("cada persona aparece una sola vez aunque comparta varios grupos conmigo");
  it.todo("un usuario sin grupos compartidos recibe una lista vacía");
  it.todo("sin sesión devuelve UNAUTHENTICATED");
});
