"use client";

import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/format-money";
import { cn } from "@/lib/cn";
import { balanceStatus } from "./balance-status";
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
   * "summary": tarjeta resumen de Mis grupos (monto 40 px; 28 px si la tarjeta mide menos de 360 px).
   * "grid" (por defecto): tarjetas en grilla (monto 28 px).
   * En ambos casos baja a 20 px si la tarjeta mide menos de 240 px (container query).
   */
  variant?: "summary" | "grid";
  className?: string;
};

// El monto nunca se trunca ni se parte: nowrap + espacios duros de formatMoney, sin overflow-hidden.
const amountSize = {
  summary: "text-[40px] @max-[360px]:text-[28px] @max-[240px]:text-[20px]",
  grid: "text-[28px] @max-[240px]:text-[20px]",
} as const;
const iconSize = {
  summary: "size-8 @max-[360px]:size-6 @max-[240px]:size-4",
  grid: "size-6 @max-[240px]:size-4",
} as const;

const statusText = { positive: "Te deben", negative: "Debés", settled: "Al día" } as const;

export function BalanceCard({
  cents,
  currency,
  label = "Tu saldo",
  animated = false,
  variant = "grid",
  className,
}: BalanceCardProps) {
  const display = useCountUp(cents, animated);
  // Signo, color, ícono y "Al día" siguen al valor que se ve mientras cuenta, no al final.
  const status = balanceStatus(display);
  const finalStatus = balanceStatus(cents);
  const finalText =
    finalStatus === "settled"
      ? statusText.settled
      : `${statusText[finalStatus]}: ${formatMoney(cents, currency, { showPlus: true })}`;

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
          className={cn("mt-1 flex items-center gap-2 leading-tight font-semibold whitespace-nowrap text-text", amountSize[variant])}
        >
          Al día <Check strokeWidth={2.5} className={cn("shrink-0", iconSize[variant])} />
        </p>
      ) : (
        <div aria-hidden>
          <p
            className={cn(
              "mt-1 flex items-center gap-2 leading-tight font-semibold whitespace-nowrap tabular-nums",
              amountSize[variant],
              status === "positive" ? "text-positive" : "text-negative",
            )}
          >
            {status === "positive" ? (
              <ArrowUp strokeWidth={2.5} className={cn("shrink-0", iconSize[variant])} />
            ) : (
              <ArrowDown strokeWidth={2.5} className={cn("shrink-0", iconSize[variant])} />
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
