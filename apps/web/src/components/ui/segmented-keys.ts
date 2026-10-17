/**
 * Índice al que se mueve el foco (y la selección) en un radiogroup según la tecla.
 * Flechas con vuelta circular, Home/End a los extremos. `null` si la tecla no aplica.
 */
export function segmentedNextIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
