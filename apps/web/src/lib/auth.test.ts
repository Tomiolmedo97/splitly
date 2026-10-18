import { describe, expect, it } from "vitest";
import { loginForm, registerForm } from "@/server/actions/auth-forms";
import {
  authFieldsByMode,
  authStateFromResult,
  focusTargetAfterSubmit,
  initialAuthState,
  sanitizeAuthState,
  type AuthFormState,
} from "./auth-action";
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
  it("login: la contraseña solo es obligatoria (sin largo mínimo ni otras pistas)", () => {
    expect(validateAuth({ email: "ana@ejemplo.com", password: "123" }, "login")).toEqual({});
    expect(validateAuth({ email: "ana@ejemplo.com", password: "" }, "login")).toEqual({ password: "REQUIRED" });
  });
  it("EMAIL_TAKEN tiene el texto de textos.md", () => {
    expect(fieldErrorCopy.EMAIL_TAKEN).toBe("Ya hay una cuenta con este email. ¿Querés ingresar?");
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

const form = (entries: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
};

describe("registerForm (stub)", () => {
  it("inválido: códigos por campo y los valores, sin la contraseña", async () => {
    const state = await registerForm(initialAuthState, form({ name: "Ana", email: "ana@", password: "123" }));
    expect(state).toEqual({
      values: { name: "Ana", email: "ana@" },
      fieldErrors: { email: "INVALID_EMAIL", password: "PASSWORD_TOO_SHORT" },
      formError: null,
    });
    expect(state.values).not.toHaveProperty("password");
  });

  it("EMAIL_TAKEN va en fieldErrors.email y el foco va al email", async () => {
    const state = await registerForm(initialAuthState, form({ name: "Ana", email: "ocupado@ejemplo.com", password: "12345678" }));
    expect(state).toEqual({
      values: { name: "Ana", email: "ocupado@ejemplo.com" },
      fieldErrors: { email: "EMAIL_TAKEN" },
      formError: null,
    });
    expect(focusTargetAfterSubmit(state, authFieldsByMode.register)).toBe("email");
  });

  it("RATE_LIMITED es error de formulario con el texto de textos.md", async () => {
    const state = await registerForm(initialAuthState, form({ name: "Ana", email: "limite@ejemplo.com", password: "12345678" }));
    expect(state.formError).toBe("RATE_LIMITED");
    expect(state.fieldErrors).toEqual({});
    expect(errorText({ code: state.formError })).toBe("Hiciste muchos intentos. Probá de nuevo en unos minutos");
  });

  it("válido: 'próximamente' y conserva los valores", async () => {
    const state = await registerForm(initialAuthState, form({ name: "Ana", email: "ana@ejemplo.com", password: "12345678" }));
    expect(state).toEqual({ values: { name: "Ana", email: "ana@ejemplo.com" }, fieldErrors: {}, formError: null, notice: "COMING_SOON" });
  });
});

describe("loginForm (stub): no filtra si el email existe", () => {
  it("mail inexistente y contraseña incorrecta dan el mismo estado genérico", async () => {
    const wrongEmail = await loginForm(initialAuthState, form({ email: "noexiste@ejemplo.com", password: "12345678" }));
    const wrongPassword = await loginForm(initialAuthState, form({ email: "ana@ejemplo.com", password: "incorrecta" }));
    for (const state of [wrongEmail, wrongPassword]) {
      expect(state.fieldErrors).toEqual({});
      expect(state.formError).toBe("INVALID_CREDENTIALS");
      expect(errorText({ code: state.formError })).toBe("El email o la contraseña no coinciden");
      expect(state.values).not.toHaveProperty("password");
      expect(focusTargetAfterSubmit(state, authFieldsByMode.login)).toBe("password");
    }
    expect({ ...wrongEmail, values: {} }).toEqual({ ...wrongPassword, values: {} });
  });

  it("contraseña corta en login no da pista por campo", async () => {
    const state = await loginForm(initialAuthState, form({ email: "noexiste@ejemplo.com", password: "123" }));
    expect(state).toEqual({ values: { email: "noexiste@ejemplo.com" }, fieldErrors: {}, formError: "INVALID_CREDENTIALS" });
  });

  it("RATE_LIMITED: error de formulario genérico", async () => {
    const state = await loginForm(initialAuthState, form({ email: "limite@ejemplo.com", password: "12345678" }));
    expect(state).toEqual({ values: { email: "limite@ejemplo.com" }, fieldErrors: {}, formError: "RATE_LIMITED" });
  });

  it("solo errores de formato por campo (vacío, email mal escrito)", async () => {
    const state = await loginForm(initialAuthState, form({ email: "ana@", password: "" }));
    expect(state.fieldErrors).toEqual({ email: "INVALID_EMAIL", password: "REQUIRED" });
    expect(state.formError).toBeNull();
  });
});

describe("authStateFromResult (respuesta de register/login de BE)", () => {
  const values = { name: "Ana", email: "ana@ejemplo.com", password: "secreta123" };
  const err = (code: Parameters<typeof errorText>[0] & { code: string }, fieldErrors?: Record<string, string[]>) =>
    ({ ok: false, error: { ...code, message: "detalle interno que no se muestra", fieldErrors } }) as const;

  it("nunca copia el message ni la contraseña al estado", () => {
    const state = authStateFromResult("login", values, err({ code: "INTERNAL" }) as never);
    expect(JSON.stringify(state)).not.toContain("detalle interno");
    expect(JSON.stringify(state)).not.toContain("secreta123");
    expect(state.formError).toBe("INTERNAL");
  });

  it("VALIDATION_ERROR de zod → códigos por campo según el valor enviado", () => {
    const state = authStateFromResult(
      "register",
      { name: "", email: "x", password: "1" },
      err({ code: "VALIDATION_ERROR" }, { name: ["Required"], email: ["Invalid email"], password: ["Too short"] }) as never,
    );
    expect(state.fieldErrors).toEqual({ name: "REQUIRED", email: "INVALID_EMAIL", password: "PASSWORD_TOO_SHORT" });
  });

  it("login: EMAIL_TAKEN o una contraseña rechazada nunca salen por campo", () => {
    expect(authStateFromResult("login", values, err({ code: "EMAIL_TAKEN" }) as never)).toMatchObject({
      fieldErrors: {},
      formError: "INVALID_CREDENTIALS",
    });
    expect(
      authStateFromResult("login", values, err({ code: "VALIDATION_ERROR" }, { password: ["Too long"] }) as never),
    ).toMatchObject({ fieldErrors: {}, formError: "INVALID_CREDENTIALS" });
  });

  it("sanitizeAuthState en login descarta códigos por campo que distinguirían el caso", () => {
    const leaky: AuthFormState = { values: { email: "ana@ejemplo.com" }, fieldErrors: { email: "EMAIL_TAKEN" }, formError: null };
    expect(sanitizeAuthState("login", leaky)).toEqual({ values: { email: "ana@ejemplo.com" }, fieldErrors: {}, formError: "INVALID_CREDENTIALS" });
    expect(sanitizeAuthState("register", leaky)).toBe(leaky);
  });
});

describe("foco después de un envío fallido", () => {
  const register = authFieldsByMode.register;
  const login = authFieldsByMode.login;
  const base: AuthFormState = { values: {}, fieldErrors: {}, formError: null };

  it("va al primer campo con error, en el orden del formulario", () => {
    expect(focusTargetAfterSubmit({ ...base, fieldErrors: { password: "PASSWORD_TOO_SHORT", email: "INVALID_EMAIL" } }, register)).toBe("email");
    expect(focusTargetAfterSubmit({ ...base, fieldErrors: { name: "REQUIRED", password: "REQUIRED" } }, register)).toBe("name");
    expect(focusTargetAfterSubmit({ ...base, fieldErrors: { password: "REQUIRED" } }, login)).toBe("password");
  });

  it("error de formulario (INVALID_CREDENTIALS, RATE_LIMITED): va a la contraseña", () => {
    expect(focusTargetAfterSubmit({ ...base, formError: "INVALID_CREDENTIALS" }, login)).toBe("password");
    expect(focusTargetAfterSubmit({ ...base, formError: "RATE_LIMITED" }, register)).toBe("password");
  });

  it("no mueve el foco si no hubo un envío fallido", () => {
    expect(focusTargetAfterSubmit(initialAuthState, login)).toBeNull();
    expect(focusTargetAfterSubmit({ ...base, notice: "COMING_SOON" }, login)).toBeNull();
  });
});
