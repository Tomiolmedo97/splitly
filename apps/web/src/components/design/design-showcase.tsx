"use client";

import { useState } from "react";
import type { Currency } from "@/lib/format-money";
import { BalanceCard } from "./balance-card";
import { SplitlyLogo } from "./logo";
import { discarded, mentaDark, mentaLight, type DesignTheme } from "./themes";

const tokenKeys = ["bg", "surface", "text", "muted", "border", "primary", "positive", "negative", "celebrate"] as const;

function ThemePanel({ theme, currency, compact = false }: { theme: DesignTheme; currency: Currency; compact?: boolean }) {
  const c = theme.colors;
  return (
    <section aria-labelledby={`theme-${theme.id}`} className="rounded-xl p-4 sm:p-6"
      style={{ backgroundColor: c.bg, color: c.text }}>
      <p className="text-[12px] font-medium" style={{ color: c.muted }}>
        {theme.status === "elegida" ? "Sistema elegido" : "Referencia descartada"}
      </p>
      <h2 id={`theme-${theme.id}`} className="mt-1 text-[20px] font-semibold">{theme.name}</h2>
      <p className="mt-1 text-[14px]" style={{ color: c.muted }}>{theme.tagline}</p>
      <div className="my-6"><SplitlyLogo top={c.logoTop} bottom={c.logoBottom} text={c.text} /></div>
      {!compact && (
        <ul className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label={`Tokens de ${theme.name}`}>
          {tokenKeys.map((k) => (
            <li key={k}>
              <span className="block h-10 rounded-lg border" style={{ backgroundColor: c[k], borderColor: c.border }} />
              <span className="mt-1 block text-[12px] font-medium">{k}</span>
              <span className="block text-[12px] uppercase tabular-nums" style={{ color: c.muted }}>{c[k]}</span>
            </li>
          ))}
        </ul>
      )}
      <BalanceCard theme={theme} currency={currency} />
    </section>
  );
}

export function DesignShowcase() {
  const [currency, setCurrency] = useState<Currency>("ARS");
  return (
    <>
      <div role="group" aria-label="Moneda de la demo" className="mb-8 inline-flex rounded-lg border border-zinc-300 p-1">
        {(["ARS", "USD"] as const).map((cur) => (
          <button key={cur} type="button" aria-pressed={currency === cur} onClick={() => setCurrency(cur)}
            className={`rounded-md px-4 py-1.5 text-[14px] font-medium ${currency === cur ? "bg-[#0F766E] text-white" : "text-zinc-700"}`}>
            {cur}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ThemePanel theme={mentaLight} currency={currency} />
        <ThemePanel theme={mentaDark} currency={currency} />
      </div>

      <h2 className="mb-4 mt-12 text-[20px] font-semibold">Lo que descartamos</h2>
      <div className="grid gap-6 opacity-90 lg:grid-cols-2">
        {discarded.map((t) => <ThemePanel key={t.id} theme={t} currency={currency} compact />)}
      </div>
    </>
  );
}
