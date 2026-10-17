/**
 * Contrato de las Server Actions de Sprint 1: esquemas de entrada (Zod), DTOs y
 * tipo de resultado. El FE programa contra estos tipos; la implementación real
 * llega en el PR de endpoints.
 *
 * Va en un archivo aparte porque un módulo con "use server" solo puede exportar
 * funciones async (Next rechaza exportar constantes como los esquemas Zod).
 */
import { z } from "zod";
import {
  CreateGroupBodySchema,
  CreateMemberBodySchema,
  CredentialsSchema,
  IdSchema,
  RegisterBodySchema,
  UpdateMemberBodySchema,
  type Currency,
} from "@/lib/validation";

// ---------------------------------------------------------------------------
// Resultado
// ---------------------------------------------------------------------------

/**
 * Códigos de error de las Server Actions.
 *
 * IMPORTANTE para el FE: el texto que ve la persona usuaria se elige SIEMPRE por
 * `code` (los textos viven en docs/design/textos.md, PR #16). `message` es solo
 * para logs y debug: puede estar en inglés, cambiar sin aviso o traer detalles técnicos.
 *
 * - VALIDATION_ERROR: la entrada no pasa el esquema Zod (ver `fieldErrors`).
 * - EMAIL_TAKEN: ya existe una cuenta con ese email (register).
 * - INVALID_CREDENTIALS: email o contraseña incorrectos (login). No distingue cuál, a propósito.
 * - PASSWORD_TOO_SHORT: la contraseña tiene menos de 8 caracteres (register).
 * - RATE_LIMITED: demasiados intentos; reintentar más tarde (login/register).
 * - UNAUTHENTICATED: no hay sesión activa.
 * - FORBIDDEN: sos integrante del grupo pero la acción no está permitida
 *   (ej.: quitar a un integrante con cuenta en Sprint 1).
 * - NOT_FOUND: el grupo o el integrante no existen, O no sos integrante del grupo.
 * - MEMBER_DUPLICATE: ya hay un integrante con ese nombre en el grupo.
 * - MEMBER_HAS_BALANCE: no se puede quitar a un integrante con saldo distinto de 0.
 * - CURRENCY_LOCKED: cambio de moneda en un grupo que ya tiene gastos.
 * - INTERNAL: error inesperado (o acción todavía sin implementar).
 *
 * Regla para TODAS las acciones con alcance de grupo (getGroup, addMember,
 * updateMember, removeMember y las que vengan): si no sos integrante del grupo,
 * la respuesta es NOT_FOUND, igual que si el grupo no existiera, para no filtrar
 * qué grupos existen. FORBIDDEN queda reservado para integrantes autenticados
 * que intentan algo no permitido.
 */
export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "PASSWORD_TOO_SHORT"
  | "RATE_LIMITED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "MEMBER_DUPLICATE"
  | "MEMBER_HAS_BALANCE"
  | "CURRENCY_LOCKED"
  | "INTERNAL";

export interface ActionError<C extends ActionErrorCode = ActionErrorCode> {
  code: C;
  /** Solo para logs/debug. NO mostrar en la UI: usar `code` (docs/design/textos.md). */
  message: string;
  /** Errores por campo cuando code = VALIDATION_ERROR (formato de zod `flatten().fieldErrors`). */
  fieldErrors?: Record<string, string[]>;
}

/** Resultado de toda Server Action: nunca tira excepciones hacia el FE. */
export type ActionResult<T, C extends ActionErrorCode = ActionErrorCode> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError<C> };

/** Resultado provisorio mientras la acción no está implementada. */
export function notImplemented(action: string): { ok: false; error: ActionError<"INTERNAL"> } {
  return { ok: false, error: { code: "INTERNAL", message: `NOT_IMPLEMENTED: ${action}` } };
}

// ---------------------------------------------------------------------------
// DTOs (plata siempre en centavos enteros; fechas como string ISO 8601)
// ---------------------------------------------------------------------------

export type { Currency };

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface MemberDTO {
  id: string;
  groupId: string;
  name: string;
  /** null = invitado sin cuenta. */
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSummaryDTO {
  id: string;
  name: string;
  currency: Currency;
  createdById: string;
  memberCount: number;
  /** true si el grupo tiene gastos: la moneda queda bloqueada. */
  hasExpenses: boolean;
  /** Tu integrante en este grupo. */
  myMemberId: string;
  /** Tu saldo en centavos: positivo = te deben, negativo = debés. */
  myBalanceCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceDTO {
  memberId: string;
  /** Centavos con signo: positivo = le deben, negativo = debe. Suman 0 en el grupo. */
  balanceCents: number;
}

export interface GroupDetailDTO extends GroupSummaryDTO {
  members: MemberDTO[];
  balances: BalanceDTO[];
}

// ---------------------------------------------------------------------------
// Esquemas de entrada
// ---------------------------------------------------------------------------

export const RegisterInputSchema = RegisterBodySchema;
export type RegisterInput = z.input<typeof RegisterInputSchema>;

export const LoginInputSchema = CredentialsSchema;
export type LoginInput = z.input<typeof LoginInputSchema>;

export const CreateGroupInputSchema = CreateGroupBodySchema;
export type CreateGroupInput = z.input<typeof CreateGroupInputSchema>;

export const GetGroupInputSchema = z.object({ groupId: IdSchema }).strict();
export type GetGroupInput = z.input<typeof GetGroupInputSchema>;

export const AddMemberInputSchema = CreateMemberBodySchema.extend({ groupId: IdSchema });
export type AddMemberInput = z.input<typeof AddMemberInputSchema>;

export const UpdateMemberInputSchema = UpdateMemberBodySchema.extend({ groupId: IdSchema, memberId: IdSchema });
export type UpdateMemberInput = z.input<typeof UpdateMemberInputSchema>;

export const RemoveMemberInputSchema = z.object({ groupId: IdSchema, memberId: IdSchema }).strict();
export type RemoveMemberInput = z.input<typeof RemoveMemberInputSchema>;
