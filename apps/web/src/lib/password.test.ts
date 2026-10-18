import { randomBytes, scryptSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import { getDummyHash, hashPassword, verifyPassword } from "./password";

describe("password (argon2id)", () => {
  it("verifica la contraseña correcta y rechaza otra", async () => {
    const hash = await hashPassword("splitly-demo-123");
    expect(hash.startsWith("$argon2id$v=19$m=19456,t=2,p=1$")).toBe(true);
    expect(await verifyPassword("splitly-demo-123", hash)).toBe(true);
    expect(await verifyPassword("otra-cosa", hash)).toBe(false);
  });
  it("usa sal aleatoria y rechaza formatos desconocidos o rotos", async () => {
    expect(await hashPassword("x")).not.toBe(await hashPassword("x"));
    expect(await verifyPassword("x", "bcrypt$algo")).toBe(false);
    expect(await verifyPassword("x", "$argon2id$roto")).toBe(false);
  });
  it("sigue aceptando el formato scrypt anterior", async () => {
    const salt = randomBytes(16);
    const key = scryptSync("vieja-123", salt, 64, { N: 16384, r: 8, p: 1 });
    const stored = ["scrypt", 16384, 8, 1, salt.toString("base64url"), key.toString("base64url")].join("$");
    expect(await verifyPassword("vieja-123", stored)).toBe(true);
    expect(await verifyPassword("otra", stored)).toBe(false);
  });
  it("el hash dummy es argon2id y no coincide con nada común", async () => {
    const dummy = await getDummyHash();
    expect(dummy.startsWith("$argon2id$")).toBe(true);
    expect(await verifyPassword("", dummy)).toBe(false);
    expect(await verifyPassword("splitly-demo-123", dummy)).toBe(false);
  });
});
