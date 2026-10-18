# Splitly — Wireframes v0 (borrador)
Sistema: Menta fresca + Geist. Base 4 px, radios 8/12, montos con tabular-nums y signo + ícono.
Contenedor móvil 390 px, márgenes 16, separación entre bloques 24.

## 1. Ingreso
```
[ logo S ]                 (centrado, 48 px)
Splitly                    28/600
Las cuentas claras entre amigos   16/400 muted

Email        ______________________
Contraseña   ______________ [ver]
[ Ingresar ]               botón primario, alto 48
¿No tenés cuenta? Crear cuenta    14, link primario #0F766E
Error inline bajo el campo, en negativo
```
Animación: el logo se arma partiendo la S (300 ms, se omite con reduced-motion).

## 2. Mis grupos (inicio)
```
Hola, Tomas                 [ Cerrar sesión ]   botón de texto
┌ Tarjeta resumen (12 radio) ───────────┐
│ Tu saldo                              │
│ Te deben          +$ 45.000,00  ↑     │  40/600 positivo, cuenta al entrar
│ Debés             −$ 12.300,00  ↓     │  20/500 negativo
└───────────────────────────────────────┘
Grupos                         [ + Nuevo ]
• Viaje Bariloche   4 personas   +$ 30.000,00
• Depto             3 personas   −$ 8.200,00
• Asado viernes     6 personas   Al día ✓
```
Monto a la derecha, lo más grande de la fila; nombre en texto, detalle en muted.
Cada grupo es una tarjeta en grilla: `grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr))` (2 columnas en desktop, 1 en móvil).
Por ahora "Cerrar sesión" es un botón de texto directo en el header; el menú de avatar queda para más adelante.

## 3. Detalle de grupo
```
← Viaje Bariloche                    [⋯]
[ Saldos ] [ Gastos ]                 tabs, subrayado primario
Saldos
  Ana    +$ 45.000,00 ↑
  Juan   −$ 15.000,00 ↓
  Sofi   −$ 30.000,00 ↓
Cómo quedar al día
  Juan  ──→  Ana   $ 15.000,00
  Sofi  ──→  Ana   $ 30.000,00      (solo informativo, sin acción)
                      [ + Agregar gasto ]  botón flotante primario
```
Saldos es la pestaña por defecto; Gastos se abre con `?tab=gastos`.
Flechas animadas al recalcular deudas (reacomodo 250 ms). Al guardar un gasto que deja a alguien en 0: número cuenta a 0, destello limón y confeti.

## 3b. Gastos (tab) y detalle del gasto
```
[ Saldos ] [ Gastos ]
Hoy
  Cena          pagó Ana    $ 12.000
Ayer
  Nafta         pagó Juan   $ 30.000
```
Del más nuevo al más viejo, agrupado por día. Los gastos borrados no se muestran. Tocar una fila abre el detalle:
```
←  Cena                         [ Editar ]
$ 12.000                         40/600
Pagó Ana · 14 oct
División (igual)
  Ana   $ 4.000
  Juan  $ 4.000
  Sofi  $ 4.000
[ Borrar gasto ]                 texto negativo, pide confirmación
```
Editar reutiliza la pantalla de Nuevo gasto con los datos cargados.

## 4. Nuevo gasto
```
×  Nuevo gasto                   [ Guardar ]
$ 0,00                           40/600, teclado numérico
Descripción ______________________
Pagó      [ Ana ▾ ]
Dividir   ( Igual ) ( % ) ( Montos )   segmented control
  ☑ Ana    $ 3.333,34
  ☑ Juan   $ 3.333,33
  ☑ Sofi   $ 3.333,33
Falta repartir: $ 0,00 ✓          (negativo + aviso si no cuadra)
```
Guardar deshabilitado hasta que cierre la suma.

