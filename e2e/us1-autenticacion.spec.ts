/**
 * US1: registro e ingreso con email (Auth.js, sesión por cookie).
 * Server Actions: register, login, logout. Los textos salen de docs/design/textos.md.
 *
 * PENDIENTE: test.describe.fixme hasta que BE publique las Server Actions de
 * auth y FE las pantallas. Se habilitan sacando el `.fixme`.
 */
import {
  RUTAS,
  TEXTOS,
  campoContrasena,
  emailUnico,
  expect,
  ingresar,
  nuevoContexto,
  nuevoUsuario,
  registrar,
  test,
  tieneSesion,
} from "./fixtures";

const rutaIngreso = new RegExp(`${RUTAS.ingreso}(\\?|$)`);

// Se habilita cuando existan las Server Actions register/login/logout.
test.describe.fixme("US1: registro, ingreso y cierre de sesión", () => {
  test("registro con email deja la sesión iniciada y entra a Mis grupos", async ({ page, context }) => {
    const usuario = await registrar(page, nuevoUsuario("Ana Registro"));

    await expect(page.getByRole("heading", { level: 1, name: TEXTOS.misGrupos.saludo(usuario.nombre) })).toBeVisible();
    expect(await tieneSesion(context)).toBe(true);
  });

  test("desde el ingreso se llega al registro", async ({ page }) => {
    await page.goto(RUTAS.ingreso);
    await expect(page.getByRole("heading", { level: 1, name: TEXTOS.ingreso.titulo })).toBeVisible();
    await page.getByRole("link", { name: TEXTOS.ingreso.linkRegistro }).click();

    await expect(page).toHaveURL(new RegExp(`${RUTAS.registro}$`));
    await expect(page.getByRole("heading", { level: 1, name: TEXTOS.registro.titulo })).toBeVisible();
  });

  test("registro con un email ya usado muestra error y no inicia sesión", async ({ browser, page }) => {
    const usuario = await registrar(page);

    // Otro navegador sin sesión intenta registrarse con el mismo email (en mayúsculas:
    // register normaliza a minúsculas, así que también tiene que chocar).
    const otro = await nuevoContexto(browser);
    const pagina = await otro.newPage();
    await pagina.goto(RUTAS.registro);
    await pagina.getByLabel(TEXTOS.registro.nombre, { exact: true }).fill("Duplicado");
    await pagina.getByLabel("Email", { exact: true }).fill(usuario.email.toUpperCase());
    await campoContrasena(pagina).fill(usuario.contrasena);
    await pagina.getByRole("button", { name: TEXTOS.registro.boton }).click();

    await expect(pagina.getByText(TEXTOS.errores.emailTomado)).toBeVisible();
    expect(await tieneSesion(otro)).toBe(false);
    await otro.close();
  });

  test("registro con contraseña de menos de 8 caracteres muestra error", async ({ page, context }) => {
    await page.goto(RUTAS.registro);
    await page.getByLabel(TEXTOS.registro.nombre, { exact: true }).fill("Corta");
    await page.getByLabel("Email", { exact: true }).fill(emailUnico());
    await campoContrasena(page).fill("1234567");
    await page.getByRole("button", { name: TEXTOS.registro.boton }).click();

    await expect(page.getByText(TEXTOS.errores.contrasenaCorta)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${RUTAS.registro}$`));
    expect(await tieneSesion(context)).toBe(false);
  });

  test("ingreso con email y contraseña correctos", async ({ browser, page }) => {
    const usuario = await registrar(page);

    // Sesión nueva y limpia para probar el ingreso de verdad.
    const limpio = await nuevoContexto(browser);
    const pagina = await limpio.newPage();
    await ingresar(pagina, usuario.email, usuario.contrasena);

    await expect(pagina.getByRole("heading", { level: 1, name: TEXTOS.misGrupos.saludo(usuario.nombre) })).toBeVisible();
    expect(await tieneSesion(limpio)).toBe(true);
    await limpio.close();
  });

  test("cerrar sesión vuelve al ingreso y borra la cookie de sesión", async ({ page, context }) => {
    await registrar(page);

    // SUPUESTO: "Cerrar sesión" está en el menú del avatar de Mis grupos
    // (botón o ítem de menú; el wireframe no lo define).
    const avatar = page.getByRole("button", { name: /cuenta|perfil|menú/i });
    if (await avatar.count()) await avatar.first().click();
    await page
      .getByRole("menuitem", { name: TEXTOS.general.cerrarSesion })
      .or(page.getByRole("button", { name: TEXTOS.general.cerrarSesion }))
      .click();

    await expect(page).toHaveURL(rutaIngreso);
    expect(await tieneSesion(context)).toBe(false);

    // Después del logout, volver a una ruta protegida redirige al ingreso.
    await page.goto(RUTAS.grupos);
    await expect(page).toHaveURL(rutaIngreso);
  });

  test("ingreso con contraseña incorrecta muestra error y no inicia sesión", async ({ browser, page }) => {
    const usuario = await registrar(page);

    const limpio = await nuevoContexto(browser);
    const pagina = await limpio.newPage();
    await ingresar(pagina, usuario.email, "contrasena-incorrecta");

    // Mensaje genérico (INVALID_CREDENTIALS): no revela si el email existe.
    await expect(pagina.getByText(TEXTOS.errores.credenciales)).toBeVisible();
    await expect(pagina).toHaveURL(rutaIngreso);
    expect(await tieneSesion(limpio)).toBe(false);
    await limpio.close();
  });

  test("ruta protegida sin sesión redirige al ingreso", async ({ page, context }) => {
    expect(await tieneSesion(context)).toBe(false);

    await page.goto(RUTAS.grupos);

    await expect(page).toHaveURL(rutaIngreso);
    await expect(page.getByRole("button", { name: TEXTOS.ingreso.boton, exact: true })).toBeVisible();
  });

  test("el detalle de un grupo sin sesión también redirige al ingreso", async ({ page }) => {
    await page.goto(RUTAS.grupo("cualquier-id"));

    await expect(page).toHaveURL(rutaIngreso);
  });
});
