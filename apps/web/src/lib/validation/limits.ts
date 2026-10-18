/**
 * Límites de cada campo, compartidos entre FE y BE. Sin dependencias (ni zod), para que
 * los formularios y los textos del cliente los importen sin sumar peso al bundle.
 */
export const LIMITS = {
  userName: 50,
  groupName: 60,
  memberName: 50,
  expenseDescription: 100,
  email: 254,
  passwordMin: 8,
  passwordMax: 128,
  /** Máximo de integrantes en la división de un gasto. */
  splitsMax: 50,
} as const;
