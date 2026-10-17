/**
 * Verifica que los mocks de docs/api/mocks respeten docs/api/openapi.yaml, así el FE
 * puede programar contra ellos con confianza.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

const API_DIR = join(__dirname, "../../../../docs/api");

type Operation = { responses: Record<string, { content?: Record<string, { schema: unknown }> }> };
type OpenApi = { paths: Record<string, Record<string, Operation & { "x-sprint"?: number }>> };
type MockEntry = { file: string | null; method: string; path: string; status: number };

const spec = parse(readFileSync(join(API_DIR, "openapi.yaml"), "utf8")) as OpenApi & Record<string, unknown>;
const { mocks } = JSON.parse(readFileSync(join(API_DIR, "mocks/index.json"), "utf8")) as { mocks: MockEntry[] };

const ajv = new Ajv2020({ strict: false, allErrors: true });
ajv.addFormat("date", /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
ajv.addFormat("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
ajv.addSchema(spec, "openapi");

/** Resuelve $ref de un nivel de components/responses. */
function responseSchema(op: Operation, status: number): unknown {
  let res = op.responses[String(status)] as { $ref?: string; content?: Record<string, { schema: unknown }> };
  if (res?.$ref) {
    const name = res.$ref.split("/").pop()!;
    res = (spec.components as { responses: Record<string, typeof res> }).responses[name]!;
  }
  return res?.content?.["application/json"]?.schema;
}

const METHODS = ["get", "post", "patch", "put", "delete"];

describe("contrato OpenAPI", () => {
  it.each(mocks.filter((m) => m.file !== null))("$file cumple el esquema de $method $path → $status", (m) => {
    const op = spec.paths[m.path]?.[m.method.toLowerCase()];
    expect(op, `no existe ${m.method} ${m.path} en el contrato`).toBeDefined();
    const schema = responseSchema(op!, m.status);
    expect(schema, `no hay esquema JSON para ${m.status}`).toBeDefined();
    // Los $ref locales ("#/components/...") apuntan al documento registrado como "openapi".
    const resolved = JSON.parse(JSON.stringify(schema).replaceAll('"#/components/', '"openapi#/components/'));
    const validate = ajv.compile(resolved);
    const body = JSON.parse(readFileSync(join(API_DIR, "mocks", m.file!), "utf8"));
    expect(validate(body), JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("cada endpoint de Sprint 1 tiene al menos un mock de respuesta exitosa", () => {
    const missing: string[] = [];
    for (const [path, item] of Object.entries(spec.paths)) {
      for (const method of METHODS) {
        const op = item[method];
        if (!op || op["x-sprint"] === 2) continue;
        // Endpoints propios de Auth.js que responden con redirecciones.
        if (["/api/auth/csrf", "/api/auth/callback/credentials", "/api/auth/signout"].includes(path)) continue;
        const has = mocks.some((m) => m.path === path && m.method.toLowerCase() === method && m.status < 300);
        if (!has) missing.push(`${method.toUpperCase()} ${path}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("los saldos de cada mock suman 0", () => {
    for (const m of mocks.filter((x) => x.file !== null)) {
      const text = readFileSync(join(API_DIR, "mocks", m.file!), "utf8");
      const body = JSON.parse(text) as Record<string, unknown>;
      const snapshots: { balanceCents: number }[][] = [];
      const collect = (v: unknown): void => {
        if (Array.isArray(v)) {
          if (v.length > 0 && v.every((x) => typeof x === "object" && x !== null && "balanceCents" in x)) {
            snapshots.push(v as { balanceCents: number }[]);
          } else v.forEach(collect);
        } else if (typeof v === "object" && v !== null) Object.values(v).forEach(collect);
      };
      collect(body);
      for (const s of snapshots) expect(s.reduce((a, b) => a + b.balanceCents, 0), m.file!).toBe(0);
    }
  });

  it("incluye un integrante invitado (userId null) y la moneda por defecto es ARS", () => {
    const members = JSON.parse(readFileSync(join(API_DIR, "mocks/members.list.200.json"), "utf8")) as {
      members: { userId: string | null }[];
    };
    expect(members.members.some((m) => m.userId === null)).toBe(true);
    const created = JSON.parse(readFileSync(join(API_DIR, "mocks/groups.create.201.json"), "utf8"));
    expect(created.group.currency).toBe("ARS");
  });
});
