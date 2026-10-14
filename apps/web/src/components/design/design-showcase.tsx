"use client";

import { useState } from "react";
import type { Currency } from "@/lib/format-money";
import { BalanceCard } from "./balance-card";
import { SplitlyLogo } from "./logo";
import { themes } from "./themes";

export function DesignShowcase() {
  const [currency, setCurrency] = useState<Currency>("ARS");
  return (
    <>
      <div role="group" aria-label="Moneda de la demo" className="mb-8 inline-flex rounded-full border border-zinc-300 p-1">
        {(["ARS", "USD"] as const).map((cur) => (
          <button key={cur} type="button" aria-pressed={currency === cur} onClick={() => setCurrency(cur)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${currency === cur ? "bg-zinc-900 text-white" : "text-zinc-700"}`}>
            {cur}
          </button>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        {themes.map((t, i) => (
          <section key={t.id} aria-labelledby={`theme-${t.id}`} className="rounded-[2rem] p-5 sm:p-6"
            style={{ backgroundColor: t.colors.bg, color: t.colors.text }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.colors.muted }}>Propuesta {i + 1}</p>
            <h2 id={`theme-${t.id}`} className="mt-1 text-2xl font-extrabold">{t.name}</h2>
            <p className="mt-1 text-sm" style={{ color: t.colors.muted }}>{t.tagline}</p>
            <div className="my-6"><SplitlyLogo primary={t.colors.primary} accent={t.colors.accent} text={t.colors.text} /></div>
            <ul className="mb-6 grid grid-cols-5 gap-2" aria-label={`Paleta ${t.name}`}>
              {t.swatches.map((s) => (
                <li key={s.hex} className="text-center">
                  <span className="block aspect-square rounded-xl border" style={{ backgroundColor: s.hex, borderColor: t.colors.border }} />
                  <span className="mt-1 block text-[11px] font-semibold">{s.name}</span>
                  <span className="block text-[10px] uppercase" style={{ color: t.colors.muted }}>{s.hex}</span>
                </li>
              ))}
            </ul>
            <BalanceCard theme={t} currency={currency} />
          </section>
        ))}
      </div>
    </>
  );
}
