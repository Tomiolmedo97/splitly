# API de Splitly

- **Contrato:** [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.1). Se lintea en CI con `pnpm lint:api` (Redocly).
- **Mocks:** [`mocks/`](./mocks), una respuesta de ejemplo por archivo. [`mocks/index.json`](./mocks/index.json)
  dice qué endpoint y status representa cada uno. Un test (`apps/web/src/lib/api-contract.test.ts`)
  valida que todos cumplan el contrato y que los saldos sumen 0.
- **Validación:** los esquemas Zod de los bodies están en `apps/web/src/lib/validation` (los mismos para FE y BE).
- **Server Actions (stubs):** `apps/web/src/server/actions` con tipos de entrada/salida para que el FE programe ya.

## Cómo usar los mocks desde el FE

Los datos de los mocks coinciden con el seed (`apps/web/prisma/seed.ts`): grupo "Viaje a Bariloche"
en ARS con Tomás, Lucía y Martín (invitado, `userId: null`).

```ts
import groups from "../../../docs/api/mocks/groups.list.200.json";
// o con MSW: http.get("/api/groups", () => HttpResponse.json(groups))
```

Errores: elegí el texto visible por `error.code` + `error.details.reason` (textos en
`docs/design/textos.md`); `error.message` es solo para logs.

## Reglas clave

| Tema | Regla |
|---|---|
| Plata | Centavos enteros (`*Cents`). `$ 1.234,56` → `123456`. |
| Porcentajes | Puntos básicos: 10000 = 100 %. |
| Saldos | `balanceCents` con signo: positivo = le deben, negativo = debe. Suman 0. |
| Moneda | `ARS` por defecto. Solo se cambia si el grupo no tiene gastos (409 `CURRENCY_LOCKED`). |
| Permisos | Solo integrantes. Si no sos integrante → 404 `NOT_FOUND` (no revela si el grupo existe). |
| 403 | Integrante que intenta algo no permitido (ej. quitar a alguien con cuenta). |
| Gastos | Sprint 2. Crear/editar/borrar devuelve `balancesBefore` y `balancesAfter` (para el confeti). |
