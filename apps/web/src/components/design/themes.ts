export type ThemeColors = {
  bg: string; surface: string; text: string; muted: string; border: string;
  primary: string; onPrimary: string; positive: string; negative: string;
  /** Solo confeti y destello de "al día". Nunca texto ni logo. */
  celebrate: string;
  logoTop: string; logoBottom: string;
};

export type DesignTheme = {
  id: string;
  name: string;
  tagline: string;
  dark: boolean;
  status: "elegida" | "descartada";
  colors: ThemeColors;
};

/** Sistema elegido por Design Bot: Menta fresca + Geist. Contrastes verificados por QA (texto >= 4,5:1, logo >= 3:1). */
export const mentaLight: DesignTheme = {
  id: "menta-light", name: "Menta fresca · claro", status: "elegida", dark: false,
  tagline: "Calma y confianza: las cuentas están claras.",
  colors: {
    bg: "#F7FAF9", surface: "#FFFFFF", text: "#12312B", muted: "#4B6B63", border: "#DCEBE4",
    primary: "#0F766E", onPrimary: "#FFFFFF", positive: "#166534", negative: "#B91C1C",
    celebrate: "#FDE047", logoTop: "#12312B", logoBottom: "#0D9488",
  },
};

export const mentaDark: DesignTheme = {
  id: "menta-dark", name: "Menta fresca · oscuro", status: "elegida", dark: true,
  tagline: "El mismo sistema, para la noche.",
  colors: {
    bg: "#0B1211", surface: "#121C1A", text: "#ECF5F2", muted: "#9DB5AE", border: "#1F2E2B",
    primary: "#2DD4BF", onPrimary: "#0B1211", positive: "#4ADE80", negative: "#F87171",
    celebrate: "#FDE047", logoTop: "#ECF5F2", logoBottom: "#2DD4BF",
  },
};

/** Referencias descartadas, con los ajustes de Design Bot. */
export const discarded: DesignTheme[] = [
  {
    id: "mango", name: "Mango y Lima", status: "descartada", dark: false,
    tagline: "Más llamativa, pero cansa en uso diario.",
    colors: {
      bg: "#FBF7F2", surface: "#FFFFFF", text: "#2B1A17", muted: "#6B4F48", border: "#EDE4DA",
      primary: "#C2412F", onPrimary: "#FFFFFF", positive: "#2F6B1F", negative: "#B42318",
      celebrate: "#C6F432", logoTop: "#2B1A17", logoBottom: "#C2412F",
    },
  },
  {
    id: "aurora", name: "Aurora", status: "descartada", dark: true,
    tagline: "Oscura y sobria, se ve genérica rápido.",
    colors: {
      bg: "#0B0B10", surface: "#16161D", text: "#F5F3FF", muted: "#B9B2D9", border: "#26262F",
      primary: "#A78BFA", onPrimary: "#0B0B10", positive: "#5EEAD4", negative: "#FDA4AF",
      celebrate: "#A78BFA", logoTop: "#F5F3FF", logoBottom: "#A78BFA",
    },
  },
];
