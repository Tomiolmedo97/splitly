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
Hola, Tomas                         [avatar]
┌ Tarjeta resumen (12 radio) ───────────┐
│ Te deben            + $ 45.000  ↑     │  40/600 positivo, cuenta al entrar
│ Debés               − $ 12.300  ↓     │  20/500 negativo
└───────────────────────────────────────┘
Grupos                         [ + Nuevo ]
• Viaje Bariloche   4 personas   + $ 30.000
• Depto             3 personas   − $ 8.200
• Asado viernes     6 personas   al día ✓
```
Monto a la derecha, lo más grande de la fila; nombre en texto, detalle en muted.

## 3. Detalle de grupo
```
← Viaje Bariloche                    [⋯]
[ Saldos ] [ Gastos ]                 tabs, subrayado primario
Saldos
  Ana    + $ 45.000 ↑
  Juan   − $ 15.000 ↓
  Sofi   − $ 30.000 ↓
Cómo quedar al día
  Juan  ──→  Ana   $ 15.000
  Sofi  ──→  Ana   $ 30.000      (solo informativo, sin acción)
                      [ + Agregar gasto ]  botón flotante primario
```
Flechas animadas al recalcular deudas (reacomodo 250 ms). Al guardar un gasto que deja a alguien en 0: número cuenta a 0, destello limón y confeti.

## 3b. Gastos (tab) y detalle del gasto
```
[ Saldos ] [ Gastos ]
Hoy
  Cena          pagó Ana    $ 12.000
Ayer
  Nafta         pagó Juan   $ 30.000
```
Del más nuevo al más viejo, agrupado por día. Tocar una fila abre el detalle:
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
Crear deshabilitado sin nombre. Al crear, entra directo al detalle del grupo.

## Estados comunes
Vacío: ilustración lineal mínima + una acción. Carga: skeletons con el radio real.
Error: texto negativo + acción para reintentar. Foco visible: anillo de 2 px primario.

## Próximas versiones (fuera del MVP)
- Ingreso con Google.
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

