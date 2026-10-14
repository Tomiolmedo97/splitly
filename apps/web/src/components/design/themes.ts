export type DesignTheme = {
  id: "mango" | "aurora" | "menta";
  name: string;
  tagline: string;
  dark: boolean;
  colors: {
    bg: string; surface: string; text: string; muted: string;
    primary: string; onPrimary: string; accent: string;
    positive: string; negative: string; border: string;
  };
  swatches: { name: string; hex: string; usage: string }[];
};

/** Todos los pares texto/fondo verificados con contraste >= 4,5:1. Lima y amarillo solo como fondo o acento. */
export const themes: DesignTheme[] = [
  {
    id: "mango", name: "Mango y Lima", tagline: "Alegre y viajera, para compartir sin vueltas.", dark: false,
    colors: { bg: "#FFF8EE", surface: "#FFFFFF", text: "#2B1A17", muted: "#6B4F48", primary: "#C2412F", onPrimary: "#FFFFFF",
      accent: "#C6F432", positive: "#2F6B1F", negative: "#B42318", border: "#F3DFCB" },
    swatches: [
      { name: "Coral", hex: "#C2412F", usage: "Acción principal" },
      { name: "Mango", hex: "#F25F4C", usage: "Ilustración y fondos" },
      { name: "Lima", hex: "#C6F432", usage: "Acentos (no texto)" },
      { name: "Crema", hex: "#FFF8EE", usage: "Fondo" },
      { name: "Cacao", hex: "#2B1A17", usage: "Texto" },
    ],
  },
  {
    id: "aurora", name: "Aurora", tagline: "La más vistosa: gradientes vivos sobre modo oscuro.", dark: true,
    colors: { bg: "#0F0A1F", surface: "#1A1333", text: "#F5F3FF", muted: "#B9B2D9", primary: "#A78BFA", onPrimary: "#0F0A1F",
      accent: "#22D3EE", positive: "#5EEAD4", negative: "#FDA4AF", border: "#2E2552" },
    swatches: [
      { name: "Violeta", hex: "#A78BFA", usage: "Acción principal" },
      { name: "Cian", hex: "#22D3EE", usage: "Acentos y gradiente" },
      { name: "Noche", hex: "#0F0A1F", usage: "Fondo" },
      { name: "Índigo", hex: "#1A1333", usage: "Tarjetas" },
      { name: "Lavanda", hex: "#F5F3FF", usage: "Texto" },
    ],
  },
  {
    id: "menta", name: "Menta fresca", tagline: "Limpia y serena: las cuentas están claras.", dark: false,
    colors: { bg: "#F3FBF7", surface: "#FFFFFF", text: "#12312B", muted: "#4B6B63", primary: "#0F766E", onPrimary: "#FFFFFF",
      accent: "#FDE047", positive: "#166534", negative: "#B91C1C", border: "#CDEFE0" },
    swatches: [
      { name: "Pino", hex: "#0F766E", usage: "Acción principal" },
      { name: "Menta", hex: "#A7F3D0", usage: "Fondos suaves" },
      { name: "Limón", hex: "#FDE047", usage: "Acentos (no texto)" },
      { name: "Bruma", hex: "#F3FBF7", usage: "Fondo" },
      { name: "Bosque", hex: "#12312B", usage: "Texto" },
    ],
  },
];
