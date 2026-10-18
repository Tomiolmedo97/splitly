import { describe, expect, it } from "vitest";
import {
  CreateExpenseBodySchema,
  CreateGroupBodySchema,
  CreateMemberBodySchema,
  DateOnlySchema,
  RegisterBodySchema,
  UpdateExpenseBodySchema,
  UpdateGroupBodySchema,
} from "./index";

describe("RegisterBodySchema", () => {
  it("normaliza el email a minúsculas y recorta el nombre", () => {
    const r = RegisterBodySchema.parse({ email: "  Tomas@Example.COM ", password: "12345678", name: " Tomás " });
    expect(r).toEqual({ email: "tomas@example.com", password: "12345678", name: "Tomás" });
  });
  it("rechaza contraseñas de menos de 8 caracteres y campos extra", () => {
    expect(RegisterBodySchema.safeParse({ email: "a@b.co", password: "1234567", name: "A" }).success).toBe(false);
    expect(
      RegisterBodySchema.safeParse({ email: "a@b.co", password: "12345678", name: "A", admin: true }).success,
    ).toBe(false);
  });
});

describe("grupos e integrantes", () => {
  it("la moneda por defecto es ARS", () => {
    expect(CreateGroupBodySchema.parse({ name: "Asado" }).currency).toBe("ARS");
  });
  it("PATCH de grupo exige al menos un campo", () => {
    expect(UpdateGroupBodySchema.safeParse({}).success).toBe(false);
    expect(UpdateGroupBodySchema.safeParse({ currency: "USD" }).success).toBe(true);
    expect(UpdateGroupBodySchema.safeParse({ currency: "EUR" }).success).toBe(false);
  });
  it("invitado: nombre recortado, no vacío, máx. 50", () => {
    expect(CreateMemberBodySchema.safeParse({ kind: "guest", name: "   " }).success).toBe(false);
    expect(CreateMemberBodySchema.safeParse({ kind: "guest", name: "x".repeat(51) }).success).toBe(false);
    expect(CreateMemberBodySchema.parse({ kind: "guest", name: " Sofi " })).toEqual({ kind: "guest", name: "Sofi" });
  });
  it("con cuenta: solo userId, sin email", () => {
    expect(CreateMemberBodySchema.safeParse({ kind: "user", userId: "u1" }).success).toBe(true);
    expect(CreateMemberBodySchema.safeParse({ kind: "user", userId: "u1", email: "a@b.co" }).success).toBe(false);
    expect(CreateMemberBodySchema.safeParse({ kind: "guest", name: "A", email: "a@b.co" }).success).toBe(false);
    expect(CreateMemberBodySchema.safeParse({ name: "A" }).success).toBe(false);
  });
});

describe("gastos (Sprint 2)", () => {
  const base = { description: "Cena", paidByMemberId: "m1", date: "2026-10-17" };

  it("EQUAL: acepta integrantes únicos y rechaza repetidos", () => {
    expect(
      CreateExpenseBodySchema.safeParse({ ...base, splitType: "EQUAL", amountCents: 10000, splits: [{ memberId: "m1" }, { memberId: "m2" }] })
        .success,
    ).toBe(true);
    expect(
      CreateExpenseBodySchema.safeParse({ ...base, splitType: "EQUAL", amountCents: 10000, splits: [{ memberId: "m1" }, { memberId: "m1" }] })
        .success,
    ).toBe(false);
  });

  it("EXACT: las partes tienen que sumar el total", () => {
    const splits = [
      { memberId: "m1", amountCents: 6000 },
      { memberId: "m2", amountCents: 4000 },
    ];
    expect(CreateExpenseBodySchema.safeParse({ ...base, splitType: "EXACT", amountCents: 10000, splits }).success).toBe(true);
    expect(CreateExpenseBodySchema.safeParse({ ...base, splitType: "EXACT", amountCents: 10001, splits }).success).toBe(false);
  });

  it("PERCENTAGE: los puntos básicos suman 10000", () => {
    const ok = [
      { memberId: "m1", basisPoints: 5000 },
      { memberId: "m2", basisPoints: 5000 },
    ];
    expect(CreateExpenseBodySchema.safeParse({ ...base, splitType: "PERCENTAGE", amountCents: 999, splits: ok }).success).toBe(true);
    expect(
      CreateExpenseBodySchema.safeParse({ ...base, splitType: "PERCENTAGE", amountCents: 999, splits: [{ memberId: "m1", basisPoints: 9999 }] })
        .success,
    ).toBe(false);
  });

  it("monto: entero positivo hasta MAX_EXPENSE_CENTS, con fieldError en amountCents", () => {
    const mk = (amountCents: number) =>
      CreateExpenseBodySchema.safeParse({ ...base, splitType: "EQUAL", amountCents, splits: [{ memberId: "m1" }] }).success;
    expect(mk(1)).toBe(true);
    expect(mk(0)).toBe(false);
    expect(mk(10.5)).toBe(false);
    expect(mk(2_147_483_648)).toBe(true);
    expect(mk(99_999_999_999)).toBe(true);
    expect(mk(100_000_000_000)).toBe(false);
    const r = CreateExpenseBodySchema.safeParse({ ...base, splitType: "EQUAL", amountCents: 100_000_000_000, splits: [{ memberId: "m1" }] });
    expect(r.success ? {} : r.error.flatten().fieldErrors).toHaveProperty("amountCents");
  });

  it("PATCH: amountCents, splitType y splits van juntos", () => {
    expect(UpdateExpenseBodySchema.safeParse({ description: "Otra" }).success).toBe(true);
    expect(UpdateExpenseBodySchema.safeParse({ amountCents: 100 }).success).toBe(false);
    expect(UpdateExpenseBodySchema.safeParse({}).success).toBe(false);
    const r = UpdateExpenseBodySchema.parse({ amountCents: 100, splitType: "EQUAL", splits: [{ memberId: "m1" }] });
    expect(r.split?.amountCents).toBe(100);
  });

  it("fecha: solo YYYY-MM-DD válidas", () => {
    expect(DateOnlySchema.safeParse("2026-02-29").success).toBe(false);
    expect(DateOnlySchema.safeParse("2028-02-29").success).toBe(true);
    expect(DateOnlySchema.safeParse("17/10/2026").success).toBe(false);
  });
});
