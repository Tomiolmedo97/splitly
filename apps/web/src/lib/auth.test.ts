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
  it("textos finales de PR #16 (af9a93f)", () => {
    expect(errorCopy.NOT_FOUND).toBe("No encontramos este grupo o no tenés acceso");
    expect(errorCopy.FORBIDDEN).toBe("No tenés permiso para hacer esto en el grupo");
    expect(errorText({ code: "MEMBER_HAS_BALANCE" }, { nombre: "Juan" })).toBe(
      "Juan todavía tiene saldo. Tiene que quedar al día antes de salir del grupo",
    );
    expect(errorText({ code: "MEMBER_HAS_BALANCE" })).toBe(copy.general.genericError);
  });
  it("nunca muestra el message del servidor", () => {
    const fromServer = { code: "EMAIL_TAKEN", message: "duplicate key value violates unique constraint" };
    expect(errorText(fromServer)).toBe(copy.authErrors.emailTaken);
    expect(errorText({ code: "WHATEVER", message: "stack trace" } as { code: unknown })).toBe(copy.general.genericError);
    expect(errorText(null)).toBe(copy.general.genericError);
  });
});
