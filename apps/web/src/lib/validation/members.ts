import { z } from "zod";
import { LIMITS, requiredText } from "./common";

/** POST /api/groups/{groupId}/members: en Sprint 1 crea un invitado (userId nulo). */
export const CreateMemberBodySchema = z
  .object({
    name: requiredText(LIMITS.memberName),
  })
  .strict();
export type CreateMemberBody = z.infer<typeof CreateMemberBodySchema>;

/** PATCH /api/groups/{groupId}/members/{memberId} */
export const UpdateMemberBodySchema = CreateMemberBodySchema;
export type UpdateMemberBody = z.infer<typeof UpdateMemberBodySchema>;
