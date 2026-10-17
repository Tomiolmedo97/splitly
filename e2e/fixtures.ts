/**
 * Helpers y fixtures compartidos por los specs e2e del Sprint 1.
 *
 * Las rutas y los textos de labels/botones siguen los wireframes
 * (docs/design/wireframes.md) y las specs de componentes base. Donde el
 * wireframe no define algo (registro, logout, URLs), queda marcado como
 * SUPUESTO para que FE/BE lo confirmen; si cambia, se ajusta solo acá.
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
 * Rutas de la app, según docs/design/textos.md (PR #16, commit da9ab46).
 * No hay API REST: auth, grupos y miembros son Server Actions.
 */
export const RUTAS = {
  ingreso: "/ingresar",
  registro: "/registro",
  grupos: "/grupos",
  nuevoGrupo: "/grupos/nuevo",
  grupo: (id: string) => `/grupos/${id}`,
} as const;

/** Textos de la UI (docs/design/textos.md, PR #16 @ da9ab46). FE muestra el texto según error.code. */
export const TEXTOS = {
  ingreso: { titulo: "Ingresá a Splitly", boton: "Ingresar", linkRegistro: "Creá una" },
  registro: { titulo: "Creá tu cuenta", nombre: "Tu nombre", boton: "Crear cuenta" },
  misGrupos: { saludo: (nombre: string) => `Hola, ${nombre}`, nuevoGrupo: "Nuevo grupo", vacio: "Todavía no tenés grupos" },
  nuevoGrupo: {
    titulo: "Nuevo grupo",
    nombre: "Nombre del grupo",
    moneda: "Moneda",
    participantes: "Participantes",
    porEmail: "Agregar por email",
    soloNombre: "Agregar solo con nombre",
    sinCuenta: "Sin cuenta",
    boton: "Crear grupo",
  },
  general: { cerrarSesion: "Cerrar sesión" },
  errores: {
    emailTomado: "Ya hay una cuenta con este email",
    credenciales: "El email o la contraseña no coinciden",
    contrasenaCorta: "La contraseña tiene que tener al menos 8 caracteres",
    nombreGrupoVacio: "Ponele un nombre al grupo",
    miembroDuplicado: "Esa persona ya está en el grupo",
    nombreDuplicado: "Ya hay alguien con ese nombre",
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
 * SUPUESTO: al terminar el registro, entra directo a Mis grupos ("Hola, {nombre}").
 */
export async function registrar(page: Page, usuario: UsuarioDePrueba = nuevoUsuario()) {
  await page.goto(RUTAS.registro);
  await page.getByLabel(TEXTOS.registro.nombre, { exact: true }).fill(usuario.nombre);
  await page.getByLabel("Email", { exact: true }).fill(usuario.email);
  await campoContrasena(page).fill(usuario.contrasena);
  await page.getByRole("button", { name: TEXTOS.registro.boton }).click();
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
