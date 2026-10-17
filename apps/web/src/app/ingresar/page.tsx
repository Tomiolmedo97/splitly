import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthScreen } from "@/components/auth/auth-screen";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: "Ingresar · Splitly" };

export default function IngresarPage() {
  return (
    <AuthScreen title={copy.login.title} subtitle={copy.login.subtitle}>
      <AuthForm mode="login" />
    </AuthScreen>
  );
}
