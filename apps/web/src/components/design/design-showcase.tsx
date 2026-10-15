"use client";

import { useState } from "react";
import type { Currency } from "@/lib/format-money";
import { BalanceCard } from "./balance-card";
import { SplitlyLogo } from "./logo";
import { mentaDark, mentaLight } from "./themes";

const tokenKeys = ["bg", "surface", "text", "muted", "border", "primary", "positive", "negative", "celebrate"] as const;

type Mode = "claro" | "oscuro";

function Segmented<T extends string>({ label, options, value, onChange, dark }: {
  label: string; options: readonly T[]; value: T; onChange: (v: T) => void; dark: boolean;
}) {
  return (
    <div role="group" aria-label={label}
      className={`inline-flex rounded-lg border p-1 ${dark ? "border-[#1F2E2B]" : "border-[#DCEBE4]"}`}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button key={o} type="button" aria-pressed={active} onClick={() => onChange(o)}
            className={`rounded-md px-4 py-1.5 text-[14px] font-medium capitalize transition-colors ${
              active
                ? dark ? "bg-[#2DD4BF] text-[#0B1211]" : "bg-[#0F766E] text-white"
                : dark ? "text-[#9DB5AE]" : "text-[#4B6B63]"
            }`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function DesignShowcase() {
  const [mode, setMode] = useState<Mode>("claro");
  const [currency, setCurrency] = useState<Currency>("ARS");
  const theme = mode === "claro" ? mentaLight : mentaDark;
  const c = theme.colors;
  const dark = theme.dark;

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: c.bg, color: c.text }}>
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
        <SplitlyLogo top={c.logoTop} bottom={c.logoBottom} text={c.text} />
        <h1 className="mt-8 text-[28px] font-semibold tracking-tight sm:text-[40px]">Así se va a ver Splitly</h1>
        <p className="mt-2 text-[16px]" style={{ color: c.muted }}>
          Diseño Menta fresca con tipografía Geist. Tocá &quot;Simular&quot; para ver los números contando, las deudas
          que se reacomodan y el confeti cuando alguien queda al día.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Segmented label="Modo de color" options={["claro", "oscuro"] as const} value={mode} onChange={setMode} dark={dark} />
          <Segmented label="Moneda" options={["ARS", "USD"] as const} value={currency} onChange={setCurrency} dark={dark} />
        </div>

        <div className="mt-8">
          <BalanceCard key={theme.id} theme={theme} currency={currency} />
        </div>

        <details className="mt-10">
          <summary className="cursor-pointer text-[14px] font-medium" style={{ color: c.muted }}>Ver colores del sistema</summary>
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label="Colores del sistema">
            {tokenKeys.map((k) => (
              <li key={k}>
                <span className="block h-10 rounded-lg border" style={{ backgroundColor: c[k], borderColor: c.border }} />
                <span className="mt-1 block text-[12px] font-medium">{k}</span>
                <span className="block text-[12px] uppercase tabular-nums" style={{ color: c.muted }}>{c[k]}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
