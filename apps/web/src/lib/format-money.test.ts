import { describe, expect, it } from "vitest";
import { formatMoney } from "./format-money";

const show = (s: string) => s.replace(/\u00a0/g, "␣");

describe("formatMoney", () => {
  it("ARS y USD con el mismo formato es-AR, solo cambia el símbolo", () => {
    expect(show(formatMoney(300000, "ARS"))).toBe("$␣3.000,00");
    expect(show(formatMoney(450000, "USD"))).toBe("US$␣4.500,00");
    expect(show(formatMoney(123456789, "USD"))).toBe("US$␣1.234.567,89");
  });

  it("signo con espacio duro y menos tipográfico (U+2212)", () => {
    expect(show(formatMoney(450000, "USD", { showPlus: true }))).toBe("+␣US$␣4.500,00");
    expect(show(formatMoney(-150000, "ARS"))).toBe("−␣$␣1.500,00");
    expect(formatMoney(-1, "USD").startsWith("\u2212")).toBe(true);
  });

  it("cero sin signo, sin '+' por defecto y sin espacios comunes", () => {
    expect(show(formatMoney(0, "ARS", { showPlus: true }))).toBe("$␣0,00");
    expect(show(formatMoney(5, "USD"))).toBe("US$␣0,05");
    expect(formatMoney(-450000, "USD", { showPlus: true })).not.toContain(" ");
  });
});
