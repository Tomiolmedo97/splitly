import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { computeBalances, simplifyDebts, type Expense } from "./balances";
import { splitEqual } from "./split";

const members = ["a", "b", "c", "d", "e"];
const expenseArb: fc.Arbitrary<Expense> = fc
  .record({
    paidBy: fc.constantFrom(...members),
    amountCents: fc.integer({ min: 0, max: 10_000_000 }),
    participants: fc.subarray(members, { minLength: 1 }),
  })
  .map(({ paidBy, amountCents, participants }) => ({
    paidBy,
    amountCents,
    splits: splitEqual(amountCents, participants),
  }));

const total = (b: Record<string, number>) => Object.values(b).reduce((x, y) => x + y, 0);

describe("computeBalances", () => {
  it("simple case", () => {
    const b = computeBalances([{ paidBy: "a", amountCents: 10000, splits: splitEqual(10000, ["a", "b", "c"]) }]);
    expect(b).toEqual({ a: 6666, b: -3333, c: -3333 });
  });

  it("rejects splits that don't sum", () => {
    expect(() => computeBalances([{ paidBy: "a", amountCents: 100, splits: [{ memberId: "a", amountCents: 99 }] }])).toThrow();
  });

  it("property: balances sum to 0", () => {
    fc.assert(fc.property(fc.array(expenseArb), (expenses) => total(computeBalances(expenses)) === 0));
  });
});

describe("simplifyDebts", () => {
  it("settles a simple case", () => {
    expect(simplifyDebts({ a: 6666, b: -3333, c: -3333 })).toEqual([
      { from: "b", to: "a", amountCents: 3333 },
      { from: "c", to: "a", amountCents: 3333 },
    ]);
  });

  it("property: transfers settle all balances, at most n-1 transfers", () => {
    fc.assert(
      fc.property(fc.array(expenseArb), (expenses) => {
        const balances = computeBalances(expenses);
        const transfers = simplifyDebts(balances);
        const after = { ...balances };
        for (const t of transfers) {
          if (t.amountCents <= 0) return false;
          after[t.from] = (after[t.from] ?? 0) + t.amountCents;
          after[t.to] = (after[t.to] ?? 0) - t.amountCents;
        }
        const nonZero = Object.values(balances).filter((v) => v !== 0).length;
        return Object.values(after).every((v) => v === 0) && transfers.length <= Math.max(0, nonZero - 1);
      }),
    );
  });
});
