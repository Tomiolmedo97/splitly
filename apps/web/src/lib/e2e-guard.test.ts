/**
 * Guarda de entorno de los e2e (e2e/guarda.ts): la usa playwright.config.ts para no
 * correr nunca contra producción. Ver docs/qa/e2e.md.
 */
import { describe, expect, it } from "vitest";
import { asegurarEntornoE2E, evaluarGuarda, normalizarHost } from "../../../../e2e/guarda";

const PROD = "https://splitly-iota.vercel.app";
const PREVIEW = "https://splitly-ht9vp5gyi-tomiolmedo97s-projects.vercel.app";

const motivo = (env: Record<string, string | undefined>) => {
  const r = evaluarGuarda(env);
  if (r.ok) throw new Error(`se esperaba rechazo y pasó en modo ${r.modo}`);
  return r.motivo;
};

describe("normalizarHost", () => {
  it("minúsculas, sin punto final, sin puerto y en punycode", () => {
    expect(normalizarHost("HTTPS://Splitly-IOTA.Vercel.App.:443/grupos")).toBe("splitly-iota.vercel.app");
    expect(normalizarHost("http://[::1]:3000")).toBe("::1");
    expect(normalizarHost("https://bücher.vercel.app")).toBe("xn--bcher-kva.vercel.app");
    expect(normalizarHost("https://ｓｐｌｉｔｌｙ-iota。vercel。app")).toBe("splitly-iota.vercel.app");
  });
  it("devuelve null para lo que no es una URL http(s)", () => {
    expect(normalizarHost("splitly-iota.vercel.app")).toBeNull();
    expect(normalizarHost("no es una url")).toBeNull();
    expect(normalizarHost("ftp://splitly-iota.vercel.app")).toBeNull();
    expect(normalizarHost("http://")).toBeNull();
  });
});

describe("guarda de e2e: producción", () => {
  it("rechaza el host de producción, con mensaje en castellano", () => {
    expect(motivo({ E2E_BASE_URL: PROD })).toMatch(/apunta a producción \(splitly-iota\.vercel\.app\)/);
    expect(() => asegurarEntornoE2E({ E2E_BASE_URL: PROD })).toThrow(/Guarda de e2e: .*nunca corren contra producción/);
  });
  it("rechaza producción con punto final, mayúsculas, puerto o en forma IDN", () => {
    for (const url of [
      "https://splitly-iota.vercel.app.",
      "https://SPLITLY-IOTA.VERCEL.APP",
      "https://splitly-iota.vercel.app:443",
      "https://Splitly-Iota.vercel.app.:8443/grupos?x=1",
      "https://ｓｐｌｉｔｌｙ-iota。vercel。app",
    ]) {
      expect(motivo({ E2E_BASE_URL: url }), url).toMatch(/producción/);
    }
  });
  it("rechaza los alias *.vercel.app de producción", () => {
    expect(motivo({ E2E_BASE_URL: "https://splitly-tomiolmedo97s-projects.vercel.app" })).toMatch(/producción/);
    expect(motivo({ E2E_BASE_URL: "https://splitly-git-main-tomiolmedo97s-projects.vercel.app" })).toMatch(/producción/);
  });
  it("producción no se habilita ni con E2E_ALLOW_REMOTE ni con E2E_READONLY", () => {
    expect(motivo({ E2E_BASE_URL: PROD, E2E_ALLOW_REMOTE: "1" })).toMatch(/producción/);
    expect(motivo({ E2E_BASE_URL: PROD, E2E_READONLY: "1" })).toMatch(/producción/);
  });
  it("rechaza VERCEL_ENV=production aunque la URL sea localhost", () => {
    expect(motivo({ VERCEL_ENV: "production" })).toMatch(/VERCEL_ENV=production/);
    expect(motivo({ VERCEL_ENV: "production", E2E_BASE_URL: "http://localhost:3000", E2E_ALLOW_REMOTE: "1" })).toMatch(
      /VERCEL_ENV=production/,
    );
  });
});

describe("guarda de e2e: local", () => {
  it("permite localhost (también por defecto, sin E2E_BASE_URL)", () => {
    expect(evaluarGuarda({})).toEqual({ ok: true, modo: "local", host: "localhost" });
    expect(evaluarGuarda({ E2E_BASE_URL: "http://localhost:3000" })).toMatchObject({ ok: true, modo: "local" });
    expect(evaluarGuarda({ E2E_BASE_URL: "http://LOCALHOST.:3000" })).toMatchObject({ ok: true, modo: "local" });
  });
  it("permite 127.0.0.1 y [::1]", () => {
    expect(evaluarGuarda({ E2E_BASE_URL: "http://127.0.0.1:3000" })).toMatchObject({ ok: true, modo: "local" });
    expect(evaluarGuarda({ E2E_BASE_URL: "http://[::1]:3000" })).toMatchObject({ ok: true, modo: "local", host: "::1" });
  });
  it("no se deja engañar por hosts que solo se parecen a localhost", () => {
    expect(motivo({ E2E_BASE_URL: "http://localhost.evil.com" })).toMatch(/host remoto/);
    expect(motivo({ E2E_BASE_URL: "http://localhost@splitly-iota.vercel.app" })).toMatch(/producción/);
  });
});

describe("guarda de e2e: preview y otros hosts remotos", () => {
  it("rechaza un preview sin opt-in", () => {
    expect(motivo({ E2E_BASE_URL: PREVIEW })).toMatch(/host remoto .*E2E_ALLOW_REMOTE=1/);
  });
  it("permite un preview con E2E_ALLOW_REMOTE=1", () => {
    expect(evaluarGuarda({ E2E_BASE_URL: PREVIEW, E2E_ALLOW_REMOTE: "1" })).toMatchObject({ ok: true, modo: "remoto" });
  });
  it("E2E_ALLOW_REMOTE distinto de 1/true no cuenta como opt-in", () => {
    expect(motivo({ E2E_BASE_URL: PREVIEW, E2E_ALLOW_REMOTE: "0" })).toMatch(/host remoto/);
    expect(motivo({ E2E_BASE_URL: PREVIEW, E2E_ALLOW_REMOTE: "" })).toMatch(/host remoto/);
  });
  it("con E2E_READONLY=1 permite un preview en modo solo lectura (@readonly)", () => {
    expect(evaluarGuarda({ E2E_BASE_URL: PREVIEW, E2E_READONLY: "1" })).toMatchObject({ ok: true, modo: "solo-lectura" });
  });
});

describe("guarda de e2e: URL inválida", () => {
  it("rechaza una URL que no se puede parsear", () => {
    expect(motivo({ E2E_BASE_URL: "no es una url" })).toMatch(/no es una URL http\(s\) válida/);
    expect(motivo({ E2E_BASE_URL: "splitly-iota.vercel.app" })).toMatch(/no es una URL http\(s\) válida/);
    expect(motivo({ E2E_BASE_URL: "javascript:alert(1)" })).toMatch(/no es una URL http\(s\) válida/);
  });
});
