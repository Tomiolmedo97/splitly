# Pruebas punta a punta (Playwright)

## Dónde corren
- **Nunca contra la base de producción.** Los e2e registran usuarios y crean grupos reales (emails `qa+…@example.test`).
- `E2E_BASE_URL` apunta a `http://localhost:3000` (por defecto) o al **preview de Vercel del PR** (con `E2E_ALLOW_REMOTE=1` o `E2E_READONLY=1`). Nunca al dominio de producción: la guarda lo impide.
- **Los e2e siembran solo un Postgres local.** El seed (`pnpm --filter @splitly/web db:seed`, `apps/web/prisma/seed.ts`) pasa por la guarda `canSeed` de `apps/web/scripts/db-guard.mjs`: corre solo con `VERCEL_ENV` sin definir y con `DATABASE_URL` (y `DATABASE_URL_UNPOOLED`, si está) apuntando a `localhost`, `127.0.0.1` o `::1`. Se niega en cualquier preview de Vercel, contra Neon y después de `vercel env pull`. Los e2e no tienen otro camino para sembrar datos: no escriben en la base directo.
- Los specs que usan el seed (`SEED`, `ingresarComoSeed`) corren solo contra la app local (`pnpm dev`) con ese Postgres local sembrado. Contra un preview de Vercel (cuya base no tiene seed) corren solo los specs que crean sus propios datos por la UI; los del seed fallan en el login.
- La migración del build (`apps/web/scripts/migrate-production.mjs`) se saltea sin `VERCEL_ENV`, y en un preview nunca toca la base de producción (guarda `PROD_DB_HOST`). Ni `--list` ni `pnpm build` sin `VERCEL_ENV` se conectan a una base (`postinstall` solo corre `prisma generate`, que no se conecta).
- En local, `apps/web/.env.local` apunta a un Postgres en localhost, nunca a Neon ni a la base de producción.
- `playwright.config.ts` corre la guarda de `e2e/guarda.ts` (ver abajo) antes de cualquier request.

## Guarda contra producción
`playwright.config.ts` llama a `asegurarEntornoE2E(process.env)` al cargarse, así que la guarda corre antes de lanzar un navegador o hacer un request, también con `--list`. Si se niega, Playwright termina enseguida con `Error: Guarda de e2e: …` (en castellano) y código de salida 1. Las reglas, en orden:

1. **`VERCEL_ENV=production`**: se niega siempre, sea cual sea la URL.
2. **Host de producción**: se niega siempre, ni con `E2E_ALLOW_REMOTE` ni con `E2E_READONLY`. Son `splitly-iota.vercel.app` y los alias `*.vercel.app` del deploy de producción (`splitly-tomiolmedo97s-projects.vercel.app`, `splitly-git-main-tomiolmedo97s-projects.vercel.app`, `splitly-tomiolmedo97-tomiolmedo97s-projects.vercel.app`). La lista está en `HOSTS_DE_PRODUCCION`; si se agrega un dominio de producción, se suma ahí.
3. **Local** (`localhost`, `127.0.0.1`, `[::1]`): permitido. Es el default si no hay `E2E_BASE_URL`.
4. **Cualquier otro host** (un preview): se niega salvo que haya opt-in explícito:
   - `E2E_ALLOW_REMOTE=1`: corrida completa, que escribe (registra usuarios y crea grupos). Solo contra un preview.
   - `E2E_READONLY=1`: corren solo los specs con el tag `@readonly` (`grep` en la config). Se marcan con `test("…", SOLO_LECTURA, async …)` (`SOLO_LECTURA` de `e2e/guarda.ts`) y solo si no registran, no ingresan, no crean datos y no mandan formularios.
5. **URL que no se puede parsear** o que no es `http(s)` (por ejemplo, `splitly-iota.vercel.app` sin esquema): se niega.

El host se normaliza antes de comparar: minúsculas, sin el punto final (`splitly-iota.vercel.app.`), sin puerto (`:443`) y en ASCII/punycode (IDN, puntos y letras de ancho completo). `localhost.evil.com` o `localhost@host` no cuentan como locales.

Limitación: la URL única de un deploy de producción (`splitly-<hash>-tomiolmedo97s-projects.vercel.app`) no se distingue de la de un preview por el host. Por eso cualquier host remoto necesita el opt-in: antes de poner `E2E_ALLOW_REMOTE=1`, confirmá que la URL es la del preview del PR.

Los tests de la guarda están en `apps/web/src/lib/e2e-guard.test.ts` (corren con `pnpm test`).

## Seed de e2e
El mismo seed de `apps/web/prisma/seed.ts` (#20), solo en un Postgres local. Es idempotente.

| Usuario | Qué tiene |
|---|---|
| `tomas@example.com` | Comparte el grupo **Viaje a Bariloche** con Lucía, más el invitado sin cuenta **Martín** y 2 gastos |
| `lucia@example.com` | Comparte **Viaje a Bariloche** con Tomás |
| `nora@example.com` | No comparte ningún grupo. Se usa para los casos `NOT_FOUND` y para ver que no aparezca "Agregar de tus grupos" |

- Los specs leen la contraseña de los usuarios del seed de la variable `E2E_SEED_PASSWORD`; en local es la contraseña de demo del seed (ver README, solo sirve contra la base local). Si falta, los tests que usan el seed fallan con un mensaje claro. `--list` no la necesita.
- Los usuarios que crean los tests (`qa+…@example.test`) usan una contraseña de prueba propia, distinta de la del seed.

## Limitación conocida del MVP
Sin invitación por email, dos personas con cuenta no pueden compartir su **primer** grupo: `addMember({ kind: "user", userId })` exige que ya compartan un grupo activo. Queda en el backlog (**US9: link de invitación**). Los e2e **no** prueban que esto funcione. El seed ya trae a Tomás y Lucía compartiendo Viaje a Bariloche.

## Cómo correrlos
```bash
# apps/web/.env.local con DATABASE_URL a un Postgres en localhost
pnpm --filter @splitly/web db:migrate       # migraciones en la base local
pnpm --filter @splitly/web db:seed          # se niega si la base no es localhost o hay VERCEL_ENV
pnpm dev                                    # en otra terminal
E2E_SEED_PASSWORD=… pnpm test:e2e           # contra http://localhost:3000
# Contra un preview (sin seed: solo los specs que crean sus datos):
E2E_BASE_URL=https://<preview>.vercel.app E2E_ALLOW_REMOTE=1 \
VERCEL_AUTOMATION_BYPASS_SECRET=… pnpm test:e2e
# Contra un preview, solo los specs @readonly:
E2E_BASE_URL=https://<preview>.vercel.app E2E_READONLY=1 pnpm test:e2e
pnpm test:e2e:list                          # solo lista (no necesita servidor)
```

## Estado
Todos los specs están en `test.describe.fixme` hasta que existan las Server Actions (BE) y las pantallas (FE). Se habilitan sacando el `.fixme`.
Proyectos: chromium, webkit y Pixel 5. axe y la pasada de 360 px corren solo en chromium.
