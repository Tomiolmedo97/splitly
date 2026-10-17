import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BalanceCard } from "./balance-card";
import { Button } from "./button";
import { initials, MemberList, MemberRow } from "./member-row";
import { TextField } from "./text-field";

const text = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|\u00a0/g, "\u00a0").replace(/[ \t\n]+/g, " ").trim();
const nb = (s: string) => s.replace(/ /g, "\u00a0");

describe("BalanceCard", () => {
  it("positivo: signo +, texto e ícono (no solo color)", () => {
    const html = renderToStaticMarkup(<BalanceCard cents={450000} currency="ARS" />);
    expect(text(html)).toContain(nb("+$ 4.500,00"));
    expect(text(html)).toContain("Te deben");
    expect(html).toContain("lucide-arrow-up");
    expect(html).toContain("text-positive");
  });

  it("negativo: signo −, texto e ícono", () => {
    const html = renderToStaticMarkup(<BalanceCard cents={-150000} currency="USD" />);
    expect(text(html)).toContain(nb("−US$ 1.500,00"));
    expect(text(html)).toContain("Debés");
    expect(html).toContain("lucide-arrow-down");
    expect(html).toContain("text-negative");
  });

  it("variantes de tamaño por ancho: resumen 40/28/20 (360, 240), grilla 28/20 (240); nunca trunca", () => {
    const summary = renderToStaticMarkup(<BalanceCard cents={450000} currency="USD" variant="summary" />);
    const grid = renderToStaticMarkup(<BalanceCard cents={450000} currency="USD" />);
    expect(summary).toContain("text-[40px] @max-[360px]:text-[28px] @max-[240px]:text-[20px]");
    expect(grid).toContain("text-[28px] @max-[240px]:text-[20px]");
    expect(grid).not.toContain("text-[40px]");
    for (const html of [summary, grid]) {
      expect(html).toContain("whitespace-nowrap");
      expect(html).not.toMatch(/truncate|text-ellipsis|overflow-hidden/);
    }
  });

  it("cero: 'Al día' con check en color de texto", () => {
    const html = renderToStaticMarkup(<BalanceCard cents={0} currency="ARS" />);
    expect(text(html)).toContain("Al día");
    expect(html).toContain("lucide-check");
    expect(html).not.toContain("text-positive");
  });
});

describe("MemberRow", () => {
  it("muestra nombre, badge 'sin cuenta' y saldo con signo", () => {
    const html = renderToStaticMarkup(
      <MemberList label="Miembros">
        <MemberRow name="Sofi" cents={-300000} currency="ARS" withoutAccount />
      </MemberList>,
    );
    expect(text(html)).toContain("Sofi");
    expect(text(html)).toContain("sin cuenta");
    expect(text(html)).toContain(nb("−$ 3.000,00"));
    expect(text(html)).toContain("debe:");
    expect(html).toContain("lucide-arrow-down");
  });

  it("positivo: flecha arriba de 14 px antes del monto", () => {
    const html = renderToStaticMarkup(<MemberRow name="Ana" cents={100} currency="ARS" />);
    expect(html).toMatch(/lucide-arrow-up[^>]*>.*\+\$\u00a01,00/);
    expect(html).toContain('width="14"');
  });

  it("el nombre conserva al menos 6 caracteres", () => {
    const html = renderToStaticMarkup(<MemberRow name="Sofi" cents={-1} currency="ARS" withoutAccount />);
    expect(html).toMatch(/class="[^"]*min-w-\[6ch\][^"]*">Sofi</);
  });

  it("sin badge por defecto", () => {
    const html = renderToStaticMarkup(<MemberRow name="Ana" cents={100} currency="ARS" />);
    expect(text(html)).not.toContain("sin cuenta");
  });

  it("iniciales", () => {
    expect(initials("ana lópez")).toBe("AL");
    expect(initials("Sofi")).toBe("S");
    expect(initials("  ")).toBe("");
  });
});

describe("Button", () => {
  it("es type=button por defecto y tiene anillo de foco", () => {
    const html = renderToStaticMarkup(<Button>Guardar</Button>);
    expect(html).toContain('type="button"');
    expect(html).toContain("focus-visible:outline-primary");
  });

  it("cargando: deshabilitado, aria-busy y conserva el label accesible", () => {
    const html = renderToStaticMarkup(<Button loading>Guardar</Button>);
    expect(html).toContain("disabled");
    expect(html).toContain('aria-busy="true"');
    expect(text(html)).toContain("Guardar");
  });
});

describe("TextField", () => {
  it("asocia label e input", () => {
    const html = renderToStaticMarkup(<TextField label="Email" id="email" />);
    expect(html).toContain('for="email"');
    expect(html).toContain('id="email"');
  });

  it("error: aria-invalid, aria-describedby y mensaje con ícono", () => {
    const html = renderToStaticMarkup(<TextField label="Email" id="email" error="Ingresá un email válido." />);
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="email-error"');
    expect(html).toContain('id="email-error"');
    expect(html).toContain("lucide-circle-alert");
  });

  it("aria-describedby solo apunta a elementos renderizados (ayuda solo sin error)", () => {
    const withHint = renderToStaticMarkup(<TextField label="Contraseña" id="pw" hint="Mínimo 8 caracteres" />);
    expect(withHint).toContain('aria-describedby="pw-hint"');
    expect(withHint).toContain('id="pw-hint"');
    const withError = renderToStaticMarkup(
      <TextField label="Contraseña" id="pw" hint="Mínimo 8 caracteres" error="Completá este campo" />,
    );
    expect(withError).toContain('aria-describedby="pw-error"');
    expect(withError).not.toContain("pw-hint");
  });

  it("contraseña: botón 'ver' con aria-label", () => {
    const html = renderToStaticMarkup(<TextField label="Contraseña" type="password" />);
    expect(html).toContain('aria-label="Mostrar contraseña"');
    expect(html).toContain('type="password"');
  });
});
