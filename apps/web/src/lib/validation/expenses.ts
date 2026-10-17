import { z } from "zod";
import {
  BasisPointsSchema,
  DateOnlySchema,
  IdSchema,
  LIMITS,
  NonNegativeCentsSchema,
  PositiveCentsSchema,
  requiredText,
} from "./common";

/**
 * Gastos (Sprint 2). La división final la calcula @splitly/core en el servidor:
 * - EQUAL: splits = [{ memberId }] → splitEqual (sobrantes por orden de id).
 * - EXACT: splits = [{ memberId, amountCents }] → validateCustom (deben sumar el total).
 * - PERCENTAGE: splits = [{ memberId, basisPoints }] → splitPercent (deben sumar 10000).
 */

const uniqueMembers = (splits: { memberId: string }[]) =>
  new Set(splits.map((s) => s.memberId)).size === splits.length;
const UNIQUE_MSG = "Cada integrante puede aparecer una sola vez";

const EqualSplitsSchema = z
  .array(z.object({ memberId: IdSchema }).strict())
  .min(1)
  .max(LIMITS.splitsMax)
  .refine(uniqueMembers, UNIQUE_MSG);

const ExactSplitsSchema = z
  .array(z.object({ memberId: IdSchema, amountCents: NonNegativeCentsSchema }).strict())
  .min(1)
  .max(LIMITS.splitsMax)
  .refine(uniqueMembers, UNIQUE_MSG);

const PercentageSplitsSchema = z
  .array(z.object({ memberId: IdSchema, basisPoints: BasisPointsSchema }).strict())
  .min(1)
  .max(LIMITS.splitsMax)
  .refine(uniqueMembers, UNIQUE_MSG)
  .refine((s) => s.reduce((acc, x) => acc + x.basisPoints, 0) === 10_000, {
    message: "Los porcentajes tienen que sumar 10000 puntos básicos (100 %)",
  })
  .refine((s) => s.some((x) => x.basisPoints > 0), {
    message: "Al menos un integrante tiene que tener un porcentaje mayor a 0",
  });

const EqualSplitShape = { splitType: z.literal("EQUAL"), amountCents: PositiveCentsSchema, splits: EqualSplitsSchema };
const ExactSplitShape = { splitType: z.literal("EXACT"), amountCents: PositiveCentsSchema, splits: ExactSplitsSchema };
const PercentageSplitShape = {
  splitType: z.literal("PERCENTAGE"),
  amountCents: PositiveCentsSchema,
  splits: PercentageSplitsSchema,
};

/** En EXACT, las partes tienen que sumar exactamente el total. */
function refineExactSum(
  input: { splitType: string; amountCents: number; splits: ReadonlyArray<{ memberId: string; amountCents?: number }> },
  ctx: z.RefinementCtx,
): void {
  if (input.splitType !== "EXACT") return;
  const sum = input.splits.reduce((acc, s) => acc + ("amountCents" in s ? (s.amountCents ?? 0) : 0), 0);
  if (sum !== input.amountCents) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["splits"],
      message: `Las partes suman ${sum} centavos y el total es ${input.amountCents}`,
    });
  }
}

/** Monto + tipo de división + partes: siempre viajan juntos. */
export const SplitInputSchema = z
  .discriminatedUnion("splitType", [
    z.object(EqualSplitShape).strict(),
    z.object(ExactSplitShape).strict(),
    z.object(PercentageSplitShape).strict(),
  ])
  .superRefine(refineExactSum);
export type SplitInput = z.infer<typeof SplitInputSchema>;

const expenseDetailsShape = {
  description: requiredText(LIMITS.expenseDescription),
  paidByMemberId: IdSchema,
  date: DateOnlySchema,
};

/** POST /api/groups/{groupId}/expenses. La moneda se copia del grupo. */
export const CreateExpenseBodySchema = z
  .discriminatedUnion("splitType", [
    z.object({ ...expenseDetailsShape, ...EqualSplitShape }).strict(),
    z.object({ ...expenseDetailsShape, ...ExactSplitShape }).strict(),
    z.object({ ...expenseDetailsShape, ...PercentageSplitShape }).strict(),
  ])
  .superRefine(refineExactSum);
export type CreateExpenseBody = z.infer<typeof CreateExpenseBodySchema>;

/**
 * PATCH /api/groups/{groupId}/expenses/{expenseId}. Todos los campos son opcionales,
 * pero amountCents, splitType y splits van juntos (la división se recalcula entera).
 */
export const UpdateExpenseBodySchema = z
  .object({
    description: requiredText(LIMITS.expenseDescription).optional(),
    paidByMemberId: IdSchema.optional(),
    date: DateOnlySchema.optional(),
    amountCents: z.unknown().optional(),
    splitType: z.unknown().optional(),
    splits: z.unknown().optional(),
  })
  .strict()
  .superRefine((body, ctx) => {
    const splitKeys = (["amountCents", "splitType", "splits"] as const).filter((k) => body[k] !== undefined);
    if (splitKeys.length === 0) {
      if (body.description === undefined && body.paidByMemberId === undefined && body.date === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mandá al menos un campo para actualizar" });
      }
      return;
    }
    if (splitKeys.length !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "amountCents, splitType y splits se mandan juntos",
      });
      return;
    }
    const parsed = SplitInputSchema.safeParse(body);
    if (!parsed.success) for (const issue of parsed.error.issues) ctx.addIssue(issue);
  })
  .transform((body) => {
    const { amountCents, splitType, splits, ...details } = body;
    const split = amountCents === undefined ? undefined : SplitInputSchema.parse({ amountCents, splitType, splits });
    return { ...details, split };
  });
export type UpdateExpenseBody = z.infer<typeof UpdateExpenseBodySchema>;

/** Query de GET /api/groups/{groupId}/expenses (paginado por cursor). */
export const ListExpensesQuerySchema = z.object({
  cursor: IdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListExpensesQuery = z.infer<typeof ListExpensesQuerySchema>;
