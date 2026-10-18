export type BalanceStatus = "positive" | "negative" | "settled";

export function balanceStatus(cents: number): BalanceStatus {
  if (cents > 0) return "positive";
  if (cents < 0) return "negative";
  return "settled";
}

/**
 * Estado visual durante la cuenta animada.
 * - Signo, color y flecha siguen al valor mostrado.
 * - "Al día" / ✓ solo si el saldo FINAL es 0 (y la cuenta ya llegó a 0).
 * - Si la cuenta cruza el 0 hacia el otro signo, en el 0 se usa el signo final: nunca hay un destello de "Al día".
 */
export function displayStatus(displayed: number, final: number): BalanceStatus {
  if (displayed > 0) return "positive";
  if (displayed < 0) return "negative";
  return balanceStatus(final);
}
