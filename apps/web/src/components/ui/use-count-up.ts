"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

export const COUNT_UP_MS = 600;

/**
 * Anima un monto entero (centavos) desde el valor anterior hasta `target`
 * en 600 ms ease-out. Con `enabled = false` o `prefers-reduced-motion`, el cambio es directo.
 * El primer render muestra el valor final (no cuenta desde cero al montar).
 */
export function useCountUp(target: number, enabled: boolean): number {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (!enabled || reduce || current.current === target) {
      current.current = target;
      setValue(target);
      return;
    }
    const controls = animate(current.current, target, {
      duration: COUNT_UP_MS / 1000,
      ease: "easeOut",
      onUpdate: (v) => {
        current.current = v;
        setValue(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [target, enabled, reduce]);

  return value;
}
