import { describe, expect, it } from "vitest";
import { canMigratePreview, canSeed } from "../../scripts/db-guard.mjs";

const PROD = "ep-prod-123.sa-east-1.aws.neon.tech";
const prodUrls = {
  DATABASE_URL: `postgresql://u:p@ep-prod-123-pooler.sa-east-1.aws.neon.tech/splitly`,
  DATABASE_URL_UNPOOLED: `postgresql://u:p@${PROD}/splitly`,
};
const branchUrls = {
  DATABASE_URL: "postgresql://u:p@ep-branch-9-pooler.sa-east-1.aws.neon.tech/splitly",
  DATABASE_URL_UNPOOLED: "postgresql://u:p@ep-branch-9.sa-east-1.aws.neon.tech/splitly",
};
const local = { DATABASE_URL: "postgresql://u:p@localhost:5432/splitly" };

describe("guarda del seed", () => {
  it("corre contra localhost (local y CI), aunque falte VERCEL_ENV", () => {
    expect(canSeed({ ...local })).toBe(true);
    expect(canSeed({ ...local, NODE_ENV: "production" })).toBe(true);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@127.0.0.1/splitly" })).toBe(true);
  });
  it("corre en un preview con su propia rama de Neon", () => {
    expect(canSeed({ VERCEL_ENV: "preview", PROD_DB_HOST: PROD, ...branchUrls })).toBe(true);
  });
  it("se niega sin VERCEL_ENV si la base no es local (vercel env pull + db:seed)", () => {
    expect(canSeed({ ...prodUrls })).toBe(false);
    expect(canSeed({ ...branchUrls, NODE_ENV: "development" })).toBe(false);
    expect(canSeed({})).toBe(false);
  });
  it("nunca corre en producción ni en development de Vercel", () => {
    expect(canSeed({ VERCEL_ENV: "production", ...local })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "production", PROD_DB_HOST: PROD, ...branchUrls })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "development", PROD_DB_HOST: PROD, ...branchUrls })).toBe(false);
  });
  it("en preview se niega si las URLs son las de producción o falta PROD_DB_HOST", () => {
    expect(canSeed({ VERCEL_ENV: "preview", PROD_DB_HOST: PROD, ...prodUrls })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "preview", ...branchUrls })).toBe(false);
  });
});

describe("guarda de la migración de preview", () => {
  it("migra la rama propia del preview", () => {
    expect(canMigratePreview({ PROD_DB_HOST: PROD, ...branchUrls })).toBe(true);
  });
  it("no migra si alguna URL es la de producción, con o sin -pooler", () => {
    expect(canMigratePreview({ PROD_DB_HOST: PROD, ...prodUrls })).toBe(false);
    expect(canMigratePreview({ PROD_DB_HOST: "ep-prod-123-pooler.sa-east-1.aws.neon.tech", ...prodUrls })).toBe(false);
    expect(
      canMigratePreview({ PROD_DB_HOST: PROD, DATABASE_URL: branchUrls.DATABASE_URL, DATABASE_URL_UNPOOLED: prodUrls.DATABASE_URL_UNPOOLED }),
    ).toBe(false);
    expect(canMigratePreview({ PROD_DB_HOST: PROD.toUpperCase(), ...prodUrls })).toBe(false);
  });
  it("no migra si falta PROD_DB_HOST o una URL no se puede leer", () => {
    expect(canMigratePreview({ ...branchUrls })).toBe(false);
    expect(canMigratePreview({ PROD_DB_HOST: PROD, DATABASE_URL: "no-es-una-url", DATABASE_URL_UNPOOLED: branchUrls.DATABASE_URL_UNPOOLED })).toBe(false);
  });
});
