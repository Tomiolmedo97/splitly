# Splitly

App para dividir gastos entre amigos (ARS / USD).

## Estructura

Monorepo con pnpm workspaces:

```
apps/
  web/          # Next.js (App Router, TypeScript, Tailwind v4)
packages/
  core/         # Lógica de dominio pura: división de gastos, balances, simplificación de deudas
.github/
  workflows/ci.yml   # CI: install, typecheck, tests
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
```

Requiere Node >= 20 y pnpm 9.

## Pruebas punta a punta

Playwright en `e2e/` (`pnpm test:e2e`). Nunca se corren contra la base de producción: ver [docs/qa/e2e.md](docs/qa/e2e.md).
