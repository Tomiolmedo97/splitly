import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SegmentedControl } from "./segmented-control";
import { segmentedNextIndex } from "./segmented-keys";

describe("segmentedNextIndex (teclado del radiogroup)", () => {
  it("ArrowRight/ArrowDown avanzan y vuelven al principio", () => {
    expect(segmentedNextIndex("ArrowRight", 0, 3)).toBe(1);
    expect(segmentedNextIndex("ArrowDown", 1, 3)).toBe(2);
    expect(segmentedNextIndex("ArrowRight", 2, 3)).toBe(0);
  });

  it("ArrowLeft/ArrowUp retroceden y vuelven al final", () => {
    expect(segmentedNextIndex("ArrowLeft", 2, 3)).toBe(1);
    expect(segmentedNextIndex("ArrowUp", 1, 3)).toBe(0);
    expect(segmentedNextIndex("ArrowLeft", 0, 3)).toBe(2);
  });

  it("Home y End van a los extremos", () => {
    expect(segmentedNextIndex("Home", 2, 3)).toBe(0);
    expect(segmentedNextIndex("End", 0, 3)).toBe(2);
  });

  it("ignora otras teclas y grupos vacíos", () => {
    expect(segmentedNextIndex("Tab", 0, 3)).toBeNull();
    expect(segmentedNextIndex("a", 0, 3)).toBeNull();
    expect(segmentedNextIndex("ArrowRight", 0, 0)).toBeNull();
  });
});

describe("SegmentedControl (semántica)", () => {
  const html = renderToStaticMarkup(
    <SegmentedControl
      label="Modo de color"
      options={[
        { value: "claro", label: "Claro" },
        { value: "oscuro", label: "Oscuro" },
      ]}
      value="oscuro"
      onChange={() => {}}
    />,
  );

  it("expone un radiogroup con nombre accesible", () => {
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Modo de color"');
    expect(html.match(/role="radio"/g)).toHaveLength(2);
  });

  it("marca solo la opción elegida y le da la única parada de Tab", () => {
    const radios = [...html.matchAll(/<button[^>]*role="radio"[^>]*>(\w+)</g)].map((m) => m[0]);
    const oscuro = radios.find((r) => r.endsWith(">Oscuro<"))!;
    const claro = radios.find((r) => r.endsWith(">Claro<"))!;
    expect(oscuro).toContain('aria-checked="true"');
    expect(oscuro).toContain('tabindex="0"');
    expect(claro).toContain('aria-checked="false"');
    expect(claro).toContain('tabindex="-1"');
  });
});
