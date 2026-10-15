export type Currency = "ARS" | "USD";

const formatters: Record<Currency, Intl.NumberFormat> = {
  ARS: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }),
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", currencyDisplay: "code" }),
};

type FormatOptions = {
  /** Muestra "+" en positivos (útil para saldos). Por defecto, false. */
  showPlus?: boolean;
};

/**
 * Formatea centavos enteros respetando el signo.
 * ARS: "$ 1.234,56" · USD: "US$ 1,234.56" · negativos: "−$ 1.234,56"
 */
export function formatMoney(cents: number, currency: Currency, { showPlus = false }: FormatOptions = {}): string {
  const value = Math.abs(cents) / 100;
  const body =
    currency === "USD"
      ? `US$ ${formatters.USD.format(value).replace("USD", "").trim()}`
      : formatters.ARS.format(value).replace(/\u00a0/g, " ");
  if (cents < 0) return `−${body}`;
  if (cents > 0 && showPlus) return `+${body}`;
  return body;
}
