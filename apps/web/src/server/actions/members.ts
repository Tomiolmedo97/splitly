"use server";

import type {
  ActionResult,
  AddMemberInput,
  MemberDTO,
  RemoveMemberInput,
  UpdateMemberInput,
} from "./contracts";
import { notImplemented } from "./contracts";

/*
 * Todas estas acciones tienen alcance de grupo: si no sos integrante del grupo
 * devuelven NOT_FOUND (igual que un grupo inexistente) para no filtrar su
 * existencia. FORBIDDEN es solo para integrantes que intentan algo no permitido.
 */

type MemberErrors = "UNAUTHENTICATED" | "VALIDATION_ERROR" | "NOT_FOUND" | "INTERNAL";

/**
 * Agrega un integrante invitado (sin cuenta, userId null) al grupo.
 * Cualquier integrante del grupo puede agregar.
 *
 * Errores posibles:
 * - UNAUTHENTICATED: no hay sesión.
 * - VALIDATION_ERROR: nombre vacío o de más de 50 caracteres.
 * - NOT_FOUND: el grupo no existe o no sos integrante.
 * - MEMBER_DUPLICATE: ya hay un integrante con ese nombre en el grupo.
 * - INTERNAL
 */
export async function addMember(_input: AddMemberInput): Promise<ActionResult<MemberDTO, MemberErrors | "MEMBER_DUPLICATE">> {
  return notImplemented("addMember");
}

/**
 * Cambia el nombre de un integrante (invitado o con cuenta).
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
 * Quita un integrante del grupo. Devuelve el id quitado.
 *
 * Errores posibles:
 * - UNAUTHENTICATED, VALIDATION_ERROR.
 * - NOT_FOUND: el grupo o el integrante no existen, o no sos integrante del grupo.
 * - MEMBER_HAS_BALANCE: el integrante tiene saldo distinto de 0 (primero hay que saldar).
 * - FORBIDDEN (sos integrante, pero no está permitido):
 *   - en Sprint 1 solo se quitan invitados (userId null); salir de un grupo queda para después;
 *   - el integrante tiene saldo 0 pero aparece en gastos (pagó o participó): se conserva
 *     para no romper el historial.
 * - INTERNAL
 */
export async function removeMember(
  _input: RemoveMemberInput,
): Promise<ActionResult<{ memberId: string }, MemberErrors | "MEMBER_HAS_BALANCE" | "FORBIDDEN">> {
  return notImplemented("removeMember");
}
