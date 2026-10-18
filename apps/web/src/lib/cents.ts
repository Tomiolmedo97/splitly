/**
 * Conversión de montos en el borde de la capa de datos.
 *
 * En la base los centavos son `bigint` (Prisma `BigInt`); el resto de la app
 * (@splitly/core, DTOs de Server Actions y el cliente) solo usa `number`. Toda
 * lectura/escritura de montos pasa por estas dos funciones: nunca se filtra un
 * `bigint` (ni un string) fuera de los repositorios.
 */
import { MAX_EXPENSE_CENTS } from "./validation/common";

/** bigint de la base → number. Falla si no entra exacto en un entero seguro de JS. */
export function fromDbCents(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError(`Monto fuera de rango seguro: ${value.toString()}`);
  }
  return Number(value);
}

/** number de la app → bigint para la base. Exige entero seguro dentro de ±MAX_EXPENSE_CENTS. */
export function toDbCents(value: number): bigint {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`El monto tiene que ser un entero de centavos: ${value}`);
  }
  if (Math.abs(value) > MAX_EXPENSE_CENTS) {
    throw new RangeError(`Monto por encima del tope (${MAX_EXPENSE_CENTS}): ${value}`);
  }
  return BigInt(value);
}
