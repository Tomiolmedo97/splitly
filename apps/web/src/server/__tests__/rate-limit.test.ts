import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {} }));

const { RATE_LIMITS, rateLimitKey, rateLimitScope } = await import("../rate-limit");

describe("rate limit", () => {
  it("producción y test usan ámbitos y claves separados", () => {
    expect(rateLimitScope({ VERCEL_ENV: "production" })).toBe("prod");
    expect(rateLimitScope({ VERCEL_ENV: "preview" })).toBe("test");
    expect(rateLimitScope({})).toBe("test");
    expect(rateLimitKey("prod", "login", "email", "a@b.co")).not.toBe(rateLimitKey("test", "login", "email", "a@b.co"));
  });
  it("la clave es un hash: no guarda el email en claro y no distingue mayúsculas", () => {
    const k = rateLimitKey("prod", "login", "email", "Tomas@Example.com");
    expect(k).toMatch(/^[0-9a-f]{64}$/);
    expect(k).not.toContain("tomas");
    expect(k).toBe(rateLimitKey("prod", "login", "email", "tomas@example.com"));
  });
  it("en test el límite por email sigue bajo (para probar RATE_LIMITED) y el de IP es alto", () => {
    expect(RATE_LIMITS.test["login:email"].limit).toBe(RATE_LIMITS.prod["login:email"].limit);
    expect(RATE_LIMITS.test["login:ip"].limit).toBeGreaterThan(RATE_LIMITS.prod["login:ip"].limit);
  });
});
