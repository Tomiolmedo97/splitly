# Pruebas punta a punta (Playwright)

## Dónde corren
- **Nunca contra la base de producción.** Los e2e registran usuarios y crean grupos reales (emails `qa+…@example.test`).
- `E2E_BASE_URL` apunta a `http://localhost:3000` (por defecto) o al **preview de Vercel del PR**. Nunca al dominio de producción.
- El preview y los e2e usan **un branch de Neon propio** (con seed), no la base de producción. En Vercel, `DATABASE_URL` / `DATABASE_URL_UNPOOLED` del entorno *Preview* tienen que apuntar a un branch de Neon distinto del de *Production*. Es un requisito para habilitar los e2e en CI.
- En local, `apps/web/.env.local` apunta a una base de desarrollo o a un branch de Neon propio, nunca a la de producción.
- `playwright.config.ts` se niega a correr si `VERCEL_ENV=production`.
- El seed nunca corre en producción (ver la estrategia de pruebas).

## Seed de e2e
Los tests de "Agregar de tus grupos" necesitan un usuario del seed (solo en el branch de Neon de e2e/preview) que comparta un grupo activo con "Bruno Seed" y "Caro Seed". Por defecto es `ana.seed@example.test`; se cambia con `E2E_SEED_EMAIL` / `E2E_SEED_PASSWORD`. Es un supuesto: BE confirma el seed.

## Cómo correrlos
```bash
pnpm dev                                    # en otra terminal
pnpm test:e2e                               # contra http://localhost:3000
E2E_BASE_URL=https://<preview>.vercel.app \
VERCEL_AUTOMATION_BYPASS_SECRET=… pnpm test:e2e
pnpm test:e2e:list                          # solo lista (no necesita servidor)
```

## Estado
Todos los specs están en `test.describe.fixme` hasta que existan las Server Actions (BE) y las pantallas (FE). Se habilitan sacando el `.fixme`.
Proyectos: chromium, webkit y Pixel 5. axe y la pasada de 360 px corren solo en chromium.
