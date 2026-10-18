import { describe, expect, it } from "vitest";
import { failureToFormState, readAuthValues, safeValues } from "./auth-form-state";

const values = { name: "Tomás", email: "tomas@example.com", password: "secreta-123" };
const fail = (code: string) => ({ ok: false as const, error: { code, message: "x" } }) as never;

describe("estado del formulario de auth", () => {
  it("nunca devuelve la contraseña", () => {
    expect(safeValues(values)).toEqual({ name: "Tomás", email: "tomas@example.com" });
    for (const code of ["EMAIL_TAKEN", "INVALID_CREDENTIALS", "RATE_LIMITED", "INTERNAL", "PASSWORD_TOO_SHORT"]) {
      for (const mode of ["login", "register"] as const) {
        const state = failureToFormState(mode, fail(code), values);
        expect(JSON.stringify(state)).not.toContain("secreta-123");
        expect(JSON.stringify(state)).not.toContain('"x"');
      }
    }
  });
  it("register: EMAIL_TAKEN y PASSWORD_TOO_SHORT van al campo", () => {
    expect(failureToFormState("register", fail("EMAIL_TAKEN"), values)).toMatchObject({
      fieldErrors: { email: "EMAIL_TAKEN" },
      formError: null,
    });
    expect(failureToFormState("register", fail("PASSWORD_TOO_SHORT"), values)).toMatchObject({
      fieldErrors: { password: "PASSWORD_TOO_SHORT" },
      formError: null,
    });
  });
  it("el resto va a formError", () => {
    for (const code of ["INVALID_CREDENTIALS", "RATE_LIMITED", "VALIDATION_ERROR", "INTERNAL"]) {
      const s = failureToFormState("register", fail(code), values);
      expect(s).toMatchObject({ formError: code, fieldErrors: {} });
    }
  });
  it("login: nunca hay pistas por campo; VALIDATION_ERROR sin campos es INVALID_CREDENTIALS", () => {
    for (const code of ["EMAIL_TAKEN", "PASSWORD_TOO_SHORT", "VALIDATION_ERROR", "INVALID_CREDENTIALS"]) {
      expect(failureToFormState("login", fail(code), values)).toMatchObject({ fieldErrors: {}, formError: "INVALID_CREDENTIALS" });
    }
    expect(failureToFormState("login", fail("RATE_LIMITED"), values)).toMatchObject({ fieldErrors: {}, formError: "RATE_LIMITED" });
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
