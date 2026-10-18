import { describe, expect, it } from "vitest";
import { fromDbCents, toDbCents } from "./cents";
import { MAX_EXPENSE_CENTS, PositiveCentsSchema } from "./validation/common";

describe("conversión bigint <-> number", () => {
  it("ida y vuelta sin pérdida, incluido el tope", () => {
    for (const n of [0, 1, 123456, 2_147_483_648, MAX_EXPENSE_CENTS, -4_458_333]) {
      expect(typeof fromDbCents(toDbCents(n))).toBe("number");
      expect(fromDbCents(toDbCents(n))).toBe(n);
    }
    expect(toDbCents(MAX_EXPENSE_CENTS)).toBe(99_999_999_999n);
  });
  it("rechaza decimales, valores sobre el tope y bigint fuera de rango seguro", () => {
    expect(() => toDbCents(10.5)).toThrow(RangeError);
    expect(() => toDbCents(MAX_EXPENSE_CENTS + 1)).toThrow(RangeError);
    expect(() => fromDbCents(2n ** 53n)).toThrow(RangeError);
    // Saldos agregados pueden superar el tope por gasto: fromDbCents solo exige entero seguro.
    expect(fromDbCents(500_000_000_000n)).toBe(500_000_000_000);
  });
});

describe("tope por gasto en Zod", () => {
  it("acepta hasta 99.999.999.999 y rechaza 1 centavo más con mensaje claro", () => {
    expect(PositiveCentsSchema.safeParse(MAX_EXPENSE_CENTS).success).toBe(true);
    const r = PositiveCentsSchema.safeParse(MAX_EXPENSE_CENTS + 1);
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe("El monto máximo por gasto es $ 999.999.999,99");
  });
});
