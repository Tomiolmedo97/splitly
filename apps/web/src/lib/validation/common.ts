import { z } from "zod";

/**
 * Esquemas compartidos entre FE y BE (formularios, Server Actions y Route Handlers).
 * Son la fuente de verdad de los límites de cada campo.
 */

/**
 * Tope por gasto: 99.999.999.999 centavos ($ 999.999.999,99). Coincide con el CHECK
 * de la base. Es un entero seguro en JS (< 2^53) y monto × 10000 bps también lo es,
 * así que @splitly/core puede operar con `number` sin perder precisión.
 */
export const MAX_EXPENSE_CENTS = 99_999_999_999;
const MAX_CENTS_MESSAGE = "El monto máximo por gasto es $ 999.999.999,99";

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
export const PositiveCentsSchema = z
  .number()
  .int("El monto tiene que ser un número entero de centavos")
  .positive("El monto tiene que ser mayor a 0")
  .max(MAX_EXPENSE_CENTS, MAX_CENTS_MESSAGE);

/** Centavos enteros no negativos (>= 0). */
export const NonNegativeCentsSchema = z
  .number()
  .int("El monto tiene que ser un número entero de centavos")
  .nonnegative("El monto no puede ser negativo")
  .max(MAX_EXPENSE_CENTS, MAX_CENTS_MESSAGE);

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
