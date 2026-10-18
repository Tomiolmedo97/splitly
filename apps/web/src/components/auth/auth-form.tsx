"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { copy } from "@/lib/copy";
import {
  authFieldsByMode,
  createStubAuthAction,
  focusTargetAfterSubmit,
  initialAuthState,
  type AuthMode,
} from "@/lib/auth-action";
import { errorText } from "@/lib/error-copy";
import { fieldErrorCopy, PASSWORD_MIN_LENGTH, type AuthField } from "@/lib/auth-validation";

const linkClass =
  "font-medium text-primary underline-offset-4 hover:underline rounded-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * Formulario visual de ingreso/registro con useActionState. Por ahora usa una acción stub
 * (valida y no guarda nada): al enviar muestra un aviso de "próximamente" que no bloquea el formulario.
 */
export function AuthForm({ mode }: { mode: AuthMode }) {
  const fields = authFieldsByMode[mode];
  const action = useMemo(() => createStubAuthAction(mode), [mode]);
  const [state, formAction, isPending] = useActionState(action, initialAuthState);
  // Campos editados desde el último envío: su error se oculta hasta el próximo envío.
  const [edited, setEdited] = useState<Partial<Record<AuthField, boolean>>>({});
  const refs = useRef<Partial<Record<AuthField, HTMLInputElement | null>>>({});
  const t = mode === "login" ? copy.login : copy.register;

  // Cada acción devuelve un estado nuevo: después de un envío fallido, foco al primer campo con error
  // o, si el error es del formulario (p. ej. INVALID_CREDENTIALS), a la contraseña. Sin autoFocus.
  useEffect(() => {
    setEdited({});
    const target = focusTargetAfterSubmit(state, fields);
    if (target) refs.current[target]?.focus();
  }, [state, fields]);

  const errorFor = (field: AuthField) => {
    const code = state.fieldErrors[field];
    return code && !edited[field] ? fieldErrorCopy[code] : undefined;
  };
  const markEdited = (field: AuthField) => {
    if (state.fieldErrors[field] && !edited[field]) setEdited((e) => ({ ...e, [field]: true }));
  };
  const bindRef = (field: AuthField) => (el: HTMLInputElement | null) => {
    refs.current[field] = el;
  };

  return (
    <form
      noValidate
      action={formAction}
      // Segundo envío bloqueado mientras isPending (el botón queda enfocable, sin `disabled`).
      onSubmit={(event) => {
        if (isPending) event.preventDefault();
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
        {mode === "register" && (
          <TextField
            ref={bindRef("name")}
            name="name"
            label={copy.register.nameLabel}
            placeholder={copy.register.namePlaceholder}
            autoComplete="name"
            required
            defaultValue={state.values.name}
            error={errorFor("name")}
            onChange={() => markEdited("name")}
          />
        )}
        <TextField
          ref={bindRef("email")}
          name="email"
          type="email"
          inputMode="email"
          label={t.emailLabel}
          placeholder={copy.login.emailPlaceholder}
          autoComplete="email"
          required
          defaultValue={state.values.email}
          error={errorFor("email")}
          onChange={() => markEdited("email")}
        />
        <TextField
          ref={bindRef("password")}
          name="password"
          type="password"
          label={t.passwordLabel}
          hint={mode === "register" ? copy.register.passwordHint : undefined}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={PASSWORD_MIN_LENGTH}
          required
          error={errorFor("password")}
          onChange={() => markEdited("password")}
        />
      </div>

      {state.status === "error" && state.formError && (
        <p role="alert" className="flex items-start gap-2 text-sm text-negative">
          <CircleAlert size={16} aria-hidden className="mt-0.5 shrink-0" />
          {errorText({ code: state.formError })}
        </p>
      )}

      <Button type="submit" className="w-full sm:h-12" loading={isPending} loadingText={t.submitting}>
        {t.submit}
      </Button>

      <div role="status" aria-live="polite">
        {state.status === "coming-soon" && !isPending && (
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
