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
  className?: string;
};

const statusText = { positive: "Te deben", negative: "Debés", settled: "Al día" } as const;

export function BalanceCard({ cents, currency, label = "Tu saldo", animated = false, className }: BalanceCardProps) {
  const display = useCountUp(cents, animated);
  const status = balanceStatus(cents);
  const finalText = formatMoney(cents, currency, { showPlus: true });

  return (
    <div
      className={cn("rounded-xl border border-border bg-surface p-5 text-text dark:border-transparent", className)}
    >
      <p className="text-sm text-muted">{label}</p>
      {status === "settled" ? (
        <p className="mt-1 flex items-center gap-2 text-[40px] leading-tight font-semibold text-text">
          Al día <Check size={32} aria-hidden strokeWidth={2.5} />
        </p>
      ) : (
        <>
          <p
            className={cn(
              "mt-1 flex items-center gap-2 text-[40px] leading-tight font-semibold tabular-nums",
              status === "positive" ? "text-positive" : "text-negative",
            )}
          >
            {status === "positive" ? (
              <ArrowUp size={32} aria-hidden strokeWidth={2.5} className="shrink-0" />
            ) : (
              <ArrowDown size={32} aria-hidden strokeWidth={2.5} className="shrink-0" />
            )}
            {/* Mientras cuenta, los lectores de pantalla leen solo el valor final. */}
            <span aria-hidden>{formatMoney(display, currency, { showPlus: true })}</span>
            <span className="sr-only">{finalText}</span>
          </p>
          <p
            className={cn("text-sm font-medium", status === "positive" ? "text-positive" : "text-negative")}
          >
            {statusText[status]}
          </p>
        </>
      )}
    </div>
  );
}
