import { describe, expect, it } from "vitest";
import { failureToFormState, readAuthValues, safeValues } from "./auth-form-state";

const values = { name: "Tomás", email: "tomas@example.com", password: "secreta-123" };
const fail = (code: string) => ({ ok: false as const, error: { code, message: "x" } }) as never;

describe("estado del formulario de auth", () => {
  it("nunca devuelve la contraseña", () => {
    expect(safeValues(values)).toEqual({ name: "Tomás", email: "tomas@example.com" });
    for (const code of ["EMAIL_TAKEN", "INVALID_CREDENTIALS", "RATE_LIMITED", "INTERNAL", "PASSWORD_TOO_SHORT"]) {
      expect(JSON.stringify(failureToFormState(fail(code), values))).not.toContain("secreta-123");
    }
  });
  it("EMAIL_TAKEN y PASSWORD_TOO_SHORT van al campo", () => {
    expect(failureToFormState(fail("EMAIL_TAKEN"), values)).toMatchObject({ status: "invalid", fieldErrors: { email: "EMAIL_TAKEN" } });
    expect(failureToFormState(fail("PASSWORD_TOO_SHORT"), values)).toMatchObject({
      status: "invalid",
      fieldErrors: { password: "PASSWORD_TOO_SHORT" },
    });
  });
  it("el resto va a formError", () => {
    for (const code of ["INVALID_CREDENTIALS", "RATE_LIMITED", "VALIDATION_ERROR", "INTERNAL"]) {
      const s = failureToFormState(fail(code), values);
      expect(s).toMatchObject({ status: "error", formError: code, fieldErrors: {} });
    }
  });
  it("lee solo los campos del modo, como strings", () => {
    const fd = new FormData();
    fd.set("email", "a@b.co");
    fd.set("password", "12345678");
    fd.set("name", "No va en login");
    fd.set("admin", "true");
    expect(readAuthValues("login", fd)).toEqual({ email: "a@b.co", password: "12345678" });
    expect(readAuthValues("register", new FormData())).toEqual({ name: "", email: "", password: "" });
  });
});
