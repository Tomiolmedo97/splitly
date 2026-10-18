import { describe, expect, it } from "vitest";
import { displayStatus } from "./balance-status";

describe("displayStatus (cuenta animada)", () => {
  it("signo y color siguen al valor mostrado", () => {
    expect(displayStatus(1200, 300000)).toBe("positive");
    expect(displayStatus(-50, 300000)).toBe("negative"); // todavía no cruzó el 0
    expect(displayStatus(150000, 0)).toBe("positive"); // bajando hacia 0
  });

  it("'Al día' solo cuando el saldo final es 0", () => {
    expect(displayStatus(0, 0)).toBe("settled");
    expect(displayStatus(1, 0)).not.toBe("settled");
  });

  it("al cruzar el 0 pasa directo al otro signo, sin destello de 'Al día'", () => {
    const frames = [-300000, -1000, 0, 2000, 450000];
    const states = frames.map((v) => displayStatus(v, 450000));
    expect(states).not.toContain("settled");
    expect(states).toEqual(["negative", "negative", "positive", "positive", "positive"]);
    expect(displayStatus(0, -100)).toBe("negative");
  });
});
