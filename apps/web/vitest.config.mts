import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Alias "@/..." igual que en tsconfig.json, para testear módulos que lo usan.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts", "prisma/**/*.test.ts"] },
});
