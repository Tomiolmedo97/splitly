"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

/**
 * Botón de texto "Cerrar sesión" para usar dentro de `<form action={logoutForm}>`.
 * Mientras se envía muestra spinner + "Cerrando sesión…" (el ancho ya está reservado) y `aria-disabled` (sin `disabled`, conserva el foco),
 * igual que el resto de los botones.
 */
export function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="text" loading={pending} loadingText={copy.general.loggingOut} className="px-2">
      {copy.general.logout}
    </Button>
  );
}
