import { z } from "zod";
import { CurrencySchema, LIMITS, requiredText } from "./common";

/** POST /api/groups. Quien crea el grupo queda como su primer integrante. */
export const CreateGroupBodySchema = z
  .object({
    name: requiredText(LIMITS.groupName),
    currency: CurrencySchema.default("ARS"),
  })
  .strict();
export type CreateGroupBody = z.infer<typeof CreateGroupBodySchema>;

/**
 * PATCH /api/groups/{groupId}. Al menos un campo.
 * La moneda solo cambia si el grupo no tiene gastos (si no, 409 CURRENCY_LOCKED):
 * esa regla la aplica el servicio, no este esquema.
 */
export const UpdateGroupBodySchema = z
  .object({
    name: requiredText(LIMITS.groupName).optional(),
    currency: CurrencySchema.optional(),
  })
  .strict()
  .refine((b) => b.name !== undefined || b.currency !== undefined, {
    message: "Mandá al menos un campo para actualizar",
  });
export type UpdateGroupBody = z.infer<typeof UpdateGroupBodySchema>;
