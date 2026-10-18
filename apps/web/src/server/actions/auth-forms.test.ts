import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorText } from "@/lib/error-copy";
import { initialAuthState } from "@/lib/auth-action";

/**
 * Las Server Actions reales de formulario (registerForm/loginForm/logoutForm de ./auth.ts)
 * con la base, la sesión, el rate limit y el hash mockeados: verifica el estado que ve la UI.
 */
const user = { id: "u1", email: "ana@ejemplo.com", name: "Ana", createdAt: new Date(0), passwordHash: "$argon2id$hash" };
const db = { user: { findUnique: vi.fn(), create: vi.fn() } };
const consumeRateLimit = vi.fn();
const createSession = vi.fn();
const destroySession = vi.fn();
const verifyPassword = vi.fn();

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/server/session", () => ({ createSession, destroySession }));
vi.mock("@/server/rate-limit", () => ({
  clientIp: async () => "1.2.3.4",
  consumeRateLimit: (...a: unknown[]) => consumeRateLimit(...a),
  resetRateLimit: async () => {},
}));
vi.mock("@/lib/password", () => ({
  hashPassword: async () => "$argon2id$nuevo",
  verifyPassword: (...a: unknown[]) => verifyPassword(...a),
  getDummyHash: async () => "$argon2id$dummy",
}));

const { loginForm, logoutForm, registerForm } = await import("./auth-forms");

const form = (entries: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
};

async function redirectTarget(run: () => Promise<unknown>): Promise<string> {
  try {
    await run();
  } catch (error) {
    const digest = String((error as { digest?: string }).digest ?? "");
    if (digest.startsWith("NEXT_REDIRECT")) return digest.split(";")[2] ?? "";
    throw error;
  }
  return "";
}

beforeEach(() => {
  vi.clearAllMocks();
  consumeRateLimit.mockResolvedValue(true);
  db.user.findUnique.mockResolvedValue(null);
  db.user.create.mockResolvedValue(user);
  verifyPassword.mockResolvedValue(false);
});

describe("loginForm", () => {
  it("mail inexistente y contraseña incorrecta: el mismo estado genérico, sin errores por campo", async () => {
    const wrongEmail = await loginForm(initialAuthState, form({ email: "noexiste@ejemplo.com", password: "12345678" }));
    db.user.findUnique.mockResolvedValue(user);
    const wrongPassword = await loginForm(initialAuthState, form({ email: "ana@ejemplo.com", password: "otra-clave" }));
    for (const state of [wrongEmail, wrongPassword]) {
      expect(state.fieldErrors).toEqual({});
      expect(state.formError).toBe("INVALID_CREDENTIALS");
      expect(errorText({ code: state.formError })).toBe("El email o la contraseña no coinciden");
      expect(JSON.stringify(state)).not.toMatch(/12345678|otra-clave|invalid credentials/);
    }
    expect({ ...wrongEmail, values: {} }).toEqual({ ...wrongPassword, values: {} });
    expect(createSession).not.toHaveBeenCalled();
  });

  it("contraseña corta: sin pista por campo (no aplica el mínimo de registro)", async () => {
    const state = await loginForm(initialAuthState, form({ email: "ana@ejemplo.com", password: "123" }));
    expect(state).toEqual({ values: { email: "ana@ejemplo.com" }, fieldErrors: {}, formError: "INVALID_CREDENTIALS" });
  });

  it("contraseña de 129 caracteres: el servidor la rechaza y la UI ve el genérico INVALID_CREDENTIALS", async () => {
    const state = await loginForm(initialAuthState, form({ email: "ana@ejemplo.com", password: "x".repeat(129) }));
    expect(state).toEqual({ values: { email: "ana@ejemplo.com" }, fieldErrors: {}, formError: "INVALID_CREDENTIALS" });
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("RATE_LIMITED es error de formulario", async () => {
    consumeRateLimit.mockResolvedValue(false);
    const state = await loginForm(initialAuthState, form({ email: "ana@ejemplo.com", password: "12345678" }));
    expect(state).toEqual({ values: { email: "ana@ejemplo.com" }, fieldErrors: {}, formError: "RATE_LIMITED" });
  });

  it("formato inválido: códigos por campo sin llamar a la base", async () => {
    const state = await loginForm(initialAuthState, form({ email: "ana@", password: "" }));
    expect(state).toEqual({ values: { email: "ana@" }, fieldErrors: { email: "INVALID_EMAIL", password: "REQUIRED" }, formError: null });
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("credenciales correctas: crea la sesión y redirige a /grupos", async () => {
    db.user.findUnique.mockResolvedValue(user);
    verifyPassword.mockResolvedValue(true);
    expect(await redirectTarget(() => loginForm(initialAuthState, form({ email: "ana@ejemplo.com", password: "12345678" })))).toBe("/grupos");
    expect(createSession).toHaveBeenCalledWith("u1");
  });
});

describe("registerForm", () => {
  it("EMAIL_TAKEN va solo en fieldErrors.email", async () => {
    db.user.findUnique.mockResolvedValue({ id: "u1" });
    const state = await registerForm(initialAuthState, form({ name: "Ana", email: "ana@ejemplo.com", password: "12345678" }));
    expect(state).toEqual({ values: { name: "Ana", email: "ana@ejemplo.com" }, fieldErrors: { email: "EMAIL_TAKEN" }, formError: null });
  });

  it("RATE_LIMITED es error de formulario", async () => {
    consumeRateLimit.mockResolvedValue(false);
    const state = await registerForm(initialAuthState, form({ name: "Ana", email: "ana@ejemplo.com", password: "12345678" }));
    expect(state.formError).toBe("RATE_LIMITED");
    expect(state.fieldErrors).toEqual({});
    expect(state.values).not.toHaveProperty("password");
  });

  it("51 caracteres de nombre y 129 de contraseña: códigos de largo máximo, sin tocar la base", async () => {
    const state = await registerForm(initialAuthState, form({ name: "A".repeat(51), email: "ana@ejemplo.com", password: "x".repeat(129) }));
    expect(state).toEqual({
      values: { name: "A".repeat(51), email: "ana@ejemplo.com" },
      fieldErrors: { name: "NAME_TOO_LONG", password: "PASSWORD_TOO_LONG" },
      formError: null,
    });
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("cuenta nueva: inicia sesión y redirige a /grupos", async () => {
    db.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(user);
    verifyPassword.mockResolvedValue(true);
    const target = await redirectTarget(() =>
      registerForm(initialAuthState, form({ name: "Ana", email: "ana@ejemplo.com", password: "12345678" })),
    );
    expect(target).toBe("/grupos");
    expect(createSession).toHaveBeenCalledWith("u1");
  });
});

describe("logoutForm", () => {
  it("borra la sesión y redirige a /ingresar", async () => {
    expect(await redirectTarget(() => logoutForm())).toBe("/ingresar");
    expect(destroySession).toHaveBeenCalled();
  });
});
