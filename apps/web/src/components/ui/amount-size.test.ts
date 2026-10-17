import { describe, expect, it } from "vitest";
import { formatMoney } from "@/lib/format-money";
import { amountClasses, amountLengthSteps } from "./amount-size";

const plus = (cents: number) => formatMoney(cents, "USD", { showPlus: true });

describe("amountLengthSteps", () => {
  it("baja un escalón desde 14 caracteres y dos desde 17", () => {
    expect(plus(450000)).toHaveLength(13); // +US$ 4.500,00
    expect(amountLengthSteps(plus(450000))).toBe(0);
    expect(amountLengthSteps(plus(4500000))).toBe(1); // +US$ 45.000,00 (14)
    expect(amountLengthSteps(plus(45000000))).toBe(1); // 15
    expect(amountLengthSteps(plus(4500000000))).toBe(2); // +US$ 45.000.000,00 (18)
    expect(amountLengthSteps(plus(99999999999))).toBe(2); // +US$ 999.999.999,99 (19)
  });

  it("cuenta el menos tipográfico como un carácter", () => {
    expect(amountLengthSteps("−".repeat(13))).toBe(0);
    expect(amountLengthSteps("−".repeat(14))).toBe(1);
  });
});

describe("amountClasses", () => {
  it("resumen: 40 → 28 → 20 y se combina con las container queries", () => {
    expect(amountClasses("summary", plus(450000)).text).toBe(
      "text-[40px] @max-[360px]:text-[28px] @max-[240px]:text-[20px]",
    );
    expect(amountClasses("summary", plus(4500000)).text).toBe("text-[28px] @max-[360px]:text-[20px]");
    expect(amountClasses("summary", plus(99999999999)).text).toBe("text-[20px]");
  });

  it("grilla: 28 → 20, con 20 px bajo 240 px, nunca menos de 20", () => {
    expect(amountClasses("grid", plus(450000)).text).toBe("text-[28px] @max-[240px]:text-[20px]");
    expect(amountClasses("grid", plus(4500000)).text).toBe("text-[20px]");
    expect(amountClasses("grid", plus(99999999999)).text).toBe("text-[20px]");
  });
});
