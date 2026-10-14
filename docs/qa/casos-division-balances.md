# Tabla de casos: división y balances

Las convenciones: los montos están en centavos. Los miembros A < B < C < D están ordenados por id. El resto se reparte de a 1 centavo a los primeros por id. Los porcentajes van en puntos básicos (10000 = 100 %).

## División igual (US4)
| ID | Total | Entre | Esperado |
|---|---|---|---|
| EQ-01 | 10000 ($100) | A, B, C | A 3334, B 3333, C 3333 |
| EQ-02 | 100 ($1) | A, B, C | A 34, B 33, C 33 |
| EQ-03 | 1 | A, B, C | A 1, B 0, C 0 |
| EQ-04 | 10000 | A | A 10000 |
| EQ-05 | 10002 | A, B, C, D | A 2501, B 2501, C 2500, D 2500 |
| EQ-06 | 10000 | C, A, B (en otro orden) | Igual que EQ-01 (determinista) |
| EQ-07 | 10000 | Ningún miembro seleccionado | Error de validación, no se guarda |
| EQ-08 | 10000 | Selección donde el pagador no está incluido | Válido: el pagador queda +10000 a favor |

## Por porcentaje
| ID | Total | Porcentajes | Esperado |
|---|---|---|---|
| PC-01 | 10000 | 50 / 50 | 5000 / 5000 |
| PC-02 | 10000 | 33,33 / 33,33 / 33,34 | 3333 / 3333 / 3334 |
| PC-03 | 1 | 50 / 50 (A, B) | A 1, B 0 |
| PC-04 | 999 | 33,33 / 33,33 / 33,34 | Las partes suman 999 y son deterministas (el valor exacto depende de la regla pendiente) |
| PC-05 | 10000 | 50 / 49,99 | Error: la suma es 99,99 |
| PC-06 | 10000 | 50 / 50,01 | Error: la suma es 100,01 |
| PC-07 | 10000 | 33,333 / ... | Error: más de 2 decimales |
| PC-08 | 10000 | 100 / 0 | Válido: B tiene 0 % (o se excluye, según defina el FE) |
| PC-09 | 10000 | -10 / 110 | Error: hay un porcentaje negativo |
| PC-10 | 1 | 0 / 50 / 50 (A, B, C) | A 0, B 1, C 0: el resto no va a quien tiene 0 % |

## Montos custom
| ID | Total | Partes | Esperado |
|---|---|---|---|
| CU-01 | 10000 | 6000 / 4000 | Válido |
| CU-02 | 10000 | 6000 / 3999 | Error: falta asignar $0,01 |
| CU-03 | 10000 | 6000 / 4001 | Error: sobran $0,01 |
| CU-04 | 10000 | 10000 / 0 | Válido |
| CU-05 | 10000 | -1000 / 11000 | Error: hay un monto negativo |

## Validación del monto
| ID | Entrada | Esperado |
|---|---|---|
| AM-01 | 0 | Error |
| AM-02 | -5 | Error |
| AM-03 | 0,01 | Válido (1 centavo) |
| AM-04 | 10,001 | Error: más de 2 decimales |
| AM-05 | "abc" o vacío | Error |
| AM-06 | "1.234,56" en ARS | 123456 centavos |
| AM-07 | Por encima del máximo definido | Error |

## Balances y simplificación (US5)
| ID | Gastos | Balances | Deudas simplificadas |
|---|---|---|---|
| BA-01 | A paga 9000, igual entre A, B, C | A +6000, B −3000, C −3000 | B→A 3000, C→A 3000 |
| BA-02 | A paga 1000 para B; B paga 1000 para C | A +1000, B 0, C −1000 | C→A 1000 (1 sola transferencia) |
| BA-03 | Ciclo: A paga por B, B paga por C, C paga por A (3000 cada uno) | Todos en 0 | Ninguna |
| BA-04 | Sin gastos | Todos en 0 | Estado vacío |
| BA-05 | Un miembro sin cuenta paga 6000, igual con A | Sin cuenta +3000, A −3000 | A→Sin cuenta 3000 |
| BA-06 | Lo mismo que BA-01, con el gasto borrado después (soft delete) | Todos en 0 | Ninguna; el gasto no cuenta |
| BA-07 | Lo mismo que BA-01, editado después a 6000 | A +4000, B −2000, C −2000 | Se recalcula |
| Propiedad | Cualquier conjunto aleatorio de gastos | Σ balances = 0 | Al aplicarlas, todos quedan en 0; hay como máximo n−1 transferencias |

## Moneda, miembros y permisos
| ID | Caso | Esperado |
|---|---|---|
| MO-01 | Grupo nuevo sin moneda elegida | ARS por defecto |
| MO-02 | Cambiar de ARS a USD sin gastos | Permitido |
| MO-03 | Cambiar la moneda con 1 gasto | Rechazado (409 o error claro) |
| MO-04 | Formato | "$ 1.234,56" en ARS, "US$ 1,234.56" en USD, con el chip de moneda visible |
| ME-01 | Agregar a un miembro sin cuenta con un nombre repetido | Error de duplicado |
| ME-02 | Agregar por email a un usuario que ya es miembro | Error de duplicado |
| ME-03 | Quitar a un miembro con balance distinto de 0 | Rechazado |
| ME-04 | Quitar a un miembro con balance 0 | Permitido |
| PE-01 | Un usuario que no es miembro abre `/groups/:id` o la API | 403 o 404, sin filtrar datos |
| PE-02 | B edita un gasto creado por A | Permitido, y `updatedById` = B |

## Confeti y transición a cero
| ID | Caso | Esperado |
|---|---|---|
| CF-01 | Un gasto deja a B en 0 desde −3000 | Confeti una vez |
| CF-02 | Se abre un grupo donde B ya estaba en 0 | No hay confeti |
| CF-03 | `prefers-reduced-motion: reduce` | No hay animación, el balance se ve igual |
