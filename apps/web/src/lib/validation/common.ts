import { z } from "zod";

/**
 * Esquemas compartidos entre FE y BE. Deben coincidir con docs/api/openapi.yaml:
 * si cambiás un límite acá, actualizá también el contrato (y viceversa).
 */

/** Máximo de un Int de Postgres: es el tope de cualquier monto en centavos. */
export const MAX_CENTS = 2_147_483_647;

export const LIMITS = {
  userName: 50,
  groupName: 60,
  memberName: 50,
  expenseDescription: 100,
  email: 254,
  passwordMin: 8,
  passwordMax: 128,
  /** Máximo de integrantes en la división de un gasto. */
  splitsMax: 50,
} as const;

export const CurrencySchema = z.enum(["ARS", "USD"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const SplitTypeSchema = z.enum(["EQUAL", "EXACT", "PERCENTAGE"]);
export type SplitType = z.infer<typeof SplitTypeSchema>;

/** IDs generados por Prisma (cuid). Se valida forma básica, no el formato exacto. */
export const IdSchema = z.string().min(1).max(64);

/** Texto obligatorio: se recorta y no puede quedar vacío. */
export const requiredText = (max: number) => z.string().trim().min(1).max(max);

/** Centavos enteros positivos (> 0). */
export const PositiveCentsSchema = z.number().int().positive().max(MAX_CENTS);

/** Centavos enteros no negativos (>= 0). */
export const NonNegativeCentsSchema = z.number().int().nonnegative().max(MAX_CENTS);

/** Puntos básicos: 10000 = 100 %. */
export const BasisPointsSchema = z.number().int().min(0).max(10_000);

/** Fecha calendario en formato YYYY-MM-DD (sin hora). */
export const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usá el formato YYYY-MM-DD")
  .refine((s) => {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
  }, "Fecha inválida");