## 5. Nuevo grupo
```
×  Nuevo grupo                    [ Crear ]
Nombre       ______________________
Moneda       ( ARS ) ( USD )
Miembros
  Tomas (vos)
  Juan  (sin cuenta)
  [ + Agregar de tus grupos ]  [ + Agregar solo con nombre ]
```
"Agregar de tus grupos" abre una lista con buscador de las personas con cuenta que comparten otro grupo con vos (nombre y avatar, sin mostrar el email). Si no hay nadie, ese botón no se muestra y queda solo "Agregar solo con nombre".
Los miembros sin cuenta llevan la etiqueta "sin cuenta" en muted y funcionan igual en gastos y saldos.
En el MVP no se invita por email; eso está en Próximas versiones.
Crear queda siempre habilitado: si falta el nombre, muestra el error inline y lleva el foco al campo. Al crear, entra directo al detalle del grupo.
"Agregar solo con nombre" abre un campo inline "Nombre" + botón "Agregar"; Enter también agrega. Vacío muestra "Completá este campo".
Nombres duplicados: se controlan solo contra los invitados activos (sin cuenta), sin distinguir mayúsculas y con trim, pero sí distinguiendo acentos ("Sofi" = " sofi ", "Sofi" ≠ "Sofí"). Las personas con cuenta se controlan por `userId`. Error: "Persona ya agregada" (`MEMBER_DUPLICATE`); para invitados por nombre se usa el texto de "Nombre duplicado" (ver textos.md).
`CURRENCY_LOCKED`: la moneda se bloquea solo si el grupo tiene gastos activos (los borrados no cuentan).

## Navegación
- `/` redirige a `/ingresar` (por ahora).
- Después de crear la cuenta, va a `/grupos`.
- Grupo inexistente o de alguien que no es miembro: 404 dentro de la app, sin cambiar la URL, con "Volver a mis grupos".

## Montos: tamaños
- Tarjeta resumen: 40 px; 28 px con contenedor menor a 360 px; 20 px con contenedor menor a 240 px.
- Tarjeta de la grilla: 28 px; 20 px con contenedor menor a 240 px.
- Montos largos: bajan un tamaño desde 14 caracteres y dos desde 17. En tarjetas nunca menos de 20 px.
- MemberRow: monto fijo en 16 px, nunca se achica ni se trunca. El nombre lleva `min-w-0` y se trunca (mínimo ~6ch); la etiqueta "sin cuenta" baja debajo del nombre. Con la fila por debajo de 330 px, el monto pasa a su propia línea, alineado a la derecha.
- Todos los montos con `tabular-nums` y signo + ícono.

## Formularios
- Submit fallido: el foco va al primer campo con error; si el error es general, a la contraseña. La contraseña nunca se devuelve ni se precarga.
- Botón pendiente: `aria-disabled="true"` + `aria-busy="true"` (no `disabled`), conserva el foco, primario relleno al 100 % con spinner inline (8 px de separación) antes del label visible. Reserva el ancho del label más largo, ignora clics y Enter, y manda un solo submit.
- `disabled` real se mantiene con opacidad 45 %.

## Tema y favicon
- Por defecto sigue `prefers-color-scheme` sin parpadeo (CSS puro); el toggle de `/design` lo pisa.
- Favicon: la S del logo en dos mitades `#12312B` / `#0D9488`; en oscuro `#ECF5F2` / `#2DD4BF`.

## Quitar miembros (PM)
Solo quien creó el grupo puede quitar a alguien, y esa persona tiene que tener saldo 0. Es soft delete: el nombre sigue apareciendo en el historial de gastos (el tratamiento visual está por definir).

## Estados comunes
Vacío: ilustración lineal mínima + una acción. Carga: skeletons con el radio real.
Error: texto negativo + acción para reintentar. Foco visible: anillo de 2 px primario.

## Próximas versiones (fuera del MVP)
- Ingreso con Google.
- Menú de avatar en el header (reemplaza el botón "Cerrar sesión").
- Invitar por email y vincular la cuenta cuando esa persona se registre.
- Pantalla Saldar deuda
```
←  Saldar
Juan le paga a Ana
$ 15.000                          40/600
Método  ( Efectivo ) ( Transferencia )
Nota (opcional) ___________________
[ Confirmar pago ]                primario, alto 48
```
Al confirmar: número cuenta a 0, destello limón y confeti solo si la persona queda al día.

