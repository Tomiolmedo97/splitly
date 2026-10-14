# Splitly: estrategia de pruebas (MVP)

## Objetivo
Detectar antes de producción los errores que más dañan la confianza del usuario: **montos o balances mal calculados**, accesos indebidos a grupos y flujos rotos en mobile.

## Áreas por riesgo
| Riesgo | Área | Por qué |
|---|---|---|
| Crítico | División de gastos y balances (`packages/core`) | Un centavo mal asignado rompe la confianza en la app |
| Alto | Autenticación y permisos (solo los miembros ven el grupo) | Exposición de datos de otras personas |
| Alto | Validaciones de US4 en el FE y el BE (mismos esquemas Zod) | Gastos inválidos que se guardan igual |
| Medio | Moneda (ARS/USD), formato y bloqueo del cambio de moneda cuando hay gastos | Confusión entre "$" y "US$" |
| Medio | Edición y borrado (soft delete), recálculo y auditoría | Balances viejos después de un cambio |
| Medio | Responsive desde 360 px, estados de carga, vacío y error | La mayoría de los usuarios va a entrar desde el celular |
| Bajo | Efectos visuales (confeti, contadores, flechas) | Solo son cosméticos, salvo que afecten el rendimiento o la accesibilidad |

## Niveles y herramientas
- **Unitarias (Vitest y fast-check):** `packages/core`. Corren en cada PR con los casos de la [tabla](./casos-division-balances.md), más estas propiedades:
  - la suma de las partes es igual al total, siempre;
  - la suma de todos los balances del grupo es 0;
  - todas las partes son enteros mayores o iguales a 0;
  - el resultado es determinista (misma entrada, misma salida, sin importar el orden de entrada);
  - la simplificación greedy deja a todos en 0 y nunca genera más de n−1 transferencias.
- **API (Vitest con Route Handlers o Playwright `request`):** códigos de estado 200/201/400/401/403/404/409, validaciones, acceso a un grupo ajeno, cambio de moneda con gastos y respuesta con los balances de antes y de después.
- **Punta a punta (Playwright):** contra el preview de Vercel de cada PR, con el bypass de protección y el branch de Neon con seed. Navegadores: Chromium, WebKit y Pixel 5 (mobile), más un viewport de 360 px.
- **Accesibilidad (axe):** cero violaciones serias o críticas en las 5 pantallas, navegación con teclado en el formulario de gasto y `prefers-reduced-motion` emulado.
- **Manual exploratorio:** en cada cierre de sprint, el celular real de Tomas y Safari en iOS.

## Smoke test (en cada preview y antes de producción)
1. Registro, login y logout.
2. Crear un grupo en ARS y agregar un miembro con cuenta y uno sin cuenta.
3. Cargar un gasto con división igual y ver que el balance sea correcto.
4. El historial muestra el gasto, con su detalle de la división.

## Criterios para dar por terminada una historia
- Todos sus criterios de aceptación tienen al menos un caso y todos pasan.
- No quedan bugs Críticos ni Altos abiertos.
- El CI está en verde (lint, typecheck, unitarias, punta a punta).
- axe no reporta violaciones serias.

## Chequeos de seguridad e infraestructura
- El seed nunca corre en producción (`VERCEL_ENV`), verificado en el primer deploy a producción.
- No hay secretos en el repo ni en variables `NEXT_PUBLIC_`.
- Un usuario no puede leer ni modificar grupos, miembros ni gastos de un grupo al que no pertenece (por id directo en la URL o en la API).

## Formato de bug
El título, los pasos, el resultado esperado contra el actual, la severidad y la prioridad, el entorno (navegador, dispositivo, commit o URL del preview), la evidencia y el impacto. Los bugs se reportan como issues en GitHub con la etiqueta `bug` y su severidad.

## Pendientes a definir
- El monto máximo por gasto (propuesta: 999.999.999,99 para evitar overflow y errores de UI).
- El largo máximo de la descripción y del nombre de un miembro (propuesta: 100 y 50 caracteres).
- La regla de los porcentajes: se asume piso por parte y el resto, por orden de id, igual que en la división igual. **BE Bot, por favor confirmalo.**
