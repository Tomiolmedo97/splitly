/**
 * Helpers y fixtures compartidos por los specs e2e del Sprint 1.
 *
 * Rutas, textos y roles siguen docs/design/textos.md y wireframes.md (main) y
 * lo confirmado por FE/Design. Lo que todavía no está confirmado queda marcado
 * como SUPUESTO en el spec que lo usa; si cambia, se ajusta acá o en ese spec.
 */
import { randomUUID } from "node:crypto";
import {
  test as base,
  expect,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  type Page,
} from "@playwright/test";
import { BASE_URL, extraHTTPHeaders } from "./entorno";

/**
 * Rutas de la app, según docs/design/textos.md (#16, actualizado por #19 @ b63585f).
 * No hay API REST: auth, grupos y miembros son Server Actions.
 */
export const RUTAS = {
  ingreso: "/ingresar",
  registro: "/registro",
  grupos: "/grupos",
  nuevoGrupo: "/grupos/nuevo",
  grupo: (id: string) => `/grupos/${id}`,
} as const;

/**
 * Textos de la UI, copiados literalmente de docs/design/textos.md (main @ b43b72e):
 * en main no hay un módulo de copy importable (lib/copy.ts llega con #17; cuando
 * se mergee, se puede importar de ahí). FE muestra el texto según error.code.
 */
export const TEXTOS = {
  ingreso: { titulo: "Ingresá a Splitly", boton: "Ingresar", linkRegistro: "Creá una" },
  registro: { titulo: "Creá tu cuenta", nombre: "Tu nombre", boton: "Crear cuenta" },
  misGrupos: {
    saludo: (nombre: string) => `Hola, ${nombre}`,
    nuevoGrupo: "Nuevo grupo",
    vacio: "Todavía no tenés grupos",
    vacioBoton: "Crear mi primer grupo",
  },
  nuevoGrupo: {
    titulo: "Nuevo grupo",
    nombre: "Nombre del grupo",
    moneda: "Moneda",
    ayudaMoneda: "Podés cambiarla mientras el grupo no tenga gastos",
    participantes: "Participantes",
    soloNombre: "Agregar solo con nombre",
    deTusGrupos: "Agregar de tus grupos",
    /** Label solo para lectores de pantalla del buscador de "Agregar de tus grupos". */
    buscadorLabel: "Buscar en tus grupos",
    buscadorPlaceholder: "Buscá por nombre",
    sinResultados: "No hay nadie con ese nombre en tus grupos",
    cantidad: (n: number) => (n === 1 ? "1 persona" : `${n} personas`),
    sinCuenta: "Sin cuenta",
    boton: "Crear grupo",
  },
  general: { cerrarSesion: "Cerrar sesión" },
  detalle: { saldos: "Saldos", gastos: "Gastos" },
  errores: {
    emailTomado: "Ya hay una cuenta con este email",
    credenciales: "El email o la contraseña no coinciden",
    contrasenaCorta: "La contraseña tiene que tener al menos 8 caracteres",
    nombreGrupoVacio: "Ponele un nombre al grupo",
    nombreDuplicado: "Ya hay alguien con ese nombre",
    /** CURRENCY_LOCKED. */
    monedaBloqueada: "Este grupo ya tiene gastos, así que la moneda no se puede cambiar",
    /** MEMBER_DUPLICATE por userId. */
    personaYaAgregada: "Esa persona ya está en el grupo",
    /** NOT_FOUND: también para quien no es miembro (no se filtra si el grupo existe). */
    grupoNoEncontrado: "No encontramos este grupo o no tenés acceso",
  },
} as const;

/** Contraseña válida para los usuarios de prueba. */
export const CONTRASENA_VALIDA = "Splitly-e2e-2026!";

export type UsuarioDePrueba = {
  nombre: string;
  email: string;
  contrasena: string;
};

/**
 * Email único por test (no choca entre workers ni entre corridas).
 * Usa el dominio reservado example.test para no mandar mails reales.
 * En minúsculas: register normaliza el email.
 */
export function emailUnico(prefijo = "qa"): string {
  const sufijo = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  return `${prefijo}+${sufijo}@example.test`;
}

/** Datos de un usuario nuevo, con email único. */
export function nuevoUsuario(nombre = "Tester QA"): UsuarioDePrueba {
  return { nombre, email: emailUnico(), contrasena: CONTRASENA_VALIDA };
}

/** Campo de contraseña: exact para no matchear el botón "ver" (aria-label). */
export function campoContrasena(page: Page) {
  return page.getByLabel("Contraseña", { exact: true });
}

/**
 * Registra un usuario por la UI y deja la sesión iniciada.
 * Confirmado por FE: al terminar el registro entra a /grupos ("Hola, {nombre}").
 */
export async function registrar(page: Page, usuario: UsuarioDePrueba = nuevoUsuario()) {
  await page.goto(RUTAS.registro);
  await page.getByLabel(TEXTOS.registro.nombre, { exact: true }).fill(usuario.nombre);
  await page.getByLabel("Email", { exact: true }).fill(usuario.email);
  await campoContrasena(page).fill(usuario.contrasena);
  await page.getByRole("button", { name: TEXTOS.registro.boton }).click();
  await expect(page).toHaveURL(new RegExp(`${RUTAS.grupos}(\\?|$)`));
  await expect(page.getByRole("heading", { level: 1, name: TEXTOS.misGrupos.saludo(usuario.nombre) })).toBeVisible();
  return usuario;
}

