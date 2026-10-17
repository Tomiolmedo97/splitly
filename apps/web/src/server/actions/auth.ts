"use server";

import type { ActionResult, LoginInput, RegisterInput, UserDTO } from "./contracts";
import { notImplemented } from "./contracts";

/**
 * Crea una cuenta con email y contraseña. No inicia sesión: después llamar a `login`.
 * Entrada: RegisterInputSchema (email se normaliza a minúsculas).
 *
 * Errores posibles:
 * - PASSWORD_TOO_SHORT: contraseña con menos de 8 caracteres.
 * - VALIDATION_ERROR: email inválido, nombre vacío, etc. (ver fieldErrors).
 * - EMAIL_TAKEN: ya existe una cuenta con ese email.
 * - RATE_LIMITED: demasiados intentos.
 * - INTERNAL
 */
export async function register(
  _input: RegisterInput,
): Promise<ActionResult<UserDTO, "PASSWORD_TOO_SHORT" | "VALIDATION_ERROR" | "EMAIL_TAKEN" | "RATE_LIMITED" | "INTERNAL">> {
  return notImplemented("register");
}

/**
 * Inicia sesión con credenciales (Auth.js). Si sale bien, deja la cookie de sesión.
 *
 * Errores posibles:
 * - VALIDATION_ERROR: faltan campos o el email no tiene formato válido.
 * - INVALID_CREDENTIALS: email o contraseña incorrectos (no se dice cuál).
 * - RATE_LIMITED: demasiados intentos.
 * - INTERNAL
 */
export async function login(
  _input: LoginInput,
): Promise<ActionResult<UserDTO, "VALIDATION_ERROR" | "INVALID_CREDENTIALS" | "RATE_LIMITED" | "INTERNAL">> {
  return notImplemented("login");
}

/**
 * Cierra la sesión actual (borra la sesión en la base y la cookie).
 * Es idempotente: sin sesión también devuelve ok.
 *
 * Errores posibles: INTERNAL.
 */
export async function logout(): Promise<ActionResult<null, "INTERNAL">> {
  return notImplemented("logout");
}
