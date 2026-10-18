/**
 * Contrato de las Server Actions de Sprint 1: esquemas de entrada (Zod), DTOs y
 * tipo de resultado. El FE programa contra estos tipos; la implementación real
 * llega en el PR de endpoints. Nunca se exponen emails de otras personas.
 *
 * Va en un archivo aparte porque un módulo con "use server" solo puede exportar
 * funciones async (Next rechaza exportar constantes como los esquemas Zod).
 */
import { z } from "zod";
import {
  CreateGroupBodySchema,
  UpdateGroupBodySchema,
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
 * `code` (tabla "Códigos de error de las Server Actions" en docs/design/textos.md).
 * `message` es solo para logs y debug: puede estar en inglés, cambiar sin aviso o
 * traer detalles técnicos.
 *
 * - VALIDATION_ERROR: la entrada no pasa el esquema Zod (ver `fieldErrors`).
 * - EMAIL_TAKEN: ya existe una cuenta con ese email (register).
 * - INVALID_CREDENTIALS: email o contraseña incorrectos (login). No distingue cuál, a propósito.
 * - PASSWORD_TOO_SHORT: la contraseña tiene menos de 8 caracteres (register).
 * - RATE_LIMITED: demasiados intentos; reintentar más tarde (login/register).
 *   El entorno de test/E2E tiene un límite propio, separado del de producción,
 *   para que las suites no se bloqueen entre sí.
 * - UNAUTHENTICATED: no hay sesión activa.
 * - FORBIDDEN: sos integrante del grupo pero la acción no está permitida
 *   (ej.: quitar a otro integrante sin ser quien creó el grupo).
 * - NOT_FOUND: el grupo o el integrante no existen, O no sos integrante del grupo.
 * - MEMBER_DUPLICATE: ya hay un invitado activo con ese nombre en el grupo, o esa
 *   persona con cuenta ya es integrante.
 * - MEMBER_HAS_BALANCE: no se puede quitar a un integrante con saldo distinto de 0.
 * - CURRENCY_LOCKED: cambio de moneda en un grupo que tiene gastos activos (no borrados).
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

/** Integrante de un grupo. No incluye email ni userId de otras personas. */
export interface MemberDTO {
  memberId: string;
  name: string;
  /** false = invitado sin cuenta. */
  hasAccount: boolean;
}

/** Persona con cuenta que comparte algún grupo con vos (selector "Agregar de tus grupos"). */
export interface KnownUserDTO {
  userId: string;
  name: string;
}

export interface GroupSummaryDTO {
  id: string;
  name: string;
  currency: Currency;
  createdById: string;
  /** true si vos creaste el grupo: solo vos podés quitar integrantes. */
  isCreator: boolean;
  memberCount: number;
  /** true si el grupo tiene gastos ACTIVOS (deletedAt nulo): la moneda queda bloqueada. */
  hasExpenses: boolean;
  /** Tu integrante en este grupo. */
  myMemberId: string;
  /** Tu saldo en centavos: positivo = te deben, negativo = debés. Ignora gastos borrados. */
  myBalanceCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface BalanceDTO {
  memberId: string;
  /**
   * Centavos con signo: positivo = le deben, negativo = debe. Suman 0 en el grupo.
   * Se calcula solo con gastos activos (Expense.deletedAt IS NULL).
   */
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

/** { groupId, kind: "guest", name } | { groupId, kind: "user", userId } */
export const AddMemberInputSchema = z.discriminatedUnion("kind", [
  CreateMemberBodySchema.options[0].extend({ groupId: IdSchema }),
  CreateMemberBodySchema.options[1].extend({ groupId: IdSchema }),
]);
export type AddMemberInput = z.input<typeof AddMemberInputSchema>;

export const UpdateMemberInputSchema = UpdateMemberBodySchema.extend({ groupId: IdSchema, memberId: IdSchema });
export type UpdateMemberInput = z.input<typeof UpdateMemberInputSchema>;

export const RemoveMemberInputSchema = z.object({ groupId: IdSchema, memberId: IdSchema }).strict();
export type RemoveMemberInput = z.input<typeof RemoveMemberInputSchema>;

/** { groupId, name?, currency? } con al menos uno de name/currency. */
export const UpdateGroupInputSchema = z
  .object({ groupId: IdSchema })
  .merge(UpdateGroupBodySchema.innerType())
  .strict()
  .refine((b) => b.name !== undefined || b.currency !== undefined, {
    message: "Mandá al menos un campo para actualizar",
  });
export type UpdateGroupInput = z.input<typeof UpdateGroupInputSchema>;

export const DeleteExpenseInputSchema = z.object({ expenseId: IdSchema }).strict();
export type DeleteExpenseInput = z.input<typeof DeleteExpenseInputSchema>;
