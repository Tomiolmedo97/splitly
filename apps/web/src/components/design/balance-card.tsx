"use client";

import { useEffect, useState } from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { formatMoney, type Currency } from "@/lib/format-money";
import type { DesignTheme } from "./themes";

type Member = { name: string; cents: number };

const before: Member[] = [
  { name: "Ana", cents: 450000 },
  { name: "Juan", cents: -150000 },
  { name: "Sofi", cents: -300000 },
];
const after: Member[] = [
  { name: "Ana", cents: 300000 },
  { name: "Juan", cents: 0 },
  { name: "Sofi", cents: -300000 },
];

function CountUp({ cents, currency }: { cents: number; currency: Currency }) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(cents);
  useEffect(() => {
    if (reduce) { setValue(cents); return; }
    const controls = animate(value, cents, { duration: 0.8, ease: "easeOut", onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cents, reduce]);
  return <span className="tabular-nums">{formatMoney(value, currency)}</span>;
}

function Confetti({ colors }: { colors: string[] }) {
  const pieces = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/3 h-2 w-1.5 rounded-sm"
          style={{ backgroundColor: colors[i % colors.length] }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: (i - 9) * 18, y: [0, -60 - (i % 4) * 15, 120], opacity: [1, 1, 0], rotate: i * 40 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function BalanceCard({ theme, currency }: { theme: DesignTheme; currency: Currency }) {
  const reduce = useReducedMotion();
  const [settled, setSettled] = useState(false);
  const [burst, setBurst] = useState(0);
  const members = settled ? after : before;
  const c = theme.colors;

  const toggle = () => {
    const next = !settled;
    setSettled(next);
    // Confeti solo en la transición a cero (antes != 0, después == 0), como en US5.
    const reachedZero = before.some((m, i) => m.cents !== 0 && after[i]!.cents === 0);
    if (next && reachedZero && !reduce) setBurst((b) => b + 1);
  };

  const debts = settled
    ? [{ from: "Sofi", to: "Ana", cents: 300000 }]
    : [{ from: "Sofi", to: "Ana", cents: 300000 }, { from: "Juan", to: "Ana", cents: 150000 }];

  return (
    <div className="relative overflow-hidden rounded-3xl border p-5 shadow-sm"
      style={{ backgroundColor: c.surface, borderColor: c.border, color: c.text }}>
      {theme.id === "aurora" && !reduce && (
        <motion.div aria-hidden className="absolute -inset-1/2 opacity-30 blur-3xl"
          style={{ background: `conic-gradient(from 0deg, ${c.primary}, ${c.accent}, ${c.primary})` }}
          animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />
      )}
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Viaje a Bariloche</h3>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: c.accent, color: theme.dark ? c.onPrimary : c.text }}>{currency}</span>
        </div>

        <ul className="space-y-2">
          {members.map((m) => {
            const positive = m.cents > 0; const zero = m.cents === 0;
            const color = zero ? c.muted : positive ? c.positive : c.negative;
            const Icon = zero ? Check : positive ? ArrowDownLeft : ArrowUpRight;
            const label = zero ? "está al día" : positive ? "le deben" : "debe";
            return (
              <li key={m.name} className="flex items-center justify-between rounded-2xl px-3 py-2"
                style={{ backgroundColor: theme.dark ? "#ffffff0d" : c.bg }}>
                <span className="font-medium">{m.name}</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
                  <Icon size={16} aria-hidden />
                  <span>{label}</span>
                  {!zero && <span>{positive ? "+" : "−"}<CountUp cents={Math.abs(m.cents)} currency={currency} /></span>}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: c.muted }}>Quién le debe a quién</p>
          <AnimatePresence initial={false}>
            {debts.map((d) => (
              <motion.div key={`${d.from}-${d.to}`} layout
                initial={reduce ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
                className="flex items-center gap-2 text-sm">
                <span className="font-medium">{d.from}</span>
                <motion.span initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }}
                  style={{ originX: 0, color: c.primary }} transition={{ duration: 0.5 }}>
                  <ArrowRight size={18} aria-label="le debe a" />
                </motion.span>
                <span className="font-medium">{d.to}</span>
                <span className="ml-auto font-semibold tabular-nums">{formatMoney(d.cents, currency)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button type="button" onClick={toggle}
          className="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-bold transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: c.primary, color: c.onPrimary, outlineColor: c.primary }}>
          {settled ? "Reiniciar demo" : "Simular: Juan salda su deuda"}
        </button>
      </div>
      {burst > 0 && <Confetti key={burst} colors={[c.primary, c.accent, c.positive]} />}
      <p className="sr-only" aria-live="polite">{settled ? "Juan quedó al día." : ""}</p>
    </div>
  );
}
