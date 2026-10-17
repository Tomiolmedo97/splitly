import { defineConfig } from "vitest/config";

// Tests de integración de las Server Actions (apps/web/src/server/__tests__).
// Los e2e de Playwright viven en /e2e en la raíz y no los corre Vitest.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
