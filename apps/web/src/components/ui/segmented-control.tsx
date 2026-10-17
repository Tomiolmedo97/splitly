"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { segmentedNextIndex } from "./segmented-keys";

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = {
  /** Nombre accesible del grupo. */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/**
 * Control segmentado con semántica de radiogroup: una sola parada de Tab
 * (tabindex itinerante) y flechas/Home/End para moverse; la selección sigue al foco.
 */
export function SegmentedControl<T extends string>({ label, options, value, onChange, className }: SegmentedControlProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const found = options.findIndex((o) => o.value === value);
  const selected = found === -1 ? 0 : found;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = segmentedNextIndex(event.key, index, options.length);
    if (next === null) return;
    event.preventDefault();
    const option = options[next];
    if (!option) return;
    refs.current[next]?.focus();
    if (option.value !== value) onChange(option.value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "relative inline-grid auto-cols-fr grid-flow-col rounded-lg bg-[color-mix(in_srgb,var(--color-border)_40%,transparent)] p-1",
        className,
      )}
    >
      {/* Indicador que se desliza 200 ms hasta la opción elegida. */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 rounded-md bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out"
        style={{
          width: `calc((100% - 0.5rem) / ${Math.max(options.length, 1)})`,
          transform: `translateX(${selected * 100}%)`,
        }}
      />
      {options.map((option, index) => {
        const checked = index === selected;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "relative z-10 h-9 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              checked ? "text-text" : "text-muted hover:text-text",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
