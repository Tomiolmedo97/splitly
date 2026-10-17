# Splitly — Textos de la UI (MVP)

Tono: claro, cercano y breve. Voseo rioplatense. Frases cortas, sin signos de exclamación salvo en celebraciones. Los errores dicen qué pasó y cómo seguir, nunca culpan a la persona. Los montos siempre con signo y moneda.

## Ingreso (`/ingresar`)
| Elemento | Texto |
|---|---|
| Título (h1) | Ingresá a Splitly |
| Subtítulo | Las cuentas claras entre amigos |
| Label email | Email |
| Placeholder email | vos@ejemplo.com |
| Label contraseña | Contraseña |
| Mostrar / ocultar (aria-label) | Mostrar contraseña / Ocultar contraseña |
| Botón principal | Ingresar |
| Botón cargando | Ingresando… |
| Link a registro | ¿No tenés cuenta? Creá una |

## Registro (`/registro`)
| Elemento | Texto |
|---|---|
| Título (h1) | Creá tu cuenta |
| Subtítulo | Empezá a dividir gastos en un minuto |
| Label nombre | Tu nombre |
| Placeholder nombre | Cómo te ven tus amigos |
| Label email | Email |
| Label contraseña | Contraseña |
| Ayuda contraseña | Mínimo 8 caracteres |
| Botón principal | Crear cuenta |
| Botón cargando | Creando cuenta… |
| Link a ingreso | ¿Ya tenés cuenta? Ingresá |

## Errores de autenticación
| Caso | Texto |
|---|---|
| Campo vacío | Completá este campo |
| Email inválido | Revisá el email, parece que falta algo |
| Contraseña corta | La contraseña tiene que tener al menos 8 caracteres |
| Email ya registrado | Ya hay una cuenta con este email. ¿Querés ingresar? |
| Credenciales incorrectas | El email o la contraseña no coinciden |
| Demasiados intentos | Hiciste muchos intentos. Probá de nuevo en unos minutos |
| Error de red / servidor | No pudimos conectarnos. Revisá tu conexión y probá de nuevo |

## Mis grupos (`/grupos`)
| Elemento | Texto |
|---|---|
| Título (h1) | Hola, {nombre} |
| Resumen: a favor | Te deben (un total por moneda, ej.: +$ 45.000 · +US$ 120) |
| Resumen: en contra | Debés (un total por moneda; nunca se suman ARS y USD) |
| Resumen: en cero | Estás al día |
| Sección (h2) | Tus grupos |
| Botón | Nuevo grupo |
| Detalle de fila | {n} personas · {saldo} |
| Fila sin saldo | Al día |
| Vacío: título | Todavía no tenés grupos |
| Vacío: texto | Creá uno para el próximo viaje, la casa o el asado |
| Vacío: botón | Crear mi primer grupo |

## Nuevo grupo (`/grupos/nuevo`)
| Elemento | Texto |
|---|---|
| Título (h1) | Nuevo grupo |
| Label nombre | Nombre del grupo |
| Placeholder nombre | Ej.: Viaje a Bariloche |
| Label moneda | Moneda |
| Opciones | ARS · USD |
| Ayuda moneda | Podés cambiarla mientras el grupo no tenga gastos |
| Sección (h2) | Participantes |
| Vos | {nombre} (vos) |
| Agregar de tus grupos | Agregar de tus grupos |
| Buscador (placeholder) | Buscá por nombre |
| Lista vacía en la búsqueda | No hay nadie con ese nombre en tus grupos |
| Agregar solo con nombre | Agregar solo con nombre |
| Etiqueta | Sin cuenta |
| Ayuda sin cuenta | Para quien no usa Splitly. Igual aparece en los gastos y saldos |
| Quitar (aria-label) | Quitar a {nombre} |
| Botón principal | Crear grupo |
| Botón cargando | Creando… |

## Errores de grupos y participantes
| Caso | Texto |
|---|---|
| Nombre vacío | Ponele un nombre al grupo |
| Nombre muy largo | El nombre puede tener hasta 40 caracteres |
| Persona ya agregada | Esa persona ya está en el grupo |
| Nombre duplicado | Ya hay alguien con ese nombre. Sumale una inicial para distinguirlos |
| Sin acceso (403) o inexistente (404) | No encontramos este grupo o no tenés acceso |
| Quitar miembro con saldo | {nombre} todavía tiene saldo. Tiene que quedar al día antes de salir del grupo |
| Confirmar quitar: título | ¿Quitar a {nombre} del grupo? |
| Confirmar quitar: texto | Sus gastos anteriores quedan en el historial |
| Confirmar quitar: botones | Quitar · Cancelar |

## Detalle de grupo (`/grupos/[id]`)
| Elemento | Texto |
|---|---|
| Pestañas | Saldos · Gastos |
| Sección (h2) | Saldos |
| Sección (h2) | Cómo quedar al día |
| Deuda | {deudor} le debe {monto} a {acreedor} |
| Todos al día | Están todos al día |
| Botón flotante | Agregar gasto |
| Vacío gastos: título | Todavía no hay gastos |
| Vacío gastos: texto | Cargá el primero y Splitly hace las cuentas |

## Confirmaciones y avisos (toasts)
| Caso | Texto |
|---|---|
| Cuenta creada | Listo, ya tenés tu cuenta |
| Grupo creado | Grupo creado |
| Participante agregado | {nombre} se sumó al grupo |
| Alguien queda al día | {nombre} quedó al día 🎉 |
| Sesión cerrada | Cerraste sesión |

## Generales
| Elemento | Texto |
|---|---|
| Cerrar sesión | Cerrar sesión |
| Volver (aria-label) | Volver |
| Reintentar | Probar de nuevo |
| Cargando (lectores de pantalla) | Cargando |
| Error genérico | Algo salió mal. Probá de nuevo |

## Códigos de error de las Server Actions
FE muestra siempre el texto según el `code`, nunca el `message` del servidor. `fieldErrors` se muestra debajo de cada campo con el texto de la tabla de validación.
| `code` | Texto |
|---|---|
| `VALIDATION_ERROR` | (por campo, ver errores de autenticación y de grupos) |
| `EMAIL_TAKEN` | Ya hay una cuenta con este email. ¿Querés ingresar? |
| `INVALID_CREDENTIALS` | El email o la contraseña no coinciden |
| `PASSWORD_TOO_SHORT` | La contraseña tiene que tener al menos 8 caracteres |
| `RATE_LIMITED` | Hiciste muchos intentos. Probá de nuevo en unos minutos |
| `UNAUTHENTICATED` | Tu sesión terminó. Ingresá de nuevo |
| `MEMBER_DUPLICATE` | Esa persona ya está en el grupo |
| `FORBIDDEN` | No tenés permiso para hacer esto en el grupo |
| `NOT_FOUND` | No encontramos este grupo o no tenés acceso |
| `MEMBER_HAS_BALANCE` | {nombre} todavía tiene saldo. Tiene que quedar al día antes de salir del grupo |
| `CURRENCY_LOCKED` | Este grupo ya tiene gastos, así que la moneda no se puede cambiar |
| `INTERNAL` | Algo salió mal. Probá de nuevo |