/** Ingresa por la pantalla de Ingreso (wireframe 1). */
export async function ingresar(page: Page, email: string, contrasena: string) {
  await page.goto(RUTAS.ingreso);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await campoContrasena(page).fill(contrasena);
  await page.getByRole("button", { name: TEXTOS.ingreso.boton, exact: true }).click();
}

/**
 * Ingresa y espera a que cargue Mis grupos (URL + h1), para no seguir con la
 * sesión a medio crear.
 */
export async function ingresarYEsperarMisGrupos(page: Page, email: string, contrasena: string) {
  await ingresar(page, email, contrasena);
  await expect(page).toHaveURL(new RegExp(`${RUTAS.grupos}(\\?|$)`));
  await expect(page.getByRole("heading", { level: 1, name: /^Hola, / })).toBeVisible();
}

/**
 * Crea un grupo por la UI (wireframe 5, Server Action createGroup) y devuelve su id, tomado de la URL
 * del detalle al que entra directo después de crear.
 */
export async function crearGrupo(
  page: Page,
  { nombre, moneda = "ARS" }: { nombre: string; moneda?: "ARS" | "USD" },
): Promise<string> {
  await page.goto(RUTAS.nuevoGrupo);
  await page.getByLabel(TEXTOS.nuevoGrupo.nombre).fill(nombre);
  await page.getByRole("radiogroup", { name: TEXTOS.nuevoGrupo.moneda }).getByRole("radio", { name: moneda }).check();
  await page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true }).click();
  await expect(page).toHaveURL(URL_DETALLE_GRUPO);
  return idDeGrupoDesdeUrl(page.url());
}

/** URL del detalle de un grupo (excluye /grupos/nuevo). */
export const URL_DETALLE_GRUPO = /\/grupos\/(?!nuevo(?:[/?#]|$))[^/?#]+(?:[?#].*)?$/;

export function idDeGrupoDesdeUrl(url: string): string {
  const id = new URL(url).pathname.match(/\/grupos\/([^/]+)$/)?.[1];
  if (!id || id === "nuevo") throw new Error(`La URL no es el detalle de un grupo: ${url}`);
  return id;
}

/** Nombre de grupo único, para poder buscarlo en listas sin falsos positivos. */
export function nombreDeGrupoUnico(base: string): string {
  return `${base} ${randomUUID().slice(0, 6)}`;
}

/**
 * Crea un contexto nuevo con browser.newContext() pasando explícitamente
 * baseURL y headers (bypass de Vercel), para usuarios aislados (otra sesión)
 * y para las pasadas de axe / viewport de 360 px.
 */
export async function nuevoContexto(
  browser: Browser,
  opciones: BrowserContextOptions = {},
): Promise<BrowserContext> {
  return browser.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders,
    locale: "es-AR",
    ...opciones,
  });
}

/**
 * Seed del branch de Neon de e2e/preview (nunca producción, ver docs/qa/e2e.md):
 * - tomas@example.com y lucia@example.com comparten el grupo "Bariloche", con el
 *   invitado sin cuenta "Martín" y 2 gastos.
 * - nora@example.com no comparte ningún grupo (para los casos NOT_FOUND).
 * La contraseña sale SIEMPRE de E2E_SEED_PASSWORD; nunca se escribe en el repo.
 */
export const SEED = {
  tomas: { email: "tomas@example.com" },
  lucia: { email: "lucia@example.com" },
  nora: { email: "nora@example.com" },
  grupo: { nombre: "Bariloche", invitado: "Martín", gastos: 2 },
} as const;

/**
 * SUPUESTO (BE confirma): nombre visible de Lucía en el seed. Se busca sin
 * depender de mayúsculas ni del acento.
 */
export const NOMBRE_LUCIA = /^Luc[ií]a\b/i;

/** Contraseña del seed. Falla con un mensaje claro si falta (no rompe --list: se lee al usarla). */
export function contrasenaSeed(): string {
  const valor = process.env.E2E_SEED_PASSWORD;
  if (!valor) throw new Error("Falta E2E_SEED_PASSWORD (contraseña de los usuarios del seed). Ver docs/qa/e2e.md.");
  return valor;
}

/** Ingresa como un usuario del seed y espera Mis grupos. */
export async function ingresarComoSeed(page: Page, usuario: { email: string }) {
  await ingresarYEsperarMisGrupos(page, usuario.email, contrasenaSeed());
}

/** Abre el grupo "Bariloche" desde Mis grupos y devuelve su id. */
export async function abrirGrupoSeed(page: Page): Promise<string> {
  await page.goto(RUTAS.grupos);
  await page.getByRole("link", { name: new RegExp(SEED.grupo.nombre) }).click();
  await expect(page).toHaveURL(URL_DETALLE_GRUPO);
  return idDeGrupoDesdeUrl(page.url());
}

type Fixtures = {
  /** Usuario recién registrado, con la sesión iniciada en `page`. */
  usuarioRegistrado: UsuarioDePrueba;
};

export const test = base.extend<Fixtures>({
  usuarioRegistrado: async ({ page }, use) => {
    const usuario = await registrar(page);
    await use(usuario);
  },
});

export { expect };

/** True si hay una cookie de sesión de Auth.js (authjs.session-token o __Secure-…). */
export async function tieneSesion(context: BrowserContext): Promise<boolean> {
  const cookies = await context.cookies();
  return cookies.some((c) => /(authjs|next-auth)\.session-token$/.test(c.name));
}
