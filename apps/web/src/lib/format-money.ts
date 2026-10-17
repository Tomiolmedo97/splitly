export type Currency = "ARS" | "USD";

/** Espacio duro (U+00A0): el monto nunca se parte entre líneas. */
export const NBSP = "\u00a0";

const symbols: Record<Currency, string> = { ARS: "$", USD: "US$" };

// Mismo formato de número es-AR para las dos monedas; solo cambia el símbolo.
const number = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type FormatOptions = {
  /** Muestra "+" en positivos (útil para saldos). Por defecto, false. */
  showPlus?: boolean;
};

/**
 * Formatea centavos enteros respetando el signo, con locale es-AR para ambas monedas.
 * ARS: "$ 1.234,56" · USD: "US$ 1.234,56" · negativos: "−$ 1.234,56" · con showPlus: "+US$ 1.234,56".
 * El signo va pegado a la moneda; entre la moneda y el número hay un U+00A0. El menos es U+2212.
 */
export function formatMoney(cents: number, currency: Currency, { showPlus = false }: FormatOptions = {}): string {
  const body = `${symbols[currency]}${NBSP}${number.format(Math.abs(cents) / 100)}`;
  if (cents < 0) return `−${body}`;
  if (cents > 0 && showPlus) return `+${body}`;
  return body;
}
