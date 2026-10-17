import type { ReactNode } from "react";
import { SplitlyLogo } from "@/components/design/logo";

/** Layout móvil primero de ingreso/registro: logo centrado, una sola h1 y el formulario. */
export function AuthScreen({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <SplitlyLogo
          top="var(--color-logo-top)"
          bottom="var(--color-logo-bottom)"
          text="var(--color-text)"
          size={48}
          showWordmark={false}
        />
        <h1 className="mt-4 text-[28px] font-semibold tracking-tight">{title}</h1>
        <p className="text-base text-muted">{subtitle}</p>
      </div>
      <div className="mt-6">{children}</div>
    </main>
  );
}
