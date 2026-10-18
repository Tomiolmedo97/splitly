import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type MouseEventHandler } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "text";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Por defecto, "primary". */
  variant?: ButtonVariant;
  /**
   * Reemplaza el label por un spinner de 16 px manteniendo el ancho. No usa `disabled` (el botón
   * conserva el foco): marca `aria-disabled="true"` y bloquea clics y envíos mientras dura.
   */
  loading?: boolean;
  /**
   * Texto visible mientras `loading` (p. ej. "Ingresando…"), con el spinner delante.
   * El botón reserva el ancho del más largo de los dos textos, así no salta entre reposo y carga.
   */
  loadingText?: string;
};

const base =
  "relative inline-flex h-12 items-center justify-center rounded-lg px-4 text-base font-medium select-none " +
  "transition-[background-color,color,transform] duration-[120ms] ease-out " +
  "enabled:not-aria-disabled:active:scale-[0.98] motion-reduce:enabled:active:scale-100 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:cursor-not-allowed disabled:opacity-45 sm:h-10 " +
  // Cargando: primario al 100 % (sin opacidad), enfocable, con cursor de progreso.
  "aria-disabled:cursor-progress";

/**
 * Mientras `loading`, cancela el clic (y con eso el envío del formulario, también el implícito con Enter)
 * sin llamar al `onClick` del consumidor. Exportado para testearlo.
 */
export function guardLoadingClick(
  loading: boolean,
  onClick?: MouseEventHandler<HTMLButtonElement>,
): MouseEventHandler<HTMLButtonElement> {
  return (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary enabled:not-aria-disabled:hover:bg-[color-mix(in_srgb,var(--color-primary)_94%,black)]",
  secondary:
    "border border-border bg-surface text-text enabled:not-aria-disabled:hover:bg-[color-mix(in_srgb,var(--color-surface)_94%,black)] " +
    "dark:enabled:not-aria-disabled:hover:bg-[color-mix(in_srgb,var(--color-surface)_94%,white)]",
  // Link: siempre `primary` (#0F766E en claro), nunca el teal del logo.
  text: "bg-transparent text-primary underline-offset-4 enabled:not-aria-disabled:hover:text-[color-mix(in_srgb,var(--color-primary)_94%,black)] enabled:not-aria-disabled:hover:underline",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, loadingText, disabled, className, children, type = "button", onClick, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], className)}
      {...props}
      onClick={guardLoadingClick(loading, onClick)}
    >
      {/* Una sola celda de grilla: el texto visible y, invisible debajo, el del otro estado (ancho mínimo estable). */}
      <span className="grid">
        <span className="col-start-1 row-start-1 inline-flex items-center justify-center gap-2">
          {loading && <LoaderCircle size={16} aria-hidden className="shrink-0 motion-safe:animate-spin" />}
          {loading && loadingText ? loadingText : children}
        </span>
        {loadingText && (
          <span aria-hidden className="invisible col-start-1 row-start-1 inline-flex items-center justify-center gap-2">
            {loading ? (
              children
            ) : (
              <>
                <LoaderCircle size={16} className="shrink-0" />
                {loadingText}
              </>
            )}
          </span>
        )}
      </span>
    </button>
  );
});
