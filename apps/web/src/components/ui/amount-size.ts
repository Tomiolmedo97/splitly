/**
 * Escalones de tamaño del monto: 40 → 28 → 20 px (nunca menos de 20).
 * El largo del monto formateado baja escalones: desde 14 caracteres uno, desde 17 dos.
 * Se suma a las container queries por ancho de la tarjeta.
 */
export const AMOUNT_STEP_FROM_14 = 14;
export const AMOUNT_STEP_FROM_17 = 17;

export type AmountStep = 0 | 1 | 2;

/** Cuántos escalones baja el monto por su largo (cuenta caracteres, no bytes: "−" es uno). */
export function amountLengthSteps(formatted: string): AmountStep {
  const length = [...formatted].length;
  if (length >= AMOUNT_STEP_FROM_17) return 2;
  if (length >= AMOUNT_STEP_FROM_14) return 1;
  return 0;
}

export type AmountVariant = "summary" | "grid";

/*
 * Clases literales (Tailwind solo genera lo que encuentra escrito). Índice = escalones por largo.
 * summary: 40 px; baja un escalón con tarjeta < 360 px y otro con < 240 px.
 * grid:    28 px; baja un escalón con tarjeta < 240 px.
 */
const text: Record<AmountVariant, readonly [string, string, string]> = {
  summary: [
    "text-[40px] @max-[360px]:text-[28px] @max-[240px]:text-[20px]",
    "text-[28px] @max-[360px]:text-[20px]",
    "text-[20px]",
  ],
  grid: ["text-[28px] @max-[240px]:text-[20px]", "text-[20px]", "text-[20px]"],
};

const icon: Record<AmountVariant, readonly [string, string, string]> = {
  summary: ["size-8 @max-[360px]:size-6 @max-[240px]:size-4", "size-6 @max-[360px]:size-4", "size-4"],
  grid: ["size-6 @max-[240px]:size-4", "size-4", "size-4"],
};

export function amountClasses(variant: AmountVariant, formatted: string): { text: string; icon: string } {
  const steps = amountLengthSteps(formatted);
  return { text: text[variant][steps], icon: icon[variant][steps] };
}
