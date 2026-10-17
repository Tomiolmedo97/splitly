/**
 * US2: crear un grupo con nombre y moneda (ARS por defecto, o USD).
 *
 * Se verifica por la UI: createGroup es una Server Action (sin API REST).
 * Las validaciones del servidor (moneda inválida, nombre vacío, creador como
 * miembro) están en apps/web/src/server/__tests__/groups.test.ts.
 *
 * PENDIENTE: test.describe.fixme hasta que BE publique createGroup y FE la
 * pantalla Nuevo grupo (wireframe 5). Se habilitan sacando el `.fixme`.
 */
import type { Page } from "@playwright/test";
import { RUTAS, TEXTOS, URL_DETALLE_GRUPO, crearGrupo, expect, nombreDeGrupoUnico, test } from "./fixtures";

/** SUPUESTO: el detalle del grupo muestra su moneda como texto (ARS / USD). */
function monedaDelGrupo(page: Page, moneda: "ARS" | "USD") {
  return page.getByText(new RegExp(`\\b${moneda}\\b`)).first();
}

// Se habilita cuando exista la Server Action createGroup.
test.describe.fixme("US2: crear grupo", () => {
  test.beforeEach(async ({ usuarioRegistrado }) => {
    // El fixture deja un usuario nuevo con la sesión iniciada.
    expect(usuarioRegistrado.email).toBeTruthy();
  });

  test("crear un grupo con ARS como moneda por defecto", async ({ page }) => {
    const nombre = nombreDeGrupoUnico("Viaje Bariloche");

    await page.goto(RUTAS.nuevoGrupo);
    await expect(page.getByRole("heading", { level: 1, name: TEXTOS.nuevoGrupo.titulo })).toBeVisible();
    // ARS viene seleccionada sin tocar nada.
    const moneda = page.getByRole("radiogroup", { name: TEXTOS.nuevoGrupo.moneda });
    await expect(moneda.getByRole("radio", { name: "ARS" })).toBeChecked();
    await expect(moneda.getByRole("radio", { name: "USD" })).not.toBeChecked();

    await page.getByLabel(TEXTOS.nuevoGrupo.nombre).fill(nombre);
    await page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true }).click();

    // Al crear, entra directo al detalle del grupo.
    await expect(page).toHaveURL(URL_DETALLE_GRUPO);
    await expect(page.getByRole("heading", { level: 1, name: nombre })).toBeVisible();
    await expect(monedaDelGrupo(page, "ARS")).toBeVisible();

    // Aparece en Mis grupos.
    await page.goto(RUTAS.grupos);
    await expect(page.getByRole("link", { name: new RegExp(nombre) })).toBeVisible();
  });

  test("crear un grupo en USD", async ({ page }) => {
    const nombre = nombreDeGrupoUnico("Viaje Miami");

    await crearGrupo(page, { nombre, moneda: "USD" });

    await expect(page.getByRole("heading", { level: 1, name: nombre })).toBeVisible();
    await expect(monedaDelGrupo(page, "USD")).toBeVisible();

    // La moneda elegida se mantiene al volver a entrar.
    await page.reload();
    await expect(monedaDelGrupo(page, "USD")).toBeVisible();
  });

  test("el nombre es obligatorio", async ({ page }) => {
    await page.goto(RUTAS.nuevoGrupo);
    const crear = page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true });

    // Solo espacios no cuenta como nombre.
    await page.getByLabel(TEXTOS.nuevoGrupo.nombre).fill("   ");

    // SUPUESTO (FE confirma): se sigue textos.md (da9ab46). "Crear grupo" está
    // habilitado y, al enviar sin nombre, muestra el error bajo el campo.
    // El wireframe v0 decía "deshabilitado"; si FE elige eso, se cambia esta parte.
    await crear.click();
    await expect(page.getByText(TEXTOS.errores.nombreGrupoVacio)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${RUTAS.nuevoGrupo}$`));
  });
});
