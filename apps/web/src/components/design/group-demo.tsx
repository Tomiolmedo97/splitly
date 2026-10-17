"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/format-money";
import { BalanceCard } from "@/components/ui/balance-card";
import { Button } from "@/components/ui/button";
import { MemberList, MemberRow } from "@/components/ui/member-row";

type Member = { name: string; cents: number; withoutAccount?: boolean };

const before: Member[] = [
  { name: "Ana", cents: 450000 },
  { name: "Juan", cents: -150000 },
  { name: "Sofi", cents: -300000, withoutAccount: true },
];
const after: Member[] = [
  { name: "Ana", cents: 300000 },
  { name: "Juan", cents: 0 },
  { name: "Sofi", cents: -300000, withoutAccount: true },
];

const confettiColors = ["var(--color-celebrate)", "var(--color-primary)", "var(--color-positive)"];

function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute top-1/3 left-1/2 h-2 w-1.5 rounded-sm"
          style={{ backgroundColor: confettiColors[i % confettiColors.length] }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: (i - 9) * 18, y: [0, -60 - (i % 4) * 15, 120], opacity: [1, 1, 0], rotate: i * 40 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/** Demo interactiva del saldo de un grupo, armada con los componentes base de `ui/`. */
export function GroupDemo({ currency }: { currency: Currency }) {
  const reduce = useReducedMotion();
  const [settled, setSettled] = useState(false);
  const [burst, setBurst] = useState(0);
  const members = settled ? after : before;
  const me = members[0]!;

  const toggle = () => {
    const next = !settled;
    setSettled(next);
    // Confeti solo en la transición a cero (antes != 0, después == 0), como pide US5.
    const reachedZero = before.some((m, i) => m.cents !== 0 && after[i]!.cents === 0);
    if (next && reachedZero && !reduce) setBurst((b) => b + 1);
  };

  const debts = settled
    ? [{ from: "Sofi", to: "Ana", cents: 300000 }]
    : [
        { from: "Sofi", to: "Ana", cents: 300000 },
        { from: "Juan", to: "Ana", cents: 150000 },
      ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 text-text dark:border-transparent">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Viaje a Bariloche</h3>
        <span className="rounded-lg border border-border px-2 py-0.5 text-xs font-medium text-muted">{currency}</span>
      </div>

      <BalanceCard
        label={`Saldo de ${me.name}`}
        cents={me.cents}
        currency={currency}
        animated
        className="bg-bg dark:bg-bg"
      />

      <MemberList label="Miembros del grupo" className="mt-4">
        {members.map((m, i) => (
          <MemberRow
            key={m.name}
            name={m.name}
            cents={m.cents}
            currency={currency}
            withoutAccount={m.withoutAccount}
            animated
            celebrate={settled && m.cents === 0 && before[i]!.cents !== 0}
          />
        ))}
      </MemberList>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-muted">Quién le debe a quién</p>
        <AnimatePresence initial={false}>
          {debts.map((d) => (
            <motion.div
              key={`${d.from}-${d.to}`}
              layout
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
              className="flex items-center gap-2 text-sm"
            >
              <span className="font-medium">{d.from}</span>
              <motion.span
                className="text-primary"
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ originX: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ArrowRight size={16} aria-label="le debe a" />
              </motion.span>
              <span className="font-medium">{d.to}</span>
              <span className="ml-auto font-semibold tabular-nums">{formatMoney(d.cents, currency)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Button className="mt-4 w-full" onClick={toggle}>
        {settled ? "Reiniciar demo" : "Simular: Juan salda su deuda"}
      </Button>

      {burst > 0 && <Confetti key={burst} />}
      <p className="sr-only" aria-live="polite">
        {settled ? "Juan quedó al día." : ""}
      </p>
    </div>
  );
}
