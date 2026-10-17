import { forwardRef, type ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "text";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Por defecto, "primary". */
  variant?: ButtonVariant;
  /** Reemplaza el label por un spinner de 16 px manteniendo el ancho. Deshabilita el botón. */
  loading?: boolean;
};

const base =
  "relative inline-flex h-12 items-center justify-center rounded-lg px-4 text-base font-medium select-none " +
  "transition-[background-color,color,transform] duration-[120ms] ease-out " +
  "enabled:active:scale-[0.98] motion-reduce:enabled:active:scale-100 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:cursor-not-allowed disabled:opacity-45 sm:h-10";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary enabled:hover:bg-[color-mix(in_srgb,var(--color-primary)_94%,black)]",
  secondary:
    "border border-border bg-surface text-text enabled:hover:bg-[color-mix(in_srgb,var(--color-surface)_94%,black)]",
  // Link: siempre `primary` (#0F766E en claro), nunca el teal del logo.
  text: "bg-transparent text-primary underline-offset-4 enabled:hover:text-[color-mix(in_srgb,var(--color-primary)_94%,black)] enabled:hover:underline",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, disabled, className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {/* El label sigue en el árbol de accesibilidad y define el ancho; solo se oculta visualmente. */}
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <LoaderCircle size={16} className="motion-safe:animate-spin" />
        </span>
      )}
    </button>
  );
});
