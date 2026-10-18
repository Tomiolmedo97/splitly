"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { AuthFormState } from "@/lib/auth-action";
import { failureToFormState, readAuthValues, safeValues } from "@/lib/auth-form-state";
import { validateAuth } from "@/lib/auth-validation";
import { getDummyHash, hashPassword, verifyPassword } from "@/lib/password";
import { clientIp, consumeRateLimit, resetRateLimit } from "@/server/rate-limit";
import { createSession, destroySession } from "@/server/session";
import type { ActionResult, LoginInput, RegisterInput, UserDTO } from "./contracts";
import { LoginInputSchema, RegisterInputSchema } from "./contracts";

/** Adónde va la persona después de ingresar o registrarse. */
const AFTER_AUTH_PATH = "/grupos";
const AFTER_LOGOUT_PATH = "/ingresar";

type Fail<C extends string> = { ok: false; error: { code: C; message: string; fieldErrors?: Record<string, string[]> } };
const fail = <C extends string>(code: C, message: string, fieldErrors?: Record<string, string[]>): Fail<C> => ({
  ok: false,
  error: fieldErrors ? { code, message, fieldErrors } : { code, message },
});

/** Log sin datos de la persona: nunca la contraseña, el email ni los argumentos de Prisma. */
function logError(action: string, err: unknown) {
  const code = err instanceof Prisma.PrismaClientKnownRequestError ? err.code : undefined;
  console.error(JSON.stringify({ level: "error", action, error: err instanceof Error ? err.name : "unknown", code }));
}

function toUserDTO(u: { id: string; email: string; name: string; createdAt: Date }): UserDTO {
  return { id: u.id, email: u.email, name: u.name, createdAt: u.createdAt.toISOString() };
}

/**
 * Crea una cuenta con email y contraseña. No inicia sesión: después llamar a `login`
 * (registerForm sí deja la sesión iniciada).
 *
 * Errores posibles:
 * - PASSWORD_TOO_SHORT: contraseña con menos de 8 caracteres.
 * - VALIDATION_ERROR: email inválido, nombre vacío, etc. (ver fieldErrors).
 * - EMAIL_TAKEN: ya existe una cuenta con ese email.
 * - RATE_LIMITED: demasiados intentos.
 * - INTERNAL
 */
export async function register(
  input: RegisterInput,
): Promise<ActionResult<UserDTO, "PASSWORD_TOO_SHORT" | "VALIDATION_ERROR" | "EMAIL_TAKEN" | "RATE_LIMITED" | "INTERNAL">> {
  const parsed = RegisterInputSchema.safeParse(input);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    const tooShort = parsed.error.issues.some((i) => i.path[0] === "password" && i.code === "too_small");
    if (tooShort) return fail("PASSWORD_TOO_SHORT", "password too short");
    return fail("VALIDATION_ERROR", "invalid input", fe);
  }
  const { email, password, name } = parsed.data;
  try {
    const [byIp, byEmail] = await Promise.all([
      consumeRateLimit("register", "ip", await clientIp()),
      consumeRateLimit("register", "email", email),
    ]);
    if (!byIp || !byEmail) return fail("RATE_LIMITED", "too many attempts");

    const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) return fail("EMAIL_TAKEN", "email taken");

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return { ok: true, data: toUserDTO(user) };
  } catch (err) {
    // Dos registros simultáneos con el mismo email: el índice único decide.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return fail("EMAIL_TAKEN", "email taken");
    }
    logError("register", err);
    return fail("INTERNAL", "internal error");
  }
}

/**
 * Inicia sesión con email y contraseña. Si sale bien, deja la cookie de sesión.
 *
 * Errores posibles:
 * - VALIDATION_ERROR: faltan campos o el email no tiene formato válido.
 * - INVALID_CREDENTIALS: email o contraseña incorrectos (no se dice cuál). Un email
 *   que no existe tarda lo mismo: se verifica contra un hash dummy.
 * - RATE_LIMITED: demasiados intentos (por IP y por email).
 * - INTERNAL
 */
export async function login(
  input: LoginInput,
): Promise<ActionResult<UserDTO, "VALIDATION_ERROR" | "INVALID_CREDENTIALS" | "RATE_LIMITED" | "INTERNAL">> {
  const parsed = LoginInputSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  const { email, password } = parsed.data;
  try {
    const [byIp, byEmail] = await Promise.all([
      consumeRateLimit("login", "ip", await clientIp()),
      consumeRateLimit("login", "email", email),
    ]);
    if (!byIp || !byEmail) return fail("RATE_LIMITED", "too many attempts");

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, createdAt: true, passwordHash: true },
    });
    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !valid) return fail("INVALID_CREDENTIALS", "invalid credentials");

    await createSession(user.id);
    await resetRateLimit("login", "email", email);
    const { passwordHash: _hash, ...rest } = user;
    return { ok: true, data: toUserDTO(rest) };
  } catch (err) {
    logError("login", err);
    return fail("INTERNAL", "internal error");
  }
}

/**
 * Cierra la sesión actual (borra la sesión en la base y la cookie).
 * Es idempotente: sin sesión también devuelve ok.
 *
 * Errores posibles: INTERNAL.
 */
export async function logout(): Promise<ActionResult<null, "INTERNAL">> {
  try {
    await destroySession();
    return { ok: true, data: null };
  } catch (err) {
    logError("logout", err);
    return fail("INTERNAL", "internal error");
  }
}

// ---------------------------------------------------------------------------
// Acciones para formularios (useActionState). Misma firma que el stub de FE.
// Si sale bien, redirigen del lado del servidor; si no, devuelven AuthFormState.
// ---------------------------------------------------------------------------

export async function loginForm(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = readAuthValues("login", formData);
  // En login el largo mínimo no aplica: solo vacío o email mal escrito. Una contraseña corta
  // va a login() y termina en INVALID_CREDENTIALS, igual que cualquier contraseña incorrecta.
  const fieldErrors = validateAuth(values);
  if (fieldErrors.password === "PASSWORD_TOO_SHORT") delete fieldErrors.password;
  if (Object.keys(fieldErrors).length > 0) return { status: "invalid", values: safeValues(values), fieldErrors };

  const result = await login({ email: values.email ?? "", password: values.password ?? "" });
  if (!result.ok) return failureToFormState(result, values);
  redirect(AFTER_AUTH_PATH);
}

export async function registerForm(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = readAuthValues("register", formData);
  const fieldErrors = validateAuth(values);
  if (Object.keys(fieldErrors).length > 0) return { status: "invalid", values: safeValues(values), fieldErrors };

  const input = { name: values.name ?? "", email: values.email ?? "", password: values.password ?? "" };
  const created = await register(input);
  if (!created.ok) return failureToFormState(created, values);

  // Cuenta recién creada: sesión directa, sin un segundo login (no gasta el rate limit
  // de login ni vuelve a verificar el hash).
  try {
    await createSession(created.data.id);
  } catch (error) {
    logError("registerForm.createSession", error);
    return failureToFormState({ ok: false, error: { code: "INTERNAL", message: "No se pudo iniciar sesión." } }, values);
  }
  redirect(AFTER_AUTH_PATH);
}

/** Para `<form action={logoutForm}>`: cierra la sesión y vuelve a Ingresar. */
export async function logoutForm(): Promise<void> {
  await logout();
  redirect(AFTER_LOGOUT_PATH);
}
