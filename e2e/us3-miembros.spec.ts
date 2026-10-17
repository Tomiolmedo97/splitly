/**
 * US3: agregar participantes a un grupo, con cuenta (por email) o sin cuenta
 * (solo con nombre: Member sin userId).
 *
 * Se verifica por la UI (Server Action addMember, sin API REST). Que el Member
 * sin cuenta quede con userId null se prueba en
 * apps/web/src/server/__tests__/members.test.ts; acá el indicador es la
 * etiqueta "Sin cuenta".
 *
 * PENDIENTE: test.describe.fixme hasta que BE publique addMember y FE la
 * sección Participantes de Nuevo grupo (wireframe 5). Se habilitan sacando el `.fixme`.
 */
import type { Page } from "@playwright/test";
import {
  RUTAS,
  TEXTOS,
  URL_DETALLE_GRUPO,
  expect,
  nombreDeGrupoUnico,
  nuevoContexto,
  nuevoUsuario,
  registrar,
  test,
} from "./fixtures";

/** SUPUESTO: la sección "Participantes" es una lista con ese nombre accesible. */
function participantes(page: Page) {
  return page.getByRole("list", { name: TEXTOS.nuevoGrupo.participantes });
}

function filaDe(page: Page, nombre: string | RegExp) {
  return participantes(page).getByRole("listitem").filter({ hasText: nombre });
}

/** SUPUESTO: "Agregar solo con nombre" abre un campo "Nombre" y un botón "Agregar". */
async function agregarSinCuenta(page: Page, nombre: string) {
  await page.getByRole("button", { name: TEXTOS.nuevoGrupo.soloNombre }).click();
  await page.getByLabel("Nombre", { exact: true }).fill(nombre);
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
}

/** SUPUESTO: "Agregar por email" abre un campo "Email" y un botón "Agregar". */
async function agregarPorEmail(page: Page, email: string) {
  await page.getByRole("button", { name: TEXTOS.nuevoGrupo.porEmail }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
}

async function crearGrupoDesdeFormulario(page: Page, nombre: string) {
  await page.getByLabel(TEXTOS.nuevoGrupo.nombre).fill(nombre);
  await page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true }).click();
  await expect(page).toHaveURL(URL_DETALLE_GRUPO);
}

/** Otro usuario con cuenta, registrado en un contexto aparte. */
async function registrarOtro(browser: Parameters<typeof nuevoContexto>[0], nombre: string) {
  const contexto = await nuevoContexto(browser);
  const usuario = await registrar(await contexto.newPage(), nuevoUsuario(nombre));
  await contexto.close();
  return usuario;
}

// Se habilita cuando exista la Server Action addMember.
test.describe.fixme("US3: participantes del grupo", () => {
  test("quien crea el grupo figura como participante (vos)", async ({ page, usuarioRegistrado }) => {
    await page.goto(RUTAS.nuevoGrupo);

    await expect(filaDe(page, `${usuarioRegistrado.nombre} (vos)`)).toBeVisible();
  });

  test("agregar un participante sin cuenta (Member sin userId)", async ({ page }) => {
    await page.goto(RUTAS.nuevoGrupo);
    await agregarSinCuenta(page, "Juan");

    const fila = filaDe(page, "Juan");
    await expect(fila).toBeVisible();
    // Etiqueta "Sin cuenta" (texto, no solo color).
    await expect(fila.getByText(TEXTOS.nuevoGrupo.sinCuenta)).toBeVisible();

    // Después de crear, sigue en el grupo con la misma etiqueta.
    await crearGrupoDesdeFormulario(page, nombreDeGrupoUnico("Asado viernes"));
    await expect(page.getByText("Juan").first()).toBeVisible();
  });

  test("agregar por email a alguien con cuenta lo suma sin la etiqueta Sin cuenta", async ({ browser, page }) => {
    const sofi = await registrarOtro(browser, "Sofi Con Cuenta");

    await page.goto(RUTAS.nuevoGrupo);
    await agregarPorEmail(page, sofi.email);

    const fila = filaDe(page, sofi.nombre);
    await expect(fila).toBeVisible();
    await expect(fila.getByText(TEXTOS.nuevoGrupo.sinCuenta)).toHaveCount(0);

    // Sofi, desde su sesión, ve el grupo en Mis grupos.
    const nombre = nombreDeGrupoUnico("Depto");
    await crearGrupoDesdeFormulario(page, nombre);
    const contextoSofi = await nuevoContexto(browser);
    const paginaSofi = await contextoSofi.newPage();
    await paginaSofi.goto(RUTAS.ingreso);
    await paginaSofi.getByLabel("Email", { exact: true }).fill(sofi.email);
    await paginaSofi.getByLabel("Contraseña", { exact: true }).fill(sofi.contrasena);
    await paginaSofi.getByRole("button", { name: TEXTOS.ingreso.boton, exact: true }).click();
    await paginaSofi.goto(RUTAS.grupos);
    await expect(paginaSofi.getByRole("link", { name: new RegExp(nombre) })).toBeVisible();
    await contextoSofi.close();
  });

  test("el nombre del participante sin cuenta es obligatorio", async ({ page }) => {
    await page.goto(RUTAS.nuevoGrupo);
    await page.getByRole("button", { name: TEXTOS.nuevoGrupo.soloNombre }).click();
    await page.getByLabel("Nombre", { exact: true }).fill("   ");
    const agregar = page.getByRole("button", { name: "Agregar", exact: true });

    // Botón deshabilitado o error "Completá este campo" (SUPUESTO: FE confirma).
    if (await agregar.isEnabled()) {
      await agregar.click();
      await expect(page.getByText("Completá este campo")).toBeVisible();
    } else {
      await expect(agregar).toBeDisabled();
    }
    // Solo queda quien crea el grupo.
    await expect(participantes(page).getByRole("listitem")).toHaveCount(1);
  });

  test("no se puede agregar dos veces el mismo email (MEMBER_DUPLICATE)", async ({ browser, page }) => {
    const juan = await registrarOtro(browser, "Juan Duplicado");

    await page.goto(RUTAS.nuevoGrupo);
    await agregarPorEmail(page, juan.email);
    await agregarPorEmail(page, juan.email.toUpperCase());

    await expect(page.getByText(TEXTOS.errores.miembroDuplicado)).toBeVisible();
    await expect(filaDe(page, juan.nombre)).toHaveCount(1);
  });

  test("no se puede agregar a uno mismo por email", async ({ page, usuarioRegistrado }) => {
    await page.goto(RUTAS.nuevoGrupo);
    await agregarPorEmail(page, usuarioRegistrado.email);

    await expect(page.getByText(TEXTOS.errores.miembroDuplicado)).toBeVisible();
    await expect(participantes(page).getByRole("listitem")).toHaveCount(1);
  });

  test("no se puede repetir el nombre de un participante sin cuenta", async ({ page }) => {
    // textos.md define "Ya hay alguien con ese nombre…". SUPUESTO a confirmar con BE:
    // la comparación no distingue mayúsculas.
    await page.goto(RUTAS.nuevoGrupo);
    await agregarSinCuenta(page, "Juan");
    await agregarSinCuenta(page, "juan");

    await expect(page.getByText(TEXTOS.errores.nombreDuplicado)).toBeVisible();
    await expect(filaDe(page, /juan/i)).toHaveCount(1);
  });
});
