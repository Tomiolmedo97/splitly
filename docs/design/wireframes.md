# Splitly — Wireframes v0 (borrador)
Sistema: Menta fresca + Geist. Base 4 px, radios 8/12, montos con tabular-nums y signo + ícono.
Contenedor móvil 390 px, márgenes 16, separación entre bloques 24.

## 1. Ingreso
```
[ logo S ]                 (centrado, 48 px)
Splitly                    28/600
Las cuentas claras entre amigos   16/400 muted

[ Continuar con Google ]   botón primario, alto 48
[ Continuar con email  ]   botón secundario (borde)
Términos · Privacidad      12 muted
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
  Juan  ──→  Ana   $ 15.000   [ Saldar ]
  Sofi  ──→  Ana   $ 30.000   [ Saldar ]
                      [ + Agregar gasto ]  botón flotante primario
```
Flechas animadas al recalcular deudas (reacomodo 250 ms).

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

## 5. Saldar deuda
```
←  Saldar
Juan le paga a Ana
$ 15.000                          40/600
Método  ( Efectivo ) ( Transferencia )
Nota (opcional) ___________________
[ Confirmar pago ]                primario, alto 48
```
Al confirmar: número cuenta a 0, destello limón y confeti solo si la persona queda al día.

## Estados comunes
Vacío: ilustración lineal mínima + una acción. Carga: skeletons con el radio real.
Error: texto negativo + acción para reintentar. Foco visible: anillo de 2 px primario.
