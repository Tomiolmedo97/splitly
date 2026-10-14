export type Currency = "ARS" | "USD";

const formatters: Record<Currency, Intl.NumberFormat> = {
  ARS: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }),
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", currencyDisplay: "code" }),
};

/** Formatea centavos enteros. ARS: "$ 1.234,56" · USD: "US$ 1,234.56" */
export function formatMoney(cents: number, currency: Currency): string {
  const value = Math.abs(cents) / 100;
  if (currency === "USD") return `US$ ${formatters.USD.format(value).replace("USD", "").trim()}`;
  return formatters.ARS.format(value).replace(/\u00a0/g, " ");
}
