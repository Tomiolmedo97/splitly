/**
 * Textos de la UI. Fuente: docs/design/textos.md (PR #16, mergeado en main como 076ed72).
 * No editar los strings acá sin actualizar ese documento.
 */
export const copy = {
  login: {
    title: "Ingresá a Splitly",
    subtitle: "Las cuentas claras entre amigos",
    emailLabel: "Email",
    emailPlaceholder: "vos@ejemplo.com",
    passwordLabel: "Contraseña",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    submit: "Ingresar",
    submitting: "Ingresando…",
    toRegisterPrompt: "¿No tenés cuenta?",
    toRegisterLink: "Creá una",
  },
  register: {
    title: "Creá tu cuenta",
    subtitle: "Empezá a dividir gastos en un minuto",
    nameLabel: "Tu nombre",
    namePlaceholder: "Cómo te ven tus amigos",
    emailLabel: "Email",
    passwordLabel: "Contraseña",
    passwordHint: "Mínimo 8 caracteres",
    submit: "Crear cuenta",
    submitting: "Creando cuenta…",
    toLoginPrompt: "¿Ya tenés cuenta?",
    toLoginLink: "Ingresá",
  },
  authErrors: {
    required: "Completá este campo",
    invalidEmail: "Revisá el email, parece que falta algo",
    passwordTooShort: "La contraseña tiene que tener al menos 8 caracteres",
    emailTaken: "Ya hay una cuenta con este email. ¿Querés ingresar?",
    invalidCredentials: "El email o la contraseña no coinciden",
    rateLimited: "Hiciste muchos intentos. Probá de nuevo en unos minutos",
    network: "No pudimos conectarnos. Revisá tu conexión y probá de nuevo",
  },
  groupErrors: {
    memberDuplicate: "Esa persona ya está en el grupo",
    /** 403 o 404: un no miembro recibe NOT_FOUND con este texto. */
    notFound: "No encontramos este grupo o no tenés acceso",
    /** Miembro que intenta una acción no permitida. */
    forbidden: "No tenés permiso para hacer esto en el grupo",
    memberHasBalance: "{nombre} todavía tiene saldo. Tiene que quedar al día antes de salir del grupo",
    currencyLocked: "Este grupo ya tiene gastos, así que la moneda no se puede cambiar",
  },
  myGroups: {
    /** h1. `{nombre}` lo completa FE con el nombre de la sesión. */
    greeting: "Hola, {nombre}",
    emptyTitle: "Todavía no tenés grupos",
    emptyText: "Creá uno para el próximo viaje, la casa o el asado",
  },
  newGroup: {
    currencyHelp: "Podés cambiarla mientras el grupo no tenga gastos",
  },
  balance: {
    /** Label por defecto de la tarjeta de saldo (no figura en textos.md). */
    label: "Tu saldo",
    positive: "Te deben",
    negative: "Debés",
    settled: "Al día",
  },
  member: {
    /** En minúscula a propósito (textos.md la escribe "Sin cuenta"). */
    withoutAccount: "sin cuenta",
    /** Estado del saldo para lectores de pantalla en la fila de persona. */
    srStatus: { positive: "le deben", negative: "debe", settled: "está al día" },
  },
  general: {
    loading: "Cargando",
    retry: "Probar de nuevo",
    genericError: "Algo salió mal. Probá de nuevo",
    sessionExpired: "Tu sesión terminó. Ingresá de nuevo",
    logout: "Cerrar sesión",
  },
} as const;
