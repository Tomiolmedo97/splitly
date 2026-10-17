/**
 * US3: agregar participantes a un grupo.
 *
 * Alcance del MVP: addMember acepta { kind: "guest", name } (Member sin cuenta)
 * o { kind: "user", userId } con alguien que ya comparte un grupo activo con
 * quien agrega ("Agregar de tus grupos", lista de listKnownUsers, sin emails).
 * BACKLOG: invitar por email.
 *
 * Se verifica por la UI (Server Actions, sin API REST). Códigos de error,
 * userId null, soft delete (removedAt) y duplicados se prueban en
 * apps/web/src/server/__tests__/members.test.ts.
 *
 * PENDIENTE: test.describe.fixme hasta que BE publique addMember y
 * listKnownUsers, y FE la sección Participantes de Nuevo grupo (wireframe 5).
 * Se habilitan sacando el `.fixme`.
 */
import type { Page } from "@playwright/test";
import {
  RUTAS,
  TEXTOS,
  URL_DETALLE_GRUPO,
  USUARIO_SEMBRADO,
  expect,
  ingresarYEsperarMisGrupos,
  nombreDeGrupoUnico,
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
async function abrirAgregarSoloConNombre(page: Page) {
  await page.getByRole("button", { name: TEXTOS.nuevoGrupo.soloNombre }).click();
}

async function agregarSinCuenta(page: Page, nombre: string) {
  await abrirAgregarSoloConNombre(page);
  await page.getByLabel("Nombre", { exact: true }).fill(nombre);
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
}

function botonDeTusGrupos(page: Page) {
  return page.getByRole("button", { name: TEXTOS.nuevoGrupo.deTusGrupos });
}

/** Buscador de "Agregar de tus grupos": label solo para lectores de pantalla. */
function buscador(page: Page) {
  return page.getByRole("searchbox", { name: TEXTOS.nuevoGrupo.buscadorLabel });
}

/** Región aria-live="polite" que anuncia la cantidad de resultados o el vacío. */
function anuncioDeResultados(page: Page) {
  return page.locator('[aria-live="polite"]');
}

/**
 * SUPUESTO (FE confirma): cada persona de la lista es un botón con su nombre
 * que la suma al grupo al tocarla.
 */
function personaDeTusGrupos(page: Page, nombre: string) {
  return page.getByRole("button", { name: nombre, exact: true });
}

// Se habilita cuando existan addMember y listKnownUsers.
test.describe.fixme("US3: participantes sin cuenta (solo con nombre)", () => {
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
    // MEMBER_DUPLICATE. SUPUESTO (BE confirma): la comparación no distingue mayúsculas.
    await page.goto(RUTAS.nuevoGrupo);
    await agregarSinCuenta(page, "Juan");
    await agregarSinCuenta(page, "juan");

    await expect(page.getByText(TEXTOS.errores.nombreDuplicado)).toBeVisible();
    await expect(filaDe(page, /juan/i)).toHaveCount(1);
  });
});

// Se habilita cuando existan addMember y listKnownUsers.
test.describe.fixme("US3: agregar de tus grupos", () => {
  test("sin nadie para agregar, no se muestra 'Agregar de tus grupos'", async ({ page, usuarioRegistrado }) => {
    // Usuario recién registrado: no comparte ningún grupo con nadie.
    expect(usuarioRegistrado.email).toBeTruthy();
    await page.goto(RUTAS.nuevoGrupo);

    await expect(page.getByRole("button", { name: TEXTOS.nuevoGrupo.soloNombre })).toBeVisible();
    await expect(botonDeTusGrupos(page)).toHaveCount(0);
  });

  test.describe("con el usuario del seed (comparte un grupo con otras personas)", () => {
    test.beforeEach(async ({ page }) => {
      await ingresarYEsperarMisGrupos(page, USUARIO_SEMBRADO.email, USUARIO_SEMBRADO.contrasena);
      await page.goto(RUTAS.nuevoGrupo);
      await botonDeTusGrupos(page).click();
    });

    test("el buscador tiene label para lectores de pantalla y placeholder", async ({ page }) => {
      const campo = buscador(page);
      await expect(campo).toBeVisible();
      await expect(campo).toHaveAttribute("placeholder", TEXTOS.nuevoGrupo.buscadorPlaceholder);
      // El label existe solo para lectores de pantalla: no hay texto visible con ese nombre.
      await expect(page.getByText(TEXTOS.nuevoGrupo.buscadorLabel, { exact: true })).not.toBeVisible();
    });

    test("la cantidad de resultados se anuncia en una región aria-live polite", async ({ page }) => {
      const anuncio = anuncioDeResultados(page);
      await expect(anuncio).toHaveText(TEXTOS.nuevoGrupo.cantidad(USUARIO_SEMBRADO.contactos.length));

      await buscador(page).fill("Bruno");
      await expect(anuncio).toHaveText(TEXTOS.nuevoGrupo.cantidad(1));
    });

    test("sin coincidencias, el estado vacío se anuncia en la misma región", async ({ page }) => {
      await buscador(page).fill("zzz-nadie");

      await expect(anuncioDeResultados(page)).toHaveText(TEXTOS.nuevoGrupo.sinResultados);
    });

    test("la lista muestra nombres y nunca emails", async ({ page }) => {
      for (const nombre of USUARIO_SEMBRADO.contactos) {
        await expect(personaDeTusGrupos(page, nombre)).toBeVisible();
      }
      // Ningún email (ni el propio) aparece en la pantalla.
      await expect(page.getByText(/[^\s@]+@[^\s@]+\.[^\s@]+/)).toHaveCount(0);
    });

    test("elegir a alguien de tus grupos lo suma con cuenta (sin 'Sin cuenta')", async ({ page }) => {
      await personaDeTusGrupos(page, "Bruno Seed").click();

      const fila = filaDe(page, "Bruno Seed");
      await expect(fila).toBeVisible();
      await expect(fila.getByText(TEXTOS.nuevoGrupo.sinCuenta)).toHaveCount(0);

      await page.getByLabel(TEXTOS.nuevoGrupo.nombre).fill(nombreDeGrupoUnico("Con Bruno"));
      await page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true }).click();
      await expect(page).toHaveURL(URL_DETALLE_GRUPO);
      await expect(page.getByText("Bruno Seed").first()).toBeVisible();
    });
  });
});
