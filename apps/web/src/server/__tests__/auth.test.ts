/**
 * Integración de las Server Actions de auth: register, login, logout.
 * Contrato y helpers en ./contrato.ts. Se verifica error.code, nunca el message.
 *
 * PENDIENTE: it.todo hasta que BE publique las acciones; se completan con
 * esperarError / esperarOk contra la base de prueba (branch de Neon con seed).
 */
import { describe, it } from "vitest";

describe("register", () => {
  it.todo("crea el usuario e inicia sesión con email y contraseña válidos");
  it.todo("un email ya registrado devuelve EMAIL_TAKEN");
  it.todo("el mismo email con otras mayúsculas también devuelve EMAIL_TAKEN");
  it.todo("una contraseña de menos de 8 caracteres devuelve PASSWORD_TOO_SHORT");
  it.todo("una contraseña de exactamente 8 caracteres se acepta (límite)");
  it.todo("normaliza el email a minúsculas (y sin espacios) antes de guardarlo");
  it.todo("un email inválido devuelve VALIDATION_ERROR con fieldErrors.email");
  it.todo("un nombre vacío devuelve VALIDATION_ERROR con fieldErrors.name");
  it.todo("nunca guarda la contraseña en texto plano (hash)");
  it.todo("muchos intentos seguidos devuelven RATE_LIMITED");
});

describe("login", () => {
  it.todo("con credenciales correctas inicia sesión (cookie de Auth.js)");
  it.todo("con contraseña incorrecta devuelve INVALID_CREDENTIALS");
  it.todo("con un email que no existe devuelve INVALID_CREDENTIALS (mismo code: no revela si existe)");
  it.todo("acepta el email con otras mayúsculas (normalizado)");
  it.todo("muchos intentos fallidos devuelven RATE_LIMITED");
});

describe("logout", () => {
  it.todo("cierra la sesión: después, las acciones protegidas devuelven UNAUTHENTICATED");
});
