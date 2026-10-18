import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";
import { copy } from "@/lib/copy";
import { loginForm } from "@/server/actions/auth-forms";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = { title: "Ingresar · Splitly" };

/** Con sesión no tiene sentido ingresar de nuevo: va a Mis grupos. Lee la cookie, así que es dinámica. */
export default async function IngresarPage() {
  if (await getCurrentUser()) redirect("/grupos");
  return (
    <AuthScreen title={copy.login.title} subtitle={copy.login.subtitle}>
      <AuthForm mode="login" action={loginForm} />
    </AuthScreen>
  );
}
