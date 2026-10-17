import { describe, expect, it } from "vitest";
import { createStubAuthAction, initialAuthState } from "./auth-action";
import { fieldErrorCopy, validateAuth } from "./auth-validation";
import { copy } from "./copy";
import { ERROR_CODES, errorCopy, errorText } from "./error-copy";

describe("validateAuth", () => {
  it("campos vacíos", () => {
    expect(validateAuth({ name: " ", email: "", password: "" })).toEqual({
      name: "REQUIRED",
      email: "REQUIRED",
      password: "REQUIRED",
    });
    expect(fieldErrorCopy.REQUIRED).toBe(copy.authErrors.required);
  });
  it("email inválido y contraseña corta", () => {
    expect(validateAuth({ email: "ana@", password: "1234567" })).toEqual({
      email: "INVALID_EMAIL",
      password: "PASSWORD_TOO_SHORT",
    });
    expect(fieldErrorCopy.INVALID_EMAIL).toBe(copy.authErrors.invalidEmail);
    expect(fieldErrorCopy.PASSWORD_TOO_SHORT).toBe(copy.authErrors.passwordTooShort);
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

describe("acción stub de useActionState", () => {
  const form = (entries: Record<string, string>) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(entries)) fd.set(k, v);
    return fd;
  };

  it("inválido: devuelve códigos por campo y los valores (sin la contraseña)", async () => {
    const action = createStubAuthAction("register", 0);
    const state = await action(initialAuthState, form({ name: "Ana", email: "ana@", password: "123" }));
    expect(state.status).toBe("invalid");
    expect(state.fieldErrors).toEqual({ email: "INVALID_EMAIL", password: "PASSWORD_TOO_SHORT" });
    expect(state.values).toEqual({ name: "Ana", email: "ana@" });
    expect(state.values).not.toHaveProperty("password");
  });

  it("válido: 'próximamente' y conserva los valores", async () => {
    const action = createStubAuthAction("login", 0);
    const state = await action(initialAuthState, form({ email: "ana@ejemplo.com", password: "12345678" }));
    expect(state).toEqual({ status: "coming-soon", values: { email: "ana@ejemplo.com" }, fieldErrors: {} });
  });
});
