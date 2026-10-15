import { type Allocation, type Cents, type MemberId, assertCents, compareIds } from "./money";

function assertUniqueIds(ids: MemberId[]): void {
  if (new Set(ids).size !== ids.length) throw new Error("memberIds must be unique");
}

function assertTotal(totalCents: Cents): void {
  assertCents(totalCents, "totalCents");
  if (totalCents < 0) throw new Error("totalCents must be >= 0");
}

/**
 * Equal split. Leftover cents go one each to members in ascending id order.
 * Result is sorted by ascending memberId.
 */
export function splitEqual(totalCents: Cents, memberIds: MemberId[]): Allocation[] {
  assertTotal(totalCents);
  if (memberIds.length === 0) throw new Error("memberIds must not be empty");
  assertUniqueIds(memberIds);
  const sorted = [...memberIds].sort(compareIds);
  const n = sorted.length;
  const base = Math.floor(totalCents / n);
  const leftover = totalCents - base * n;
  return sorted.map((memberId, i) => ({
    memberId,
    amountCents: base + (i < leftover ? 1 : 0),
  }));
}

export interface PercentShare {
  memberId: MemberId;
  /** Basis points: 10000 = 100%. */
  bps: number;
}

/**
 * Percent split in basis points (must sum to 10000). Each member gets
 * floor(total * bps / 10000); leftover cents go one each, in ascending id
 * order, only to members with bps > 0 (a 0% member never receives cents).
 */
export function splitPercent(totalCents: Cents, shares: PercentShare[]): Allocation[] {
  assertTotal(totalCents);
  if (shares.length === 0) throw new Error("shares must not be empty");
  assertUniqueIds(shares.map((s) => s.memberId));
  let sumBps = 0;
  for (const s of shares) {
    if (!Number.isInteger(s.bps) || s.bps < 0) throw new Error("bps must be a non-negative integer");
    sumBps += s.bps;
  }
  if (sumBps !== 10000) throw new Error(`shares must sum to 10000 bps (got ${sumBps})`);
  const sorted = [...shares].sort((a, b) => compareIds(a.memberId, b.memberId));
  const result = sorted.map((s) => ({
    memberId: s.memberId,
    amountCents: Math.floor((totalCents * s.bps) / 10000),
  }));
  const eligible = sorted.flatMap((s, i) => (s.bps > 0 ? [i] : []));
  let leftover = totalCents - result.reduce((acc, r) => acc + r.amountCents, 0);
  if (leftover > 0 && eligible.length === 0) {
    throw new Error("splitPercent: leftover cents but no member with bps > 0");
  }
  for (let k = 0; leftover > 0; k = (k + 1) % eligible.length) {
    result[eligible[k]!]!.amountCents += 1;
    leftover -= 1;
  }
  return result;
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Custom amounts must be non-negative integer cents summing exactly to total. */
export function validateCustom(totalCents: Cents, amounts: Allocation[]): ValidationResult {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) {
    return { ok: false, error: "totalCents must be a non-negative integer" };
  }
  if (amounts.length === 0) return { ok: false, error: "amounts must not be empty" };
  if (new Set(amounts.map((a) => a.memberId)).size !== amounts.length) {
    return { ok: false, error: "memberIds must be unique" };
  }
  let sum = 0;
  for (const a of amounts) {
    if (!Number.isSafeInteger(a.amountCents) || a.amountCents < 0) {
      return { ok: false, error: `invalid amount for ${a.memberId}` };
    }
    sum += a.amountCents;
  }
  if (sum !== totalCents) {
    return { ok: false, error: `amounts sum to ${sum}, expected ${totalCents}` };
  }
  return { ok: true };
}
