import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { copy } from "@/lib/copy";
import { LogoutButton } from "./logout-button";

describe("LogoutButton", () => {
  it("es submit, y reserva el ancho de 'Cerrando sesión…' desde el reposo", () => {
    const html = renderToStaticMarkup(
      <form>
        <LogoutButton />
      </form>,
    );
    expect(copy.general.loggingOut).toBe("Cerrando sesión\u2026");
    expect(html).toContain('type="submit"');
    expect(html).toContain(copy.general.logout);
    // El texto de carga está en la celda invisible (aria-hidden) que fija el ancho mínimo.
    expect(html).toMatch(/aria-hidden="true" class="invisible[^"]*"[^>]*>.*Cerrando sesión…/);
    expect(html).not.toContain(`aria-disabled="true"`);
  });
});
