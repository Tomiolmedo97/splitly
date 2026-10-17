"use client";

import { useState, type ReactNode } from "react";
import type { Currency } from "@/lib/format-money";
import { cn } from "@/lib/cn";
import { BalanceCard } from "@/components/ui/balance-card";
import { Button } from "@/components/ui/button";
import { MemberList, MemberRow } from "@/components/ui/member-row";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TextField } from "@/components/ui/text-field";
import { GroupDemo } from "./group-demo";
import { SplitlyLogo } from "./logo";
import { mentaDark, mentaLight } from "./themes";

const tokenKeys = ["bg", "surface", "text", "muted", "border", "primary", "positive", "negative", "celebrate"] as const;

type Mode = "claro" | "oscuro";

const modeOptions = [
  { value: "claro", label: "Claro" },
  { value: "oscuro", label: "Oscuro" },
] as const;
const currencyOptions = [
  { value: "ARS", label: "ARS" },
  { value: "USD", label: "USD" },
] as const;

/** Jerarquía de encabezados: una sola h1 por pantalla, secciones en h2 y subsecciones en h3. Nunca saltar niveles. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 first:mt-0">
      <h3 className="mb-3 text-sm font-medium text-muted">{title}</h3>
      {children}
    </div>
  );
}

export function DesignShowcase() {
  const [mode, setMode] = useState<Mode>("claro");
  const [currency, setCurrency] = useState<Currency>("ARS");
  const [split, setSplit] = useState<"iguales" | "montos" | "porcentajes">("iguales");
  const theme = mode === "claro" ? mentaLight : mentaDark;
  const c = theme.colors;

  return (
    <div
      className={cn("min-h-screen bg-bg text-text transition-colors duration-300", theme.dark && "dark")}
      data-theme={theme.dark ? "dark" : "light"}
    >
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <SplitlyLogo top={c.logoTop} bottom={c.logoBottom} text={c.text} />
        <h1 className="mt-8 text-[28px] font-semibold tracking-tight">Así se va a ver Splitly</h1>
        <p className="mt-2 text-base text-muted">
          Diseño Menta fresca con tipografía Geist. Tocá &quot;Simular&quot; para ver los números contando, las deudas
          que se reacomodan y el confeti cuando alguien queda al día.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <SegmentedControl label="Modo de color" options={modeOptions} value={mode} onChange={setMode} />
          <SegmentedControl label="Moneda" options={currencyOptions} value={currency} onChange={setCurrency} />
        </div>

        <Section id="demo" title="Demo: saldar una deuda">
          <GroupDemo key={theme.id} currency={currency} />
        </Section>

        <Section id="componentes" title="Componentes base">
          <Subsection title="Tarjeta de saldo">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
              <BalanceCard label="Tu saldo en Bariloche" cents={450000} currency={currency} />
              <BalanceCard label="Tu saldo en el depto" cents={-150000} currency={currency} />
              <BalanceCard label="Tu saldo en el cumple" cents={0} currency={currency} />
              <BalanceCard label="Grilla con monto largo" cents={99999999999} currency="USD" />
            </div>
          </Subsection>

          <Subsection title="Montos largos">
            <div className="flex flex-col gap-3">
              <BalanceCard label="Resumen con monto largo" cents={99999999999} currency="USD" variant="summary" />
              <MemberList label="Fila con monto largo" className="rounded-xl border border-border bg-surface dark:border-transparent">
                <MemberRow name="Sofi" cents={99999999999} currency="USD" withoutAccount detail="Invitada por Ana" />
              </MemberList>
            </div>
          </Subsection>

          <Subsection title="Fila de persona">
            <MemberList label="Ejemplo de miembros" className="rounded-xl border border-border bg-surface dark:border-transparent">
              <MemberRow name="Ana López" cents={450000} currency={currency} detail="Pagó el alojamiento" />
              <MemberRow name="Juan Pérez" cents={0} currency={currency} detail="Está al día" />
              <MemberRow name="Sofi" cents={-300000} currency={currency} withoutAccount detail="Invitada por Ana" />
            </MemberList>
          </Subsection>

          <Subsection title="Botones">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Agregar gasto</Button>
              <Button variant="secondary">Cancelar</Button>
              <Button variant="text">Ver detalle</Button>
              <Button disabled>Deshabilitado</Button>
              <Button loading>Guardando</Button>
            </div>
          </Subsection>

          <Subsection title="Campos de texto">
            <div className="flex flex-col gap-4">
              <TextField label="Descripción" placeholder="Ej.: Cena del sábado" />
              <TextField label="Email" type="email" defaultValue="ana@" error="Ingresá un email válido." />
              <TextField label="Contraseña" type="password" defaultValue="secreto123" autoComplete="off" />
            </div>
          </Subsection>

          <Subsection title="Control segmentado">
            <SegmentedControl
              label="Cómo dividir"
              options={[
                { value: "iguales", label: "Iguales" },
                { value: "montos", label: "Montos" },
                { value: "porcentajes", label: "%" },
              ]}
              value={split}
              onChange={setSplit}
            />
          </Subsection>
        </Section>

        <details className="mt-12">
          <summary className="cursor-pointer text-sm font-medium text-muted">Ver colores del sistema</summary>
          <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5" aria-label="Colores del sistema">
            {tokenKeys.map((k) => (
              <li key={k}>
                <span className="block h-10 rounded-lg border border-border" style={{ backgroundColor: `var(--color-${k})` }} />
                <span className="mt-1 block text-xs font-medium">{k}</span>
                <span className="block text-xs uppercase tabular-nums text-muted">{c[k]}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
