import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BalanceCard } from "./balance-card";
import { Button } from "./button";
import { initials, MemberList, MemberRow } from "./member-row";
import { TextField } from "./text-field";

const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

describe("BalanceCard", () => {
  it("positivo: signo +, texto e ícono (no solo color)", () => {
    const html = renderToStaticMarkup(<BalanceCard cents={450000} currency="ARS" />);
    expect(text(html)).toContain("+$ 4.500,00");
    expect(text(html)).toContain("Te deben");
    expect(html).toContain("lucide-arrow-up");
    expect(html).toContain("text-positive");
  });

  it("negativo: signo −, texto e ícono", () => {
    const html = renderToStaticMarkup(<BalanceCard cents={-150000} currency="USD" />);
    expect(text(html)).toContain("−US$ 1,500.00");
    expect(text(html)).toContain("Debés");
    expect(html).toContain("lucide-arrow-down");
    expect(html).toContain("text-negative");
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
    expect(text(html)).toContain("−$ 3.000,00");
    expect(text(html)).toContain("debe:");
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

  it("contraseña: botón 'ver' con aria-label", () => {
    const html = renderToStaticMarkup(<TextField label="Contraseña" type="password" />);
    expect(html).toContain('aria-label="Mostrar contraseña"');
    expect(html).toContain('type="password"');
  });
});
