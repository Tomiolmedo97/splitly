# Pruebas punta a punta (Playwright)

## Dónde corren
- **Nunca contra la base de producción.** Los e2e registran usuarios y crean grupos reales (emails `qa+…@example.test`).
- `E2E_BASE_URL` apunta a `http://localhost:3000` (por defecto) o al **preview de Vercel del PR**. Nunca al dominio de producción.
- El preview y los e2e usan **un branch de Neon propio** (con seed), no la base de producción. En Vercel, `DATABASE_URL` / `DATABASE_URL_UNPOOLED` del entorno *Preview* tienen que apuntar a un branch de Neon distinto del de *Production*. Es un requisito para habilitar los e2e en CI.
- En local, `apps/web/.env.local` apunta a una base de desarrollo o a un branch de Neon propio, nunca a la de producción.
- `playwright.config.ts` se niega a correr si `VERCEL_ENV=production`.
- El seed nunca corre en producción (ver la estrategia de pruebas).

## Seed de e2e
El seed corre solo en el branch de Neon de e2e/preview, nunca en producción.

| Usuario | Qué tiene |
|---|---|
| `tomas@example.com` | Comparte el grupo **Bariloche** con Lucía, más el invitado sin cuenta **Martín** y 2 gastos |
| `lucia@example.com` | Comparte **Bariloche** con Tomas |
| `nora@example.com` | No comparte ningún grupo. Se usa para los casos `NOT_FOUND` y para ver que no aparezca "Agregar de tus grupos" |

- La contraseña de los usuarios del seed sale **siempre** de la variable `E2E_SEED_PASSWORD`. No se escribe en el repo, ni en los specs, ni en el CI en texto plano: en CI va como secret. Si falta, los tests que usan el seed fallan con un mensaje claro. `--list` no la necesita.
- Los usuarios que crean los tests (`qa+…@example.test`) usan una contraseña de prueba propia, distinta de la del seed.

## Limitación conocida del MVP
Sin invitación por email, dos personas con cuenta no pueden compartir su **primer** grupo: `addMember({ kind: "user", userId })` exige que ya compartan un grupo activo. Queda en el backlog (**US9: link de invitación**). Los e2e **no** prueban que esto funcione. El seed ya trae a Tomas y Lucía compartiendo Bariloche.

## Cómo correrlos
```bash
pnpm dev                                    # en otra terminal
pnpm test:e2e                               # contra http://localhost:3000
E2E_BASE_URL=https://<preview>.vercel.app \
VERCEL_AUTOMATION_BYPASS_SECRET=… E2E_SEED_PASSWORD=… pnpm test:e2e
pnpm test:e2e:list                          # solo lista (no necesita servidor)
```

## Estado
Todos los specs están en `test.describe.fixme` hasta que existan las Server Actions (BE) y las pantallas (FE). Se habilitan sacando el `.fixme`.
Proyectos: chromium, webkit y Pixel 5. axe y la pasada de 360 px corren solo en chromium.
