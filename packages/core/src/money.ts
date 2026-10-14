import { z } from "zod";

export const CurrencySchema = z.enum(["ARS", "USD"]);
export type Currency = z.infer<typeof CurrencySchema>;

/** Money is always an integer number of cents. */
export const CentsSchema = z.number().int().safe();
export type Cents = number;

export type MemberId = string;

export interface Allocation {
  memberId: MemberId;
  amountCents: Cents;
}

export function assertCents(value: number, label = "amount"): void {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label} must be an integer number of cents`);
  }
}

export function compareIds(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
