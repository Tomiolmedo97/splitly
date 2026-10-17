"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  /** Mensaje de error. Se muestra con ícono y texto (nunca solo color) y marca el campo como inválido. */
  error?: string;
  /** Texto de ayuda opcional debajo del campo. */
  hint?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, id, type = "text", className, disabled, "aria-describedby": describedBy, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `${autoId}-input`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const describedByIds = [describedBy, hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds || undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-surface px-3 text-base text-text placeholder:text-muted",
            "outline-none transition-[border-color,box-shadow] duration-[120ms]",
            "disabled:cursor-not-allowed disabled:opacity-45",
            error
              ? "border-negative focus:ring-3 focus:ring-negative/20"
              : "border-border focus:border-primary focus:ring-3 focus:ring-primary/20",
            isPassword && "pr-11",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={disabled}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            aria-controls={inputId}
            className={cn(
              "absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted",
              "hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              "disabled:cursor-not-allowed",
            )}
          >
            {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-xs font-normal text-negative">
          <CircleAlert size={14} aria-hidden className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});
