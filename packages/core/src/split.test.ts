import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { splitEqual, splitPercent, validateCustom } from "./split";

const sum = (xs: { amountCents: number }[]) => xs.reduce((a, x) => a + x.amountCents, 0);
const idsArb = fc.uniqueArray(fc.string({ minLength: 1, maxLength: 6 }), { minLength: 1, maxLength: 10 });
const totalArb = fc.integer({ min: 0, max: 100_000_000 });

describe("splitEqual", () => {
  it("10000 among 3 -> 3334, 3333, 3333", () => {
    expect(splitEqual(10000, ["c", "a", "b"])).toEqual([
      { memberId: "a", amountCents: 3334 },
      { memberId: "b", amountCents: 3333 },
      { memberId: "c", amountCents: 3333 },
    ]);
  });

  it("leftover goes to lowest ids", () => {
    expect(splitEqual(5, ["z", "y", "x"]).map((a) => a.amountCents)).toEqual([2, 2, 1]);
  });

  it("rejects bad input", () => {
    expect(() => splitEqual(100, [])).toThrow();
    expect(() => splitEqual(1.5, ["a"])).toThrow();
    expect(() => splitEqual(100, ["a", "a"])).toThrow();
  });

  it("property: sums match and parts differ by at most 1", () => {
    fc.assert(
      fc.property(totalArb, idsArb, (total, ids) => {
        const r = splitEqual(total, ids);
        const amounts = r.map((x) => x.amountCents);
        return sum(r) === total && Math.max(...amounts) - Math.min(...amounts) <= 1;
      }),
    );
  });
});

describe("splitPercent", () => {
  it("splits 3333/3333/3334 bps", () => {
    const r = splitPercent(10000, [
      { memberId: "a", bps: 3333 },
      { memberId: "b", bps: 3333 },
      { memberId: "c", bps: 3334 },
    ]);
    expect(r.map((x) => x.amountCents)).toEqual([3333, 3333, 3334]);
  });

  it("leftover in ascending id order", () => {
    const r = splitPercent(1, [
      { memberId: "b", bps: 5000 },
      { memberId: "a", bps: 5000 },
    ]);
    expect(r).toEqual([
      { memberId: "a", amountCents: 1 },
      { memberId: "b", amountCents: 0 },
    ]);
  });

  it("rejects bps not summing 10000", () => {
    expect(() => splitPercent(100, [{ memberId: "a", bps: 9999 }])).toThrow();
  });

  it("property: sums match", () => {
    const sharesArb = idsArb.chain((ids) =>
      fc
        .array(fc.integer({ min: 0, max: 10000 }), { minLength: ids.length - 1, maxLength: ids.length - 1 })
        .map((cuts) => {
          const points = [0, ...cuts.sort((a, b) => a - b), 10000];
          return ids.map((memberId, i) => ({ memberId, bps: points[i + 1]! - points[i]! }));
        }),
    );
    fc.assert(fc.property(totalArb, sharesArb, (total, shares) => sum(splitPercent(total, shares)) === total));
  });
});

describe("validateCustom", () => {
  it("accepts exact sum", () => {
    expect(validateCustom(100, [{ memberId: "a", amountCents: 60 }, { memberId: "b", amountCents: 40 }])).toEqual({ ok: true });
  });
  it("rejects mismatched sum", () => {
    expect(validateCustom(100, [{ memberId: "a", amountCents: 99 }]).ok).toBe(false);
  });
  it("rejects non-integer and negative", () => {
    expect(validateCustom(100, [{ memberId: "a", amountCents: 100.5 }]).ok).toBe(false);
    expect(validateCustom(0, [{ memberId: "a", amountCents: -1 }, { memberId: "b", amountCents: 1 }]).ok).toBe(false);
  });
});
