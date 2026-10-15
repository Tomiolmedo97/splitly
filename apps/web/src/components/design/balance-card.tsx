"use client";

import { useEffect, useRef, useState } from "react";
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
  const current = useRef(cents);
  useEffect(() => {
    if (reduce) { current.current = cents; setValue(cents); return; }
    const controls = animate(current.current, cents, {
      duration: 0.8, ease: "easeOut",
      onUpdate: (v) => { current.current = v; setValue(Math.round(v)); },
    });
    return () => controls.stop();
  }, [cents, reduce]);
  return <span className="tabular-nums">{formatMoney(value, currency, { showPlus: true })}</span>;
}

function Confetti({ colors }: { colors: string[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }, (_, i) => (
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
    // Confeti solo en la transición a cero (antes != 0, después == 0), como pide US5.
    const reachedZero = before.some((m, i) => m.cents !== 0 && after[i]!.cents === 0);
    if (next && reachedZero && !reduce) setBurst((b) => b + 1);
  };

  const debts = settled
    ? [{ from: "Sofi", to: "Ana", cents: 300000 }]
    : [{ from: "Sofi", to: "Ana", cents: 300000 }, { from: "Juan", to: "Ana", cents: 150000 }];

  return (
    <div className="relative overflow-hidden rounded-xl border p-4"
      style={{ backgroundColor: c.surface, borderColor: c.border, color: c.text }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold">Viaje a Bariloche</h3>
        <span className="rounded-lg border px-2 py-0.5 text-[12px] font-medium" style={{ borderColor: c.border, color: c.muted }}>
          {currency}
        </span>
      </div>

      <ul className="space-y-2">
        {members.map((m) => {
          const positive = m.cents > 0;
          const zero = m.cents === 0;
          const color = zero ? c.muted : positive ? c.positive : c.negative;
          const Icon = zero ? Check : positive ? ArrowDownLeft : ArrowUpRight;
          const label = zero ? "está al día" : positive ? "le deben" : "debe";
          return (
            <li key={m.name} className="relative flex items-center justify-between rounded-lg px-3 py-3"
              style={{ backgroundColor: c.bg }}>
              {zero && settled && !reduce && (
                <motion.span aria-hidden className="absolute inset-0 rounded-lg"
                  style={{ backgroundColor: c.celebrate }}
                  initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 1.2 }} />
              )}
              <span className="relative text-[14px]" style={{ color: c.muted }}>{m.name}</span>
              <span className="relative flex items-center gap-2" style={{ color }}>
                <Icon size={16} aria-hidden />
                <span className="text-[12px] font-medium">{label}</span>
                {!zero && <span className="text-[20px] font-semibold"><CountUp cents={m.cents} currency={currency} /></span>}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-2">
        <p className="text-[12px] font-medium" style={{ color: c.muted }}>Quién le debe a quién</p>
        <AnimatePresence initial={false}>
          {debts.map((d) => (
            <motion.div key={`${d.from}-${d.to}`} layout
              initial={reduce ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
              className="flex items-center gap-2 text-[14px]">
              <span className="font-medium">{d.from}</span>
              <motion.span initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }}
                style={{ originX: 0, color: c.primary }} transition={{ duration: 0.5 }}>
                <ArrowRight size={16} aria-label="le debe a" />
              </motion.span>
              <span className="font-medium">{d.to}</span>
              <span className="ml-auto font-semibold tabular-nums">{formatMoney(d.cents, currency)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button type="button" onClick={toggle}
        className="mt-4 w-full rounded-lg px-4 py-3 text-[14px] font-semibold transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ backgroundColor: c.primary, color: c.onPrimary, outlineColor: c.primary }}>
        {settled ? "Reiniciar demo" : "Simular: Juan salda su deuda"}
      </button>

      {burst > 0 && <Confetti key={burst} colors={[c.celebrate, c.primary, c.positive]} />}
      <p className="sr-only" aria-live="polite">{settled ? "Juan quedó al día." : ""}</p>
    </div>
  );
}
