"use client";

import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/format-money";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { amountClasses, type AmountVariant } from "./amount-size";
import { balanceStatus, displayStatus } from "./balance-status";
import { useCountUp } from "./use-count-up";

export type BalanceCardProps = {
  /** Saldo en centavos enteros. Positivo: te deben. Negativo: debés. */
  cents: number;
  currency: Currency;
  /** Por defecto, "Tu saldo". */
  label?: string;
  /** Cuenta animada al cambiar el saldo (600 ms). Respeta prefers-reduced-motion. */
  animated?: boolean;
  /**
   * "summary": tarjeta resumen de Mis grupos (40 px; 28 px con tarjeta < 360 px; 20 px < 240 px).
   * "grid" (por defecto): tarjetas en grilla (28 px; 20 px con tarjeta < 240 px).
   * Además, los montos largos bajan escalones (ver amount-size.ts). Nunca menos de 20 px.
   */
  variant?: AmountVariant;
  className?: string;
};

const statusText = {
  positive: copy.balance.positive,
  negative: copy.balance.negative,
  settled: copy.balance.settled,
} as const;

export function BalanceCard({
  cents,
  currency,
  label = copy.balance.label,
  animated = false,
  variant = "grid",
  className,
}: BalanceCardProps) {
  const display = useCountUp(cents, animated);
  // Signo, color y flecha siguen al valor que se ve; "Al día" solo si el saldo FINAL es 0.
  const status = displayStatus(display, cents);
  const finalStatus = balanceStatus(cents);
  const finalAmount = formatMoney(cents, currency, { showPlus: true });
  const finalText = finalStatus === "settled" ? statusText.settled : `${statusText[finalStatus]}: ${finalAmount}`;
  // El tamaño sale del monto final, así no salta de escalón mientras cuenta.
  const size = amountClasses(variant, finalAmount);

  return (
    // El contenedor de la query es la tarjeta entera (incluido el padding), no el área de contenido.
    <div className={cn("@container rounded-xl border border-border bg-surface text-text dark:border-transparent", className)}>
      <div className="p-5">
        <p className="text-sm text-muted">{label}</p>
        {/* Lectores de pantalla: solo el valor final, nunca los intermedios de la cuenta. */}
        <p className="sr-only">{finalText}</p>
        {status === "settled" ? (
          <p
            aria-hidden
            className={cn("mt-1 flex items-center gap-2 leading-tight font-semibold whitespace-nowrap text-text", size.text)}
          >
            {copy.balance.settled} <Check strokeWidth={2.5} className={cn("shrink-0", size.icon)} />
          </p>
        ) : (
          <div aria-hidden>
            <p
              className={cn(
                // El monto nunca se trunca ni se parte: nowrap + espacio duro de formatMoney, sin overflow-hidden.
                "mt-1 flex items-center gap-2 leading-tight font-semibold whitespace-nowrap tabular-nums",
                size.text,
                status === "positive" ? "text-positive" : "text-negative",
              )}
            >
              {status === "positive" ? (
                <ArrowUp strokeWidth={2.5} className={cn("shrink-0", size.icon)} />
              ) : (
                <ArrowDown strokeWidth={2.5} className={cn("shrink-0", size.icon)} />
              )}
              <span>{formatMoney(display, currency, { showPlus: true })}</span>
            </p>
            <p className={cn("text-sm font-medium", status === "positive" ? "text-positive" : "text-negative")}>
              {statusText[status]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
