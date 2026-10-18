/**
 * Completitud de CODIGOS_DE_ERROR (./contrato.ts) contra el union ActionErrorCode
 * de ../actions/contracts.ts. Si BE agrega o saca un código, este test (y el
 * typecheck) fallan hasta que se actualice la lista de QA.
 *
 * ActionErrorCode es solo un tipo (no hay un array const exportado), así que:
 * - Nivel de tipos: no falta ni sobra ningún código (Exclude en las dos direcciones).
 * - Runtime: un Record<ActionErrorCode, true> obliga a escribir cada código una vez
 *   (TS rechaza claves faltantes y de más en el literal) y se compara con la lista.
 */
import { describe, expect, expectTypeOf, it } from "vitest";
import type { ActionErrorCode } from "../actions/contracts";
import { CODIGOS_DE_ERROR } from "./contrato";

type CodigoDeQa = (typeof CODIGOS_DE_ERROR)[number];
type Faltantes = Exclude<ActionErrorCode, CodigoDeQa>;
type Sobrantes = Exclude<CodigoDeQa, ActionErrorCode>;

// Falla el typecheck si falta o sobra un código (el error nombra cuál).
const sinFaltantes: [Faltantes] extends [never] ? true : Faltantes = true;
const sinSobrantes: [Sobrantes] extends [never] ? true : Sobrantes = true;

const TODOS_LOS_CODIGOS: Record<ActionErrorCode, true> = {
  VALIDATION_ERROR: true,
  EMAIL_TAKEN: true,
  INVALID_CREDENTIALS: true,
  PASSWORD_TOO_SHORT: true,
  RATE_LIMITED: true,
  UNAUTHENTICATED: true,
  FORBIDDEN: true,
  NOT_FOUND: true,
  MEMBER_DUPLICATE: true,
  MEMBER_HAS_BALANCE: true,
  CURRENCY_LOCKED: true,
  INTERNAL: true,
};

describe("CODIGOS_DE_ERROR = ActionErrorCode completo", () => {
  it("a nivel de tipos no falta ni sobra ningún código", () => {
    expectTypeOf<Faltantes>().toBeNever();
    expectTypeOf<Sobrantes>().toBeNever();
    expect(sinFaltantes && sinSobrantes).toBe(true);
  });

  it("en runtime tiene los mismos códigos, sin repetidos", () => {
    expect(new Set(CODIGOS_DE_ERROR).size).toBe(CODIGOS_DE_ERROR.length);
    expect(CODIGOS_DE_ERROR.length).toBe(Object.keys(TODOS_LOS_CODIGOS).length);
    expect([...CODIGOS_DE_ERROR].sort()).toEqual(Object.keys(TODOS_LOS_CODIGOS).sort());
  });
});
