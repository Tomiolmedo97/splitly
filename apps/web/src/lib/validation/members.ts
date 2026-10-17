import { z } from "zod";
import { IdSchema, LIMITS, requiredText } from "./common";

/**
 * Alta de integrante. Unión discriminada por `kind`:
 * - guest: invitado sin cuenta (userId null), identificado por nombre.
 * - user: una persona con cuenta que ya comparte al menos otro grupo con quien la
 *   agrega (sale del selector "Agregar de tus grupos", ver listKnownUsers).
 *   No se busca por email: así nunca se expone ni se confirma el email de nadie.
 */
export const CreateMemberBodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("guest"), name: requiredText(LIMITS.memberName) }).strict(),
  z.object({ kind: z.literal("user"), userId: IdSchema }).strict(),
]);
export type CreateMemberBody = z.infer<typeof CreateMemberBodySchema>;

/** Renombrar un integrante. */
export const UpdateMemberBodySchema = z
  .object({
    name: requiredText(LIMITS.memberName),
  })
  .strict();
export type UpdateMemberBody = z.infer<typeof UpdateMemberBodySchema>;
