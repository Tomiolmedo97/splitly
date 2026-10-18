import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("/", () => {
  it("redirige a /ingresar del lado del servidor", () => {
    let digest = "";
    try {
      HomePage();
    } catch (error) {
      digest = String((error as { digest?: string }).digest ?? "");
    }
    expect(digest).toContain("NEXT_REDIRECT");
    expect(digest).toContain("/ingresar");
  });
});

describe("icon.svg", () => {
  const svg = readFileSync(fileURLToPath(new URL("./icon.svg", import.meta.url)), "utf8");

  it("usa los colores del logo en claro y cambia en oscuro con prefers-color-scheme", () => {
    const [light, dark] = svg.split("@media (prefers-color-scheme: dark)");
    expect(light).toContain("#12312B");
    expect(light).toContain("#0D9488");
    expect(dark).toContain("#ECF5F2");
    expect(dark).toContain("#2DD4BF");
  });

  it("fondo transparente (sin rect de fondo)", () => {
    expect(svg).not.toMatch(/<rect/);
  });
});
