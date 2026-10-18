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
  it("corre contra localhost, 127.0.0.1 y ::1, aunque falte VERCEL_ENV", () => {
    expect(canSeed({ ...local })).toBe(true);
    expect(canSeed({ ...local, NODE_ENV: "production" })).toBe(true);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@127.0.0.1/splitly" })).toBe(true);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@[::1]:5432/splitly" })).toBe(true);
    expect(canSeed({ ...local, DATABASE_URL_UNPOOLED: local.DATABASE_URL })).toBe(true);
  });
  it("se niega sin VERCEL_ENV si la base no es local (vercel env pull + db:seed)", () => {
    expect(canSeed({ ...prodUrls })).toBe(false);
    expect(canSeed({ ...branchUrls, NODE_ENV: "development" })).toBe(false);
    expect(canSeed({})).toBe(false);
    expect(canSeed({ DATABASE_URL: "no-es-una-url" })).toBe(false);
  });
  it("no se deja engañar por URLs tramposas", () => {
    expect(canSeed({ DATABASE_URL: "postgres://u:p@db.neon.tech/x?host=localhost" })).toBe(false);
    expect(canSeed({ DATABASE_URL: "postgres://u:p@localhost.evil.com/x" })).toBe(false);
    expect(canSeed({ DATABASE_URL: "postgres://localhost:p@db.neon.tech/x" })).toBe(false);
    expect(canSeed({ ...local, DATABASE_URL_UNPOOLED: prodUrls.DATABASE_URL_UNPOOLED })).toBe(false);
  });
  it("se niega si un parámetro cambia el host al que se conecta Prisma (F)", () => {
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@localhost:5432/db?host=10.255.255.1" })).toBe(false);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@localhost:5432/db?HOST=10.255.255.1" })).toBe(false);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@localhost:5432/db?hostaddr=10.255.255.1" })).toBe(false);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@localhost:5432/db?options=endpoint%3Dep-prod-123" })).toBe(false);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@localhost:5432/db?sslmode=disable&host=localhost" })).toBe(false);
    expect(canSeed({ DATABASE_URL: "postgresql://u:p@localhost:5432/db?sslmode=disable" })).toBe(true);
  });
  it("nunca corre con VERCEL_ENV definido, aunque la base sea local (G)", () => {
    expect(canSeed({ VERCEL_ENV: "production", ...local })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "development", ...local })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "preview", ...local })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "", ...local })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "preview", PROD_DB_HOST: PROD, ...branchUrls })).toBe(false);
    expect(canSeed({ VERCEL_ENV: "preview", ...prodUrls })).toBe(false);
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
  it("no migra si un parámetro manda la conexión a otro host o endpoint (F)", () => {
    const b = branchUrls.DATABASE_URL_UNPOOLED;
    expect(canMigratePreview({ PROD_DB_HOST: PROD, ...branchUrls, DATABASE_URL_UNPOOLED: `${b}?host=${PROD}` })).toBe(false);
    expect(canMigratePreview({ PROD_DB_HOST: PROD, ...branchUrls, DATABASE_URL_UNPOOLED: `${b}?hostaddr=10.0.0.1` })).toBe(false);
    expect(canMigratePreview({ PROD_DB_HOST: PROD, ...branchUrls, DATABASE_URL: `${branchUrls.DATABASE_URL}?options=endpoint%3Dep-prod-123` })).toBe(false);
    expect(canMigratePreview({ PROD_DB_HOST: PROD, ...branchUrls, DATABASE_URL_UNPOOLED: `${b}?sslmode=require` })).toBe(true);
  });
  it("no migra si falta PROD_DB_HOST o una URL no se puede leer", () => {
    expect(canMigratePreview({ ...branchUrls })).toBe(false);
    expect(canMigratePreview({ PROD_DB_HOST: PROD, DATABASE_URL: "no-es-una-url", DATABASE_URL_UNPOOLED: branchUrls.DATABASE_URL_UNPOOLED })).toBe(false);
  });
});
