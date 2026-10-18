# Pruebas punta a punta (Playwright)

## Dónde corren
- **Nunca contra la base de producción.** Los e2e registran usuarios y crean grupos reales (emails `qa+…@example.test`).
- `E2E_BASE_URL` apunta a `http://localhost:3000` (por defecto) o al **preview de Vercel del PR**. Nunca al dominio de producción.
- **Los e2e siembran solo un Postgres local.** El seed (`pnpm --filter @splitly/web db:seed`, `apps/web/prisma/seed.ts`) pasa por la guarda `canSeed` de `apps/web/scripts/db-guard.mjs`: corre solo con `VERCEL_ENV` sin definir y con `DATABASE_URL` (y `DATABASE_URL_UNPOOLED`, si está) apuntando a `localhost`, `127.0.0.1` o `::1`. Se niega en cualquier preview de Vercel, contra Neon y después de `vercel env pull`. Los e2e no tienen otro camino para sembrar datos: no escriben en la base directo.
- Los specs que usan el seed (`SEED`, `ingresarComoSeed`) corren solo contra la app local (`pnpm dev`) con ese Postgres local sembrado. Contra un preview de Vercel (cuya base no tiene seed) corren solo los specs que crean sus propios datos por la UI; los del seed fallan en el login.
- La migración del build (`apps/web/scripts/migrate-production.mjs`) se saltea sin `VERCEL_ENV`, y en un preview nunca toca la base de producción (guarda `PROD_DB_HOST`). Ni `--list` ni `pnpm build` sin `VERCEL_ENV` se conectan a una base (`postinstall` solo corre `prisma generate`, que no se conecta).
- En local, `apps/web/.env.local` apunta a un Postgres en localhost, nunca a Neon ni a la base de producción.
- `playwright.config.ts` se niega a correr si `VERCEL_ENV=production`.

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
E2E_BASE_URL=https://<preview>.vercel.app \
VERCEL_AUTOMATION_BYPASS_SECRET=… pnpm test:e2e
pnpm test:e2e:list                          # solo lista (no necesita servidor)
```

## Estado
Todos los specs están en `test.describe.fixme` hasta que existan las Server Actions (BE) y las pantallas (FE). Se habilitan sacando el `.fixme`.
Proyectos: chromium, webkit y Pixel 5. axe y la pasada de 360 px corren solo en chromium.
