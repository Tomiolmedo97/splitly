export type BalanceStatus = "positive" | "negative" | "settled";

export function balanceStatus(cents: number): BalanceStatus {
  if (cents > 0) return "positive";
  if (cents < 0) return "negative";
  return "settled";
}
