import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { splitPercent } from "./split";

describe("splitPercent with 0 bps members", () => {
  it("never gives leftover cents to a 0% member", () => {
    const r = splitPercent(1, [
      { memberId: "a", bps: 0 },
      { memberId: "b", bps: 5000 },
      { memberId: "c", bps: 5000 },
    ]);
    expect(r).toEqual([
      { memberId: "a", amountCents: 0 },
      { memberId: "b", amountCents: 1 },
      { memberId: "c", amountCents: 0 },
    ]);
  });

  it("property: 0 bps members always get 0 and sums match", () => {
    const arb = fc
      .uniqueArray(fc.string({ minLength: 1, maxLength: 4 }), { minLength: 2, maxLength: 8 })
      .chain((ids) =>
        fc.array(fc.integer({ min: 0, max: 10000 }), { minLength: ids.length - 1, maxLength: ids.length - 1 }).map((cuts) => {
          const pts = [0, ...cuts.sort((x, y) => x - y), 10000];
          return ids.map((memberId, i) => ({ memberId, bps: pts[i + 1]! - pts[i]! }));
        }),
      );
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10_000_000 }), arb, (total, shares) => {
        const r = splitPercent(total, shares);
        const zero = new Set(shares.filter((s) => s.bps === 0).map((s) => s.memberId));
        return (
          r.reduce((a, x) => a + x.amountCents, 0) === total &&
          r.every((x) => !zero.has(x.memberId) || x.amountCents === 0)
        );
      }),
    );
  });
});
