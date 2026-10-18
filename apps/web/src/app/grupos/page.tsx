import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { copy } from "@/lib/copy";
import { logoutForm } from "@/server/actions/auth-forms";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = { title: "Mis grupos · Splitly" };
/** Depende de la cookie de sesión: nunca se prerenderiza ni se cachea. */
export const dynamic = "force-dynamic";

/**
 * PROVISORIO: Mis grupos todavía sin grupos (llegan con los endpoints de grupos).
 * Por ahora: saludo, "Cerrar sesión" y el estado vacío de textos.md, sin el botón
 * "Crear mi primer grupo" porque /grupos/nuevo todavía no existe.
 */
export default async function GruposPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/ingresar");
  const nombre = user.name.trim() || user.email;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="min-w-0 text-[28px] font-semibold tracking-tight [overflow-wrap:anywhere]">
          {copy.myGroups.greeting.replace("{nombre}", nombre)}
        </h1>
        <form action={logoutForm} className="shrink-0">
          <LogoutButton />
        </form>
      </header>

      <section
        aria-labelledby="grupos-vacio"
        className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center"
      >
        <Users size={40} strokeWidth={1.5} aria-hidden className="text-muted" />
        <h2 id="grupos-vacio" className="text-xl font-semibold">
          {copy.myGroups.emptyTitle}
        </h2>
        <p className="max-w-xs text-base text-muted">{copy.myGroups.emptyText}</p>
      </section>
    </main>
  );
}
