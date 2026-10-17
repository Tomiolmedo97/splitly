/**
 * US3: agregar participantes a un grupo.
 *
 * Alcance del MVP (decisión de PM): addMember acepta solo
 *   - un nombre (Member sin cuenta, sin userId), o
 *   - el id de un usuario que ya comparte otro grupo con quien agrega.
 * Agregar por email queda fuera de alcance (backlog), igual que el caso
 * "email sin cuenta".
 *
 * Se verifica por la UI (Server Action addMember, sin API REST). Que el Member
 * sin cuenta quede con userId null, el alta por userId y sus rechazos se
 * prueban en apps/web/src/server/__tests__/members.test.ts.
 *
 * PENDIENTE: test.describe.fixme hasta que BE publique addMember y FE la
 * sección Participantes de Nuevo grupo (wireframe 5). Se habilitan sacando el `.fixme`.
 *
 * BACKLOG e2e: elegir a un usuario de otro grupo compartido. Se escribe cuando
 * FE defina ese control (textos.md todavía no lo tiene).
 */
import type { Page } from "@playwright/test";
import { RUTAS, TEXTOS, URL_DETALLE_GRUPO, expect, nombreDeGrupoUnico, test } from "./fixtures";

/** SUPUESTO: la sección "Participantes" es una lista con ese nombre accesible. */
function participantes(page: Page) {
  return page.getByRole("list", { name: TEXTOS.nuevoGrupo.participantes });
}

function filaDe(page: Page, nombre: string | RegExp) {
  return participantes(page).getByRole("listitem").filter({ hasText: nombre });
}

/** SUPUESTO: "Agregar solo con nombre" abre un campo "Nombre" y un botón "Agregar". */
async function abrirAgregarSoloConNombre(page: Page) {
  await page.getByRole("button", { name: TEXTOS.nuevoGrupo.soloNombre }).click();
}

async function agregarSinCuenta(page: Page, nombre: string) {
  await abrirAgregarSoloConNombre(page);
  await page.getByLabel("Nombre", { exact: true }).fill(nombre);
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
}

// Se habilita cuando exista la Server Action addMember.
test.describe.fixme("US3: participantes del grupo", () => {
  test("quien crea el grupo figura como participante (vos)", async ({ page, usuarioRegistrado }) => {
    await page.goto(RUTAS.nuevoGrupo);

    await expect(filaDe(page, `${usuarioRegistrado.nombre} (vos)`)).toBeVisible();
  });

  test("agregar un participante solo con nombre (Member sin cuenta)", async ({ page, usuarioRegistrado }) => {
    expect(usuarioRegistrado.email).toBeTruthy();
    await page.goto(RUTAS.nuevoGrupo);
    await agregarSinCuenta(page, "Juan");

    const fila = filaDe(page, "Juan");
    await expect(fila).toBeVisible();
    // Etiqueta "Sin cuenta" (texto, no solo color).
    await expect(fila.getByText(TEXTOS.nuevoGrupo.sinCuenta)).toBeVisible();

    // Después de crear, entra al detalle y Juan sigue en el grupo.
    await page.getByLabel(TEXTOS.nuevoGrupo.nombre).fill(nombreDeGrupoUnico("Asado viernes"));
    await page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true }).click();
    await expect(page).toHaveURL(URL_DETALLE_GRUPO);
    await expect(page.getByText("Juan").first()).toBeVisible();
  });

  test("el nombre del participante sin cuenta es obligatorio", async ({ page, usuarioRegistrado }) => {
    expect(usuarioRegistrado.email).toBeTruthy();
    await page.goto(RUTAS.nuevoGrupo);
    await abrirAgregarSoloConNombre(page);
    await page.getByLabel("Nombre", { exact: true }).fill("   ");

    // SUPUESTO (FE confirma): mismo patrón que el nombre del grupo. "Agregar" está
    // habilitado y, al enviar vacío, muestra "Completá este campo" (textos.md).
    await page.getByRole("button", { name: "Agregar", exact: true }).click();
    await expect(page.getByText("Completá este campo")).toBeVisible();
    // Solo queda quien crea el grupo.
    await expect(participantes(page).getByRole("listitem")).toHaveCount(1);
  });

  test("no se puede repetir el nombre de un participante sin cuenta", async ({ page, usuarioRegistrado }) => {
    expect(usuarioRegistrado.email).toBeTruthy();
    // MEMBER_DUPLICATE con el texto de textos.md. SUPUESTO (BE confirma): la
    // comparación no distingue mayúsculas.
    await page.goto(RUTAS.nuevoGrupo);
    await agregarSinCuenta(page, "Juan");
    await agregarSinCuenta(page, "juan");

    await expect(page.getByText(TEXTOS.errores.nombreDuplicado)).toBeVisible();
    await expect(filaDe(page, /juan/i)).toHaveCount(1);
  });
});
