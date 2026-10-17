import { describe, expect, it } from "vitest";
import { canSeed } from "../../prisma/seed";

describe("guarda del seed", () => {
  it("corre en local y en previews de Vercel", () => {
    expect(canSeed({ NODE_ENV: "development" })).toBe(true);
    expect(canSeed({ VERCEL_ENV: "preview", NODE_ENV: "production" })).toBe(true);
  });
  it("nunca corre en producción", () => {
    expect(canSeed({ VERCEL_ENV: "production", NODE_ENV: "production" })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "development", NODE_ENV: "development" })).toBe(false);
    expect(canSeed({ NODE_ENV: "production" })).toBe(false);
  });
});
