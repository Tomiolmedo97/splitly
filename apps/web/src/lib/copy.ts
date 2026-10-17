/**
 * Textos de la UI. Fuente: docs/design/textos.md (PR #16, 39f2747).
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
    forbidden: "Este grupo no es tuyo o ya no sos parte",
    notFound: "No encontramos este grupo",
  },
  newGroup: {
    currencyHelp: "No se puede cambiar después de crear el grupo",
    currencyLocked: "La moneda no se puede cambiar después de crear el grupo",
  },
  general: {
    loading: "Cargando",
    retry: "Probar de nuevo",
    genericError: "Algo salió mal. Probá de nuevo",
    sessionExpired: "Tu sesión terminó. Ingresá de nuevo",
    /** Pendiente de validar con Design Bot: no figura en textos.md. */
    comingSoon: "Próximamente vas a poder usar esto. Todavía no guardamos nada.",
  },
} as const;
