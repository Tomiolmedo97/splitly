import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

const getCurrentUser = vi.fn();
vi.mock("@/server/session", () => ({ getCurrentUser: () => getCurrentUser() }));
const { default: HomePage } = await import("./page");

async function redirectDigest(): Promise<string> {
  try {
    await HomePage();
  } catch (error) {
    return String((error as { digest?: string }).digest ?? "");
  }
  return "";
}

describe("/", () => {
  it("sin sesión redirige a /ingresar del lado del servidor", async () => {
    getCurrentUser.mockResolvedValueOnce(null);
    const digest = await redirectDigest();
    expect(digest).toContain("NEXT_REDIRECT");
    expect(digest).toContain("/ingresar");
  });
  it("con sesión redirige a /grupos", async () => {
    getCurrentUser.mockResolvedValueOnce({ id: "u1", email: "a@b.co", name: "A" });
    expect(await redirectDigest()).toContain("/grupos");
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
