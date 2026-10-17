import { describe, expect, it } from "vitest";
import { validateAuth } from "./auth-validation";
import { copy } from "./copy";
import { ERROR_CODES, errorCopy, errorText } from "./error-copy";

describe("validateAuth", () => {
  it("campos vacíos", () => {
    expect(validateAuth({ name: " ", email: "", password: "" })).toEqual({
      name: copy.authErrors.required,
      email: copy.authErrors.required,
      password: copy.authErrors.required,
    });
  });
  it("email inválido y contraseña corta", () => {
    expect(validateAuth({ email: "ana@", password: "1234567" })).toEqual({
      email: copy.authErrors.invalidEmail,
      password: copy.authErrors.passwordTooShort,
    });
  });
  it("válido", () => {
    expect(validateAuth({ name: "Ana", email: "ana@ejemplo.com", password: "12345678" })).toEqual({});
  });
});

describe("errorText", () => {
  it("tiene texto para todos los códigos", () => {
    for (const code of ERROR_CODES) expect(errorCopy[code]).toBeTruthy();
  });
  it("FORBIDDEN y NOT_FOUND comparten texto", () => {
    expect(errorCopy.FORBIDDEN).toBe(errorCopy.NOT_FOUND);
  });
  it("nunca muestra el message del servidor", () => {
    const fromServer = { code: "EMAIL_TAKEN", message: "duplicate key value violates unique constraint" };
    expect(errorText(fromServer)).toBe(copy.authErrors.emailTaken);
    expect(errorText({ code: "WHATEVER", message: "stack trace" } as { code: unknown })).toBe(copy.general.genericError);
    expect(errorText(null)).toBe(copy.general.genericError);
  });
});
