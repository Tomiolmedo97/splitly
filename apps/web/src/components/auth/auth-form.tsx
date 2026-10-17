"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { copy } from "@/lib/copy";
import { validateAuth, type AuthField, type AuthFieldErrors, type AuthValues } from "@/lib/auth-validation";

type Mode = "login" | "register";

const fieldsByMode: Record<Mode, readonly AuthField[]> = {
  login: ["email", "password"],
  register: ["name", "email", "password"],
};

const linkClass =
  "font-medium text-primary underline-offset-4 hover:underline rounded-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * Formulario visual de ingreso/registro. Valida solo en el cliente y todavía no guarda nada:
 * al enviar muestra un aviso de "próximamente" que no bloquea el formulario.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const fields = fieldsByMode[mode];
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [notice, setNotice] = useState(false);
  const refs = useRef<Partial<Record<AuthField, HTMLInputElement | null>>>({});
  const t = mode === "login" ? copy.login : copy.register;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values: AuthValues = Object.fromEntries(fields.map((f) => [f, String(data.get(f) ?? "")]));
    const next = validateAuth(values);
    setErrors(next);
    const firstInvalid = fields.find((f) => next[f]);
    if (firstInvalid) {
      setNotice(false);
      refs.current[firstInvalid]?.focus();
      return;
    }
    setNotice(true);
  };

  const clearError = (field: AuthField) => {
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {mode === "register" && (
          <TextField
            ref={(el) => {
              refs.current.name = el;
            }}
            name="name"
            label={copy.register.nameLabel}
            placeholder={copy.register.namePlaceholder}
            autoComplete="name"
            required
            error={errors.name}
            onChange={() => clearError("name")}
          />
        )}
        <TextField
          ref={(el) => {
            refs.current.email = el;
          }}
          name="email"
          type="email"
          inputMode="email"
          label={t.emailLabel}
          placeholder={copy.login.emailPlaceholder}
          autoComplete="email"
          required
          error={errors.email}
          onChange={() => clearError("email")}
        />
        <TextField
          ref={(el) => {
            refs.current.password = el;
          }}
          name="password"
          type="password"
          label={t.passwordLabel}
          hint={mode === "register" ? copy.register.passwordHint : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          required
          error={errors.password}
          onChange={() => clearError("password")}
        />
      </div>

      <Button type="submit" className="w-full sm:h-12">
        {t.submit}
      </Button>

      <div role="status" aria-live="polite">
        {notice && (
          <p className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-text">
            <Info size={16} aria-hidden className="mt-0.5 shrink-0 text-primary" />
            {copy.general.comingSoon}
          </p>
        )}
      </div>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            {copy.login.toRegisterPrompt}{" "}
            <Link href="/registro" className={linkClass}>
              {copy.login.toRegisterLink}
            </Link>
          </>
        ) : (
          <>
            {copy.register.toLoginPrompt}{" "}
            <Link href="/ingresar" className={linkClass}>
              {copy.register.toLoginLink}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
