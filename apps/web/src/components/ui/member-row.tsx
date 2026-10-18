"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/format-money";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy";
import { balanceStatus, displayStatus } from "./balance-status";
import { useCountUp } from "./use-count-up";

export type MemberRowProps = {
  name: string;
  /** Saldo en centavos enteros. */
  cents: number;
  currency: Currency;
  /** Detalle secundario (14 muted), p. ej. "pagó la cena". */
  detail?: ReactNode;
  /** Muestra la etiqueta "sin cuenta" para miembros invitados sin usuario. */
  withoutAccount?: boolean;
  /** Cuenta animada al cambiar el saldo. Respeta prefers-reduced-motion. */
  animated?: boolean;
  /** Destello de celebración (una vez) cuando la persona queda al día. */
  celebrate?: boolean;
};

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0]![0], parts[parts.length - 1]![0]] : [parts[0]?.[0]];
  return letters.filter(Boolean).join("").toLocaleUpperCase("es-AR");
}

const srStatus = copy.member.srStatus;

/** Fila de una persona del grupo. Renderiza un `<li>`: usala dentro de `<MemberList>`. */
export function MemberRow({ name, cents, currency, detail, withoutAccount, animated = false, celebrate }: MemberRowProps) {
  const reduce = useReducedMotion();
  const display = useCountUp(cents, animated);
  // Signo, color y flecha según el valor mostrado; "Al día" solo si el saldo final es 0. Lectores: valor final.
  const status = displayStatus(display, cents);
  const finalStatus = balanceStatus(cents);

  return (
    <li
      className={cn(
        // La fila es el contenedor de la query que decide si el monto baja a una segunda línea.
        "@container relative",
        // Separador de 1 px con inset de 56 px (12 de padding + 32 de avatar + 12 de gap).
        "after:absolute after:right-0 after:bottom-0 after:left-14 after:h-px after:bg-border last:after:hidden",
      )}
    >
      {celebrate && !reduce && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-lg bg-celebrate"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      )}
      {/*
        Fila de menos de 330 px: el monto baja a una segunda línea, alineado a la derecha debajo del nombre,
        mismo tamaño y con la flecha. Umbral medido: con "−US$ 999.999.999,99" (183 px a 16 px) el nombre
        necesita 80 (padding + avatar + gaps) + 183 + 64 (6ch) = 327 px de fila para mostrar 6 caracteres.
      */}
      <div className="relative flex min-h-14 items-center gap-3 px-3 py-2 @max-[330px]:flex-wrap @max-[330px]:gap-y-1">
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-text"
        >
          {initials(name)}
        </span>
        {/*
          Columna del nombre: el nombre conserva al menos 6 caracteres. "sin cuenta" puede achicarse y,
          si no entra al lado del nombre, baja sola a la segunda línea, junto al detalle.
        */}
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2">
          <span className="min-w-[6ch] truncate text-base text-text">{name}</span>
          {withoutAccount && (
            <span className="min-w-0 truncate rounded-full border border-border px-2 text-xs leading-5 text-muted">
              {copy.member.withoutAccount}
            </span>
          )}
          {detail && (
            <span
              className={cn(
                "truncate text-sm text-muted",
                // Con etiqueta: el detalle crece pero exige el ancho de la columna menos lo que ocupa la etiqueta.
                // Si la etiqueta quedó al lado del nombre, no entra ahí y baja; si la etiqueta bajó, entra a su lado.
                withoutAccount ? "min-w-[calc(100%-6.5rem)] grow basis-0" : "min-w-0 basis-full",
              )}
            >
              {detail}
            </span>
          )}
        </span>
        <span
          className={cn(
            // El monto nunca se achica ni se trunca.
            "flex shrink-0 items-center gap-1 text-base font-semibold whitespace-nowrap tabular-nums",
            "@max-[330px]:basis-full @max-[330px]:justify-end @max-[330px]:pl-11",
            status === "positive" && "text-positive",
            status === "negative" && "text-negative",
            status === "settled" && "text-text",
          )}
        >
          <span className="sr-only">
            {finalStatus === "settled"
              ? srStatus.settled
              : `${srStatus[finalStatus]}: ${formatMoney(cents, currency, { showPlus: true })}`}
          </span>
          {status === "settled" ? (
            <>
              <span aria-hidden>{copy.balance.settled}</span>
              <Check size={16} aria-hidden />
            </>
          ) : (
            <>
              {status === "positive" ? (
                <ArrowUp size={14} aria-hidden className="shrink-0" />
              ) : (
                <ArrowDown size={14} aria-hidden className="shrink-0" />
              )}
              <span aria-hidden>{formatMoney(display, currency, { showPlus: true })}</span>
            </>
          )}
        </span>
      </div>
    </li>
  );
}

export function MemberList({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <ul aria-label={label} className={cn("flex flex-col", className)}>
      {children}
    </ul>
  );
}
