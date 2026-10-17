"use server";

import type {
  ActionResult,
  AddMemberInput,
  KnownUserDTO,
  MemberDTO,
  RemoveMemberInput,
  UpdateMemberInput,
} from "./contracts";
import { notImplemented } from "./contracts";

/*
 * Acciones con alcance de grupo: si no sos integrante del grupo devuelven
 * NOT_FOUND (igual que un grupo inexistente) para no filtrar su existencia.
 * FORBIDDEN es solo para integrantes que intentan algo no permitido.
 * Ninguna respuesta incluye emails de otras personas.
 */

type MemberErrors = "UNAUTHENTICATED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL";

/**
 * Agrega un integrante al grupo. Cualquier integrante puede agregar.
 *
 * Entrada (unión por `kind`):
 * - `{ groupId, kind: "guest", name }`: invitado sin cuenta (hasAccount = false).
 * - `{ groupId, kind: "user", userId }`: persona con cuenta que comparte al menos OTRO
 *   grupo con vos (sale de `listKnownUsers`). Se usa el nombre de su cuenta. No hay
 *   búsqueda por email y la respuesta nunca incluye emails.
 *
 * Errores posibles:
 * - UNAUTHENTICATED: no hay sesión.
 * - VALIDATION_ERROR: nombre vacío o de más de 50 caracteres, `kind` inválido.
 * - NOT_FOUND: el grupo no existe o no sos integrante; o (kind "user") el userId no
 *   existe o no comparte ningún otro grupo con vos (mismo error, para no revelar cuentas).
 * - MEMBER_DUPLICATE: (guest) ya hay un invitado activo con ese nombre en el grupo
 *   (índice único parcial; un invitado SÍ puede llamarse igual que alguien con cuenta);
 *   (user) esa persona ya es integrante activa del grupo. Si estaba dada de baja
 *   (removedAt), se la reactiva y la respuesta es ok.
 * - INTERNAL
 */
export async function addMember(_input: AddMemberInput): Promise<ActionResult<MemberDTO, MemberErrors | "MEMBER_DUPLICATE">> {
  return notImplemented("addMember");
}

/**
 * Cambia el nombre de un integrante.
 *
 * Errores posibles:
 * - UNAUTHENTICATED, VALIDATION_ERROR.
 * - NOT_FOUND: el grupo o el integrante no existen, el integrante es de otro grupo,
 *   o no sos integrante del grupo.
 * - MEMBER_DUPLICATE: el nombre nuevo ya lo usa otro integrante del grupo.
 * - INTERNAL
 */
export async function updateMember(
  _input: UpdateMemberInput,
): Promise<ActionResult<MemberDTO, MemberErrors | "MEMBER_DUPLICATE">> {
  return notImplemented("updateMember");
}

/**
 * Quita a otro integrante del grupo (baja lógica: Member.removedAt). Sus gastos y
 * partes quedan en el historial; deja de aparecer en listas y selectores.
 * Solo quien creó el grupo (Group.createdById) puede quitar integrantes.
 *
 * Errores posibles (en este orden de chequeo):
 * - UNAUTHENTICATED, VALIDATION_ERROR.
 * - NOT_FOUND: el grupo o el integrante no existen (o ya fue quitado), o no sos integrante.
 * - FORBIDDEN: no sos quien creó el grupo, o intentás quitarte a vos (salir de un
 *   grupo queda fuera del MVP).
 * - MEMBER_HAS_BALANCE: el integrante tiene saldo distinto de 0 (primero tiene que quedar al día).
 * - INTERNAL
 */
export async function removeMember(
  _input: RemoveMemberInput,
): Promise<ActionResult<{ memberId: string }, MemberErrors | "FORBIDDEN" | "MEMBER_HAS_BALANCE">> {
  return notImplemented("removeMember");
}

/**
 * Personas con cuenta que comparten al menos un grupo con vos (integrantes activos,
 * sin incluirte), ordenadas por nombre. Alimenta el selector "Agregar de tus grupos" de addMember.
 * Solo devuelve userId y nombre: nunca emails.
 *
 * Errores posibles:
 * - UNAUTHENTICATED: no hay sesión.
 * - INTERNAL
 */
export async function listKnownUsers(): Promise<ActionResult<KnownUserDTO[], "UNAUTHENTICATED" | "INTERNAL">> {
  return notImplemented("listKnownUsers");
}
