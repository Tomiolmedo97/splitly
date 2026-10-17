/**
 * Permisos: solo los miembros ven un grupo.
 *
 * La app usa Server Actions llamadas desde el FE (no hay API REST), así que
 * acá se verifica solo por la UI. Los chequeos de autorización de cada
 * Server Action van en apps/web/src/server/__tests__/ (Vitest).
 *
 * PENDIENTE: test.describe.fixme hasta que existan las Server Actions de
 * grupos y las pantallas. Se habilitan sacando el `.fixme`.
 */
import type { Page, Response } from "@playwright/test";
import {
  RUTAS,
  TEXTOS,
  crearGrupo,
  expect,
  nombreDeGrupoUnico,
  nuevoContexto,
  nuevoUsuario,
  registrar,
  test,
} from "./fixtures";

/**
 * Un no miembro recibe NOT_FOUND (nunca FORBIDDEN), así no se filtra si el
 * grupo existe. En la UI: 404 (notFound() de Next), una redirección fuera del
 * detalle o el texto "No encontramos este grupo o no tenés acceso".
 * SUPUESTO: FE confirma si es 404 con ese texto o redirección.
 */
async function esperarAccesoDenegado(page: Page, respuesta: Response | null, idGrupo: string) {
  const status = respuesta?.status() ?? 0;
  const redirigio = !new URL(page.url()).pathname.endsWith(RUTAS.grupo(idGrupo));
  const textoDeError = await page.getByText(TEXTOS.errores.grupoNoEncontrado).count();
  expect(status, "un no miembro nunca recibe 403: no se revela que el grupo existe").not.toBe(403);
  expect(status === 404 || redirigio || textoDeError > 0, `status ${status}, url ${page.url()}`).toBe(true);
}

// Se habilita cuando existan las Server Actions de grupos.
test.describe.fixme("Permisos: acceso a grupos ajenos", () => {
  test("un usuario que no es miembro no puede abrir /grupos/:id", async ({ browser, page }) => {
    // Ana crea un grupo.
    await registrar(page, nuevoUsuario("Ana Dueña"));
    const nombre = nombreDeGrupoUnico("Grupo privado");
    const id = await crearGrupo(page, { nombre });

    // Bruno, con otra sesión, intenta entrar por id directo en la URL.
    const contextoBruno = await nuevoContexto(browser);
    const bruno = await contextoBruno.newPage();
    await registrar(bruno, nuevoUsuario("Bruno Ajeno"));
    const respuesta = await bruno.goto(RUTAS.grupo(id));

    await esperarAccesoDenegado(bruno, respuesta, id);
    // Nunca se filtra el contenido del grupo.
    await expect(bruno.getByText(nombre)).toHaveCount(0);
    await contextoBruno.close();
  });

  test("un no miembro tampoco ve las pantallas internas del grupo", async ({ browser, page }) => {
    await registrar(page, nuevoUsuario("Ana Dueña"));
    const nombre = nombreDeGrupoUnico("Grupo privado");
    const id = await crearGrupo(page, { nombre });

    const contextoBruno = await nuevoContexto(browser);
    const bruno = await contextoBruno.newPage();
    await registrar(bruno, nuevoUsuario("Bruno Ajeno"));
    // SUPUESTO: la pestaña Gastos usa ?tab=gastos sobre el mismo detalle.
    const respuesta = await bruno.goto(`${RUTAS.grupo(id)}?tab=gastos`);

    await esperarAccesoDenegado(bruno, respuesta, id);
    await expect(bruno.getByText(nombre)).toHaveCount(0);
    await expect(bruno.getByRole("button", { name: /Agregar gasto/ })).toHaveCount(0);
    await contextoBruno.close();
  });

  test("un id de grupo inexistente se trata igual que uno ajeno", async ({ page }) => {
    // No se distingue "no existe" de "no sos miembro": no se filtra qué ids existen.
    await registrar(page);
    const id = "grupo-que-no-existe";
    const respuesta = await page.goto(RUTAS.grupo(id));

    await esperarAccesoDenegado(page, respuesta, id);
  });

  test("Mis grupos muestra solo los grupos propios", async ({ browser, page }) => {
    await registrar(page, nuevoUsuario("Ana Dueña"));
    const grupoDeAna = nombreDeGrupoUnico("Viaje de Ana");
    await crearGrupo(page, { nombre: grupoDeAna });

    const contextoBruno = await nuevoContexto(browser);
    const bruno = await contextoBruno.newPage();
    await registrar(bruno, nuevoUsuario("Bruno Ajeno"));
    const grupoDeBruno = nombreDeGrupoUnico("Depto de Bruno");
    await crearGrupo(bruno, { nombre: grupoDeBruno });

    await bruno.goto(RUTAS.grupos);
    await expect(bruno.getByRole("link", { name: new RegExp(grupoDeBruno) })).toBeVisible();
    await expect(bruno.getByText(grupoDeAna)).toHaveCount(0);

    await page.goto(RUTAS.grupos);
    await expect(page.getByRole("link", { name: new RegExp(grupoDeAna) })).toBeVisible();
    await expect(page.getByText(grupoDeBruno)).toHaveCount(0);
    await contextoBruno.close();
  });

  test("un usuario nuevo ve Mis grupos vacío, sin grupos de otros", async ({ browser, page }) => {
    await registrar(page, nuevoUsuario("Ana Dueña"));
    const grupoDeAna = nombreDeGrupoUnico("Viaje de Ana");
    await crearGrupo(page, { nombre: grupoDeAna });

    const contextoNuevo = await nuevoContexto(browser);
    const nuevo = await contextoNuevo.newPage();
    await registrar(nuevo, nuevoUsuario("Recién Llegado"));
    await nuevo.goto(RUTAS.grupos);

    await expect(nuevo.getByText(grupoDeAna)).toHaveCount(0);
    // Estado vacío de textos.md.
    await expect(nuevo.getByText(TEXTOS.misGrupos.vacio)).toBeVisible();
    await contextoNuevo.close();
  });
});
