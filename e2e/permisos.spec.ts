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
  SEED,
  TEXTOS,
  abrirGrupoSeed,
  crearGrupo,
  ingresarComoSeed,
  expect,
  nombreDeGrupoUnico,
  nuevoContexto,
  nuevoUsuario,
  registrar,
  test,
} from "./fixtures";

/**
 * Confirmado por FE/Design: un no miembro recibe NOT_FOUND (nunca FORBIDDEN),
 * así no se filtra si el grupo existe. Next notFound() responde HTTP 404 real,
 * la URL no cambia (no hay redirección) y se ve la pantalla not-found.tsx con
 * "No encontramos este grupo o no tenés acceso" y el botón "Volver a mis grupos".
 */
async function esperarAccesoDenegado(page: Page, respuesta: Response | null, rutaPedida: string) {
  expect(respuesta, "goto tiene que devolver la respuesta del documento").not.toBeNull();
  expect(respuesta!.status()).toBe(404);
  const pedida = new URL(rutaPedida, page.url());
  const actual = new URL(page.url());
  expect(actual.pathname + actual.search).toBe(pedida.pathname + pedida.search);
  await expect(page.getByText(TEXTOS.errores.grupoNoEncontrado)).toBeVisible();
  await expect(page.getByRole("button", { name: TEXTOS.general.volverAMisGrupos })).toBeVisible();
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

    await esperarAccesoDenegado(bruno, respuesta, RUTAS.grupo(id));
    // Nunca se filtra el contenido del grupo.
    await expect(bruno.getByText(nombre)).toHaveCount(0);

    // "Volver a mis grupos" lleva a Mis grupos.
    await bruno.getByRole("button", { name: TEXTOS.general.volverAMisGrupos }).click();
    await expect(bruno).toHaveURL(new RegExp(`${RUTAS.grupos}$`));
    await contextoBruno.close();
  });

  test("un no miembro tampoco ve las pantallas internas del grupo", async ({ browser, page }) => {
    await registrar(page, nuevoUsuario("Ana Dueña"));
    const nombre = nombreDeGrupoUnico("Grupo privado");
    const id = await crearGrupo(page, { nombre });

    const contextoBruno = await nuevoContexto(browser);
    const bruno = await contextoBruno.newPage();
    await registrar(bruno, nuevoUsuario("Bruno Ajeno"));
    // Confirmado por FE: la pestaña Gastos es ?tab=gastos (Saldos es la de por defecto).
    const ruta = `${RUTAS.grupo(id)}?tab=gastos`;
    const respuesta = await bruno.goto(ruta);

    await esperarAccesoDenegado(bruno, respuesta, ruta);
    await expect(bruno.getByText(nombre)).toHaveCount(0);
    await expect(bruno.getByRole("button", { name: /Agregar gasto/ })).toHaveCount(0);
    await contextoBruno.close();
  });

  test("Nora (seed, sin grupos compartidos) no puede abrir Bariloche ni lo ve en Mis grupos", async ({ browser, page }) => {
    // Tomas abre Bariloche para obtener su id.
    await ingresarComoSeed(page, SEED.tomas);
    const id = await abrirGrupoSeed(page);

    const contextoNora = await nuevoContexto(browser);
    const nora = await contextoNora.newPage();
    await ingresarComoSeed(nora, SEED.nora);
    await expect(nora.getByText(SEED.grupo.nombre)).toHaveCount(0);

    for (const ruta of [RUTAS.grupo(id), `${RUTAS.grupo(id)}?tab=gastos`]) {
      const respuesta = await nora.goto(ruta);
      await esperarAccesoDenegado(nora, respuesta, ruta);
      await expect(nora.getByText(SEED.grupo.invitado)).toHaveCount(0);
    }
    await contextoNora.close();
  });

  test("un id de grupo inexistente se trata igual que uno ajeno", async ({ page }) => {
    // No se distingue "no existe" de "no sos miembro": no se filtra qué ids existen.
    await registrar(page);
    const id = "grupo-que-no-existe";
    const respuesta = await page.goto(RUTAS.grupo(id));

    await esperarAccesoDenegado(page, respuesta, RUTAS.grupo(id));
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
