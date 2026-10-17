/**
 * Accesibilidad (axe) y pasada en viewport de 360 px.
 *
 * Criterio (docs/qa/estrategia-de-pruebas.md): cero violaciones serias o
 * críticas. Cada test crea su propio contexto con browser.newContext() (vía
 * nuevoContexto) para controlar viewport y sesión. Corre solo en el proyecto
 * chromium (testIgnore en playwright.config.ts).
 *
 * PENDIENTE: test.describe.fixme hasta que existan las pantallas de Ingreso
 * y grupos con sus Server Actions. Se habilitan sacando el `.fixme`.
 */
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import {
  RUTAS,
  TEXTOS,
  crearGrupo,
  expect,
  nombreDeGrupoUnico,
  nuevoContexto,
  registrar,
  test,
} from "./fixtures";

const ETIQUETAS_WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const MOVIL_360 = { width: 360, height: 800 };

/** Corre axe y falla solo con violaciones serias o críticas (con detalle legible). */
async function esperarSinViolacionesGraves(page: Page) {
  const resultado = await new AxeBuilder({ page }).withTags(ETIQUETAS_WCAG).analyze();
  const graves = resultado.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} nodo(s)`);
  expect(graves, `Violaciones de axe en ${page.url()}`).toEqual([]);
}

/** Sin scroll horizontal: el contenido entra en el ancho del viewport. */
async function esperarSinScrollHorizontal(page: Page) {
  const { anchoContenido, anchoVentana } = await page.evaluate(() => ({
    anchoContenido: document.documentElement.scrollWidth,
    anchoVentana: window.innerWidth,
  }));
  expect(anchoContenido).toBeLessThanOrEqual(anchoVentana);
}

// Se habilita cuando existan las pantallas y las Server Actions.
test.describe.fixme("Accesibilidad con axe", () => {
  test("Ingreso sin violaciones serias ni críticas", async ({ browser }) => {
    const contexto = await nuevoContexto(browser);
    const page = await contexto.newPage();
    await page.goto(RUTAS.ingreso);
    await expect(page.getByRole("button", { name: TEXTOS.ingreso.boton, exact: true })).toBeVisible();

    await esperarSinViolacionesGraves(page);
    await contexto.close();
  });

  test("Ingreso con error de contraseña sigue accesible", async ({ browser }) => {
    const contexto = await nuevoContexto(browser);
    const page = await contexto.newPage();
    await page.goto(RUTAS.ingreso);
    await page.getByRole("button", { name: TEXTOS.ingreso.boton, exact: true }).click();
    // El error inline también tiene que pasar contraste y estar asociado al campo.
    await esperarSinViolacionesGraves(page);
    await contexto.close();
  });

  test("Mis grupos, Nuevo grupo y Detalle de grupo sin violaciones serias ni críticas", async ({ browser }) => {
    const contexto = await nuevoContexto(browser);
    const page = await contexto.newPage();
    await registrar(page);

    await page.goto(RUTAS.grupos);
    await esperarSinViolacionesGraves(page);

    await page.goto(RUTAS.nuevoGrupo);
    await esperarSinViolacionesGraves(page);

    await crearGrupo(page, { nombre: nombreDeGrupoUnico("Accesible") });
    await esperarSinViolacionesGraves(page);
    await contexto.close();
  });

  test("con reduced-motion las pantallas siguen sin violaciones", async ({ browser }) => {
    const contexto = await nuevoContexto(browser, { reducedMotion: "reduce" });
    const page = await contexto.newPage();
    await page.goto(RUTAS.ingreso);
    await esperarSinViolacionesGraves(page);
    await contexto.close();
  });
});

// Se habilita cuando existan las pantallas y las Server Actions.
test.describe.fixme("Viewport de 360 px", () => {
  test("Ingreso entra en 360 px y el botón Ingresar se ve completo", async ({ browser }) => {
    const contexto = await nuevoContexto(browser, { viewport: MOVIL_360, isMobile: true, hasTouch: true });
    const page = await contexto.newPage();
    await page.goto(RUTAS.ingreso);

    await expect(page.getByRole("button", { name: TEXTOS.ingreso.boton, exact: true })).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole("link", { name: TEXTOS.ingreso.linkRegistro })).toBeVisible();
    await esperarSinScrollHorizontal(page);
    await esperarSinViolacionesGraves(page);
    await contexto.close();
  });

  test("Mis grupos, Nuevo grupo y Detalle entran en 360 px sin scroll horizontal", async ({ browser }) => {
    const contexto = await nuevoContexto(browser, { viewport: MOVIL_360, isMobile: true, hasTouch: true });
    const page = await contexto.newPage();
    await registrar(page);

    await page.goto(RUTAS.grupos);
    await esperarSinScrollHorizontal(page);

    await page.goto(RUTAS.nuevoGrupo);
    await expect(page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true })).toBeInViewport();
    await expect(page.getByRole("radiogroup", { name: TEXTOS.nuevoGrupo.moneda })).toBeVisible();
    await esperarSinScrollHorizontal(page);

    // Nombre largo: no debe romper el layout del detalle.
    await crearGrupo(page, { nombre: nombreDeGrupoUnico("Viaje de egresados a Bariloche con todo el curso") });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Saldos" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Gastos" })).toBeVisible();
    await esperarSinScrollHorizontal(page);
    await esperarSinViolacionesGraves(page);
    await contexto.close();
  });
});
