import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";
import { copy } from "@/lib/copy";
import { registerForm } from "@/server/actions/auth-forms";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = { title: "Crear cuenta · Splitly" };

/** Con sesión no tiene sentido ingresar de nuevo: va a Mis grupos. Lee la cookie, así que es dinámica. */
export default async function RegistroPage() {
  if (await getCurrentUser()) redirect("/grupos");
  return (
    <AuthScreen title={copy.register.title} subtitle={copy.register.subtitle}>
      <AuthForm mode="register" action={registerForm} />
    </AuthScreen>
  );
}
