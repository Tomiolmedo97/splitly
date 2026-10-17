import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password (scrypt)", () => {
  it("verifica la contraseña correcta y rechaza otra", async () => {
    const hash = await hashPassword("splitly-demo-123");
    expect(hash.startsWith("scrypt$16384$8$1$")).toBe(true);
    expect(await verifyPassword("splitly-demo-123", hash)).toBe(true);
    expect(await verifyPassword("otra-cosa", hash)).toBe(false);
  });
  it("usa sal aleatoria y rechaza formatos desconocidos", async () => {
    expect(await hashPassword("x")).not.toBe(await hashPassword("x"));
    expect(await verifyPassword("x", "bcrypt$algo")).toBe(false);
  });
});
