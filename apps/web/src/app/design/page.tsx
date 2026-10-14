import type { Metadata } from "next";
import { DesignShowcase } from "@/components/design/design-showcase";

export const metadata: Metadata = {
  title: "Propuestas de diseño · Splitly",
  robots: { index: false, follow: false },
};

export default function DesignPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tres caminos para Splitly</h1>
        <p className="mt-2 text-zinc-600">
          Cada propuesta muestra su paleta, el logo y una tarjeta de balance real. Tocá &quot;Simular&quot; para ver los
          números animados, las deudas que se reacomodan y el confeti cuando alguien queda al día.
        </p>
      </header>
      <DesignShowcase />
    </main>
  );
}
