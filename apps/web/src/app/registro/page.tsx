import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";
import { copy } from "@/lib/copy";
import { registerForm } from "@/server/actions/auth-forms";

export const metadata: Metadata = { title: "Crear cuenta · Splitly" };

export default function RegistroPage() {
  return (
    <AuthScreen title={copy.register.title} subtitle={copy.register.subtitle}>
      <AuthForm mode="register" action={registerForm} />
    </AuthScreen>
  );
}
