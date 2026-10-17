/**
 * US3: agregar participantes a un grupo.
 *
 * Alcance del MVP: addMember acepta { kind: "guest", name } (Member sin cuenta)
 * o { kind: "user", userId } con alguien que ya comparte un grupo activo con
 * quien agrega ("Agregar de tus grupos", lista de listKnownUsers, sin emails).
 * BACKLOG: invitar por email. Limitación conocida del MVP: dos personas con
 * cuenta no pueden compartir su primer grupo (backlog US9, link de invitación);
 * no se prueba que funcione. Ver docs/qa/e2e.md.
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
  NOMBRE_LUCIA,
  SEED,
  expect,
  ingresarComoSeed,
  nombreDeGrupoUnico,
  test,
} from "./fixtures";

/** Confirmado por FE: lista con nombre accesible "Participantes" (igual que su h2). */
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

/** Confirmado por FE: searchbox con label (solo lectores de pantalla) "Buscar en tus grupos". */
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
function personaDeTusGrupos(page: Page, nombre: string | RegExp) {
  return page.getByRole("button", { name: nombre, exact: true });
}

// Se habilita cuando existan addMember y listKnownUsers.
test.describe.fixme("US3: participantes sin cuenta (solo con nombre)", () => {
  test("quien crea el grupo figura como participante (vos)", async ({ page, usuarioRegistrado }) => {
    await page.goto(RUTAS.nuevoGrupo);

    await expect(page.getByRole("heading", { level: 2, name: TEXTOS.nuevoGrupo.participantes })).toBeVisible();
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

  // Confirmado por BE: los duplicados de invitados se comparan sin distinguir
  // mayúsculas y sin espacios en los bordes (índice sobre lower(trim(name)) entre
  // los invitados activos). Todos dan MEMBER_DUPLICATE.
  for (const [primero, segundo, caso] of [
    ["Martin", "martin", "mayúsculas"],
    ["Martín", " Martín ", "espacios en los bordes"],
  ] as const) {
    test(`no se puede repetir el nombre de un invitado (${caso}: "${primero}" y "${segundo}")`, async ({
      page,
      usuarioRegistrado,
    }) => {
      expect(usuarioRegistrado.email).toBeTruthy();
      await page.goto(RUTAS.nuevoGrupo);
      await agregarSinCuenta(page, primero);
      await agregarSinCuenta(page, segundo);

      await expect(page.getByText(TEXTOS.errores.nombreDuplicado)).toBeVisible();
      await expect(filaDe(page, new RegExp(primero.trim(), "i"))).toHaveCount(1);
    });
  }

  // TODO(BE): acentos sin definir ("Martin" vs "Martín"). Cuando BE decida si el
  // índice los normaliza, se agrega el caso con el resultado esperado.
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

  test("Nora (sin grupos compartidos) no ve 'Agregar de tus grupos'", async ({ page }) => {
    await ingresarComoSeed(page, SEED.nora);
    await page.goto(RUTAS.nuevoGrupo);

    await expect(botonDeTusGrupos(page)).toHaveCount(0);
  });

  test.describe("como Tomas (comparte Bariloche con Lucía y el invitado Martín)", () => {
    test.beforeEach(async ({ page }) => {
      await ingresarComoSeed(page, SEED.tomas);
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
      // Solo Lucía: Tomas no se ve a sí mismo y Martín es invitado (sin cuenta).
      const anuncio = anuncioDeResultados(page);
      await expect(anuncio).toHaveText(TEXTOS.nuevoGrupo.cantidad(1));

      await buscador(page).fill("Luc");
      await expect(anuncio).toHaveText(TEXTOS.nuevoGrupo.cantidad(1));
    });

    test("sin coincidencias, el estado vacío se anuncia en la misma región", async ({ page }) => {
      await buscador(page).fill("zzz-nadie");

      await expect(anuncioDeResultados(page)).toHaveText(TEXTOS.nuevoGrupo.sinResultados);
    });

    test("la lista muestra solo personas con cuenta, sin uno mismo y sin emails", async ({ page }) => {
      await expect(personaDeTusGrupos(page, NOMBRE_LUCIA)).toBeVisible();
      // El invitado Martín (sin cuenta) no aparece.
      await expect(personaDeTusGrupos(page, SEED.grupo.invitado)).toHaveCount(0);
      // Ningún email (ni el propio) aparece en la pantalla.
      await expect(page.getByText(/[^\s@]+@[^\s@]+\.[^\s@]+/)).toHaveCount(0);
    });

    test("elegir a Lucía la suma con cuenta (sin 'Sin cuenta')", async ({ page }) => {
      await personaDeTusGrupos(page, NOMBRE_LUCIA).click();

      const fila = filaDe(page, NOMBRE_LUCIA);
      await expect(fila).toBeVisible();
      await expect(fila.getByText(TEXTOS.nuevoGrupo.sinCuenta)).toHaveCount(0);

      await page.getByLabel(TEXTOS.nuevoGrupo.nombre).fill(nombreDeGrupoUnico("Con Lucía"));
      await page.getByRole("button", { name: TEXTOS.nuevoGrupo.boton, exact: true }).click();
      await expect(page).toHaveURL(URL_DETALLE_GRUPO);
      await expect(page.getByText(NOMBRE_LUCIA).first()).toBeVisible();
    });
  });
});
