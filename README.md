# Splitly

App para dividir gastos entre amigos (ARS / USD).

## Estructura

Monorepo con pnpm workspaces:

```
apps/
  web/          # Next.js (App Router, TypeScript, Tailwind v4) + Prisma (apps/web/prisma)
packages/
  core/         # Lógica de dominio pura: división de gastos, balances, simplificación de deudas
docs/
  api/          # Contrato OpenAPI 3.1 + mocks para el FE (ver docs/api/README.md)
.github/
  workflows/ci.yml   # CI: install, Prisma validate/generate, lint OpenAPI, typecheck, tests
  dependabot.yml
```

### packages/core

- El dinero se maneja siempre en **centavos enteros** (nunca floats).
- `splitEqual(totalCents, memberIds)`: divide en partes iguales; los centavos sobrantes van de a uno a los miembros en orden ascendente de id (ej: 10000 entre 3 → 3334, 3333, 3333).
- `splitPercent(totalCents, shares)`: divide por porcentajes en puntos básicos (deben sumar 10000), misma regla de sobrantes.
- `validateCustom(totalCents, amounts)`: valida que los montos custom sumen exactamente el total.
- `computeBalances(expenses)`: balance neto por miembro (siempre suma 0).
- `simplifyDebts(balances)`: simplificación greedy de deudas.

## Desarrollo

```bash
pnpm install
cp .env.example apps/web/.env.local   # completar valores
pnpm dev        # levanta apps/web
pnpm typecheck
pnpm test
pnpm lint:api   # lintea docs/api/openapi.yaml
```

### Base de datos (Prisma + Neon Postgres 17)

El esquema está en `apps/web/prisma/schema.prisma` y las migraciones en `apps/web/prisma/migrations`.

```bash
pnpm --filter @splitly/web db:generate   # genera Prisma Client
pnpm --filter @splitly/web db:migrate    # prisma migrate deploy (usa DIRECT_URL)
pnpm --filter @splitly/web db:seed       # datos de ejemplo: SOLO local o VERCEL_ENV=preview
```

- `DATABASE_URL`: conexión con pooler (la usa la app). `DIRECT_URL`: conexión directa (migraciones).
- Para una migración nueva: editar el schema y correr
  `pnpm --filter @splitly/web exec prisma migrate dev --name <nombre>` contra una base local o un branch de Neon.
- Usuarios del seed: `tomas@example.com` / `lucia@example.com`, contraseña `splitly-demo-123`.

Requiere Node >= 20 y pnpm 9.
